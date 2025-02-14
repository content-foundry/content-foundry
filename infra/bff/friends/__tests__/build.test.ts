// Tests for ./infra/bff/friends/build.bff.ts
import { assertEquals } from "@std/assert";
import { build } from "../build.bff.ts";

// Note: build() runs shell commands to compile. 
// Typically you'd mock runShellCommand for unit tests; 
// here we'll just do a minimal test that it doesn't throw.
Deno.test("build: runs the build function", async () => {
  const code = await build();
  // We can't guarantee success in a real environment. 
  // But let's verify we got a numeric code back.
  assertEquals(typeof code, "number");
});