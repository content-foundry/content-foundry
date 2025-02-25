// FILE: infra/bff/friends/ci.bff.ts

import { register } from "infra/bff/bff.ts";
import { runShellCommandWithOutput } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";
import { loggerGithub } from "infra/bff/githubLogger.ts";

const logger = getLogger(import.meta);

type GhMeta = {
  file?: string;
  line?: number;
  col?: number;
};

// Quick helpers to unify normal logging & GH annotations
const logCI = {
  info: (msg: string) => {
    logger.info(msg);
  },
  error: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.error(msg, meta);
    } else {
      logger.error(msg);
    }
  },
  warn: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.warn(msg, meta);
    } else {
      logger.warn(msg);
    }
  },
  debug: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.warn(msg, meta);
    } else {
      logger.debug(msg);
    }
  },
};

// ----------------------------------------------------------------------------
// 1. Lint step
// ----------------------------------------------------------------------------

async function runLintStep(useGithub: boolean): Promise<number> {
  logger.info("Running deno lint");
  // If useGithub, do `deno lint --json` so we can parse it ourselves
  const cmdArray = ["deno", "lint"];
  if (useGithub) {
    cmdArray.push("--json");
  }

  const { code: errorCode, stdout } = await runShellCommandWithOutput(
    cmdArray,
    {},
    /* useSpinner */ true,
    /* silent */ useGithub, // or "false" if you still want logs
  );

  // If GitHub annotations mode, parse JSON output and emit annotations
  if (useGithub) {
    parseDenoLintJsonOutput(stdout);
  }
  return errorCode;
}

/** If `deno lint --json` was used, parse JSON and emit GH Annotations. */
function parseDenoLintJsonOutput(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString); // shape: { diagnostics: [...], errors: [...] }
    // 1) diagnostics
    for (const diag of parsed.diagnostics ?? []) {
      const filePath = diag.location?.filename ?? "unknown.ts";
      const start = diag.location?.range?.start;
      const line = (typeof start?.line === "number")
        ? start.line + 1
        : undefined;
      const col = (typeof start?.character === "number")
        ? start.character + 1
        : undefined;
      const message = diag.message ?? "Unknown lint problem";
      logCI.debug(message, { file: filePath, line, col });
    }
    // 2) errors
    for (const err of parsed.errors ?? []) {
      const filePath = err.location?.filename ?? "unknown.ts";
      const start = err.location?.range?.start;
      const line = (typeof start?.line === "number")
        ? start.line + 1
        : undefined;
      const col = (typeof start?.character === "number")
        ? start.character + 1
        : undefined;
      const message = err.message ?? "Unknown lint error";
      logCI.error(message, { file: filePath, line, col });
    }
  } catch (err) {
    logger.error("Error parsing deno lint --json output:", err);
  }
}

// ----------------------------------------------------------------------------
// 2. Fmt step
// ----------------------------------------------------------------------------

async function runFormatStep(useGithub: boolean): Promise<number> {
  logger.info("Checking formatting (deno fmt --check)...");
  const { code, stdout } = await runShellCommandWithOutput(
    ["deno", "fmt", "--check"],
    {},
    /* useSpinner */ true,
    /* silent */ useGithub,
  );

  // If GitHub annotations mode, parse the text output
  if (useGithub) {
    parseDenoFmtOutput(stdout);
  }
  return code;
}

/**
 * Parse the plain-text output of `deno fmt --check` for lines referencing file paths, line numbers,
 * etc. This is a simple example that looks for:
 *    from /full/path/to/file.ts:
 *      12 | -    ...
 * and so on, then logs GH annotations as warnings.
 */
