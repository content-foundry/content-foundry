import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BlogFrame } from "packages/app/components/BfBlog/BlogFrame.tsx";

export const Blog = iso(`
  field BfCurrentViewer.Blog @component {
    blog {
      BlogPostList
    }
  }
`)(function Blog({ data }) {
  const BlogList = data?.blog?.BlogPostList ?? (() => "No posts yet");

  return (
    <BlogFrame>
      <BlogList />
    </BlogFrame>
  );
});
