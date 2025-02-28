import { assertEquals } from "@std/assert";
import { getLogger } from "packages/logger.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { DatabaseBackendNeon } from "packages/bfDb/backend/DatabaseBackendNeon.ts";
import { DatabaseBackendPg } from "packages/bfDb/backend/DatabaseBackendPg.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";

const logger = getLogger(import.meta);

type TestProps = {
  name: string;
  value: number;
};

// A helper function to run the same tests against different backends
async function runBackendTests(backend: DatabaseBackend, backendName: string) {
  // Create a unique ID for this test run
  const testRunId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // Initialize the database
    await backend.initialize();

    // Test item creation and retrieval
    const testBfOid = toBfGid(`test-org-${testRunId}`);
    const testBfGid = toBfGid(`test-item-${testRunId}`);
    const testBfCid = toBfGid(`test-collection-${testRunId}`);

    const testProps: TestProps = {
      name: "Test Item",
      value: 42,
    };

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

    // Get item
    const retrievedItem = await backend.getItem<TestProps>(
      testBfOid,
      testBfGid,
    );

    assertEquals(retrievedItem?.props.name, testProps.name);
    assertEquals(retrievedItem?.props.value, testProps.value);
    assertEquals(retrievedItem?.metadata.bfOid, testBfOid);
    assertEquals(retrievedItem?.metadata.className, "TestItem");

    // Test item retrieval by bfGid
    const retrievedByGid = await backend.getItemByBfGid<TestProps>(testBfGid);
    assertEquals(retrievedByGid?.props.name, testProps.name);

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

    const retrievedUpdated = await backend.getItem<TestProps>(
      testBfOid,
      testBfGid,
    );
    assertEquals(retrievedUpdated?.props.value, 100);

    // Test queryItems
    const queriedItems = await backend.queryItems<TestProps>(
      { bfOid: testBfOid, className: "TestItem" },
    );

    assertEquals(queriedItems.length > 0, true);
    assertEquals(
      queriedItems.some((item) => item.metadata.bfGid === testBfGid),
      true,
    );

    // Test item deletion
    await backend.deleteItem(testBfOid, testBfGid);
    const deletedItem = await backend.getItem(testBfOid, testBfGid);
    assertEquals(deletedItem, null);

    logger.info(`${backendName} backend tests passed successfully`);
  } catch (error) {
    logger.error(`${backendName} backend tests failed:`, error);
    throw error;
  } finally {
    // Clean up
    await backend.close();
  }
}

// Main test function that runs tests on both backends
Deno.test("Database backends compatibility test", async () => {
  logger.info("Testing Neon backend");
  Deno.env.set("DB_BACKEND_TYPE", "neon");
  const neonBackend = new DatabaseBackendNeon();
  await runBackendTests(neonBackend, "Neon");
  Deno.env.set("DB_BACKEND_TYPE", "pg");
  const pgBackend = new DatabaseBackendPg();
  await runBackendTests(pgBackend, "PostgreSQL");
});
