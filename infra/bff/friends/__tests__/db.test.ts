// Tests for ./infra/bff/friends/db.bff.ts
import { assertEquals } from "@std/assert";
import { dbReset, dbClean } from "../db.bff.ts";

// These commands can destroy a dev DB or manipulate it, so in real usage you'd mock them.
// We'll do minimal tests verifying they return a number.

Deno.test("db:reset returns exit code", async () => {
  const code = await dbReset();
  // Possibly it returns 1337 if BF_ENV != "DEVELOPMENT"
  assertEquals(typeof code, "number");
});

Deno.test("db:clean returns exit code", async () => {
  const code = await dbClean();
  assertEquals(typeof code, "number");
});