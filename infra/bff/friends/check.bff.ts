// infra/bff/friends/check.bff.ts
import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function checkCommand(options: string[]): Promise<number> {
  logger.info("Running type checking...");

  const args = ["deno", "check"];

  // Add files to check
  if (options.length > 0) {
    args.push(...options);
  } else {
    // Default to check important directories if no files specified
    args.push(
      "infra/**/*.ts",
      "infra/**/*.tsx",
      "packages/**/*.ts", 
      "packages/**/*.tsx"
    );
  }

  // Add --watch flag if requested
  if (options.includes("--watch")) {
    args.push("--watch");
    logger.info("Running in watch mode...");
  }

  // Add --quiet flag if requested for less verbose output
  if (options.includes("--quiet")) {
    args.push("--quiet");
  }

  // Execute deno check with the specified arguments
  const result = await runShellCommand(args);

  if (result === 0) {
    logger.info("✨ Type checking passed!");
  } else {
    logger.error("❌ Type checking failed");
  }

  return result;
}

register(
  "check",
  "Run type checking on the codebase using Deno check",
  checkCommand,
);