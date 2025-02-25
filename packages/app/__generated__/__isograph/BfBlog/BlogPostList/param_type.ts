import { type BfBlogPost__BlogPostListItem__output_type } from '../../BfBlogPost/BlogPostListItem/output_type.ts';

export type BfBlog__BlogPostList__param = {
  readonly data: {
    readonly __typename: string,
    readonly posts: ({
      readonly nodes: (ReadonlyArray<({
        readonly BlogPostListItem: BfBlogPost__BlogPostListItem__output_type,
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
