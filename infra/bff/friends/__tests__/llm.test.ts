// ./infra/bff/friends/__tests__/llm.test.ts
import { assert, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { emptyDir } from "@std/fs";
import { llm } from "infra/bff/friends/llm.bff.ts";
import { getLogger } from "packages/logger.ts";

async function runLlmAndCapture(args: string[]): Promise<string[]> {
  const bffLlmLogger = getLogger(
    import.meta.resolve("infra/bff/friends/llm.bff.ts").replace("file://", ""),
  );
  const lines: string[] = [];
  const originalInfo = bffLlmLogger.info;

  try {
    bffLlmLogger.info = (...msgs: unknown[]) => {
      // collect everything that would have gone to logger.info
      lines.push(msgs.map(String).join(" "));
    };

    await llm(args.concat(["--std-out"]));
  } finally {
    // restore
    bffLlmLogger.info = originalInfo;
  }

  return lines;
}

Deno.test("llm - basic usage with no flags", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const fooFile = join(testDir, "foo.md");
    await Deno.writeTextFile(fooFile, "## Hello from foo.md\nLine2\nLine3");

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    // Test
    assertStringIncludes(joinedOutput, fooFile);
    assertStringIncludes(joinedOutput, "## Hello from foo.md");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - cxml mode", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const barFile = join(testDir, "bar.ts");
    await Deno.writeTextFile(barFile, `console.log("Hello from bar.ts");`);

    const output = await runLlmAndCapture([testDir, "-c"]);
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, "<documents>");
    assertStringIncludes(joinedOutput, `<source>${barFile}</source>`);
    assertStringIncludes(joinedOutput, "Hello from bar.ts");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - xml escaping in cxml mode", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    // Create a file with a name containing XML special characters
    const specialFile = join(testDir, "file&with<special>chars.ts");
    await Deno.writeTextFile(specialFile, `console.log("<xml>tag</xml>");`);

    const output = await runLlmAndCapture([testDir, "-c"]);
    const joinedOutput = output.join("\n");

    // Check that the file path is properly escaped in the XML
    assertStringIncludes(joinedOutput, "<source>");
    assertStringIncludes(joinedOutput, "&lt;special&gt;");
    assertStringIncludes(joinedOutput, "&amp;with");

    // Content should NOT be escaped - Claude expects raw content
    assertStringIncludes(joinedOutput, 'console.log("<xml>tag</xml>");');
    assertStringIncludes(joinedOutput, "</document_content>");
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

    assertStringIncludes(joinedOutput, "1  First line");
    assertStringIncludes(joinedOutput, "2  Second line");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - ignoring hidden files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const hiddenFile = join(testDir, ".secret");
    await Deno.writeTextFile(hiddenFile, "You should not see me.");

    const normalFile = join(testDir, "visible.md");
    await Deno.writeTextFile(normalFile, "You should see me.");

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, normalFile);
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
    const hiddenFile = join(testDir, ".secret.md");
    await Deno.writeTextFile(hiddenFile, "Hidden content.");

    const normalFile = join(testDir, "visible.md");
    await Deno.writeTextFile(normalFile, "Visible content.");

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
    const skipFile = join(testDir, "skip.me");
    await Deno.writeTextFile(skipFile, "Should be skipped");
    const keepFile = join(testDir, "keep.me");
    await Deno.writeTextFile(keepFile, "Should be kept");

    const output = await runLlmAndCapture([testDir, "--ignore", "skip.*"]);
    const joinedOutput = output.join("\n");

    assert(
      !joinedOutput.includes("Should be skipped"),
      "skip.me was included but shouldn't be.",
    );
    assertStringIncludes(joinedOutput, "Should be kept");
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - respect .gitignore by default", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    await Deno.writeTextFile(join(testDir, ".gitignore"), `*.ignoreme\n`);

    const normal = join(testDir, "normal.txt");
    await Deno.writeTextFile(normal, "I am normal");
    const ignored = join(testDir, "ignored.ignoreme");
    await Deno.writeTextFile(ignored, "I should be ignored via .gitignore");

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, "I am normal");
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
    await Deno.writeTextFile(join(testDir, ".gitignore"), `*.ignoreme\n`);

    const normal = join(testDir, "normal.txt");
    await Deno.writeTextFile(normal, "I am normal");
    const ignored = join(testDir, "ignored.ignoreme");
    await Deno.writeTextFile(
      ignored,
      "I should be included if we ignore .gitignore",
    );

    const output = await runLlmAndCapture([testDir, "--ignore-gitignore"]);
    const joinedOutput = output.join("\n");

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

    const output = await runLlmAndCapture([testDir, "--extension", ".md"]);
    const joinedOutput = output.join("\n");

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
    const textFile = join(testDir, "text.txt");
    await Deno.writeTextFile(textFile, "This is text content");

    const binaryFile = join(testDir, "binary.bin");
    const binaryContent = new Uint8Array([0, 1, 2, 3, 0, 5, 6, 7, 0]);
    await Deno.writeFile(binaryFile, binaryContent);

    const output = await runLlmAndCapture([testDir]);
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, "This is text content");
    assert(
      !joinedOutput.includes("binary.bin"),
      "Binary file should not be listed",
    );
  } finally {
    await emptyDir(testDir);
  }
});

Deno.test("llm - stdout option", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "llm_test_" });

  try {
    const testFile = join(testDir, "test.txt");
    await Deno.writeTextFile(testFile, "Content for stdout test");

    const output = await runLlmAndCapture([testDir, "--std-out"]);
    const joinedOutput = output.join("\n");

    assertStringIncludes(joinedOutput, "Content for stdout test");
    assertStringIncludes(joinedOutput, testFile);
  } finally {
    await emptyDir(testDir);
  }
});
