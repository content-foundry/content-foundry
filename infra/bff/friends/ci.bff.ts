import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export default async function ciCommand(_options: string[]): Promise<number> {
  logger.info("Running CI checks...");
  let hasErrors = false;

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
