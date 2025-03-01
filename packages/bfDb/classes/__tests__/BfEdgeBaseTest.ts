import { assertEquals } from "@std/assert";
import type { BfEdgeBase } from "packages/bfDb/classes/BfEdgeBase.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfNodeBase } from "packages/bfDb/classes/BfNodeBase.ts";

type MockBfNodeProps = {
  name: string;
};

class MockBfNode extends BfNodeBase<MockBfNodeProps> {
  override save() {
    // no op
    return Promise.resolve(this);
  }
}

export function testBfEdgeBase(BfEdgeClass: typeof BfEdgeBase) {
  Deno.test(`BfEdgeBase test suite: ${BfEdgeClass.name}`, async (t) => {
    // Mock current viewer
    const mockCv = BfCurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        "test",
        "test",
      );

    const sourceNode = await MockBfNode.__DANGEROUS__createUnattached(mockCv, {
      name: "Source Node",
    });
    const targetNode = await MockBfNode.__DANGEROUS__createUnattached(mockCv, {
      name: "Target Node",
    });

    await t.step(
      "createBetweenNodes should create an edge between two nodes",
      async () => {
        const role = "test-role";
        const edge = await BfEdgeClass.createBetweenNodes(
          mockCv,
          sourceNode,
          targetNode,
          role,
        );

        assertEquals(edge.metadata.bfSid, sourceNode.metadata.bfGid);
        assertEquals(edge.metadata.bfTid, targetNode.metadata.bfGid);
        assertEquals(edge.metadata.bfSClassName, sourceNode.metadata.className);
        assertEquals(edge.metadata.bfTClassName, targetNode.metadata.className);
        assertEquals(edge.props.role, role);
      },
    );
  });
}