function parseDenoFmtOutput(fullOutput: string) {
  const lines = fullOutput.split("\n");
  let currentFile: string | undefined;

  for (const line of lines) {
    // e.g. "from /home/runner/workspace/infra/bff/friends/githubAnnotations.ts:"
    const fromMatch = line.match(/^from\s+([^:]+):$/);
    if (fromMatch) {
      currentFile = fromMatch[1].trim();
      continue;
    }

    // e.g. "  60 | -    const foo = 123;"
    // We'll parse out the line number & mark it as a "warning" annotation
    if (currentFile) {
      // check for blank line => done with that file
      if (line.trim() === "") {
        currentFile = undefined;
        continue;
      }

      const lineMatch = line.match(/^\s+(\d+)\s+\|\s+(.*)$/);
      if (lineMatch) {
        const lineNum = parseInt(lineMatch[1], 10);
        const snippet = lineMatch[2];
        // You can produce a more descriptive message if you want
        // e.g. "File not formatted according to deno fmt!"
        logCI.warn(snippet, { file: currentFile, line: lineNum });
        continue;
      }
    }

    // If we see `error: Found X not formatted files in Y files`
    // we'll mark that as an error annotation.
    if (line.includes("error: Found") && line.includes("not formatted files")) {
      logCI.error(line.trim());
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Build step
// ----------------------------------------------------------------------------

async function runBuildStep(useGithub: boolean): Promise<number> {
  logger.info("Running bff build");
  const { code } = await runShellCommandWithOutput(
    ["bff", "build"],
    {},
    /* useSpinner */ true,
    /* silent */ useGithub,
  );
  return code;
}

// ----------------------------------------------------------------------------
// 4. Test step
// ----------------------------------------------------------------------------

async function runTestStep(useGithub: boolean): Promise<number> {
  logger.info("Running deno test -A");
  const { code } = await runShellCommandWithOutput(
    ["bff", "test"],
    {},
    /* useSpinner */ true,
    /* silent */ useGithub,
  );
  return code;
}

// ----------------------------------------------------------------------------
// 5. Install step
// ----------------------------------------------------------------------------

async function runInstallStep(useGithub: boolean): Promise<number> {
  logger.info("Caching dependencies via deno cache .");
  // For the example, we re-use "deno install" since your logs do that.
  // But you might prefer "deno cache --reload ." or similar in your real pipeline.
  const { code } = await runShellCommandWithOutput(
    ["deno", "install"],
    {},
    true,
    useGithub,
  );
  return code;
}

// ----------------------------------------------------------------------------
// MAIN CI pipeline
// ----------------------------------------------------------------------------

async function ciCommand(options: string[]) {
  logger.info("Running CI checks...");
  const useGithub = options.includes("-g");

  // 1) Install / “deno cache”
  const installResult = await runInstallStep(useGithub);

  // 2) Build step
  const buildResult = await runBuildStep(useGithub);

  // 3) Lint (with or without JSON mode)
  const lintResult = await runLintStep(useGithub);

  // 4) Test
  const testResult = await runTestStep(useGithub);

  // 5) Format check
  const fmtResult = await runFormatStep(useGithub);

  const untrackedResult = await checkUntrackedFiles();

  const hasErrors = Boolean(
    installResult || buildResult || lintResult || testResult || fmtResult ||
      untrackedResult,
  );

  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Install:   ${installResult === 0 ? "✅" : "❌"}`);
  logger.info(`Build:     ${buildResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:      ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Test:      ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format:    ${fmtResult === 0 ? "✅" : "❌"}`);
  logger.info(`Untracked: ${untrackedResult === 0 ? "✅" : "❌"}`);

  if (hasErrors) {
    logCI.error("CI checks failed");
    return 1;
  } else {
    logger.info("All CI checks passed");
    return 0;
  }
}

async function checkUntrackedFiles() {
  const { code, stdout } = await runShellCommandWithOutput([
    "git",
    "status",
    "--porcelain",
  ]);
  const noChanges = code === 0 && stdout.trim() === "";
  return code || noChanges ? 0 : 1;
}

register(
  "ci",
  "Run CI checks (lint, test, build, format). E.g. `bff ci -g` for GH annotations.",
  ciCommand,
);
