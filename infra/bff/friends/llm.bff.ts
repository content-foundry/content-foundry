// ./infra/bff/friends/llm.bff.ts
import { register } from "infra/bff/bff.ts";
import { walk } from "@std/fs/walk";
import { basename, dirname, extname, join } from "@std/path";
import { globToRegExp } from "@std/path";
import { exists } from "@std/fs/exists";
import { getLogger } from "packages/logger.ts";

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
 * Main command called by bff.
 * Usage example:
 *   bff llm path/to/folder -e .ts -e .md --ignore "*.test.*" -c -n
 */
export async function llm(args: string[]): Promise<number> {
  try {
    const opts = parseArgs(args);

    // If an output file is specified, we’ll create/overwrite it.
    let outputFileHandle: Deno.FsFile | undefined;
    if (opts.outputFile) {
      outputFileHandle = await Deno.open(opts.outputFile, {
        write: true,
        create: true,
        truncate: true,
      });
    }

    // Define a simple “writer” function that either writes to stdout or the file.
    const writer = async (line: string) => {
      if (outputFileHandle) {
        await outputFileHandle.write(new TextEncoder().encode(line + "\n"));
      } else {
        logger.info(line);
      }
    };

    // If using XML-ish mode for Claude, add <documents> tag at the start.
    if (opts.cxml) {
      await writer("<documents>");
    }

    // Collect .gitignore patterns globally (if `--ignore-gitignore` is not set).
    const globalGitignorePatterns = new Set<string>();
    if (!opts.ignoreGitignore) {
      for (const p of opts.paths) {
        // If p is a directory, look for .gitignore inside it (and recursively up).
        await collectGitignorePatterns(p, globalGitignorePatterns);
      }
    }

    // Process all specified paths in the same manner.
    let docIndex = 1;
    for (const p of opts.paths) {
      await processPath(
        p,
        opts,
        globalGitignorePatterns,
        writer,
        docIndex,
      ).then((nextIndex) => {
        docIndex = nextIndex; // keep incrementing index across multiple paths
      });
    }

    // If using XML-ish mode for Claude, close the </documents> tag.
    if (opts.cxml) {
      await writer("</documents>");
    }

    if (outputFileHandle) {
      outputFileHandle.close();
    }

    return 0;
  } catch (error) {
    logger.error("bff llm: Error", error);
    return 1;
  }
}

/**
 * Parse the command-line arguments in a simple, manual way.
 * (Feel free to adjust to your liking; BFF is just raw Deno.args after `bff llm`.)
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

  // We'll do a basic manual parse. More robust solutions might use a library like std/flags,
  // but let's keep it straightforward for BFF usage.
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
        // If it doesn't match a known flag, consider it a path.
        opts.paths.push(arg);
        break;
      }
    }

    i++;
  }

  // If the user didn’t provide any paths, default to current directory.
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
  // If startPath is a file, use its directory.
  let currentDir = (await isDirectory(startPath))
    ? startPath
    : dirname(startPath);

  while (true) {
    const gitignorePath = join(currentDir, ".gitignore");
    if (await exists(gitignorePath)) {
      // read all lines
      const content = await Deno.readTextFile(gitignorePath);
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        patternSet.add(trimmed);
      }
    }

    const parent = dirname(currentDir);
    if (parent === currentDir) {
      break; // root reached
    }
    currentDir = parent;
  }
}

/**
 * Return true if the path is a directory, false if file, or error if missing.
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
    docIndex = await outputOneFile(startPath, writer, opts, docIndex);
    return docIndex;
  }

  // It's a directory, so let's walk it:
  for await (
    const entry of walk(startPath, {
      maxDepth: Infinity,
      includeFiles: true,
      includeDirs: false,
    })
  ) {
    const _rel = entry.path.slice(startPath.length).replace(/^\/+/, "");
    const filename = basename(entry.path);

    // 1) If ignoring hidden files
    if (!opts.includeHidden && filename.startsWith(".")) {
      continue;
    }

    // 2) If ignoring patterns (like *.test.*, etc.)
    if (shouldIgnore(entry.path, opts.ignorePatterns, opts.ignoreFilesOnly)) {
      continue;
    }

    // 3) If .gitignore is to be respected, see if it matches any pattern
    if (
      !opts.ignoreGitignore &&
      matchesGitignore(entry.path, startPath, gitignorePatterns)
    ) {
      continue;
    }

    // 4) If extensions are set, skip if not in the set
    if (opts.extensions.length > 0) {
      const fext = extname(entry.path);
      if (!opts.extensions.includes(fext)) {
        continue;
      }
    }

    // Now output the file
    docIndex = await outputOneFile(entry.path, writer, opts, docIndex);
  }

  return docIndex;
}

/**
 * Check if a file appears to be binary by examining its first few bytes.
 * Returns true if the file seems to be binary, false if it looks like text.
 */
