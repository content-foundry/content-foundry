import { assertEquals, assertExists } from "@std/assert";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfNodeBase } from "packages/bfDb/classes/BfNodeBase.ts";

export function testBfNodeBase(BfNodeClass: typeof BfNodeBase) {
  Deno.test(`BfNodeBase test suite: ${BfNodeClass.name}`, async (t) => {
    // Mock current viewer
    const mockCv = BfCurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        "test",
        "test",
      );

    await t.step(
      "createUnattached should create a node with proper metadata",
      async () => {
        const nodeName = "Test Node";
        const node = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
          name: nodeName,
        });

        assertExists(node.metadata.bfGid, "Node should have a global ID");
        assertExists(node.metadata.bfOid, "Node should have an owner ID");
        assertEquals(node.metadata.className, BfNodeClass.name);
        assertEquals(node.props.name, nodeName);
      },
    );

    await t.step("should generate unique GIDs for each node", async () => {
      const node1 = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
        name: "Node 1",
      });
      const node2 = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
        name: "Node 2",
      });

      assertExists(node1.metadata.bfGid);
      assertExists(node2.metadata.bfGid);
      assertEquals(
        node1.metadata.bfGid !== node2.metadata.bfGid,
        true,
        "Nodes should have unique GIDs",
      );
    });

    await t.step("should allow updating props", async () => {
      const node = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
        name: "Initial Name",
      });

      // Update props
      node.props = {
        ...node.props,
        name: "Updated Name",
        description: "New description",
      };

      assertEquals(node.props.name, "Updated Name");
      assertEquals(node.props.description, "New description");
    });

    await t.step("toGraphql should return expected structure", async () => {
      const node = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
        name: "GraphQL Node",
      });

      const graphqlObj = node.toGraphql();

      assertEquals(graphqlObj.id, node.metadata.bfGid);
      assertEquals(graphqlObj.__typename, node.__typename);
      assertEquals(graphqlObj.name, "GraphQL Node");
    });

    await t.step(
      "toString should return a formatted string with metadata",
      async () => {
        const node = await BfNodeClass.__DANGEROUS__createUnattached(mockCv, {
          name: "String Test Node",
        });

        const stringRepresentation = node.toString();

        // Check that string contains the class name and IDs
        assertEquals(
          stringRepresentation.includes(BfNodeClass.name),
          true,
          "String representation should include class name",
        );
        assertEquals(
          stringRepresentation.includes(node.metadata.bfGid),
          true,
          "String representation should include bfGid",
        );
        assertEquals(
          stringRepresentation.includes(node.metadata.bfOid),
          true,
          "String representation should include bfOid",
        );
      },
    );

    await t.step("generateMetadata should create proper metadata", () => {
      const metadata = BfNodeClass.generateMetadata(mockCv);

      assertExists(metadata.bfGid);
      assertEquals(metadata.bfOid, mockCv.bfOid);
      assertEquals(metadata.className, BfNodeClass.name);
      assertExists(metadata.sortValue);
    });

    await t.step("generateSortValue should create a numeric value", () => {
      const sortValue = BfNodeClass.generateSortValue();
      assertEquals(typeof sortValue, "number");
    });
  });
}
