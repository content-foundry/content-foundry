import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";

export const EntrypointBlog = iso(`
  field Query.EntrypointBlog {
    me {
      blog {
        name
      }
      Blog
    }
  }
`)(function EntrypointBlog({ data }): RouteEntrypoint {
  const title = "Content Foundry";
  const DefaultBody = () => "coming soon";

  return {
    Body: data?.me?.Blog ?? DefaultBody,
    title: data?.me?.blog?.name ?? title,
  };
});
