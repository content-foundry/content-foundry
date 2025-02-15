// Tests for ./infra/bff/bff.ts
import { assertEquals, assertExists } from "@std/assert";
import { friendMap, register } from "../bff.ts";

Deno.test("bff: help friend should exist", () => {
  const helpFriend = friendMap.get("help");
  assertExists(helpFriend, "Help friend was not registered");
});

Deno.test("bff: registering a friend updates friendMap", () => {
  const testCommand = () => 0;
  register("testFriend", "A test friend", testCommand);
  const got = friendMap.get("testFriend");
  assertExists(got);
  assertEquals(got?.description, "A test friend");
});
