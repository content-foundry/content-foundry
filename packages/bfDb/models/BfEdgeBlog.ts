// packages/bfDb/models/BfEdgeBlog.ts

import { BfEdge, BfEdgeProps } from "packages/bfDb/coreModels/BfEdge.ts";
import { getLogger } from "packages/logger.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfBlog } from "packages/bfDb/models/BfBlog.ts";
import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";

const logger = getLogger(import.meta);

export type BfEdgeBlogProps = BfEdgeProps & {
  // Custom properties for blog connections
  featured?: boolean;
  order?: number;
};

/**
 * BfEdgeBlog - Special edge class to manage relationships between blogs and posts
 */
export class BfEdgeBlog extends BfEdge<BfEdgeBlogProps> {
  /**
   * Connect a blog to a post
   */
  static async connectBlogToPost(
    cv: BfCurrentViewer,
    blog: BfBlog,
    post: BfBlogPost,
    props: Partial<BfEdgeBlogProps> = {},
  ): Promise<BfEdgeBlog> {
    logger.debug(
      `Connecting blog ${blog.metadata.bfGid} to post ${post.metadata.bfGid}`,
    );

    // Default props with role and any custom properties
    const edgeProps: BfEdgeBlogProps = {
      role: "BLOG_POST",
      featured: props.featured || false,
      order: props.order || Date.now(), // Default ordering by creation time
      ...props,
    };

    return await this.createBetweenNodes(
      cv,
      blog,
      post,
      edgeProps.role,
    ) as BfEdgeBlog;
  }

  /**
   * Find all posts for a blog, with optional filtering by edge properties
   */
  static async findPostsForBlog(
    cv: BfCurrentViewer,
    blogId: BfGid,
    options: {
      featured?: boolean;
      limit?: number;
      orderByField?: "order" | "created_at";
      orderDirection?: "ASC" | "DESC";
    } = {},
  ): Promise<{ edges: BfEdgeBlog[]; posts: BfBlogPost[] }> {
    const blog = await BfBlog.find(cv, blogId);

    if (!blog) {
      return { edges: [], posts: [] };
    }

    // Get all edges from this blog to posts
    const edges = await this.findBySource(
      cv,
      blog,
      "BfBlogPost",
    ) as BfEdgeBlog[];

    // Filter by featured if specified
    let filteredEdges = edges;
    if (options.featured !== undefined) {
      filteredEdges = edges.filter((edge) =>
        edge.props.featured === options.featured
      );
    }

    // Sort edges by specified field and direction
    const orderByField = options.orderByField || "order";
    const orderDirection = options.orderDirection || "DESC";

    filteredEdges.sort((a, b) => {
      const aValue = a.props[orderByField] || 0;
      const bValue = b.props[orderByField] || 0;

      return orderDirection === "ASC"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      filteredEdges = filteredEdges.slice(0, options.limit);
    }

    // Get the actual post objects
    const posts = await Promise.all(
      filteredEdges.map(async (edge) => {
        return await BfBlogPost.find(cv, edge.targetId) as BfBlogPost;
      }),
    );

    // Filter out any null posts (in case some were deleted)
    const validPosts = posts.filter(Boolean);

    return {
      edges: filteredEdges.slice(0, validPosts.length),
      posts: validPosts,
    };
  }

  /**
   * Check if a post is featured in a blog
   */
  get isFeatured(): boolean {
    return this.props.featured || false;
  }

  /**
   * Get the display order of the post in the blog
   */
  get order(): number {
    return this.props.order || 0;
  }

  /**
   * Override toGraphql to include edge-specific fields
   */
  override toGraphql() {
    const baseGraphql = super.toGraphql();

    return {
      ...baseGraphql,
      featured: this.isFeatured,
      order: this.order,
    };
  }
}
