import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function tCommand(options: string[]): Promise<number> {
  logger.info("Running tests via 't' command...");

  // Simply pass all arguments to the test command
  const result = await runShellCommand(["bff", "test", ...options]);

  return result;
}

register(
  "t",
  "Shortcut for 'bff test'",
  tCommand,
);
