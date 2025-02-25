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
  stdOut: boolean;
  cxml: boolean;
  lineNumbers: boolean;
}

/**
 * Lazily load & cache the Python-based `tiktoken` encoding object.
 */
// deno-lint-ignore no-explicit-any
let _encoding: any; // storing the tiktoken encoding object
let _pythonEnvSet = false; // so we only set env once

async function ensurePythonEnv() {
  if (_pythonEnvSet) return;

  // 1) run your one-line Python to get the library directory
  // Using the new Deno.Command API
  const cmd = new Deno.Command("python", {
    args: ["-c", 'import sysconfig; print(sysconfig.get_config_var("LIBDIR"))'],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await cmd.output();
  if (code !== 0) {
    const err = new TextDecoder().decode(stderr);
    throw new Error(`Failed to retrieve LIBDIR from Python: ${err}`);
  }
  const libDir = new TextDecoder().decode(stdout).trim();
  const soPath = `${libDir}/libpython3.so`;

  // 2) set the env var for denosaurs/python
  Deno.env.set("DENO_PYTHON_PATH", soPath);

  _pythonEnvSet = true;
}

async function getEncoding() {
  if (!_encoding) {
    // Make sure the environment is configured *before* we import the python module
    await ensurePythonEnv();

    // Dynamically import the python & tiktoken
    const { python } = await import("@denosaurs/python");
    const tiktoken = python.import("tiktoken");
    _encoding = tiktoken.get_encoding("cl100k_base");
  }
  return _encoding;
}

/**
 * Helper functions for encoding/decoding text
 */
async function encodeText(text: string): Promise<number[]> {
  const encoding = await getEncoding();
  // encoding.encode() returns something iterable; convert it to an array
  return Array.from(encoding.encode(text)).map(Number);
}

async function countTokens(text: string): Promise<number> {
  return (await encodeText(text)).length;
}

/**
 * Escapes XML special characters in a string.
 * This is used for file paths and other metadata that appears in XML attributes.
 */
function escapeXmlForAttributes(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Collects and processes files into the Claude-friendly XML format.
 * Returns the complete output as a single string.
 */
async function collectFilesOutput(
  opts: LlmOptions,
): Promise<string> {
  const outputParts: string[] = [];

  // Start with XML header if in cxml mode
  if (opts.cxml) {
    outputParts.push("<documents>");
  }

  // Get gitignore patterns
  const globalGitignorePatterns = new Set<string>();
  if (!opts.ignoreGitignore) {
    for (const p of opts.paths) {
      await collectGitignorePatterns(p, globalGitignorePatterns);
    }
  }

  // Process all requested paths
  let docIndex = 1;
  for (const p of opts.paths) {
    // For each path, process files
    const pathResult = await processFolderOrFile(
      p,
      opts,
      globalGitignorePatterns,
      docIndex,
    );
    // Append results to the output and update the document index
    outputParts.push(...pathResult.parts);
    docIndex = pathResult.nextIndex;
  }

  // Close XML if in cxml mode
  if (opts.cxml) {
    outputParts.push("</documents>");
  }

  // Return the complete content as a single string
  return outputParts.join("\n");
}

/**
 * Main command: bff llm
 */
export async function llm(args: string[]): Promise<number> {
  try {
    const opts = parseArgs(args);

    // Collect all output into a single string
    const output = await collectFilesOutput(opts);

    // Output based on chosen mode
    if (opts.stdOut) {
      logger.info(output);
    } else if (opts.outputFile) {
      logger.info(`Writing to ${opts.outputFile}`);
      await Deno.writeTextFile(opts.outputFile, output);

      // Count tokens if we have an output file
      const totalTokens = await countTokens(output);
      logger.warn(`Total tokens: ${totalTokens}`);
    } else {
      logger.warn("No --output file specified; skipping token count.");
    }

    return 0;
  } catch (err) {
    logger.error("bff llm: Error", err);
    return 1;
  }
}

function parseArgs(args: string[]): LlmOptions {
  const opts: LlmOptions = {
    paths: [],
    extensions: [],
    includeHidden: false,
    ignoreFilesOnly: false,
    ignoreGitignore: false,
    ignorePatterns: [],
    outputFile: "build/llm.txt",
    stdOut: false,
    cxml: false,
    lineNumbers: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case "-e":
      case "--extension":
        i++;
        if (i < args.length) opts.extensions.push(args[i]);
        break;
      case "--include-hidden":
        opts.includeHidden = true;
        break;
      case "--ignore-files-only":
        opts.ignoreFilesOnly = true;
        break;
      case "--ignore-gitignore":
        opts.ignoreGitignore = true;
        break;
      case "--ignore":
        i++;
        if (i < args.length) opts.ignorePatterns.push(args[i]);
        break;
      case "-o":
      case "--output":
        i++;
        if (i < args.length) opts.outputFile = args[i];
        break;
      case "-c":
      case "--cxml":
        opts.cxml = true;
        break;
      case "-n":
      case "--line-numbers":
        opts.lineNumbers = true;
        break;
      case "--std-out":
        opts.stdOut = true;
        opts.outputFile = undefined;
        break;
      default:
        opts.paths.push(arg);
        break;
    }
    i++;
  }

  // default path is "."
  if (opts.paths.length === 0) {
    opts.paths = ["."];
  }

  return opts;
}

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
    if (parent === currentDir) break;
    currentDir = parent;
  }
}

