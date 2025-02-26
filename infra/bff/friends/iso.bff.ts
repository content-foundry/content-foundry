// ./infra/bff/friends/iso.bff.ts
import { register } from "infra/bff/bff.ts";
import {
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/**
 * Runs the isograph compiler to generate code from GraphQL
 *
 * @param options Command-line options passed to the isograph command
 * @returns Exit code (0 for success, non-zero for failure)
 */
export async function isoCommand(options: string[]): Promise<number> {
  logger.info("Running isograph compiler...");

  // Default working directory is packages/app where the isograph config lives
  const workingDir = "packages/app";

  try {
    // When called directly, provide more verbose output
    if (options.includes("--verbose")) {
      options = options.filter((opt) => opt !== "--verbose");
      const { stdout, stderr, code } = await runShellCommandWithOutput(
        ["deno", "run", "-A", "npm:@isograph/compiler", ...options],
      );

      if (stdout) logger.info(stdout);
      if (stderr) logger.error(stderr);

      if (code === 0) {
        logger.info("✅ Isograph compilation completed successfully");
      } else {
        logger.error(`❌ Isograph compilation failed with code ${code}`);
      }

      return code;
    }

    // Standard execution for build pipeline
    const result = await runShellCommand(
      ["deno", "run", "-A", "npm:@isograph/compiler", ...options],
      workingDir,
    );

    if (result === 0) {
      logger.info("✅ Isograph compilation completed successfully");
    } else {
      logger.error(`❌ Isograph compilation failed with code ${result}`);
    }

    return result;
  } catch (error) {
    logger.error("Error running isograph compiler:", error);
    return 1;
  }
}

// Register the command with the BFF framework
register(
  "iso",
  "Run the isograph compiler to generate code from GraphQL",
  isoCommand,
  [
  ],
);
