// Tests for database backends and bfDb functionality
import { assertEquals, assertExists } from "@std/assert";
import { afterEach } from "@std/testing/bdd";
import { getLogger } from "packages/logger.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { DatabaseBackendNeon } from "packages/bfDb/backend/DatabaseBackendNeon.ts";
import { DatabaseBackendPg } from "packages/bfDb/backend/DatabaseBackendPg.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import { DatabaseBackendSqlite } from "packages/bfDb/backend/DatabaseBackendSqlite.ts";
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
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";

const logger = getLogger(import.meta);

// Clean up after each test to prevent connection leaks
afterEach(async () => {
  await bfCloseConnection();
});

type TestProps = {
  name: string;
  value: number;
};

async function runBackendTests(backend: DatabaseBackend, backendName: string) {
  // Create a unique ID for this test run
  const testRunId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // For SQLite backend, use a unique database file to avoid locking issues
  if (backendName === "SQLite") {
    const uniqueDbName = `tmp/test-db-${testRunId}.sqlite`;
    Deno.env.set("SQLITE_DB_PATH", uniqueDbName);
    logger.info(`Using unique SQLite database: ${uniqueDbName}`);

    // Make sure to clean up after the test
    try {
      // Initialize with the unique database
      await backend.initialize();

      // Run the test with the original implementation...
      await testDatabaseOperations(backend, testRunId);

      logger.info(`${backendName} backend tests passed successfully`);
    } catch (error) {
      logger.error(`${backendName} backend tests failed:`, error);
      throw error;
    } finally {
      // Always close the database connection
      await backend.close();

      // Try to remove the test database file
      try {
        await Deno.remove(uniqueDbName);
        logger.info(`Cleaned up test database: ${uniqueDbName}`);
      } catch (cleanupError) {
        logger.warn(
          `Failed to clean up test database: ${uniqueDbName}`,
          cleanupError,
        );
      }
    }
  } else {
    // For other backends, just use the original approach
    try {
      await backend.initialize();
      await testDatabaseOperations(backend, testRunId);
      logger.info(`${backendName} backend tests passed successfully`);
    } catch (error) {
      logger.error(`${backendName} backend tests failed:`, error);
      throw error;
    } finally {
      await backend.close();
    }
  }
}

// Extract the test operations into a separate function
async function testDatabaseOperations(
  backend: DatabaseBackend,
  testRunId: string,
) {
  // Create a unique IDs for this test run
  const testBfOid = toBfGid(`test-org-${testRunId}`);
  const testBfGid = toBfGid(`test-item-${testRunId}`);
  const testBfCid = toBfGid(`test-collection-${testRunId}`);

  const testProps: TestProps = {
    name: "Test Item",
    value: 42,
  };

  // Add delay between operations to reduce contention
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Put item
  await backend.putItem(testProps, {
    bfGid: testBfGid,
    bfOid: testBfOid,
    bfCid: testBfCid,
    className: "TestItem",
    createdAt: new Date(),
    lastUpdated: new Date(),
    sortValue: Date.now(),
  });

  // Add a small delay between operations
  await delay(100);

  // Get item
  const retrievedItem = await backend.getItem<TestProps>(
    testBfOid,
    testBfGid,
  );

  assertEquals(retrievedItem?.props.name, testProps.name);
  assertEquals(retrievedItem?.props.value, testProps.value);
  assertEquals(retrievedItem?.metadata.bfOid, testBfOid);
  assertEquals(retrievedItem?.metadata.className, "TestItem");

  await delay(100);

  // Test item retrieval by bfGid
  const retrievedByGid = await backend.getItemByBfGid<TestProps>(testBfGid);
  assertEquals(retrievedByGid?.props.name, testProps.name);

  await delay(100);

  // Test item update
  const updatedProps: TestProps = {
    ...testProps,
    value: 100,
  };

  await backend.putItem(updatedProps, {
    bfGid: testBfGid,
    bfOid: testBfOid,
    bfCid: testBfCid,
    className: "TestItem",
    createdAt: retrievedItem!.metadata.createdAt,
    lastUpdated: new Date(),
    sortValue: retrievedItem!.metadata.sortValue,
  });

  await delay(100);

  const retrievedUpdated = await backend.getItem<TestProps>(
    testBfOid,
    testBfGid,
  );
  assertEquals(retrievedUpdated?.props.value, 100);

  await delay(100);

  // Test queryItems
  const queriedItems = await backend.queryItems<TestProps>(
    { bfOid: testBfOid, className: "TestItem" },
  );

  assertEquals(queriedItems.length > 0, true);
  assertEquals(
    queriedItems.some((item) => item.metadata.bfGid === testBfGid),
    true,
  );

  await delay(100);

  // Test item deletion
  await backend.deleteItem(testBfOid, testBfGid);

  await delay(100);

  const deletedItem = await backend.getItem(testBfOid, testBfGid);
  assertEquals(deletedItem, null);
}

