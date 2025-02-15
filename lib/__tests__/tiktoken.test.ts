
import { assertEquals } from "@std/assert";
import { Tiktoken } from "lib/tiktoken.ts";

Deno.test("Tiktoken.encode", async () => {
  const text = "Hello, world!";
  const tokens = Tiktoken.encode(text);
  assertEquals(Array.isArray(tokens), true, "Encoded result should be an array");
  assertEquals(tokens.length > 0, true, "Should have at least one token");
});

Deno.test("Tiktoken.decode", async () => {
  const text = "Hello, world!";
  const tokens = Tiktoken.encode(text);
  const decoded = Tiktoken.decode(tokens);
  assertEquals(decoded, text, "Decoded text should match original");
});

Deno.test("Tiktoken.countTokens", async () => {
  const text = "Hello, world!";
  const count = Tiktoken.countTokens(text);
  assertEquals(typeof count, "number", "Token count should be a number");
  assertEquals(count > 0, true, "Should have at least one token");
});

Deno.test("Tiktoken with different encodings", async () => {
  const text = "Testing different encodings";
  const cl100kTokens = Tiktoken.encode(text, "cl100k_base");
  const p50kTokens = Tiktoken.encode(text, "p50k_base");
  assertEquals(Array.isArray(cl100kTokens), true, "cl100k tokens should be an array");
  assertEquals(Array.isArray(p50kTokens), true, "p50k tokens should be an array");
});

Deno.test("Tiktoken singleton instance", async () => {
  const text = "Test singleton";
  const tokens1 = Tiktoken.encode(text);
  const tokens2 = Tiktoken.encode(text);
  assertEquals(tokens1, tokens2, "Multiple calls should return same tokens");
});
