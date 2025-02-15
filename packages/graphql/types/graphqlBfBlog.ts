import { idArg, objectType } from "nexus";
import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";
import { connectionFromArray } from "graphql-relay";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";

/**
 * Resuming: Load the blog and get its posts and show them in graphiql
 */
export const graphqlBfBlogPostType = objectType({
  name: "BfBlogPost",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("author");
    t.string("content");
    t.string("title");
    t.string("cta");
    t.string("summary");
    t.string("slug");
    t.string("href", {
      resolve: (parent) => `/blog/${parent.slug || parent.id || ""}`,
    });
  },
});

export const graphqlBfBlogType = objectType({
  name: "BfBlog",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("name");
    t.field("post", {
      type: graphqlBfBlogPostType,
      args: {
        id: idArg(),
      },
      resolve: async (_parent, { id }, ctx) => {
        if (!id) return null;
        const post = await ctx.findX(BfBlogPost, toBfGid(id));
        return post.toGraphql();
      },
    });
    // @ts-ignore problem with compiling on deno pre 2.1.7
    t.connectionField("posts", {
      type: graphqlBfBlogPostType,
      // @ts-ignore problem with compiling on deno pre 2.1.7
      resolve: async (_parent, args, _ctx) => {
        const posts = await BfBlogPost.query();
        return connectionFromArray(posts.map((post) => post.toGraphql()), args);
      },
    });
  },
});
