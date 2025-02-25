import { booleanArg, idArg, objectType, queryField, stringArg } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";
import { connectionFromArray } from "graphql-relay";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";

// Ensure this file gets included in the GraphQL schema generation
export * from "./graphqlBfContentCollection.ts";

const logger = getLogger(import.meta);

/**
 * GraphQL type definition for the BfContentCollection model
 */
export const graphqlBfContentCollectionType = objectType({
  name: "BfContentCollection",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("description");
    t.string("content");
    t.string("path");
    t.boolean("featured");
    t.list.string("tags");
    t.string("date");
    t.string("author");
    t.string("href", {
      resolve: (parent) => `/content/${parent.id}`,
    });
  },
});

/**
 * Content Root type that serves as an entry point for content queries
 */
export const graphqlContentRootType = objectType({
  name: "ContentRoot",
  definition(t) {
    t.nonNull.id("id");

    // Field for fetching a single content collection by ID
    t.field("collection", {
      type: graphqlBfContentCollectionType,
      args: {
        id: idArg({
          description: "ID of the content collection to fetch",
        }),
      },
      resolve: async (_, { id }, ctx) => {
        if (!id) return null;

        try {
          const collection = await ctx.findX(BfContentCollection, toBfGid(id));
          return collection.toGraphql();
        } catch (error) {
          logger.error(`Error fetching content collection ${id}:`, error);
          return null;
        }
      },
    });

    // Connection field for fetching multiple content collections with filtering
    t.connectionField("collections", {
      type: graphqlBfContentCollectionType,
      additionalArgs: {
        path: stringArg({
          description: "Filter by content path (e.g., 'content/blog')",
        }),
        featured: booleanArg({
          description: "Filter for featured content only",
        }),
        tag: stringArg({
          description: "Filter by a specific tag",
        }),
      },
      resolve: async (_, args) => {
        const { path, featured, tag } = args;

        // Create filter based on args
        const filter: Record<string, unknown> = {};
        if (path) filter.path = path;
        if (featured !== undefined) filter.featured = featured;

        // Create a CV to use for querying
        const loggedOutCV = BfCurrentViewer.createLoggedOut(import.meta);

        // Query collections with the filter
        const collections = await BfContentCollection.query(
          loggedOutCV,
          undefined,
          filter,
        );

        // If tag filter is applied, manually filter results
        let filteredCollections = collections;
        if (tag) {
          filteredCollections = collections.filter((collection) => {
            const tags = collection.props.tags;
            return tags && Array.isArray(tags) && tags.includes(tag);
          });
        }

        // Return as a connection
        return connectionFromArray(
          filteredCollections.map((collection) => collection.toGraphql()),
          args,
        );
      },
    });
  },
});

/**
 * Root query field for accessing the content system
 */
export const graphqlContentRootQuery = queryField("content", {
  type: graphqlContentRootType,
  resolve: () => ({
    id: "content-root",
  }),
});
