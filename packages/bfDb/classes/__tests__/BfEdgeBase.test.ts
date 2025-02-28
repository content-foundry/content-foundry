import { assertEquals, assertThrows } from "@std/assert";
import { BfEdgeBase } from "packages/bfDb/classes/BfEdgeBase.ts";
import { BfNodeBase } from "packages/bfDb/classes/BfNodeBase.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";
import { BfEdgeInMemory } from "packages/bfDb/classes/BfEdgeInMemory.ts";

Deno.test("BfEdgeBase test suite", async (t) => {
  // Mock current viewer
  const mockCv = BfCurrentViewer
    .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
      import.meta,
      "test",
      "test",
    );

  // Create mock nodes to use in tests
  const sourceNode = await BfEdgeInMemory.__DANGEROUS__createUnattached(
    mockCv,
    {},
  );
  const targetNode = await BfEdgeInMemory.__DANGEROUS__createUnattached(
    mockCv,
    {},
  );

  await t.step(
    "createBetweenNodes should create an edge between two nodes",
    async () => {
      const role = "test-role";
      const edge = await BfEdgeBase.createBetweenNodes(
        mockCv,
        sourceNode,
        targetNode,
        role,
      );

      assertEquals(edge.sourceId, sourceNode.metadata.bfGid);
      assertEquals(edge.targetId, targetNode.metadata.bfGid);
      assertEquals(edge.sourceClassName, sourceNode.metadata.className);
      assertEquals(edge.targetClassName, targetNode.metadata.className);
      assertEquals(edge.role, role);
    },
  );

  await t.step(
    "querySourceInstances should throw NotImplemented in base class",
    () => {
      assertThrows(
        () =>
          BfEdgeBase.querySourceInstances(
            mockCv,
            targetNode,
            BfNodeBase,
            targetNode.metadata.bfGid,
          ),
        BfErrorNotImplemented,
      );
    },
  );

  await t.step(
    "queryTargetInstances should throw NotImplemented in base class",
    () => {
      assertThrows(
        () =>
          BfEdgeBase.queryTargetInstances(
            mockCv,
            sourceNode,
            BfNodeBase,
            sourceNode.metadata.bfGid,
            {},
          ),
        BfErrorNotImplemented,
      );
    },
  );

  await t.step(
    "querySourceEdgesForNode should throw NotImplemented in base class",
    () => {
      assertThrows(
        () => BfEdgeBase.querySourceEdgesForNode(targetNode, BfNodeBase),
        BfErrorNotImplemented,
      );
    },
  );

  await t.step(
    "queryTargetEdgesForNode should throw NotImplemented in base class",
    () => {
      assertThrows(
        () => BfEdgeBase.queryTargetEdgesForNode(sourceNode, BfNodeBase),
        BfErrorNotImplemented,
      );
    },
  );

  await t.step(
    "deleteEdgesTouchingNode should throw NotImplemented in base class",
    () => {
      assertThrows(
        () =>
          BfEdgeBase.deleteEdgesTouchingNode(mockCv, sourceNode.metadata.bfGid),
        BfErrorNotImplemented,
      );
    },
  );

  await t.step(
    "toString should include source and target information",
    async () => {
      const edge = await BfEdgeBase.createBetweenNodes(
        mockCv,
        sourceNode,
        targetNode,
      );
      const stringRepresentation = edge.toString();

      // Verify the string contains key information
      assertEquals(
        stringRepresentation.includes(
          `(${sourceNode.metadata.className}#${sourceNode.metadata.bfGid} -> ${targetNode.metadata.className}#${targetNode.metadata.bfGid})`,
        ),
        true,
      );
    },
  );

  await t.step("toGraphql should include edge-specific fields", async () => {
    const role = "test-graphql-role";
    const edge = await BfEdgeBase.createBetweenNodes(
      mockCv,
      sourceNode,
      targetNode,
      role,
    );
    const graphql = edge.toGraphql();

    assertEquals(graphql.sourceId, sourceNode.metadata.bfGid);
    assertEquals(graphql.targetId, targetNode.metadata.bfGid);
    assertEquals(graphql.sourceClassName, sourceNode.metadata.className);
    assertEquals(graphql.targetClassName, targetNode.metadata.className);
    assertEquals(graphql.role, role);
  });
});
