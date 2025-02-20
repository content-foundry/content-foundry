// packages/loggerGithub.ts
import { getLogger } from "packages/logger.ts";

/**
 * GitHub Actions annotation syntax is:
 *   ::error file=FILE,line=LINE,col=COL::MESSAGE
 *   ::warning file=FILE,line=LINE,col=COL::MESSAGE
 *   ::notice file=FILE,line=LINE,col=COL::MESSAGE
 *
 * If you only need error vs. non-error levels, you might skip "warning"/"info".
 */
export interface GithubAnnotationMeta {
  file?: string;
  line?: number;
  col?: number;
}

function annotationLine(
  type: "error" | "warning" | "notice",
  message: string,
  meta?: GithubAnnotationMeta,
): string {
  const { file, line, col } = meta || {};
  let lineOut = `::${type}`;
  if (file) lineOut += ` file=${file.replace("file://", "").replace(Deno.cwd(), "")}`;
  if (typeof line === "number") lineOut += `,line=${line}`;
  if (typeof col === "number") lineOut += `,col=${col}`;
  // The message goes after "::"
  lineOut += `::${message}`;
  return lineOut;
}

const baseLogger = getLogger("github_annotations");

// We’ll copy the original log-level methods in case you want them
const realError = baseLogger.error.bind(baseLogger);
const realWarn = baseLogger.warn.bind(baseLogger);
const realInfo = baseLogger.info.bind(baseLogger);

/**
 * Our special logger prints GitHub annotations to stdout/stderr,
 * then calls the original underlying logger for good measure.
 */
export const loggerGithub = {
  ...baseLogger,

  /**
   * Example usage:
   *   loggerGithub.error("Something's broken", { file: "src/foo.ts", line: 42, col: 5 });
   */
  error(message: string, meta?: GithubAnnotationMeta) {
    // Print GitHub annotation line
    console.log(annotationLine("error", message, meta));
    // Also feed into the original logger
    realError(message);
  },

  /**
   * Example usage:
   *   loggerGithub.warn("This is a heads-up", { file: "src/foo.ts", line: 10 });
   */
  warn(message: string, meta?: GithubAnnotationMeta) {
    // “warning” => GitHub’s annotation
    console.log(annotationLine("warning", message, meta));
    realWarn(message);
  },

  /**
   * Example usage:
   *   loggerGithub.info("FYI only", { file: "src/index.ts" });
   */
  info(message: string, meta?: GithubAnnotationMeta) {
    // “notice” => GitHub’s annotation
    console.log(annotationLine("notice", message, meta));
    realInfo(message);
  },
};