// infra/bff/friends/ci.bff.ts

import { register } from "infra/bff/bff.ts";
import {
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";
import { loggerGithub } from "infra/bff/githubLogger.ts";

const logger = getLogger(import.meta);

/**
 * 1) Parse "bff build" output (which calls deno compile) for TS errors
 *    and emit GitHub annotations. Return 0 if success, else 1.
 */
async function runCompileWithAnnotations(): Promise<number> {
  logger.info("Running 'bff build' with annotation parsing...");
  let output = "";
  let exitCode = 0;
  try {
    // Use runShellCommandWithOutput so we can parse the logs ourselves
    output = await runShellCommandWithOutput(["bff", "build"], {}, false, true);
  } catch {
    // If bff build fails, the function might throw; mark exit code = 1
    exitCode = 1;
  }

  // Look for lines like "error: TS2322 [ERROR]: message"
  // Then next line "    at file:///...:line:col"
  let foundErrors = 0;
  const lines = output.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("error: TS")) {
      const message = line.replace(/^error:\s*/, "").trim();
      // Next line should have "at file:///path/to/file.ts:NN:NN"
      const nextLine = lines[i + 1] || "";
      const match = nextLine.match(/at (file:\/\/[^\s]+):(\d+):(\d+)/);
      if (match) {
        const filePath = match[1];
        const lineNum = parseInt(match[2], 10);
        const colNum = parseInt(match[3], 10);
        loggerGithub.error(message, { file: filePath, line: lineNum, col: colNum });
      } else {
        // No location line, just log the message
        loggerGithub.error(message);
      }
      foundErrors++;
    }
  }

  if (foundErrors > 0) exitCode = 1;
  return exitCode;
}

/**
 * 2) Parse deno lint --json and emit GitHub annotations for each finding.
 *    IMPORTANT: The new shape is { filename, range, message, code, hint, ... }
 */
async function runLintWithGithubAnnotations(): Promise<number> {
  logger.info("Running deno lint --json...");
  let exitCode = 0;
  let rawOutput = "";
  try {
    rawOutput = await runShellCommandWithOutput(
      ["deno", "lint", "--json"],
      {},
      false,
      true,
    );
  } catch {
    // Non-zero exit from 'deno lint' => probably means some lint issues
    exitCode = 1;
  }

  let parsed: { diagnostics?: unknown[]; errors?: unknown[] };
  try {
    parsed = JSON.parse(rawOutput);
  } catch (err) {
    logger.error("Error parsing deno lint JSON:", err);
    return 1;
  }

  // Now each diagnostic has shape:
  //  {
  //    "filename": "file:///path/to/foo.ts",
  //    "range": { "start": { "line": 12, "col": 5 }, "end": ... },
  //    "message": "`foo` is never used",
  //    "code": "no-unused-vars",
  //    "hint": ...
  //  }
  for (const diag of (parsed.diagnostics ?? []) as Array<Record<string, unknown>>) {
    const filePath = String(diag.filename ?? "unknown.ts");
    // range => { start: { line, col }, end: {...} }
    const range = diag.range as
      | { start?: { line?: number; col?: number }; end?: unknown }
      | undefined;

    const start = range?.start;
    const line = typeof start?.line === "number" ? (start.line + 1) : undefined;
    const col = typeof start?.col === "number" ? (start.col + 1) : undefined;

    const message = String(diag.message ?? "Lint error");
    // Emit annotation
    loggerGithub.error(message, { file: filePath, line, col });
    exitCode = 1;
  }

  // "errors" array => parse-level or config-level errors
  for (const err of (parsed.errors ?? []) as Array<Record<string, unknown>>) {
    // Might have same shape or slightly different
    const filePath = String(err.filename ?? "unknown.ts");
    const range = err.range as
      | { start?: { line?: number; col?: number } }
      | undefined;
    const start = range?.start;
    const line = typeof start?.line === "number" ? (start.line + 1) : undefined;
    const col = typeof start?.col === "number" ? (start.col + 1) : undefined;

    const message = String(err.message ?? "Unknown lint error");
    loggerGithub.error(message, { file: filePath, line, col });
    exitCode = 1;
  }

  return exitCode;
}

/**
 * 3) Parse deno test --json line by line, emit GitHub annotations for failing tests.
 */
async function runTestWithGithubAnnotations(): Promise<number> {
  logger.info("Running deno test --json -A...");
  let exitCode = 0;
  let rawOutput = "";
  try {
    rawOutput = await runShellCommandWithOutput(
      ["deno", "test", "-A", "--json"],
      {},
      false,
      true,
    );
  } catch {
    // Non-zero => test failures
    exitCode = 1;
  }

  const lines = rawOutput.split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      if (event.event === "testEnd" && event.result?.passed === false) {
        exitCode = 1;
        const testName = event.result.name ?? "(unknown test)";
        const errorMsg = event.result.error?.message ??
          "Test failed (unknown error)";
        loggerGithub.error(`[TEST FAIL] ${testName}: ${errorMsg}`);
      }
    } catch {
      // If a line isn't JSON, ignore
    }
  }
  return exitCode;
}

/**
 * 4) Check formatting via `deno fmt --check`. If unformatted, emit single annotation line.
 */
async function checkFormatWithAnnotations(): Promise<number> {
  logger.info("Checking formatting (deno fmt --check)...");
  const result = await runShellCommand(
    ["deno", "fmt", "--check"],
    undefined,
    {},
    true,
    true,
  );
  if (result !== 0) {
    // Print a single annotation
    loggerGithub.error(
      "Some files need formatting. Run `bff f` to fix them automatically.",
    );
  }
  return result;
}

/**
 * The main CI command:
 *   bff ci -g
 */
async function ciCommand(_options: string[]): Promise<number> {
  logger.info("Running CI checks...");
  let hasErrors = false;

  // 1) deno install
  logger.info("Installing dependencies...");
  const installResult = await runShellCommand(["deno", "install"]);
  if (installResult !== 0) {
    logger.error("Failed to install dependencies");
    hasErrors = true;
  }

  // 2) Build => parse type errors => GH annotations
  const compileResult = await runCompileWithAnnotations();
  if (compileResult !== 0) {
    hasErrors = true;
  }

  // 3) Lint => GH annotations
  const lintResult = await runLintWithGithubAnnotations();
  if (lintResult !== 0) {
    hasErrors = true;
  }

  // 4) Test => GH annotations
  const testResult = await runTestWithGithubAnnotations();
  if (testResult !== 0) {
    hasErrors = true;
  }

  // 5) Format => single annotation if needed
  const fmtResult = await checkFormatWithAnnotations();
  if (fmtResult !== 0) {
    hasErrors = true;
  }

  // Summaries
  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Install:   ${installResult === 0 ? "✅" : "❌"}`);
  logger.info(`Build:     ${compileResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:      ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Test:      ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format:    ${fmtResult === 0 ? "✅" : "❌"}`);

  if (hasErrors) {
    logger.error("\n❌ Some CI checks failed");
    return 1;
  }
  logger.info("\n✨ All CI checks passed! ✨");
  return 0;
}

register(
  "ci",
  "Run CI checks (lint, test, compile, format). E.g. `bff ci -g` for GH annotations.",
  ciCommand,
);