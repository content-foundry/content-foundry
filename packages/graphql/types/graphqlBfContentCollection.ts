import { objectType } from "nexus";
import { connectionFromArray } from "graphql-relay";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Define the BfContentItem type
export const graphqlBfContentItemType = objectType({
  name: "BfContentItem",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("body");
    t.string("slug");
    // Add additional fields as needed
    t.string("href", {
      resolve: (parent) => `/content/${parent.slug || parent.id || ""}`,
    });
  },
});

// Define the BfContentCollection type
export const graphqlBfContentCollectionType = objectType({
  name: "BfContentCollection",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("name");
    t.string("slug");
    t.string("description");

    // Connection to BfContentItems
    t.connectionField("items", {
      type: graphqlBfContentItemType,
      resolve: (parent, args) => {
        // In a real implementation, you would fetch items from a database
        // For now, return an empty array as a placeholder
        logger.debug(`Fetching content items for collection: ${parent.slug}`);
        const mockItems = [
          // Mock data until we implement the DB side
          {
            id: "item1",
            title: "Example Content 1",
            body: "This is example content 1",
            slug: "example-1",
          },
          {
            id: "item2",
            title: "Example Content 2",
            body: "This is example content 2",
            slug: "example-2",
          },
        ];

        return connectionFromArray(mockItems, args);
      },
    });
  },
});
