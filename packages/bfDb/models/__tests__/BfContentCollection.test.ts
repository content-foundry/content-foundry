// Fixed test for packages/bfDb/models/__tests__/BfContentCollection.test.ts

import { assert, assertEquals, assertExists } from "@std/assert";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { ensureDir } from "@std/fs";
import { fromFileUrl, join } from "@std/path";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Use absolute path for TEST_CONTENT_DIR with file:// stripped off
const TEST_CONTENT_DIR = fromFileUrl(
  new URL("./test_content", import.meta.url),
);

// Create some test content files
async function setupTestContent() {
  // Ensure the test directory exists
  await ensureDir(TEST_CONTENT_DIR);

  // Create a test file with frontmatter
  const testFilePath = join(TEST_CONTENT_DIR, "test-post.md");
  const testContent = `---
title: Test Post
description: This is a test post
tags:
  - test
  - example
featured: true
---

# Test Post Content

This is some test content for the BfContentCollection test.`;

  await Deno.writeTextFile(testFilePath, testContent);

  // Create a nested directory with content
  const nestedDir = join(TEST_CONTENT_DIR, "nested");
  await ensureDir(nestedDir);

  // Create a test file in the nested directory
  const nestedFilePath = join(nestedDir, "nested-post.md");
  const nestedContent = `---
title: Nested Test Post
description: This is a nested test post
featured: false
---

# Nested Test Post

This is some nested test content.`;

  await Deno.writeTextFile(nestedFilePath, nestedContent);

  return TEST_CONTENT_DIR;
}

// Clean up test content
async function cleanupTestContent() {
  try {
    await Deno.remove(TEST_CONTENT_DIR, { recursive: true });
  } catch (error) {
    logger.error("Error cleaning up test content:", error);
  }
}

// Before each test, clear the cache
async function setupTest() {
  // Clear the cache to avoid state leaking between tests
  BfContentCollection.getCollectionsCache().clear();
  const baseDir = await setupTestContent();

  await BfContentCollection.loadCollection(baseDir);

  return baseDir;
}

Deno.test("BfContentCollection - findX should find content by ID", async () => {
  const baseDir = await setupTest();
  try {
    // Create a viewer for testing
    const cv = BfCurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(
      import.meta,
    );

    // Now test finding with the absolute paths
    const testPostId = toBfGid(join(baseDir, "test-post"));
    const contentItem = await BfContentCollection.findX(cv, testPostId);

    assertExists(contentItem);
    assertEquals(contentItem.props.title, "Test Post");
    assertEquals(contentItem.props.featured, true);
    assert(
      typeof contentItem.props.content === "string" &&
        contentItem.props.content.includes("# Test Post Content"),
    );

    // Test finding a nested content file
    const nestedPostId = toBfGid(join(baseDir, "nested", "nested-post"));
    const nestedContentItem = await BfContentCollection.findX(cv, nestedPostId);

    assertExists(nestedContentItem);
    assertEquals(nestedContentItem.props.title, "Nested Test Post");
    assertEquals(nestedContentItem.props.featured, false);
    assert(
      typeof nestedContentItem.props.content === "string" &&
        nestedContentItem.props.content.includes("# Nested Test Post"),
    );
  } finally {
    await cleanupTestContent();
  }
});

Deno.test("BfContentCollection - findX should throw for non-existent content", async () => {
  const baseDir = await setupTest();
  try {
    // Create a viewer for testing
    const cv = BfCurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(
      import.meta,
    );

    // Test with a non-existent path using absolute path
    const nonExistentId = toBfGid(join(baseDir, "non-existent-post"));

    // Instead of trying to load an actual nonexistent file, we'll just check if the error is as expected
    // This avoids the async leak
    try {
      await BfContentCollection.findX(cv, nonExistentId);
      assert(false, "Should have thrown an error");
    } catch (e) {
      assert(
        e instanceof BfErrorNodeNotFound,
        "Should be a BfErrorNodeNotFound",
      );
    }
  } finally {
    await cleanupTestContent();
  }
});

Deno.test("BfContentCollection - query should return filtered content", async () => {
  const baseDir = await setupTest();
  try {
    // Create a viewer for testing
    const cv = BfCurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(
      import.meta,
    );

    // Query all content in the test directory
    const allContent = await BfContentCollection.query(cv, undefined, {
      path: baseDir,
    });

    // Check that only the expected files from our test directory are included
    assertEquals(
      allContent.length,
      2,
      "Should only have the two test files we created",
    );

    // Verify we have the files we expect
    const titles = allContent.map((item) => item.props.title);
    assert(titles.includes("Test Post"), "Should include 'Test Post'");
    assert(
      titles.includes("Nested Test Post"),
      "Should include 'Nested Test Post'",
    );

    // Query only featured content
    const featuredContent = await BfContentCollection.query(cv, undefined, {
      featured: true,
    });
    assertEquals(
      featuredContent.length,
      1,
      "Should have only one featured post",
    );
    assertEquals(featuredContent[0].props.title, "Test Post");
  } finally {
    await cleanupTestContent();
  }
});

Deno.test("BfContentCollection - cache should work correctly", async () => {
  const baseDir = await setupTest();
  try {
    // Create a viewer for testing
    const cv = BfCurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(
      import.meta,
    );

    // First call to findX should use the cache
    const testPostId = toBfGid(join(baseDir, "test-post"));
    const firstCall = await BfContentCollection.findX(cv, testPostId);
    assertExists(firstCall);

    // Get the cache
    const cache = BfContentCollection.getCollectionsCache();
    assert(cache.has(testPostId));

    // Second call should use the cache
    const secondCall = await BfContentCollection.findX(cv, testPostId);
    assertExists(secondCall);

    // Both calls should return the same instance (by reference)
    assert(firstCall === secondCall);
  } finally {
    await cleanupTestContent();
  }
});
