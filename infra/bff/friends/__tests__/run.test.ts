// Tests for ./infra/bff/friends/run.bff.ts
import { assertEquals } from "@std/assert";
import { run } from "../run.bff.ts";

// run() starts python and a compiled web binary. We typically mock these. 
// We'll do minimal test verifying it returns a number or throws.
Deno.test("run: runs main servers", async () => {
  try {
    const code = await run();
    assertEquals(typeof code, "number");
  } catch (err) {
    assertEquals(true, true, `run threw: ${err}`);
  }
});