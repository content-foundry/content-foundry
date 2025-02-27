// Updates to packages/graphql/types/graphqlBfContentCollection.ts

import { objectType } from "nexus";
import { connectionFromArray } from "graphql-relay";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { getLogger } from "packages/logger.ts";
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";

const logger = getLogger(import.meta);

// Define the BfContentItem type
export const graphqlBfContentItemType = objectType({
  name: "BfContentItem",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("body");
    t.string("slug");
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
      resolve: async (parent, args, ctx) => {
        try {
          // Use the context to find the collection by ID
          const collection = await ctx.findX(
            BfContentCollection,
            parent.id as BfGid,
          );

          // Get the content items from the collection
          const contentItems = await collection.getContentItems();

          // Map to proper objects with IDs that match what our system expects
          const items = contentItems.map((item) => ({
            __typename: "BfContentItem",
            id: item.metadata.bfGid,
            title: item.title,
            body: item.content,
            slug: item.props.slug
          }));

          return connectionFromArray(items, args);
        } catch (error) {
          logger.error(
            `Error fetching content items: ${(error as Error).message}`,
          );
          return connectionFromArray([], args);
        }
      },
    });
  },
});
