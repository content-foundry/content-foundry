// ./infra/bff/friends/__tests__/llm.test.ts
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { emptyDir, ensureDir } from "@std/fs";
import { llm } from "../llm.bff.ts";

/**
 * A helper function to capture output from llm. We override llm’s console output by
 * using a custom "mock writer" if we do a small tweak in llm to accept it.
 */
async function runLlmAndCapture(args: string[]): Promise<string[]> {
  const lines: string[] = [];

  // We'll mock the built-in console.log by temporarily storing the real one.
  const realLog = console.log;
  try {
    // Override to push lines into our array
    console.log = (...msgs) => {
      // join all messages with space (like console.log would) and push to lines
      lines.push(msgs.map(String).join(" "));
    };

    // Actually run the command
    const exitCode = await llm(args);

    // We'll also put the exitCode at the end if needed, or just return it from test.
    // For demonstration, we won't. We'll rely on the lines array alone.
    // But you could also push `exitCode` somewhere or do asserts.
  } finally {
    console.log = realLog; // restore
  }

  return lines;
}

Deno.test("llm - basic usage with no flags", async () => {
  // 1. Create a temporary directory
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // 2. Make some subdirs/files
    // Example: testDir/foo.md
    const fooFile = join(testDir, "foo.md");
    await Deno.writeTextFile(fooFile, "## Hello from foo.md\nLine2\nLine3");

    // 3. Run llm on this directory
    //    "bff llm" usage => pass the path. We'll do a direct function call:
    const output = await runLlmAndCapture([testDir]);

    // 4. Now check that the output includes the path and the file's content
    //    The default format is:
    //        path/to/foo.md
    //        ---
    //        (file content)
    //        ---
    //        (blank line)
    //
    // Let's do some simple assertions:
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, fooFile); // path
    assertStringIncludes(joinedOutput, "## Hello from foo.md"); // content
  } finally {
    // 5. Cleanup
    await emptyDir(testDir);
    // The OS eventually cleans up temp directories, but you can remove if you want.
    // e.g. await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("llm - cxml mode", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const barFile = join(testDir, "bar.ts");
    await Deno.writeTextFile(barFile, `console.log("Hello from bar.ts");`);

    // We pass the `-c` or `--cxml` flag
    const output = await runLlmAndCapture([testDir, "-c"]);

    const joinedOutput = output.join("\n");

    // We expect <documents>, <document index="N">, <source>..., </document> etc.
    assertStringIncludes(joinedOutput, "<documents>");
    assertStringIncludes(joinedOutput, `<source>${barFile}</source>`);
    assertStringIncludes(joinedOutput, "Hello from bar.ts");
    assertStringIncludes(joinedOutput, "</documents>");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - line numbers", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const linesFile = join(testDir, "lines.txt");
    const content = `First line\nSecond line\nThird line`;
    await Deno.writeTextFile(linesFile, content);

    const output = await runLlmAndCapture([testDir, "--line-numbers"]);
    const joinedOutput = output.join("\n");

    // For line numbers, we expect a format like:
    // 1   First line
    // 2   Second line
    // 3   Third line
    // ...
    assertStringIncludes(joinedOutput, "1  First line");
    assertStringIncludes(joinedOutput, "2  Second line");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - ignoring hidden files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // hidden file
    const hiddenFile = join(testDir, ".secret");
    await Deno.writeTextFile(hiddenFile, "You should not see me.");

    // normal file
    const normalFile = join(testDir, "visible.md");
    await Deno.writeTextFile(normalFile, "You should see me.");

    const output = await runLlmAndCapture([testDir]);

    const joinedOutput = output.join("\n");
    assertStringIncludes(joinedOutput, normalFile);
    // The hidden file should NOT appear in the output
    // (unless user provided --include-hidden)
    assert(
      !joinedOutput.includes(hiddenFile),
      "Hidden file should not be listed.",
    );
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - include hidden files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // hidden file
    const hiddenFile = join(testDir, ".secret.md");
    await Deno.writeTextFile(hiddenFile, "Hidden content.");

    // normal file
    const normalFile = join(testDir, "visible.md");
    await Deno.writeTextFile(normalFile, "Visible content.");

    // Notice we pass "--include-hidden"
    const output = await runLlmAndCapture([testDir, "--include-hidden"]);

    const joinedOutput = output.join("\n");
    assertStringIncludes(joinedOutput, hiddenFile);
    assertStringIncludes(joinedOutput, normalFile);
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - ignoring patterns", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const skipMe = join(testDir, "skip.me");
    await Deno.writeTextFile(skipMe, "Should be skipped");
    const keepMe = join(testDir, "keep.me");
    await Deno.writeTextFile(keepMe, "Should be kept");

    // We'll pass --ignore "skip.*"
    const output = await runLlmAndCapture([testDir, "--ignore", "skip.*"]);
    const joinedOutput = output.join("\n");

    // skip.me content should not appear
    assert(
      !joinedOutput.includes("Should be skipped"),
      "skip.me was included but shouldn't be.",
    );

    // keep.me should appear
    assertStringIncludes(joinedOutput, "Should be kept");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - respect .gitignore by default", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // Write a .gitignore that excludes *.ignoreme
    const gitignoreFile = join(testDir, ".gitignore");
    await Deno.writeTextFile(gitignoreFile, `*.ignoreme\n`);

    // Create two files
    const normal = join(testDir, "normal.txt");
    await Deno.writeTextFile(normal, "I am normal");
    const ignored = join(testDir, "ignored.ignoreme");
    await Deno.writeTextFile(ignored, "I should be ignored via .gitignore");

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    // Should see normal
    assertStringIncludes(joinedOutput, "I am normal");

    // Should NOT see ignored
    assert(
      !joinedOutput.includes("I should be ignored"),
      ".gitignore was not respected!",
    );
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - ignoring .gitignore with --ignore-gitignore", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const gitignoreFile = join(testDir, ".gitignore");
    await Deno.writeTextFile(gitignoreFile, `*.ignoreme\n`);

    const normal = join(testDir, "normal.txt");
    await Deno.writeTextFile(normal, "I am normal");
    const ignored = join(testDir, "ignored.ignoreme");
    await Deno.writeTextFile(
      ignored,
      "I should be included if we ignore .gitignore",
    );

    // Notice we pass "--ignore-gitignore"
    const output = await runLlmAndCapture([testDir, "--ignore-gitignore"]);
    const joinedOutput = output.join("\n");

    // Both normal and ignored should appear
    assertStringIncludes(joinedOutput, "I am normal");
    assertStringIncludes(
      joinedOutput,
      "I should be included if we ignore .gitignore",
    );
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - extension filtering", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const fileA = join(testDir, "fileA.ts");
    await Deno.writeTextFile(fileA, `console.log("A");`);

    const fileB = join(testDir, "fileB.md");
    await Deno.writeTextFile(fileB, `# B file content`);

    // Only show .md files
    const output = await runLlmAndCapture([testDir, "--extension", ".md"]);
    const joinedOutput = output.join("\n");

    // We expect to see fileB, not fileA
    assert(
      !joinedOutput.includes('console.log("A")'),
      "Unexpected TS file in output!",
    );
    assertStringIncludes(joinedOutput, "# B file content");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - ignoring binary files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // Create a text file
    const textFile = join(testDir, "text.txt");
    await Deno.writeTextFile(textFile, "This is text content");

    // Create a "binary" file with some null bytes and non-printable chars
    const binaryFile = join(testDir, "binary.bin");
    const binaryContent = new Uint8Array([0, 1, 2, 3, 0, 5, 6, 7, 0]);
    await Deno.writeFile(binaryFile, binaryContent);

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    // Should see the text file
    assertStringIncludes(joinedOutput, "This is text content");

    // Should NOT see the binary file path at all
    assert(
      !joinedOutput.includes("binary.bin"),
      "Binary file should not be listed",
    );
  } finally {
    await emptyDir(testDir);
  }
});
