import { iso } from "packages/app/__generated__/__isograph/iso.ts";
// import { BlogFrame } from "packages/app/components/Blog/BlogFrame.tsx";

export const BlogPostList = iso(`
  field BfBlog.BlogPostList @component {
     __typename
     posts {
      nodes {
         BlogPostListItem
       }
     }
     
  }
`)(function Blog({ data }) {
  const nodes = data?.posts?.nodes ?? [];
  const blogPostListItems = nodes.map((node) =>
    node && <node.BlogPostListItem />
  ).filter(Boolean);

  return blogPostListItems.length > 0
    ? blogPostListItems
    : <div>No posts found</div>;
});