// Tests for the bfDb interface
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
          className: "TestQueryNode", // Make sure this matches the expected column name
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
      try {
        await bfPutItem(node.props, node.metadata);
        logger.info(
          `Successfully inserted node with bfGid: ${node.metadata.bfGid}`,
        );
      } catch (error) {
        logger.error(`Failed to insert node: ${error}`);
        throw error; // Re-throw to fail the test
      }
    }

    // Check all nodes in the database to help debug
    const allNodes = await bfQueryItems<Props>({}, {});
    logger.info(`Total nodes in database: ${allNodes.length}`);
    for (const node of allNodes) {
      logger.info(
        `Found node: className=${node.metadata.className}, bfGid=${node.metadata.bfGid}`,
      );
    }

    // Test query by metadata
    const results1 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      {},
      undefined,
      "ASC",
    );
    logger.info(
      `Query results for className=TestQueryNode: ${results1.length}`,
    );
    assertEquals(results1.length, 2);

    // Test query by props
    logger.info(
      "Running query by props: { className: 'TestQueryNode' }, { type: 'test' }",
    );
    const results2 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      { type: "test" },
      undefined,
      "ASC",
    );
    logger.info(`Query results for props { type: 'test' }: ${results2.length}`);
    if (results2.length > 0) {
      logger.info("Found props:", JSON.stringify(results2[0].props));
    }
    assertEquals(results2.length, 2);

    // Test query with more specific props
    logger.info(
      "Running query by props: { className: 'TestQueryNode' }, { priority: 1 }",
    );
    const results3 = await bfQueryItems<Props>(
      { className: "TestQueryNode" },
      { priority: 1 },
      undefined,
      "ASC",
    );
    logger.info(`Query results for props { priority: 1 }: ${results3.length}`);
    if (results3.length > 0) {
      logger.info("Found props:", JSON.stringify(results3[0].props));
    } else {
      // Debug: if no results, let's query for all TestQueryNode items again to see their properties
      const allNodes = await bfQueryItems<Props>(
        { className: "TestQueryNode" },
        {},
        undefined,
        "ASC",
      );
      logger.info(`All TestQueryNode props:`);
      for (const node of allNodes) {
        logger.info(JSON.stringify(node.props));
      }
    }
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

    const cv = BfCurrentViewer
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
  } finally {
    // Ensure connection is closed even if test fails
    await bfCloseConnection();
  }
});

// Main test function that runs tests on multiple backends
Deno.test("Database backends compatibility test", async () => {
  logger.info("Testing database backends compatibility");
  const hasDatabaseUrl = Boolean(getConfigurationVariable("DATABASE_URL"));

  if (hasDatabaseUrl) {
    // Test Neon backend if DATABASE_URL is available
    logger.info("Testing Neon backend");
    Deno.env.set("DB_BACKEND_TYPE", "neon");
    const neonBackend = new DatabaseBackendNeon();
    await runBackendTests(neonBackend, "Neon");

    // Test PostgreSQL backend if DATABASE_URL is available
    logger.info("Testing PostgreSQL backend");
    Deno.env.set("DB_BACKEND_TYPE", "pg");
    const pgBackend = new DatabaseBackendPg();
    await runBackendTests(pgBackend, "PostgreSQL");
  } else {
    logger.info("Skipping Neon and PostgreSQL tests - DATABASE_URL not set");
  }

  // Always test SQLite backend as it doesn't require external dependencies
  logger.info("Testing SQLite backend");
  Deno.env.set("DB_BACKEND_TYPE", "sqlite");
  const sqliteBackend = new DatabaseBackendSqlite();
  await runBackendTests(sqliteBackend, "SQLite");
});