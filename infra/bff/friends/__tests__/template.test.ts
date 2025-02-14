// ./infra/bff/friends/__tests__/template.test.ts
import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { emptyDir, ensureDir } from "@std/fs";
import * as path from "@std/path";
import { templateCommand } from "../template.bff.ts";

const TEST_DIR = path.join(Deno.cwd(), "test_template");
const NESTED_DIR = path.join(TEST_DIR, "nested");

describe("templateCommand", () => {
  beforeEach(async () => {
    // Clear out (or create) our test directory
    await emptyDir(TEST_DIR);
    await ensureDir(NESTED_DIR);
  });

  afterEach(async () => {
    // Clean up after each test
    await emptyDir(TEST_DIR);
  });

  it("should create a file using a local template if found", async () => {
    // Place __TEMPLATE__.md in the TEST_DIR
    const localTemplatePath = path.join(TEST_DIR, "__TEMPLATE__.md");
    const templateText = "## This is the local template content";
    await Deno.writeTextFile(localTemplatePath, templateText);

    // Switch current directory to nested folder for the test
    const originalCwd = Deno.cwd();
    Deno.chdir(NESTED_DIR);
    try {
      // Call templateCommand
      const filename = "example.md";
      const exitCode = await templateCommand([filename]);
      assertEquals(exitCode, 0);

      // Confirm new file was created with content from the template
      const createdFilePath = path.join(NESTED_DIR, filename);
      const createdFileContent = await Deno.readTextFile(createdFilePath);
      assertStringIncludes(createdFileContent, templateText);
    } finally {
      // Restore original working directory
      Deno.chdir(originalCwd);
    }
  });

  it("should create a blank template if none is found and then create the file", async () => {
    // Do NOT create any __TEMPLATE__ file in the test directories

    // Switch current directory to nested folder for the test
    const originalCwd = Deno.cwd();
    Deno.chdir(NESTED_DIR);
    try {
      const filename = "noTemplateFound.md";
      const exitCode = await templateCommand([filename]);
      assertEquals(exitCode, 0);

      // Should have created a blank __TEMPLATE__.md in NESTED_DIR
      const localTemplate = path.join(NESTED_DIR, "__TEMPLATE__.md");
      const localTemplateInfo = await Deno.stat(localTemplate);
      assert(localTemplateInfo.isFile, "Should have created a local template file");

      const createdFilePath = path.join(NESTED_DIR, filename);
      const createdFileContent = await Deno.readTextFile(createdFilePath);
      // Should be empty, since the template was blank
      assertEquals(createdFileContent, "");
    } finally {
      // Restore original working directory
      Deno.chdir(originalCwd);
    }
  });

  it("should find a template up the directory tree if none local", async () => {
    // Place template in the TEST_DIR (one level above the nested folder)
    const localTemplatePath = path.join(TEST_DIR, "__TEMPLATE__.md");
    const templateText = "## Parent directory template content";
    await Deno.writeTextFile(localTemplatePath, templateText);

    // Switch current directory to nested folder for the test
    const originalCwd = Deno.cwd();
    Deno.chdir(NESTED_DIR);
    try {
      // Run command
      const filename = "foundUpTree.md";
      const exitCode = await templateCommand([filename]);
      assertEquals(exitCode, 0);

      // Check the result
      const createdFilePath = path.join(NESTED_DIR, filename);
      const createdFileContent = await Deno.readTextFile(createdFilePath);
      assertStringIncludes(createdFileContent, templateText);
    } finally {
      // Restore original working directory
      Deno.chdir(originalCwd);
    }
  });

  it("should fail with exit code 1 if no filename is provided", async () => {
    const exitCode = await templateCommand([]);
    assertEquals(exitCode, 1);
  });
});