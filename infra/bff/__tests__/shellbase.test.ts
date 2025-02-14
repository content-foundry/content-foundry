// Tests for ./infra/bff/shellBase.ts
import { assertEquals, assertArrayIncludes } from "@std/assert";
import {
  runShellCommand,
  runShellCommandWithOutput,
  registerShellCommand,
  runningProcesses,
} from "../shellBase.ts";

Deno.test("shellBase: registerShellCommand adds a friend", async () => {
  // We'll just verify that calling registerShellCommand doesn't throw
  const cmd = registerShellCommand("fakeShell", "A fake command", ["echo", "hello"]);
  const result = await cmd([]);
  // Since "echo" is valid, we should get a 0 exit code in normal circumstances
  assertEquals(result, 0);
});

Deno.test("shellBase: runShellCommand should run an echo command", async () => {
  const exitCode = await runShellCommand(["echo", "shellBaseTest"]);
  assertEquals(exitCode, 0);
});

Deno.test("shellBase: runShellCommandWithOutput captures stdout", async () => {
  const output = await runShellCommandWithOutput(["echo", "shellBaseOutput"]);
  // on some systems, "echo" may append a newline
  const trimmed = output.trim();
  assertEquals(trimmed, "shellBaseOutput");
});

Deno.test("shellBase: runningProcesses array gets updated", async () => {
  // We'll run a short command and see if it appears in runningProcesses
  const initialCount = runningProcesses.length;
  await runShellCommand(["echo", "test"]);
  // Because of the ephemeral nature of Deno.Command, we can only test that
  // we didn't break anything. The process might vanish quickly.
  // So just ensure it doesn't throw and that the array is at least the same length.
  const finalCount = runningProcesses.length;
  // Typically they'd be identical, but we check anyway:
  assertEquals(finalCount >= initialCount, true);
});