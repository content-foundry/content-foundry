import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { objectType } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { getLogger } from "packages/logger.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";

const _logger = getLogger(import.meta);

export const graphqlBfContentItemType = objectType({
  name: "BfContentItem",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("body");
    t.string("slug");
    t.string("author");
    t.string("summary");
    t.string("cta");
    t.string("href");
  },
});

export const graphqlBfContentCollectionType = objectType({
  name: "BfContentCollection",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("description");
    t.list.field("items", {
      type: "BfContentItem",
      resolve: async (parent, _args, ctx) => {
        // Get the collection by parent ID using ctx
        const collection = await ctx.findX(
          BfContentCollection,
          toBfGid(parent.id),
        );

        return collection.props.items.map((item) => {
          return {
            ...item,
            id: "temporary",
            __typename: "BfContentItem",
          };
        });
      },
    });
  },
});
