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
 * Main command: bff llm
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

    const writer = async (line: string) => {
      if (outputFileHandle) {
        await outputFileHandle.write(new TextEncoder().encode(line + "\n"));
      } else {
        logger.info(line);
      }
    };

    // If cxml mode, open the <documents> tag
    if (opts.cxml) {
      await writer("<documents>");
    }

    const globalGitignorePatterns = new Set<string>();
    if (!opts.ignoreGitignore) {
      for (const p of opts.paths) {
        await collectGitignorePatterns(p, globalGitignorePatterns);
      }
    }

    // Process all requested paths
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

    // close cxml
    if (opts.cxml) {
      await writer("</documents>");
    }

    if (outputFileHandle) {
      outputFileHandle.close();
    }

    // If no output file was specified, there's nothing to count tokens on
    if (!opts.outputFile) {
      logger.warn("No --output file specified; skipping token count.");
      return 0;
    }

    // Count total tokens
    const allContent = await Deno.readTextFile(opts.outputFile);
    const totalTokens = await countTokens(allContent);
    logger.warn(`Total tokens: ${totalTokens}`);

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

async function processPath(
  startPath: string,
  opts: LlmOptions,
  gitignorePatterns: Set<string>,
  writer: (line: string) => Promise<void>,
  initialDocIndex: number,
): Promise<number> {
  let docIndex = initialDocIndex;
  const dirCheck = await isDirectory(startPath);
  if (!dirCheck) {
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

    // 1) skip hidden files unless --include-hidden
    if (!opts.includeHidden && filename.startsWith(".")) continue;
    // 2) skip if pattern matched
    if (shouldIgnore(entry.path, opts.ignorePatterns, opts.ignoreFilesOnly)) {
      continue;
    }
    // 3) skip if matches .gitignore
    if (
      !opts.ignoreGitignore && matchesGitignore(entry.path, gitignorePatterns)
    ) continue;
    // 4) skip if extension not in list
    if (opts.extensions.length > 0) {
      const fext = extname(entry.path);
      if (!opts.extensions.includes(fext)) continue;
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

  const outputLines: string[] = [];
  if (opts.cxml) {
    outputLines.push(`<document index="${docIndex}">`);
    outputLines.push(`<source>${filePath}</source>`);
    outputLines.push(`<document_content>`);
    if (opts.lineNumbers) {
      outputLines.push(addLineNumbers(content));
    } else {
      outputLines.push(content);
    }
    outputLines.push(`</document_content>`);
    outputLines.push(`</document>`);
  } else {
    outputLines.push(filePath);
    outputLines.push("---");
    if (opts.lineNumbers) {
      outputLines.push(addLineNumbers(content));
    } else {
      outputLines.push(content);
    }
    outputLines.push("---");
    outputLines.push("");
  }

  const outputContent = outputLines.join("\n");
  if (opts.stdOut) {
    await writer(outputContent);
  } else {
    if (opts.outputFile) {
      const existingContent = await Deno.readTextFile(opts.outputFile).catch(
        () => "",
      );
      await Deno.writeTextFile(
        opts.outputFile,
        existingContent + outputContent,
      );
    }
  }
  return docIndex + 1;
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
