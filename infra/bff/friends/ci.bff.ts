// infra/bff/friends/ci.bff.ts
import { register } from "infra/bff/bff.ts";
import { runShellCommand, runShellCommandWithOutput } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/** 
 * Print a GitHub Actions annotation. 
 * See: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message
 */
function printGitHubAnnotation(
  type: "error" | "warning",
  msg: string,
  file?: string,
  line?: number,
  col?: number,
) {
  // Example format:
  //   ::error file=app.ts,line=10,col=15::Something went wrong
  // Or, simpler:
  //   ::error ::Some error message
  let annotation = `::${type}`;
  if (file) annotation += ` file=${file}`;
  if (typeof line === "number") annotation += `,line=${line}`;
  if (typeof col === "number") annotation += `,col=${col}`;
  annotation += `::${msg}`;
  console.log(annotation);
}

/**
 * Run `deno lint --json`, parse the single object it returns, 
 * and emit GitHub annotations for each diagnostic if found.
 */
async function runLintWithGithubAnnotations(): Promise<number> {
  let code = 0;
  try {
    const output = await runShellCommandWithOutput(
      ["deno", "lint", "--json"],
      {},
      /* useSpinner= */ false,
      /* silent= */ true,
    );

    // In newer Deno, the result is a single object:
    // {
    //   "diagnostics": [...],
    //   "errors": [...],
    //   ...
    // }
    const parsed = JSON.parse(output);

    // 1) "diagnostics" array
    for (const diag of parsed.diagnostics ?? []) {
      const filePath = diag.location?.filename ?? "unknown.ts";
      const start = diag.location?.range?.start;
      const line = typeof start?.line === "number" ? start.line + 1 : undefined;
      const col = typeof start?.character === "number" ? start.character + 1 : undefined;
      const message = diag.message ?? "Unknown lint issue";
      printGitHubAnnotation("error", message, filePath, line, col);
      code = 1;
    }

    // 2) "errors" array (e.g. parse failures)
    for (const err of parsed.errors ?? []) {
      const filePath = err.location?.filename ?? "unknown.ts";
      const start = err.location?.range?.start;
      const line = typeof start?.line === "number" ? start.line + 1 : undefined;
      const col = typeof start?.character === "number" ? start.character + 1 : undefined;
      const message = err.message ?? "Unknown lint error";
      printGitHubAnnotation("error", message, filePath, line, col);
      code = 1;
    }
  } catch (err) {
    logger.error("Error parsing deno lint --json output:", err);
    code = 1;
  }

  return code;
}

/**
 * Parse the JSON output from `deno test --json` line-by-line 
 * and emit GitHub annotations for failing tests.
 */
async function runTestWithGithubAnnotations(): Promise<number> {
  let code = 0;
  try {
    const cmd = ["deno", "test", "-A", "--json"];
    const rawOutput = await runShellCommandWithOutput(cmd, {}, false, true);

    // deno test --json prints multiple JSON lines, one event per line
    const lines = rawOutput.split("\n").filter(Boolean);
    for (const line of lines) {
      const event = JSON.parse(line);

      // "testEnd" event indicates a single test has completed
      if (event.event === "testEnd") {
        if (event.result?.passed === false) {
          code = 1;
          const testName = event.result.name ?? "unknown test";
          const errorMsg = event.result.error?.message ?? "Test failed";
          // Typically there's no exact file/line from the "testEnd" JSON. 
          // We'll attach the test name to the annotation as best we can:
          printGitHubAnnotation("error", `[TEST FAIL] ${testName}: ${errorMsg}`);
        }
      }

      // You could also check other event types like "uncaughtException" or "error"
      // if you want more detailed annotations.
    }
  } catch (err) {
    logger.error("Error parsing deno test --json output:", err);
    code = 1;
  }
  return code;
}

/**
 * The main CI command. 
 * 
 * Usage:
 *   bff ci
 *   bff ci --fix     # runs deno fmt & lint fix
 *   bff ci --github  # emits GitHub workflow annotations
 */
export default async function ciCommand(options: string[]): Promise<number> {
  // Clear console
  // deno-lint-ignore no-console
  console.clear();
  logger.info("Running CI checks...");

  let hasErrors = false;
  const shouldFix = options.includes("--fix") || options.includes("-f");
  const githubMode = options.includes("--github") || options.includes("-g");

  // 1) Install dependencies
  logger.info("Installing dependencies...");
  const installResult = await runShellCommand(["deno", "install"], undefined, {}, true, true);
  if (installResult !== 0) {
    logger.error("Failed to install dependencies");
    return installResult;
  }

  // 2) Format + Lint Fix, if requested
  if (shouldFix) {
    // deno fmt
    logger.info("Running deno fmt...");
    const fmtFixResult = await runShellCommand(["deno", "fmt"], undefined, {}, true, true);
    if (fmtFixResult !== 0) {
      logger.error("Format failed");
      return fmtFixResult;
    }

    // deno lint --fix
    logger.info("Running deno lint --fix...");
    const lintFixResult = await runShellCommand(["deno", "lint", "--fix"], undefined, {}, true, true);
    if (lintFixResult !== 0) {
      logger.error("Lint fix failed");
      return lintFixResult;
    }
  }

  // 3) Build
  logger.info("Running build...");
  const buildResult = await runShellCommand(["bff", "build"], undefined, {}, true, true);
  if (buildResult !== 0) {
    hasErrors = true;
  }

  // 4) Lint
  let lintResult = 0;
  if (githubMode) {
    logger.info("Running deno lint --json (GitHub mode)...");
    lintResult = await runLintWithGithubAnnotations();
  } else {
    logger.info("Running deno lint...");
    lintResult = await runShellCommand(["deno", "lint"], undefined, {}, true, true);
  }
  if (lintResult !== 0) hasErrors = true;

  // 5) Test
  let testResult = 0;
  if (githubMode) {
    logger.info("Running deno test --json (GitHub mode)...");
    testResult = await runTestWithGithubAnnotations();
  } else {
    logger.info("Running deno test -A...");
    testResult = await runShellCommand(["deno", "test", "-A"], undefined, {}, true, true);
  }
  if (testResult !== 0) hasErrors = true;

  // 6) Format check
  logger.info("Checking formatting (deno fmt --check)...");
  const fmtCheckResult = await runShellCommand(["deno", "fmt", "--check"], undefined, {}, true, true);
  if (fmtCheckResult !== 0) {
    hasErrors = true;
    if (githubMode) {
      // There's no `--json` for deno fmt, so let's produce one annotation:
      printGitHubAnnotation("error", "Some files need formatting. Run `deno fmt`.");
    }
  }

  // 7) Output summary
  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Build:   ${buildResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:    ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Test:    ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format:  ${fmtCheckResult === 0 ? "✅" : "❌"}`);

  if (hasErrors) {
    logger.error("\n❌ Some CI checks failed");
    return 1;
  }

  logger.info("\n✨ All CI checks passed! ✨");
  return 0;
}

register(
  "ci",
  "Run CI checks (lint, test, format, build). Optional flags: --fix, --github",
  ciCommand,
);