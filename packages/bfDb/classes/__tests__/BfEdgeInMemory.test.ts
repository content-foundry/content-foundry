import { assertEquals } from "@std/assert";
import { BfEdgeInMemory } from "packages/bfDb/classes/BfEdgeInMemory.ts";
import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";

type MockBfNodeProps = {
  name: string;
};
// Mock implementation of BfNodeBase that overrides findX for testing
class MockBfNode extends BfNodeBase<MockBfNodeProps> {
  static mockNodes = new Map<string, MockBfNode>();

  static override findX<
    TProps extends BfNodeBaseProps,
    TThisClass extends typeof BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ) {
    const node = this.mockNodes.get(id);
    if (!node) {
      throw new Error(`Node not found: ${id}`);
    }
    return Promise.resolve(node) as Promise<InstanceType<TThisClass>>;
  }

  static registerMockNode(node: MockBfNode): void {
    this.mockNodes.set(node.metadata.bfGid, node);
  }

  static clearMockNodes(): void {
    this.mockNodes.clear();
  }
}

Deno.test("BfEdgeInMemory test suite", async (t) => {
  // Setup and teardown
  let mockCv: BfCurrentViewer;
  let sourceNode: MockBfNode;
  let targetNode: MockBfNode;

  const setup = () => {
    // Create mock current viewer
    mockCv = BfCurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        "test",
        "test",
      );

    // Create and register mock nodes
    sourceNode = new MockBfNode(mockCv, { name: "Source Node" });
    targetNode = new MockBfNode(mockCv, { name: "Target Node" });

    MockBfNode.registerMockNode(sourceNode);
    MockBfNode.registerMockNode(targetNode);
  };

  const teardown = () => {
    BfEdgeInMemory.clearAll();
    MockBfNode.clearMockNodes();
  };

  await t.step({
    name: "createBetweenNodes should create and store an edge between nodes",
    fn: async () => {
      setup();

      const role = "test-relationship";
      const edge = await BfEdgeInMemory.createBetweenNodes(
        mockCv,
        sourceNode,
        targetNode,
        role,
      );

      assertEquals(edge.sourceId, sourceNode.metadata.bfGid);
      assertEquals(edge.targetId, targetNode.metadata.bfGid);
      assertEquals(edge.role, role);

      teardown();
    },
  });

  // await t.step({
  //   name: "querySourceEdgesForNode should find all source edges for a node",
  //   fn: async () => {
  //     setup();

  //     // Create multiple source nodes connected to the target
  //     const sourceNode2 = new MockBfNode(mockCv, { name: "Source Node 2" });
  //     MockBfNode.registerMockNode(sourceNode2);

  //     BfEdgeInMemory.createBetweenNodes(
  //       mockCv,
  //       sourceNode,
  //       targetNode,
  //       "role1",
  //     );
  //     BfEdgeInMemory.createBetweenNodes(
  //       mockCv,
  //       sourceNode2,
  //       targetNode,
  //       "role2",
  //     );

  //     const sourceEdges = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode,
  //       MockBfNode,
  //     );

  //     assertEquals(sourceEdges.length, 2);
  //     assertEquals(sourceEdges[0].targetId, targetNode.metadata.bfGid);
  //     assertEquals(sourceEdges[1].targetId, targetNode.metadata.bfGid);

  //     // Test filtering by source class
  //     class DifferentNodeClass extends MockBfNode {}
  //     const filteredEdges = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode,
  //       DifferentNodeClass,
  //     );

  //     assertEquals(filteredEdges.length, 0);

  //     teardown();
  //   },
  // });

  // await t.step({
  //   name: "deleteEdgesTouchingNode should remove all edges connected to a node",
  //   fn: async () => {
  //     setup();

  //     // Create multiple connections
  //     const targetNode2 = new MockBfNode(mockCv, { name: "Target Node 2" });
  //     MockBfNode.registerMockNode(targetNode2);

  //     BfEdgeInMemory.createBetweenNodes(
  //       mockCv,
  //       sourceNode,
  //       targetNode,
  //       "role1",
  //     );
  //     BfEdgeInMemory.createBetweenNodes(
  //       mockCv,
  //       sourceNode,
  //       targetNode2,
  //       "role2",
  //     );

  //     // Verify edges exist
  //     let sourceEdges1 = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode,
  //       MockBfNode,
  //     );
  //     let sourceEdges2 = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode2,
  //       MockBfNode,
  //     );

  //     assertEquals(sourceEdges1.length, 1);
  //     assertEquals(sourceEdges2.length, 1);

  //     // Delete all edges touching sourceNode
  //     await BfEdgeInMemory.deleteEdgesTouchingNode(
  //       mockCv,
  //       sourceNode.metadata.bfGid,
  //     );

  //     // Verify edges were deleted
  //     sourceEdges1 = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode,
  //       MockBfNode,
  //     );
  //     sourceEdges2 = await BfEdgeInMemory.querySourceEdgesForNode(
  //       targetNode2,
  //       MockBfNode,
  //     );

  //     assertEquals(sourceEdges1.length, 0);
  //     assertEquals(sourceEdges2.length, 0);

  //     teardown();
  //   },
  // });
});
