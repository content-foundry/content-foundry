import { assertEquals } from "@std/assert";
import { afterEach } from "@std/testing/bdd";
import {
  bfCloseConnection,
  bfDeleteItem,
  bfGetItem,
  bfPutItem,
  bfQueryItems,
  type Props,
} from "packages/bfDb/bfDb.ts";
import {
  type BfMetadataNode,
  BfNode,
} from "packages/bfDb/coreModels/BfNode.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";

// Clean up after each test to prevent connection leaks
afterEach(async () => {
  await bfCloseConnection();
});

Deno.test("bfDb - basic CRUD operations", async () => {
  try {
    // Create a test node
    const props = { name: "Test Node", value: 42 };
    const metadata: BfMetadataNode = {
      bfGid: toBfGid("test-node-1"),
      bfOid: toBfGid("test-org-1"),
      bfCid: toBfGid("creator-1"),
      className: "TestNode",
      createdAt: new Date(),
      lastUpdated: new Date(),
      sortValue: 1,
    };

    // Test putItem
    await bfPutItem(props, metadata);

    // Test getItem
    const item = await bfGetItem<Props>(metadata.bfOid, metadata.bfGid);
    assertEquals(item?.props?.name, "Test Node");
    assertEquals(item?.props?.value, 42);

    // Test deleteItem
    await bfDeleteItem(metadata.bfOid, metadata.bfGid);
    const deletedItem = await bfGetItem(metadata.bfOid, metadata.bfGid);
    assertEquals(deletedItem, null);
  } finally {
    // Ensure connection is closed even if test fails
    await bfCloseConnection();
  }
});

Deno.test("bfDb - query items", async () => {
  try {
    // Create multiple test nodes
    const nodes = [
      {
        props: { name: "Node 1", type: "test", priority: 1 },
        metadata: {
          bfGid: toBfGid("test-query-node-1"),
          bfOid: toBfGid("test-org-1"),
          bfCid: toBfGid("creator-1"),
          className: "TestQueryNode",
          createdAt: new Date(),
          lastUpdated: new Date(),
          sortValue: 100,
        },
      },
      {
        props: { name: "Node 2", type: "test", priority: 2 },
        metadata: {
          bfGid: toBfGid("test-query-node-2"),
          bfOid: toBfGid("test-org-1"),
          bfCid: toBfGid("creator-1"),
          className: "TestQueryNode",
          createdAt: new Date(),
          lastUpdated: new Date(),
          sortValue: 200,
        },
      },
    ];

    for (const node of nodes) {
      await bfPutItem(node.props, node.metadata);
    }

    // Test query by metadata
    const results1 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      {},
      undefined,
      "ASC",
    );
    assertEquals(results1.length, 2);

    // Test query by props
    const results2 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      { type: "test" },
      undefined,
      "ASC",
    );
    assertEquals(results2.length, 2);

    // Test query with more specific props
    const results3 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      { priority: 1 },
      undefined,
      "ASC",
    );
    assertEquals(results3.length, 1);
    assertEquals(results3[0].props.name, "Node 1");

    // Clean up
    for (const node of nodes) {
      await bfDeleteItem(node.metadata.bfOid, node.metadata.bfGid);
    }
  } finally {
    // Ensure connection is closed even if test fails
    await bfCloseConnection();
  }
});

Deno.test("bfDb - metadata handling", async () => {
  try {
    type TestMetadataNodeProps = {
      name: string;
    };
    class TestMetadataNode extends BfNode<TestMetadataNodeProps> {
    }

    const cv = await BfCurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        "test",
        "test",
      );

    // Create a node
    const node = await TestMetadataNode.__DANGEROUS__createUnattached(
      cv,
      { name: "Metadata Test" },
    );
    const bfGid = node.metadata.bfGid;

    // Verify metadata properties
    assertEquals(node.metadata.className, "TestMetadataNode");
    assertEquals(typeof node.metadata.createdAt.getTime, "function"); // Check it's a date
    assertEquals(typeof node.metadata.lastUpdated.getTime, "function"); // Check it's a date
    assertEquals(typeof node.metadata.sortValue, "number");

    // Test updating causes lastUpdated to change
    const originalLastUpdated = node.metadata.lastUpdated;
    await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure time passes
    node.props = {
      ...node.props,
      name: "Updated Name",
    };
    await node.save();

    const updatedNode = await TestMetadataNode.findX(cv, bfGid);
    assertEquals(updatedNode.props.name, "Updated Name");
    assertEquals(
      updatedNode.metadata.lastUpdated > originalLastUpdated,
      true,
      "lastUpdated should be newer after update",
    );

    // Clean up
    // await updatedNode.delete();
  } finally {
    // Ensure connection is closed even if test fails
    await bfCloseConnection();
  }
});
