/**
 * 1) Before we import @denosaurs/python, run a Python command to discover the
 *    correct LIBDIR, then set DENO_PYTHON_PATH accordingly.
 */
const cmd = new Deno.Command("python", {
  args: [
    "-c",
    "import sysconfig; print(sysconfig.get_config_var('LIBDIR'))",
  ],
  stdout: "piped",
  stderr: "piped",
});

const { stdout } = await cmd.output();
const output = new TextDecoder().decode(stdout).trim();

// This sets the environment variable at runtime:
Deno.env.set("DENO_PYTHON_PATH", `${output}/libpython3.so`);

import { register } from "infra/bff/bff.ts";
import { walk } from "@std/fs/walk";
import { basename, dirname, extname, join } from "@std/path";
import { globToRegExp } from "@std/path";
import { exists } from "@std/fs/exists";
import { getLogger } from "packages/logger.ts";

// 1) Import the Python and tiktoken modules directly here:
import { python } from "@denosaurs/python";
const tiktoken = python.import("tiktoken");
const encoding = tiktoken.get_encoding("cl100k_base");

const logger = getLogger(import.meta);

interface LlmOptions {
  paths: string[];
  extensions: string[];
  includeHidden: boolean;
  ignoreFilesOnly: boolean;
  ignoreGitignore: boolean;
  ignorePatterns: string[];
  outputFile?: string;
  cxml: boolean;
  lineNumbers: boolean;
}

/**
 * Helper functions previously in TiktokenResource
 */
function encodeText(text: string): number[] {
  // tiktoken.encode() returns an iterator-like object;
  // convert to array, then map to Number just to be safe.
  return Array.from(encoding.encode(text)).map(Number);
}

// function decodeTokens(tokens: number[]): string {
//   // tiktoken.decode() returns a Uint8Array-like object; convert to string
//   const decoded = String(encoding.decode(tokens));
//   // Optionally remove leading/trailing quotes
//   return decoded.replace(/^"|"$/g, "");
// }

function countTokens(text: string): number {
  return encodeText(text).length;
}

/**
 * Main command called by bff.
 * Usage example:
 *   bff llm path/to/folder -e .ts -e .md --ignore "*.test.*" -c -n
 */
export async function llm(args: string[]): Promise<number> {
  try {
    const opts = parseArgs(args);

    let outputFileHandle: Deno.FsFile | undefined;
    if (opts.outputFile) {
      logger.info(`Writing to ${opts.outputFile}`);
      outputFileHandle = await Deno.open(opts.outputFile, {
        write: true,
        create: true,
        truncate: true,
      });
    }

    // Define a simple “writer” function that either writes to stdout or a file.
    const writer = async (line: string) => {
      if (outputFileHandle) {
        await outputFileHandle.write(new TextEncoder().encode(line + "\n"));
      } else {
        logger.info(line);
      }
    };

    // If using XML-ish mode, start with <documents>.
    if (opts.cxml) {
      await writer("<documents>");
    }

    // Collect .gitignore patterns globally
    const globalGitignorePatterns = new Set<string>();
    if (!opts.ignoreGitignore) {
      for (const p of opts.paths) {
        await collectGitignorePatterns(p, globalGitignorePatterns);
      }
    }

    // Process paths
    let docIndex = 1;
    for (const p of opts.paths) {
      docIndex = await processPath(
        p,
        opts,
        globalGitignorePatterns,
        writer,
        docIndex,
      );
    }

    // Close XML-ish
    if (opts.cxml) {
      await writer("</documents>");
    }

    if (outputFileHandle) {
      outputFileHandle.close();
    }

    // Count total tokens in the final output
    const allContent = await Deno.readTextFile(
      opts.outputFile ?? "build/llm.txt",
    );
    const totalTokens = countTokens(allContent);
    logger.warn(`Total tokens: ${totalTokens}`);

    return 0;
  } catch (error) {
    logger.error("bff llm: Error", error);
    return 1;
  }
}

/**
 * Parse the command-line arguments in a simple, manual way.
 */
function parseArgs(args: string[]): LlmOptions {
  const opts: LlmOptions = {
    paths: [],
    extensions: [],
    includeHidden: false,
    ignoreFilesOnly: false,
    ignoreGitignore: false,
    ignorePatterns: [],
    cxml: false,
    lineNumbers: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case "-e":
      case "--extension": {
        i++;
        if (i < args.length) {
          opts.extensions.push(args[i]);
        }
        break;
      }
      case "--include-hidden": {
        opts.includeHidden = true;
        break;
      }
      case "--ignore-files-only": {
        opts.ignoreFilesOnly = true;
        break;
      }
      case "--ignore-gitignore": {
        opts.ignoreGitignore = true;
        break;
      }
      case "--ignore": {
        i++;
        if (i < args.length) {
          opts.ignorePatterns.push(args[i]);
        }
        break;
      }
      case "-o":
      case "--output": {
        i++;
        if (i < args.length) {
          opts.outputFile = args[i];
        }
        break;
      }
      case "-c":
      case "--cxml": {
        opts.cxml = true;
        break;
      }
      case "-n":
      case "--line-numbers": {
        opts.lineNumbers = true;
        break;
      }
      default: {
        opts.paths.push(arg);
        break;
      }
    }
    i++;
  }

  if (opts.paths.length === 0) {
    opts.paths = ["."];
  }

  return opts;
}

