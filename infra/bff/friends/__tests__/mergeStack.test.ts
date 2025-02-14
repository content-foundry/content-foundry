import { assertEquals } from "@std/assert";
import { mergeStack } from "../mergeStack.bff.ts";

/**
 * A mock shell that you can adapt for different test scenarios.
 */
function createMockShell(
  cmdResponses: Record<string, { status?: number; stdout?: string; stderr?: string }>,
) {
  // We'll store each command we "ran" in here, for verification
  const issuedCommands: string[][] = [];

  return {
    issuedCommands,
    async runShellCommand(cmd: string[]): Promise<number> {
      issuedCommands.push(cmd);
      const key = cmd.join(" ");
      const response = cmdResponses[key];
      if (!response) {
        // By default, if we have no mapping, treat it as success
        return 0;
      }
      // If the test wants to produce a certain non-zero exit code, do it here
      return response.status ?? 0;
    },

    async runShellCommandWithOutput(cmd: string[]): Promise<string> {
      issuedCommands.push(cmd);
      const key = cmd.join(" ");
      const response = cmdResponses[key];
      if (!response) {
        // By default, if we have no mapping, treat it as empty output
        return "";
      }
      if (response.status && response.status !== 0) {
        // If we have a failing status, let's simulate an error by throwing
        throw new Error(response.stderr ?? "Some error");
      }
      return response.stdout ?? "";
    },
  };
}

Deno.test("mergeStack - returns 1 if no current PR exists", async () => {
  // We simulate `gh pr view --json number` failing => means no PR
  const shell = createMockShell({
    "gh pr view --json number": {
      status: 1,        // => non-zero exit code
      stderr: "no PR",  // => we throw an error from runShellCommandWithOutput
    },
  });

  const exitCode = await mergeStack(shell);
  assertEquals(exitCode, 1);

  // Optionally, verify commands that were called
  // "gh pr view --json number" is the only one we expect
  assertEquals(shell.issuedCommands, [
    ["gh", "pr", "view", "--json", "number"],
  ]);
});

Deno.test("mergeStack - merges the PR and closes stacked PRs", async () => {
  const shell = createMockShell({
    // First call: "gh pr view --json number" => returns PR #123
    "gh pr view --json number": {
      status: 0,
      stdout: JSON.stringify({ number: 123 }),
    },
    // We simulate "gh pr merge 123 --merge --delete-branch" => success
    "gh pr merge 123 --merge --delete-branch": {
      status: 0,
    },
    // We simulate "gh pr list --json number,body" => returns two PRs referencing #123
    "gh pr list --json number,body": {
      status: 0,
      stdout: JSON.stringify([
        { number: 124, body: "some text #123 and more" },
        { number: 125, body: "some text #123 and more" },
        { number: 126, body: "no mention" },
      ]),
    },
    // Now each close
    "gh pr close 124": { status: 0 },
    "gh pr close 125": { status: 0 },
  });

  const exitCode = await mergeStack(shell);
  assertEquals(exitCode, 0);

  // Check the actual commands that got run
  assertEquals(shell.issuedCommands, [
    // 1) getCurrentPR
    ["gh", "pr", "view", "--json", "number"],
    // 2) merge current PR (#123)
    ["gh", "pr", "merge", "123", "--merge", "--delete-branch"],
    // 3) get stacked PRs
    ["gh", "pr", "list", "--json", "number,body"],
    // 4) close #124
    ["gh", "pr", "close", "124"],
    // 5) close #125
    ["gh", "pr", "close", "125"],
  ]);
});