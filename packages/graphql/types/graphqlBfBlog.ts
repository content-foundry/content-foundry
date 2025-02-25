import { booleanArg, idArg, intArg, objectType, stringArg } from "nexus";
import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/**
 * GraphQL type for BfBlogPost
 */
export const graphqlBfBlogPostType = objectType({
  name: "BfBlogPost",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("title");
    t.string("content");
    t.string("author");
    t.string("summary");
    t.string("cta");
    t.string("slug");
    t.string("href", {
      resolve: (parent) => `/blog/${parent.slug || parent.id || ""}`,
    });
    t.list.string("tags", {
      resolve: (parent) => parent.tags || [],
    });
    t.string("publishedAt", {
      resolve: (parent) =>
        parent.publishedAt ? parent.publishedAt.toISOString() : null,
    });
    t.boolean("isPublished", {
      resolve: (parent) => parent.isPublished || false,
    });
  },
});

/**
 * GraphQL type for BfBlogPostEdge with custom edge fields
 */
export const graphqlBfBlogPostEdgeType = objectType({
  name: "BfBlogPostEdge",
  definition(t) {
    t.string("cursor");
    t.field("node", { type: graphqlBfBlogPostType });
    t.boolean("featured", {
      resolve: (parent) => parent.featured || false,
    });
    t.int("order", {
      resolve: (parent) => parent.order || 0,
    });
  },
});

/**
 * GraphQL type for BfBlogPostConnection with edge and pagination fields
 */
export const graphqlBfBlogPostConnectionType = objectType({
  name: "BfBlogPostConnection",
  definition(t) {
    t.field("pageInfo", { type: "PageInfo" });
    t.list.field("edges", { type: graphqlBfBlogPostEdgeType });
    t.list.field("nodes", { type: graphqlBfBlogPostType });
    t.int("count");
  },
});

/**
 * GraphQL type for BfBlog with posts connection
 */
export const graphqlBfBlogType = objectType({
  name: "BfBlog",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("name");
    t.string("description");
    t.string("slug");
    t.boolean("isPublic");
    t.string("url", {
      resolve: (parent) => `/blog/${parent.slug || ""}`,
    });

    // Field to get a single post by ID or slug
    t.field("post", {
      type: graphqlBfBlogPostType,
      args: {
        id: idArg(),
        slug: stringArg(),
      },
      resolve: async (_parent, { id, slug }, ctx) => {
        let post = null;

        // First try to find by ID
        if (id) {
          post = await ctx.find(BfBlogPost, toBfGid(id));
        } // Then try to find by slug
        else if (slug) {
          post = await BfBlogPost.findBySlug(ctx.getCvForGraphql(), slug);
        }

        return post ? post.toGraphql() : null;
      },
    });

    // Connection field for multiple posts with filtering options
    t.connectionField("posts", {
      type: graphqlBfBlogPostType,
      additionalArgs: {
        featured: booleanArg(),
        status: stringArg(),
        limit: intArg(),
      },
      async resolve(parent, args, ctx) {
        logger.debug("Resolving blog posts connection", {
          blogId: parent.id,
          args,
        });

        try {
          const { BfEdgeBlog } = await import(
            "packages/bfDb/models/BfEdgeBlog.ts"
          );

          // Build edge filters
          const edgeFilters: Record<string, unknown> = {};
          if (args.featured !== undefined) {
            edgeFilters.featured = args.featured;
          }

          // Build target filters
          const targetFilters: Record<string, unknown> = {};
          if (args.status) {
            targetFilters.status = args.status;
          }

          // Use the new queryConnectionForGraphql method
          const connection = await ctx.queryConnectionForGraphql(
            BfBlog,
            BfBlogPost,
            BfEdgeBlog,
            toBfGid(parent.id),
            args,
            {
              edgeProps: edgeFilters,
              targetProps: targetFilters,
            },
          );

          // Enhance edges with custom properties from BfEdgeBlog
          const enhancedEdges = connection.edges.map((edge) => {
            // Find the corresponding edge
            const sourceId = toBfGid(parent.id);
            const targetId = toBfGid(edge.node.id);

            // Add any custom properties from the edge
            return {
              ...edge,
              featured: edge.featured || false,
              order: edge.order || 0,
            };
          });

          return {
            ...connection,
            edges: enhancedEdges,
          };
        } catch (error) {
          logger.error("Error resolving blog posts connection", error);
          throw error;
        }
      },
      // Count resolver for the connection
      count: async (parent, args, ctx) => {
        const { BfEdgeBlog } = await import(
          "packages/bfDb/models/BfEdgeBlog.ts"
        );

        try {
          const sourceId = toBfGid(parent.id);
          const blog = await ctx.findX(BfBlog, sourceId);

          const { posts } = await BfEdgeBlog.findPostsForBlog(
            ctx.getCvForGraphql(),
            sourceId,
            {
              featured: args.featured,
            },
          );

          return posts.length;
        } catch (error) {
          logger.error("Error counting blog posts", error);
          return 0;
        }
      },
    });

    // Field to get featured posts (shorthand)
    t.connectionField("featuredPosts", {
      type: graphqlBfBlogPostType,
      async resolve(parent, args, ctx) {
        logger.debug("Resolving featured blog posts", {
          blogId: parent.id,
          args,
        });

        const modifiedArgs = {
          ...args,
          featured: true,
        };

        // Reuse the posts connection resolver with featured=true
        return await ctx.queryConnectionForGraphql(
          BfBlog,
          BfBlogPost,
          (await import("packages/bfDb/models/BfEdgeBlog.ts")).BfEdgeBlog,
          toBfGid(parent.id),
          modifiedArgs,
          {
            edgeProps: { featured: true },
          },
        );
      },
      // Count resolver for the featuredPosts connection
      count: async (parent, args, ctx) => {
        const { BfEdgeBlog } = await import(
          "packages/bfDb/models/BfEdgeBlog.ts"
        );

        try {
          const { posts } = await BfEdgeBlog.findPostsForBlog(
            ctx.getCvForGraphql(),
            toBfGid(parent.id),
            { featured: true },
          );

          return posts.length;
        } catch (error) {
          logger.error("Error counting featured blog posts", error);
          return 0;
        }
      },
    });
  },
});
