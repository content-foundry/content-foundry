import { assert, assertEquals } from "@std/assert";
import { upsertBfDb } from "packages/bfDb/bfDbUtils.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { BfEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import { bfGetItem } from "packages/bfDb/bfDb.ts";

/**
 * A minimal test node class with just one property
 */
export class TestNode extends BfNode<{ title: string }> {}

/** A simple test suite for BfEdge */
Deno.test("createBetweenNodes should store an edge row in bfdb", async () => {
  // Make sure our schema is created
  try {
    await upsertBfDb();
  } catch {
    //...
  }

  // For testing, we'll use an "omni" viewer to bypass permission checks
  const cv = BfCurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(
    import.meta,
  );

  // 1) Create a source node
  const sourceNode = await TestNode.__DANGEROUS__createUnattached(
    cv,
    { title: "source node" },
  );

  // 2) Create a target node
  const targetNode = await TestNode.__DANGEROUS__createUnattached(
    cv,
    { title: "target node" },
  );

  // 3) Create an edge between sourceNode -> targetNode
  const role = "TEST_RELATION";
  const edge = await BfEdge.createBetweenNodes(
    cv,
    sourceNode,
    targetNode,
    role,
  );

  // 4) Verify that the edge has the correct bfSid, bfTid, etc.
  //    We'll do a basic check by re-loading the edge from bfdb by its bf_gid
  const freshEdgeFromDb = await bfGetItem(
    edge.metadata.bfOid,
    edge.metadata.bfGid,
  );
  assert(freshEdgeFromDb, "Expected to find edge row in bfdb");
  const { metadata, props } = freshEdgeFromDb!;
  assertEquals(edge.metadata.bfSid, sourceNode.metadata.bfGid);
  assertEquals(metadata.bfTid, targetNode.metadata.bfGid);
  assertEquals(metadata.bfSClassName, "TestNode");
  assertEquals(metadata.bfTClassName, "TestNode");
  // The edge's className in bfdb is "BfEdge" by default
  assertEquals(metadata.className, "BfEdge");
  // The role property is stored in the JSON props
  assertEquals(props.role, role);
});
