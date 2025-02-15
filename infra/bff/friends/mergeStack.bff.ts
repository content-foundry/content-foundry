import { register } from "infra/bff/bff.ts";
import {
  runShellCommand as defaultRunShellCommand,
  runShellCommandWithOutput as defaultRunShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export interface Shell {
  runShellCommand(cmd: string[]): Promise<number>;
  runShellCommandWithOutput(cmd: string[]): Promise<string>;
}

const defaultShell: Shell = {
  runShellCommand: defaultRunShellCommand,
  runShellCommandWithOutput: defaultRunShellCommandWithOutput,
};

/** The *testable* version of mergeStack, which can be called with a mock shell. */
export async function mergeStack(shell: Shell = defaultShell): Promise<number> {
  const currentPR = await getCurrentPR(shell);
  if (!currentPR) {
    logger.error("No current pull request found");
    return 1;
  }

  // Merge current PR
  logger.info(`Merging PR #${currentPR}...`);
  const mergeResult = await shell.runShellCommand([
    "gh",
    "pr",
    "merge",
    currentPR,
    "--merge",
    "--delete-branch",
  ]);
  if (mergeResult !== 0) {
    logger.error("Failed to merge current PR");
    return mergeResult;
  }

  // Close stacked PRs
  const stackedPRs = await getStackedPRs(shell, currentPR);
  for (const prNumber of stackedPRs) {
    logger.info(`Closing PR #${prNumber}...`);
    await shell.runShellCommand(["gh", "pr", "close", prNumber]);
  }

  logger.info("Successfully merged PR and closed stacked PRs!");
  return 0;
}

/**
 * The BffCommand adapter: it matches the signature (options: string[]) => Promise<number>
 * and simply calls the real testable function.
 */
export function mergeStackBffCommand(): Promise<number> {
  return mergeStack(); // uses defaultShell
}

// Finally, we register the BffCommand
register(
  "mergeStack",
  "Merge current PR and close stacked PRs",
  mergeStackBffCommand,
);

/**
 * Helper to fetch the current PR # or null if none.
 */
async function getCurrentPR(shell: Shell): Promise<string | null> {
  try {
    const output = await shell.runShellCommandWithOutput([
      "gh",
      "pr",
      "view",
      "--json",
      "number",
    ]);
    // If the JSON has { number: 123 }, turn it into "123"
    const prNumber = JSON.parse(output).number;
    return prNumber != null ? String(prNumber) : null;
  } catch {
    return null;
  }
}

/**
 * Helper to find PRs that mention the current PR in their body, etc.
 */
async function getStackedPRs(
  shell: Shell,
  currentPR: string,
): Promise<string[]> {
  const output = await shell.runShellCommandWithOutput([
    "gh",
    "pr",
    "list",
    "--json",
    "number,body",
  ]);
  const prs = JSON.parse(output);
  return prs
    // deno-lint-ignore no-explicit-any
    .filter((pr: any) => pr.body.includes(`#${currentPR}`))
    // deno-lint-ignore no-explicit-any
    .map((pr: any) => String(pr.number));
}
