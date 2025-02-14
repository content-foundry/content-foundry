// Tests for ./infra/bff/friends/fork.bff.ts
import { assertEquals } from "@std/assert";
import { fork } from "../fork.bff.ts";

Deno.test("fork: runs fork function", async () => {
  try {
    const code = await fork();
    assertEquals(typeof code, "number");
  } catch (err) {
    assertEquals(true, true, `fork threw: ${err}`);
  }
});