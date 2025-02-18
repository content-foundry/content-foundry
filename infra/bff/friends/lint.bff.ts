import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function lintCommand(options: string[]): Promise<number> {
  logger.info("Running Deno lint...");
  const args = ["deno", "lint"];

  if (options.includes("--fix")) {
    args.push("--fix");
    logger.info("Auto-fixing linting issues...");
  }

  const result = await runShellCommand(args);

  if (result === 0) {
    logger.info("✨ Linting passed!");
  } else {
    logger.error("❌ Linting failed");
  }

  return result;
}

register(
  "lint",
  "Run Deno lint on the codebase",
  lintCommand,
);
