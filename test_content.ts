// Test script for content collections
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { ContentUtils } from "packages/bfDb/bfDbUtils.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import * as path from "@std/path";

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
};

async function testContent() {
  console.log("Initializing content collections...");
  await BfContentCollection.initFromFilesystem(mockCv);
  
  console.log("Getting collections cache...");
  const collectionsCache = await BfContentCollection.getCollectionsCache(mockCv);
  
  console.log(`Found ${collectionsCache.size} collections`);
  
  // Get root collection
  const rootPath = path.resolve(Deno.cwd(), "content");
  const rootCollection = collectionsCache.get(toBfGid(rootPath));
  
  if (!rootCollection) {
    console.error("Root collection not found!");
    return;
  }
  
  console.log("Root collection:", rootCollection.props.name);
  
  // Get blog collection
  const blogCollection = await ContentUtils.findCollectionBySlugPath(mockCv, "blog");
  
  if (!blogCollection) {
    console.error("Blog collection not found!");
    return;
  }
  
  console.log("Blog collection:", blogCollection.props.name);
  
  // Get blog items
  const blogItems = await blogCollection.getContentItems();
  console.log(`Blog has ${blogItems.length} items`);
  
  if (blogItems.length > 0) {
    console.log("First blog item:", {
      title: blogItems[0].title,
      slug: blogItems[0].props.slug,
      fileType: blogItems[0].fileType,
    });
  }
  
  // Try to get the content tree
  const contentTree = await ContentUtils.getContentTree(mockCv);
  console.log("Content tree structure:", JSON.stringify({
    name: contentTree.name,
    slug: contentTree.slug,
    childCollections: contentTree.children.map(c => c.slug),
    itemCount: contentTree.items.length,
  }, null, 2));
}

await testContent();