async function isDirectory(p: string): Promise<boolean> {
  const info = await Deno.stat(p);
  return info.isDirectory;
}

/**
 * Process a folder or file and return the resulting output parts
 * and the next document index to use.
 */
async function processFolderOrFile(
  startPath: string,
  opts: LlmOptions,
  gitignorePatterns: Set<string>,
  initialDocIndex: number,
): Promise<{ parts: string[]; nextIndex: number }> {
  const outputParts: string[] = [];
  let docIndex = initialDocIndex;

  const dirCheck = await isDirectory(startPath);
  if (!dirCheck) {
    // Process single file case
    const fileResult = await processFile(startPath, opts, docIndex);
    if (fileResult) {
      outputParts.push(...fileResult.parts);
      docIndex = fileResult.nextIndex;
    }
    return { parts: outputParts, nextIndex: docIndex };
  }

  // Process directory case
  for await (
    const entry of walk(startPath, {
      maxDepth: Infinity,
      includeFiles: true,
      includeDirs: false,
    })
  ) {
    const filename = basename(entry.path);

    // Apply filters
    if (!opts.includeHidden && filename.startsWith(".")) continue;
    if (shouldIgnore(entry.path, opts.ignorePatterns, opts.ignoreFilesOnly)) {
      continue;
    }
    if (
      !opts.ignoreGitignore && matchesGitignore(entry.path, gitignorePatterns)
    ) continue;
    if (opts.extensions.length > 0) {
      const fext = extname(entry.path);
      if (!opts.extensions.includes(fext)) continue;
    }

    // Process each file
    const fileResult = await processFile(entry.path, opts, docIndex);
    if (fileResult) {
      outputParts.push(...fileResult.parts);
      docIndex = fileResult.nextIndex;
    }
  }

  return { parts: outputParts, nextIndex: docIndex };
}

async function isBinaryFile(filePath: string): Promise<boolean> {
  try {
    const file = await Deno.open(filePath);
    const buffer = new Uint8Array(512);
    const bytesRead = await file.read(buffer);
    file.close();
    if (bytesRead === null) return false;

    // quick heuristic
    const slice = buffer.slice(0, bytesRead);
    let suspiciousBytes = 0;
    for (const byte of slice) {
      if (byte === 0) return true; // definitely binary
      if (byte < 7 || (byte > 14 && byte < 32)) suspiciousBytes++;
    }
    // if over 30% is unusual ASCII, likely binary
    return suspiciousBytes / bytesRead > 0.3;
  } catch {
    return false;
  }
}

/**
 * Process a single file and return its output parts + next index
 */
async function processFile(
  filePath: string,
  opts: LlmOptions,
  docIndex: number,
): Promise<{ parts: string[]; nextIndex: number } | null> {
  // Skip binary files
  if (await isBinaryFile(filePath)) {
    return null;
  }

  // Try to read the file
  let content: string;
  try {
    content = await Deno.readTextFile(filePath);
  } catch {
    return null;
  }

  const parts: string[] = [];

  if (opts.lineNumbers) {
    content = addLineNumbers(content);
  }

  // Format based on options
  if (opts.cxml) {
    // Claude XML mode with proper escaping of file paths
    parts.push(`<document index="${docIndex}">`);
    parts.push(`<source>${escapeXmlForAttributes(filePath)}</source>`);
    parts.push(`<document_content>`);
    parts.push(content);
    parts.push(`</document_content>`);
    parts.push(`</document>`);
  } else {
    // Plain text mode
    parts.push(filePath);
    parts.push("---");
    parts.push(content);
    parts.push("---");
    parts.push("");
  }

  return { parts, nextIndex: docIndex + 1 };
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
    // check name or full path
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

// Finally, register the command
register(
  "llm",
  "Outputs files in a prompt-friendly format (like files-to-prompt-cli).",
  llm,
);
