import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function pull(): Promise<number> {
  logger.info("Pulling latest code from sapling...");
  return await runShellCommand([
    "sl",
    "pull",
  ]);
}

register("pull", "Pull the latest code from sapling", pull);
