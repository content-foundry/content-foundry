import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export function processNotebookContent(notebookContent: string) {
  const { cells } = JSON.parse(notebookContent);

  // #techdebt
  // deno-lint-ignore no-explicit-any
  return cells.map((cell: any) => {
    if (cell.cell_type === "markdown") {
      return cell.source.join("");
    } else if (cell.cell_type === "code") {
      // Language detection
      const lang = cell.metadata?.language_info?.name ?? "typescript";
      const codeBlock = "```" + lang + "\n" +
        cell.source.join("") + "\n```\n";

      let outputs = "";
      if (cell.outputs) {
        for (const out of cell.outputs) {
          outputs += out.output_type + "\n";
          if (out.output_type === "stream") {
            outputs += "```\n" + out.text.join("") + "\n```\n";
          }
        }
      }
      return codeBlock + "\n---\n" + outputs;
    }
    return "";
  }).join("\n\n");
}
