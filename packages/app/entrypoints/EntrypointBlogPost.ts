import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointBlogPost = iso(`
  field Query.EntrypointBlogPost($slug: ID) {
    me {
      blog {
        post(id: $slug) {
          __typename
          BlogPostListItem
        }
      }
    }
  }
`)(function EntrypointBlogPost({ data }) {
  const Body = data?.me?.blog?.post?.BlogPostListItem ?? (() => "nope");
  logger.debug("data", data);
  const title = "Blog Post";
  return { Body, title };
});
