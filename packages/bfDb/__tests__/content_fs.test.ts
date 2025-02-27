import {
  assertEquals,
  assertExists,
} from "@std/assert";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { ContentUtils } from "packages/bfDb/bfDbUtils.ts";
import * as path from "@std/path";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";

// Create a minimal mock of the current viewer for testing
const mockCv = {
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
  bfOid: toBfGid("test_org"),
  metadata: {
    bfOid: toBfGid("test_org"),
  },
} as unknown as BfCurrentViewer;

// Reinitialize for each test
async function setupContentCollections(): Promise<void> {
  // Force reinitialization
  const contentCollection = BfContentCollection as unknown;
  (contentCollection as { _initialized: boolean })._initialized = false;
  (contentCollection as { _collectionsCache: unknown })._collectionsCache = new Map();
  (contentCollection as { _itemsCache: unknown })._itemsCache = new Map();
  (contentCollection as { _edgesCache: unknown })._edgesCache = new Map();
  
  // Also reset BfContentItem cache
  const { BfContentItem } = await import("packages/bfDb/models/BfContentItem.ts");
  const contentItem = BfContentItem as unknown;
  (contentItem as { _itemsCache: unknown })._itemsCache = new Map();
  
  // Initialize
  await BfContentCollection.initFromFilesystem(mockCv);
}

Deno.test("BfContentCollection loads content from filesystem", async () => {
  await setupContentCollections();
  
  // Get collections cache
  const collectionsCache = await BfContentCollection.getCollectionsCache(mockCv);
  
  // Get root collection
  const rootPath = path.resolve(Deno.cwd(), "content");
  const rootCollection = collectionsCache.get(toBfGid(rootPath));
  assertExists(rootCollection, "Root collection should exist");
  
  // Check subcollections
  const subcollections = await rootCollection.getSubcollections();
  
  // Expect at least blog and documentation subcollections
  assertEquals(subcollections.length >= 2, true, "Should have at least 2 subcollections");
  
  // Check for blog collection
  const blogCollection = subcollections.find((c) => c.props.slug === "blog");
  assertExists(blogCollection, "Blog collection should exist");
  
  // Get blog items
  const blogItems = await blogCollection.getContentItems();
  assertEquals(blogItems.length > 0, true, "Blog should have items");
  
  // Check item properties
  const firstItem = blogItems[0];
  assertExists(firstItem.title, "Item should have a title");
  assertExists(firstItem.content, "Item should have content");
  assertExists(firstItem.filePath, "Item should have a filePath");
  assertExists(firstItem.fileType, "Item should have a fileType");
});

Deno.test("ContentUtils traverses content tree", async () => {
  await setupContentCollections();
  
  // Get blog collection by slug path
  const blogCollection = await ContentUtils.findCollectionBySlugPath(
    mockCv,
    "blog",
  );
  assertExists(
    blogCollection,
    "Blog collection should be found by slug path",
  );
  assertEquals(
    blogCollection.props.slug,
    "blog",
    "Should find the right collection",
  );
  
  // Get documentation/community collection by slug path
  const communityCollection = await ContentUtils.findCollectionBySlugPath(
    mockCv,
    "documentation/community",
  );
  assertExists(
    communityCollection,
    "Community collection should be found by slug path",
  );
  assertEquals(
    communityCollection.props.slug,
    "community",
    "Should find the right collection",
  );
  
  // Get content tree
  const contentTree = await ContentUtils.getContentTree(mockCv);
  assertExists(contentTree, "Content tree should be generated");
  
  // Find an item by path
  const itemPath = path.resolve(
    Deno.cwd(),
    "content/blog/what-is-story-led-growth.md",
  );
  const item = await ContentUtils.getItemByPath(mockCv, itemPath);
  
  if (item) {
    // Check if it has expected frontmatter properties
    const summary = item.getFrontmatterProperty<string>("summary", "");
    assertExists(summary, "Should have a summary property");
  }
});