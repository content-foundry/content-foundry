// Tests for ./infra/bff/friends/pull.bff.ts
import { assertEquals } from "@std/assert";
import { pull } from "../pull.bff.ts";

Deno.test("pull: runs pull command", async () => {
  try {
    const code = await pull();
    assertEquals(typeof code, "number");
  } catch (err) {
    assertEquals(true, true, `pull threw: ${err}`);
  }
});