import { register } from "infra/bff/bff.ts";
import { runShellCommand, runShellCommandWithOutput } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/** 
 * Print an annotation that GitHub will pick up.
 * 
 * See: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
 *
 * type can be "error" or "warning" (GitHub also supports "notice", but “error”/“warning” are typical).
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
  // Or just:
  //   ::error :: A generic error
  let annotation = `::${type}`;
  if (file) annotation += ` file=${file}`;
  if (typeof line === "number") annotation += `,line=${line}`;
  if (typeof col === "number") annotation += `,col=${col}`;
  annotation += `::${msg}`;
  // deno-lint-ignore no-console
  console.log(annotation);
}

/**
 * Parse the JSON output from "deno lint --json" and print GitHub annotations on each diagnostic error.
 */
async function runLintWithGithubAnnotations(): Promise<number> {
  // "deno lint --json"
  const output = await runShellCommandWithOutput(["deno", "lint", "--json"], {}, /* spinner= */ false, /* silent= */ true);

  let code = 0;
  try {
    const parsed = JSON.parse(output);
    for (const fileReport of parsed) {
      // Each file report has an array of diagnostics
      const { diagnostics, filePath } = fileReport;
      for (const diag of diagnostics) {
        const { message, range } = diag;
        const line = range?.start?.line + 1; // Deno typically is zero-based
        const col = range?.start?.character + 1;
        printGitHubAnnotation("error", message, filePath, line, col);
        code = 1; // At least one error
      }
    }
  } catch (err) {
    logger.error("Error parsing deno lint --json output:", err);
    code = 1;
  }

  return code;
}

/**
 * Parse the JSON output from `deno test --json`. 
 * This is available as of Deno 1.28+ (if any sub-versions break, see doc).
 */
async function runTestWithGithubAnnotations(): Promise<number> {
  const cmd = ["deno", "test", "-A", "--json"];
  const output = await runShellCommandWithOutput(cmd, {}, /* spinner= */ false, /* silent= */ true);

  let code = 0;
  try {
    /**
     * The JSON from `deno test --json` is actually a stream of JSON lines for each event.
     * Each line can be parsed separately. We have to handle them one by one.
     */
    const lines = output.split("\n").filter(Boolean);

    for (const line of lines) {
      const event = JSON.parse(line);

      // "Plan" event, "Result" event, "TestStart", "TestEnd", "SuiteStart", "SuiteEnd"...
      if (event.event === "testEnd") {
        // Check if test fails
        if (event.result?.passed === false) {
          code = 1;
          // Some test frameworks supply location for errors, some do not
          // We'll just produce an annotation pointing to the test name
          const testName = event.result.name ?? "unknown test";
          const errorDisplay = event.result?.error?.message ?? "Test failed";
          // We do not have file/line/col from typical “testEnd” events 
          // unless your test framework throws an error with stack traces.
          // We'll just create a generic annotation referencing the name:
          printGitHubAnnotation("error", `[TEST FAIL] ${testName}: ${errorDisplay}`);
        }
      }
      // or you can handle "error" events, "uncaughtException", etc.
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
 *    bff ci            # plain mode
 *    bff ci --fix      # attempts “deno fmt” and “deno lint --fix”
 *    bff ci --github   # adds GitHub annotation output
 */
export default async function ciCommand(options: string[]): Promise<number> {
  // Clear console
  console.clear();
  logger.info("Running CI checks...");
  let hasErrors = false;

  const shouldFix = options.includes("--fix") || options.includes("-f");
  const githubMode = options.includes("--github") || options.includes("-g");

  // 1) Install dependencies
  logger.info("Installing dependencies...");
  const installResult = await runShellCommand(["deno", "install"], undefined, {}, /* spinner= */ true, /* silent= */ true);
  if (installResult !== 0) {
    logger.error("Failed to install dependencies");
    return installResult;
  }

  // 2) Format + Lint Fix, if requested
  if (shouldFix) {
    // deno fmt
    logger.info("Running deno fmt...");
    const formatResult = await runShellCommand(["deno", "fmt"], undefined, {}, /* spinner= */ true, /* silent= */ true);
    if (formatResult !== 0) {
      logger.error("Format failed");
      return formatResult;
    }

    // deno lint --fix
    logger.info("Running deno lint with --fix...");
    const lintFixResult = await runShellCommand(["deno", "lint", "--fix"], undefined, {}, /* spinner= */ true, /* silent= */ true);
    if (lintFixResult !== 0) {
      logger.error("Lint fix failed");
      return lintFixResult;
    }
  }

  // 3) Build
  logger.info("Running build...");
  const buildResult = await runShellCommand(["bff", "build"], undefined, {}, /* spinner= */ true, /* silent= */ true);
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
    lintResult = await runShellCommand(["deno", "lint"], undefined, {}, /* spinner= */ true, /* silent= */ true);
  }
  if (lintResult !== 0) {
    hasErrors = true;
  }

  // 5) Test
  let testResult = 0;
  if (githubMode) {
    logger.info("Running deno test --json (GitHub mode)...");
    testResult = await runTestWithGithubAnnotations();
  } else {
    logger.info("Running deno test -A...");
    testResult = await runShellCommand(["deno", "test", "-A"], undefined, {}, /* spinner= */ true, /* silent= */ true);
  }
  if (testResult !== 0) {
    hasErrors = true;
  }

  // 6) Check formatting
  logger.info("Checking formatting (deno fmt --check)...");
  const fmtResult = await runShellCommand(["deno", "fmt", "--check"], undefined, {}, /* spinner= */ true, /* silent= */ true);
  if (fmtResult !== 0) {
    hasErrors = true;
    if (githubMode) {
      // We don't have a --json for this, so let's produce a single annotation:
      printGitHubAnnotation(
        "error",
        "Some files need formatting. Run `deno fmt`.",
      );
    }
  }

  // --- Output summary ---
  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Build:   ${buildResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:    ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Test:    ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format:  ${fmtResult === 0 ? "✅" : "❌"}`);

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