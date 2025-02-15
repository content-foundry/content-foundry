import { idArg, objectType } from "nexus";
import { BfDocsPost } from "packages/bfDb/models/BfDocsPost.ts";
import { connectionFromArray } from "graphql-relay";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);
export const graphqlBfDocsPostType = objectType({
  name: "BfDocsPost",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("author");
    t.string("content");
    t.string("title");
    t.string("status");
    t.string("summary");
    t.string("slug");
    t.string("href", {
      resolve: (parent) => `/docs/${parent.slug || parent.id || ""}`,
    });
  },
});

export const graphqlBfDocsType = objectType({
  name: "BfDocs",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("name");
    // @ts-ignore problem with compiling on deno pre 2.1.7
    t.connectionField("posts", {
      type: graphqlBfDocsPostType,
      // @ts-ignore problem with compiling on deno pre 2.1.7
      resolve: async (_parent, args, _ctx) => {
        const posts = await BfDocsPost.query();
        return connectionFromArray(posts.map((post) => post.toGraphql()), args);
      },
    });

    t.field("post", {
      type: graphqlBfDocsPostType,
      args: {
        slug: idArg(),
      },
      resolve: async (_parent, { slug }, ctx) => {
        if (!slug) return null;
        logger.debug("slug", slug);
        const post = await ctx.findX(BfDocsPost, toBfGid(slug));
        return post?.toGraphql();
      },
    });
  },
});
