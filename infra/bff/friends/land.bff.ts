import { register } from "infra/bff/bff.ts";
import {
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

async function getSaplingCommitsSince(
  lastSaplingHash: string,
): Promise<Array<string>> {
  const output = await runShellCommandWithOutput([
    "sl",
    "log",
    `-r"${lastSaplingHash}::."`,
    "--template",
    "{desc}\n",
  ]);
  return output.split("\n").filter(Boolean);
}

async function getCurrentSaplingHash(): Promise<string> {
  return (await runShellCommandWithOutput([
    "sl",
    "log",
    "-r",
    ".",
    "--template",
    "{node}",
  ])).trim();
}

async function getLastSaplingHashFromGit(): Promise<string | null> {
  try {
    const lastCommitMsg = await runShellCommandWithOutput([
      "git",
      "log",
      "-1",
      "--pretty=%B",
    ]);
    const match = lastCommitMsg.match(/Sapling-Hash: ([a-f0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function land(): Promise<number> {
  // Then pull the latest code
  logger.info("Pulling latest code from sapling...");
  const pullResult = await runShellCommand([
    "sl",
    "pull",
  ]);

  if (pullResult !== 0) {
    logger.error("Failed to pull latest code");
    return pullResult;
  }
  // Try to goto remote/main with clean state
  logger.info("Going to remote/main with clean state...");
  const gotoResult = await runShellCommand([
    "sl",
    "goto",
    "remote/main",
    "--clean",
  ]);

  if (gotoResult !== 0) {
    logger.error("Failed to goto remote/main");
    return gotoResult;
  }

  // Install dependencies
  logger.info("Installing dependencies...");
  const installResult = await runShellCommand([
    "deno",
    "install",
  ]);

  if (installResult !== 0) {
    logger.error("Failed to install dependencies");
    return installResult;
  }

  // Build BFF
  logger.info("Building BFF...");
  const buildResult = await runShellCommand([
    "bff",
    "build",
  ]);

  if (buildResult !== 0) {
    logger.error("Failed to build BFF");
    return buildResult;
  }

  const currentSaplingHash = await getCurrentSaplingHash();
  const lastSaplingHash = await getLastSaplingHashFromGit();

  let commitMsg = "";
  if (lastSaplingHash) {
    const commits = await getSaplingCommitsSince(lastSaplingHash);
    commitMsg = commits.join("\n\n");
  } else {
    commitMsg = await runShellCommandWithOutput([
      "sl",
      "log",
      "-r",
      ".",
      "--template",
      "{desc}",
    ]);
  }

  // Add all changes to git
  logger.info("Adding changes to git...");
  const addResult = await runShellCommand([
    "git",
    "add",
    ".",
  ]);

  if (addResult !== 0) {
    logger.error("Failed to add changes to git");
    return addResult;
  }

  // Create git commit with sapling commits and hash
  logger.info("Creating git commit...");
  const fullCommitMsg =
    `${commitMsg.trim()}\n\nSapling-Hash: ${currentSaplingHash}`;
  const commitResult = await runShellCommand([
    "git",
    "commit",
    "-m",
    fullCommitMsg,
  ]);

  if (commitResult !== 0) {
    logger.error("Failed to create git commit");
    return commitResult;
  }

  logger.info("Successfully landed changes!");
  return 0;
}

register(
  "land",
  "Pull code from sapling, install deps, and create a git commit",
  land,
);