/**
 * Recursively collects patterns from .gitignore files, starting at `startPath`
 * and walking upward.
 */
async function collectGitignorePatterns(
  startPath: string,
  patternSet: Set<string>,
): Promise<void> {
  let currentDir = (await isDirectory(startPath))
    ? startPath
    : dirname(startPath);

  while (true) {
    const gitignorePath = join(currentDir, ".gitignore");
    if (await exists(gitignorePath)) {
      const content = await Deno.readTextFile(gitignorePath);
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        patternSet.add(trimmed);
      }
    }
    const parent = dirname(currentDir);
    if (parent === currentDir) {
      break;
    }
    currentDir = parent;
  }
}

/**
 * Return true if the path is a directory.
 */
async function isDirectory(p: string): Promise<boolean> {
  const info = await Deno.stat(p);
  return info.isDirectory;
}

/**
 * Process a path (file or directory). If directory, walk it.
 */
async function processPath(
  startPath: string,
  opts: LlmOptions,
  gitignorePatterns: Set<string>,
  writer: (line: string) => Promise<void>,
  initialDocIndex: number,
): Promise<number> {
  let docIndex = initialDocIndex;
  const isDir = await isDirectory(startPath);
  if (!isDir) {
    return await outputOneFile(startPath, writer, opts, docIndex);
  }

  for await (
    const entry of walk(startPath, {
      maxDepth: Infinity,
      includeFiles: true,
      includeDirs: false,
    })
  ) {
    const filename = basename(entry.path);

    // 1) If ignoring hidden
    if (!opts.includeHidden && filename.startsWith(".")) {
      continue;
    }
    // 2) If ignoring patterns
    if (shouldIgnore(entry.path, opts.ignorePatterns, opts.ignoreFilesOnly)) {
      continue;
    }
    // 3) If ignoring .gitignore
    if (
      !opts.ignoreGitignore && matchesGitignore(entry.path, gitignorePatterns)
    ) {
      continue;
    }
    // 4) If extension is not in allowed list
    if (opts.extensions.length > 0) {
      const fext = extname(entry.path);
      if (!opts.extensions.includes(fext)) {
        continue;
      }
    }

    docIndex = await outputOneFile(entry.path, writer, opts, docIndex);
  }

  return docIndex;
}

async function isBinaryFile(filePath: string): Promise<boolean> {
  try {
    const file = await Deno.open(filePath);
    const buffer = new Uint8Array(512);
    const bytesRead = await file.read(buffer);
    file.close();
    if (bytesRead === null) return false;

    const slice = buffer.slice(0, bytesRead);
    let suspiciousBytes = 0;
    for (const byte of slice) {
      if (byte === 0) return true; // definitely binary
      if (byte < 7 || (byte > 14 && byte < 32)) suspiciousBytes++;
    }
    // If over 30% is unusual ASCII, likely binary
    return (suspiciousBytes / bytesRead) > 0.3;
  } catch {
    return false;
  }
}

/**
 * Output a single file's content in either default or cxml mode.
 */
async function outputOneFile(
  filePath: string,
  writer: (line: string) => Promise<void>,
  opts: LlmOptions,
  docIndex: number,
): Promise<number> {
  if (await isBinaryFile(filePath)) {
    return docIndex; // skip
  }

  let content: string;
  try {
    content = await Deno.readTextFile(filePath);
  } catch {
    return docIndex;
  }

  if (opts.cxml) {
    await writer(`<document index="${docIndex}">`);
    await writer(`<source>${filePath}</source>`);
    await writer(`<document_content>`);
    if (opts.lineNumbers) {
      await writer(addLineNumbers(content));
    } else {
      await writer(content);
    }
    await writer(`</document_content>`);
    await writer(`</document>`);
    return docIndex + 1;
  }

  // Otherwise, default format
  await writer(filePath);
  await writer("---");
  if (opts.lineNumbers) {
    await writer(addLineNumbers(content));
  } else {
    await writer(content);
  }
  await writer("---");
  await writer("");
  return docIndex;
}

function shouldIgnore(
  filePath: string,
  ignorePatterns: string[],
  _ignoreFilesOnly: boolean,
): boolean {
  for (const pattern of ignorePatterns) {
    const reg = globToRegExp(pattern, { extended: true, globstar: true });
    if (reg.test(basename(filePath))) {
      return true;
    }
  }
  return false;
}

function matchesGitignore(filePath: string, patternSet: Set<string>): boolean {
  const name = basename(filePath);
  for (const pat of patternSet) {
    const reg = globToRegExp(pat, { extended: true, globstar: true });
    // Check both the filename and the entire path
    if (reg.test(name) || reg.test(filePath)) {
      return true;
    }
  }
  return false;
}

function addLineNumbers(content: string): string {
  const lines = content.split("\n");
  const pad = String(lines.length).length;
  return lines
    .map((line, i) => `${(i + 1).toString().padStart(pad, " ")}  ${line}`)
    .join("\n");
}

// Finally, register the "llm" command.
register(
  "llm",
  "Outputs files in a prompt-friendly format (like files-to-prompt-cli).",
  llm,
);
