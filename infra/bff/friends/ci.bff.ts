import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export default async function ciCommand(options: string[]): Promise<number> {
  // Clear console
  // deno-lint-ignore no-console
  console.clear();
  logger.info("Running CI checks...");
  let hasErrors = false;

  // Install dependencies
  logger.info("Installing dependencies...");
  const installResult = await runShellCommand(
    ["deno", "install"],
    undefined,
    {},
    true,
    true
  );
  if (installResult !== 0) {
    logger.error("Failed to install dependencies");
    return installResult;
  }

  const shouldFix = options.includes("--fix") || options.includes("-f");

  if (shouldFix) {
    // Run format first
    logger.info("Running formatter...");
    const formatResult = await runShellCommand(["bff", "f"]);
    if (formatResult !== 0) {
      logger.error("Format failed");
      return formatResult;
    }

    // Run lint with fix
    logger.info("Running linter with --fix...");
    const lintFixResult = await runShellCommand(["bff", "lint", "--fix"]);
    if (lintFixResult !== 0) {
      logger.error("Lint fix failed");
      return lintFixResult;
    }
  }

  // Run build after fix
  logger.info("Running build...");
  const buildResult = await runShellCommand(
    ["bff", "build"],
    undefined,
    {},
    true,
    true,
  );
  if (buildResult !== 0) hasErrors = true;

  // Run deno lint
  const lintResult = await runShellCommand(
    ["deno", "lint"],
    undefined,
    {},
    true,
    true,
  );
  if (lintResult !== 0) hasErrors = true;

  // Run deno test
  const testResult = await runShellCommand(
    ["deno", "test", "-A"],
    undefined,
    {},
    true,
    true,
  );
  if (testResult !== 0) hasErrors = true;

  // Run deno fmt check
  const fmtResult = await runShellCommand(
    ["deno", "fmt", "--check"],
    undefined,
    {},
    true,
    true,
  );
  if (fmtResult !== 0) hasErrors = true;

  // Output summary
  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Build: ${buildResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:   ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Tests:  ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format: ${fmtResult === 0 ? "✅" : "❌"}`);

  if (hasErrors) {
    logger.error("\n❌ Some CI checks failed");
    return 1;
  }

  logger.info("\n✨ All CI checks passed! ✨");
  return 0;
}

register(
  "ci",
  "Run CI checks (lint, test, and format)",
  ciCommand,
);
