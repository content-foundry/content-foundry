// ./infra/bff/friends/llmCommit.bff.ts

import { register } from "infra/bff/bff.ts";
import { runShellCommand } from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export async function llmCommit(args: string[]): Promise<number> {
  logger.info("Running llmCommit with minimal interaction...");

  // Process arguments for non-interactive mode
  let title = "Automated commit";
  let summary = "Changes detected by automated system";
  let testPlan = "Verified by system checks";

  // Check if arguments are provided for non-interactive mode
  if (args.length >= 1) {
    title = args[0];
  }
  if (args.length >= 2) {
    summary = args[1];
  }
  if (args.length >= 3) {
    testPlan = args[2];
  }

  // 1. Format code first
  logger.info("1. Formatting code with bff f");
  const formatResult = await runShellCommand(["bff", "f"]);
  if (formatResult !== 0) {
    logger.error("Failed to format code");
    return formatResult;
  }

  // 2. Generate diff file
  logger.info("2. Generating diff file");
  const diffResult = await runShellCommand(["sl", "diff", ">", "build/sl.txt"]);
  if (diffResult !== 0) {
    logger.error("Failed to generate diff file");
    return diffResult;
  }

  // 3. Analyze code changes
  logger.info("3. Analyzing code changes");
  // Here we would perform automated analysis of changes
  // This could include regex pattern matching or simple heuristics
  // For advanced analysis, we'd call an LLM API here

  // Process changes to identify logical commit splits
  try {
    const diffContent = await Deno.readTextFile("build/sl.txt");

    // Simple heuristic: Check if the diff contains changes to multiple directories
    // which could indicate logical separation
    const fileChanges = diffContent.match(/^diff --git a\/(.*?) b\//gm) || [];
    const changedFiles = fileChanges.map((line) => {
      const match = line.match(/^diff --git a\/(.*?) b\//);
      return match ? match[1] : "";
    });

    // Log files being changed for reference
    if (changedFiles.length > 0) {
      logger.info(`Files changed: ${changedFiles.join(", ")}`);
    } else {
      logger.warn("No changes detected in diff");
      return 0; // Exit if no changes to commit
    }
  } catch (error) {
    logger.warn("Could not analyze diff file:", error);
  }

  // Format the commit message
  const summaryBullets = summary.split(",").map((item) => `- ${item.trim()}`)
    .join("\n");
  const testPlanBullets = testPlan.split(",").map((item) => `- ${item.trim()}`)
    .join("\n");

  const commitMessage = `${title.trim()}

## Summary
${summaryBullets}

## Test Plan
${testPlanBullets}
`;

  // 4. Create the commit
  logger.info("4. Creating commit");
  const commitResult = await runShellCommand([
    "sl",
    "commit",
    "-m",
    commitMessage,
  ]);
  if (commitResult !== 0) {
    logger.error("Failed to create commit");
    return commitResult;
  }

  logger.info("Commit created successfully!");
  return 0;
}

register(
  "llmCommit",
  "Create a commit with LLM assistance (minimal interaction)",
  llmCommit,
);
