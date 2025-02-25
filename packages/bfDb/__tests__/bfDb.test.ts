import { assertEquals, assertNotEquals } from "@std/assert";
import {
  bfGetItem,
  bfPutItem,
  bfQueryItems,
  CLEAR_FOR_DEBUGGING,
} from "packages/bfDb/bfDb.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";

Deno.test("bfDb - basic CRUD operations", async () => {
  await CLEAR_FOR_DEBUGGING();

  const testId = toBfGid("test-item");
  const testOrgId = toBfGid("test-org");

  // Test Put and Get
  const testProps = { name: "Test Item", value: 42 };
  const testMetadata = {
    bfGid: testId,
    bfOid: testOrgId,
    bfCid: testOrgId,
    className: "TestItem",
    createdAt: new Date(),
    lastUpdated: new Date(),
    sortValue: Date.now(),
  };

  await bfPutItem(testProps, testMetadata);
  const result = await bfGetItem(testOrgId, testId);

  assertEquals(result?.props.name, testProps.name);
  assertEquals(result?.props.value, testProps.value);
  assertEquals(result?.metadata.bfGid, testId);
});

Deno.test("bfDb - query items", async () => {
  await CLEAR_FOR_DEBUGGING();

  const testOrgId = toBfGid("test-org");
  const items = [
    { name: "Item 1", tag: "test" },
    { name: "Item 2", tag: "test" },
    { name: "Item 3", tag: "other" },
  ];

  // Insert test items
  for (const [i, props] of items.entries()) {
    await bfPutItem(props, {
      bfGid: toBfGid(`test-item-${i}`),
      bfOid: testOrgId,
      bfCid: testOrgId,
      className: "TestItem",
      createdAt: new Date(),
      lastUpdated: new Date(),
      sortValue: Date.now(),
    });
  }

  // Test querying by props
  const results = await bfQueryItems({ bfOid: testOrgId }, { tag: "test" });
  assertEquals(results.length, 2);
  assertEquals(results[0].props.tag, "test");
});

Deno.test("bfDb - metadata handling", async () => {
  await CLEAR_FOR_DEBUGGING();

  const testId = toBfGid("test-item");
  const testOrgId = toBfGid("test-org");
  const createdAt = new Date();

  const testMetadata = {
    bfGid: testId,
    bfOid: testOrgId,
    bfCid: testOrgId,
    className: "TestItem",
    createdAt,
    lastUpdated: createdAt,
    sortValue: Date.now(),
  };

  await bfPutItem({ name: "Test" }, testMetadata);

  // Update the same item
  const updatedMetadata = { ...testMetadata, lastUpdated: new Date() };
  await bfPutItem({ name: "Updated Test" }, updatedMetadata);

  const result = await bfGetItem(testOrgId, testId);
  assertEquals(result?.metadata.createdAt.getTime(), createdAt.getTime());
  assertNotEquals(result?.metadata.lastUpdated.getTime(), createdAt.getTime());
});