async function isBinaryFile(filePath: string): Promise<boolean> {
  try {
    // Read first 512 bytes
    const file = await Deno.open(filePath);
    const buffer = new Uint8Array(512);
    const bytesRead = await file.read(buffer);
    file.close();

    if (bytesRead === null) return false; // Empty file, treat as text

    // Check the actual bytes read
    const slice = buffer.slice(0, bytesRead);

    // Look for null bytes or high concentration of non-printable chars
    let suspiciousBytes = 0;
    for (const byte of slice) {
      if (byte === 0) return true; // Null byte -> definitely binary
      if (byte < 7 || (byte > 14 && byte < 32)) suspiciousBytes++;
    }

    // If more than 30% non-printable chars, likely binary
    return (suspiciousBytes / bytesRead) > 0.3;
  } catch {
    return false; // If can't read file, treat as text (let downstream handle it)
  }
}

/**
 * Output a single file’s content, either in default or XML-ish mode.
 */
async function outputOneFile(
  filePath: string,
  writer: (line: string) => Promise<void>,
  opts: LlmOptions,
  docIndex: number,
): Promise<number> {
  // First check if it's a binary file
  if (await isBinaryFile(filePath)) {
    return docIndex; // Skip binary files silently
  }

  let content: string;
  try {
    content = await Deno.readTextFile(filePath);
  } catch {
    return docIndex; // skip unreadable files
  }

  if (opts.cxml) {
    await writer(`<document index="${docIndex}">`);
    await writer(`<source>${filePath}</source>`);
    await writer(`<document_content>`);
    if (opts.lineNumbers) {
      const numbered = addLineNumbers(content);
      await writer(numbered);
    } else {
      await writer(content);
    }
    await writer(`</document_content>`);
    await writer(`</document>`);
    return docIndex + 1;
  }

  // Otherwise, default output style
  await writer(filePath);
  await writer("---");
  if (opts.lineNumbers) {
    const numbered = addLineNumbers(content);
    await writer(numbered);
  } else {
    await writer(content);
  }
  await writer("---");
  await writer(""); // blank line
  return docIndex;
}

/**
 * Checks if the file should be ignored based on patterns.
 * If --ignore-files-only is set, we do not exclude directories from these patterns, etc.
 */
function shouldIgnore(
  filePath: string,
  ignorePatterns: string[],
): boolean {
  for (const pattern of ignorePatterns) {
    // Convert the user pattern into a regex
    const reg = globToRegExp(pattern, { extended: true, globstar: true });
    if (reg.test(basename(filePath))) {
      // If ignoring only files, see if the path is a file
      // but we typically skip it if it's matched.
      return true;
    }
  }
  return false;
}

/**
 * Checks if filePath matches any patterns from .gitignore.
 * Typically .gitignore patterns are relative to the repo root or the .gitignore location.
 * We do a simplistic approach: if the basename matches, we skip.
 * For real correctness, you’d interpret each .gitignore pattern relative to its containing directory.
 */
function matchesGitignore(
  filePath: string,
  _rootDir: string,
  patternSet: Set<string>,
): boolean {
  // For simplicity, just check if the file’s name or path matches any pattern.
  const name = basename(filePath);
  for (const pat of patternSet) {
    const reg = globToRegExp(pat, { extended: true, globstar: true });
    // You could also do something like checking the relative path from the .gitignore's folder.
    if (reg.test(name) || reg.test(filePath)) {
      return true;
    }
  }
  return false;
}

/**
 * Adds line numbers to each line of the file content.
 */
function addLineNumbers(content: string): string {
  const lines = content.split("\n");
  const pad = String(lines.length).length;
  return lines.map((line, i) => {
    const lineNum = (i + 1).toString().padStart(pad, " ");
    return `${lineNum}  ${line}`;
  }).join("\n");
}

// Finally, register the new friend for "bff llm" usage:
register(
  "llm",
  "Outputs files in a prompt-friendly format (like files-to-prompt-cli).",
  llm,
);
