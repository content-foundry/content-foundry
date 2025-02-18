import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

register(
  "restartLsp",
  "Restart Deno LSP server by killing the current process",
  async () => {
    try {
      await runShellCommand(["pkill", "-f", "deno lsp"]);
      logger.info("LSP server killed successfully");
      return 0;
    } catch (error) {
      logger.info("No LSP process found");
      return 0;
    }
  }
);
