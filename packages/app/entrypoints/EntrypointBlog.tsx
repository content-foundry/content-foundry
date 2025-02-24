import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const EntrypointBlog = iso(`
  field Query.EntrypointBlog {
    me {
      blog {
        name
      }
      Blog
    }
  }
`)(function EntrypointBlog({ data }){
  const title = "Content Foundry";
  const DefaultBody = () => "coming soon";

  return {
    Body: data?.me?.Blog ?? DefaultBody,
    title: data?.me?.blog?.name ?? title,
  };
});
