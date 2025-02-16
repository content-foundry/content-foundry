import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function deployCommand(_options: string[]): Promise<number> {
  logger.info("Starting deployment process...");

  // Run CI checks first
  logger.info("Running CI checks...");
  const ciResult = await runShellCommand(["bff", "ci"]);
  if (ciResult !== 0) {
    logger.error("CI checks failed");
    return 1;
  }

  // Run build if CI passes
  logger.info("Running build...");
  const buildResult = await runShellCommand(["bff", "build"]);
  if (buildResult !== 0) {
    logger.error("Build failed");
    return 1;
  }

  logger.info("✨ Deploy completed successfully");
  return 0;
}

register(
  "deploy",
  "Run CI checks and build for deployment",
  deployCommand,
);
