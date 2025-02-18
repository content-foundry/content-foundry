import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";

export async function formatCommand(_options: string[]): Promise<number> {
  return await runShellCommand(["deno", "fmt"]);
}

// Register both 'format' and 'f' as aliases for the same command
register(
  "format",
  "Format code using deno fmt",
  formatCommand,
);

register(
  "f",
  "Alias for format command",
  formatCommand,
);
