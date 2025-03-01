
import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function cCommand(options: string[]): Promise<number> {
  logger.info("Running type check via 'c' command...");
  
  // Simply pass all arguments to the check command
  const result = await runShellCommand(["bff", "check", ...options]);
  
  return result;
}

register(
  "c",
  "Shortcut for 'bff check'",
  cCommand
);
