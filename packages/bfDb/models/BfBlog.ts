// packages/bfDb/models/BfBlog.ts

import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";
import { getLogger } from "packages/logger.ts";
import type { Connection, ConnectionArguments } from "graphql-relay";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { bfQueryItemsForGraphQLConnection } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

export type BfBlogProps = {
  name: string;
  description?: string;
  slug?: string;
  isPublic?: boolean;
};

export class BfBlog extends BfNode<BfBlogProps> {
  /**
   * Get the blog's name
   */
  get name(): string {
    return this.props.name || "Untitled Blog";
  }

  /**
   * Get the blog's description
   */
  get description(): string | undefined {
    return this.props.description;
  }

  /**
   * Get the blog's slug for URL purposes
   */
  get slug(): string {
    return this.props.slug || this.metadata.bfGid;
  }

  /**
   * Check if the blog is public
   */
  get isPublic(): boolean {
    return this.props.isPublic !== false; // Default to true
  }

  /**
   * Add a post to this blog
   */
  async addPost(
    post: BfBlogPost,
    options: {
      featured?: boolean;
      order?: number;
    } = {},
  ): Promise<void> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    await BfEdgeBlog.connectBlogToPost(this.cv, this, post, {
      featured: options.featured,
      order: options.order || Date.now(),
    });
  }

  /**
   * Find a post by ID that is connected to this blog
   */
  async findPost(postId: BfGid): Promise<BfBlogPost | null> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    // First check if we have an edge connecting this blog to the post
    const post = await BfBlogPost.find(this.cv, postId);
    if (!post) {
      return null;
    }

    const edge = await BfEdgeBlog.findBySourceAndTarget(
      this.cv,
      this,
      post,
    );

    // If we found an edge, return the post
    return edge ? post : null;
  }

  /**
   * Get all posts for this blog
   */
  async getPosts(
    options: {
      featured?: boolean;
      limit?: number;
      orderByField?: "order" | "created_at";
      orderDirection?: "ASC" | "DESC";
    } = {},
  ): Promise<BfBlogPost[]> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    const { posts } = await BfEdgeBlog.findPostsForBlog(
      this.cv,
      this.metadata.bfGid,
      options,
    );

    return posts;
  }

  /**
   * Get posts for this blog as a connection for GraphQL
   */
  async getPostsConnection(
    args: ConnectionArguments,
  ): Promise<Connection<BfBlogPost> & { count: number }> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    // Find all edges between this blog and its posts
    const edges = await BfEdgeBlog.findBySource(
      this.cv,
      this,
      "BfBlogPost",
    );

    // Extract the target IDs to use for our query
    const postIds = edges.map((edge) => edge.targetId);

    // Use the bfDb query system to get a paginated connection
    const connection = await bfQueryItemsForGraphQLConnection(
      { className: "BfBlogPost" },
      {},
      args,
      postIds,
    );

    return connection;
  }

  /**
   * Create a blog with default values
   */
  static async createBlog(
    cv: BfCurrentViewer,
    props: Partial<BfBlogProps>,
    metadata?: Partial<BfMetadataNode>,
  ): Promise<BfBlog> {
    const defaultProps: BfBlogProps = {
      name: props.name || "New Blog",
      description: props.description,
      slug: props.slug || `blog-${Date.now()}`,
      isPublic: props.isPublic !== false,
    };

    return await this.__DANGEROUS__createUnattached(
      cv,
      defaultProps,
      metadata,
    );
  }

  /**
   * Find a blog by its slug
   */
  static async findBySlug(
    cv: BfCurrentViewer,
    slug: string,
  ): Promise<BfBlog | null> {
    const blogs = await this.query(
      cv,
      {},
      { slug },
    );

    return blogs.length > 0 ? blogs[0] : null;
  }

  /**
   * Convenience method to get or create the main site blog
   */
  static async getMainBlog(cv: BfCurrentViewer): Promise<BfBlog> {
    try {
      return await this.findX(cv, "the-blog" as BfGid);
    } catch (error) {
      if (error instanceof BfErrorNodeNotFound) {
        // Create the main blog if it doesn't exist
        return await this.createBlog(cv, {
          name: "Content Foundry Blog",
          slug: "blog",
          isPublic: true,
        }, {
          bfGid: "the-blog" as BfGid,
        });
      }
      throw error;
    }
  }

  /**
   * Override toGraphql to include our custom fields
   */
  override toGraphql() {
    const baseGraphql = super.toGraphql();

    return {
      ...baseGraphql,
      name: this.name,
      description: this.description,
      slug: this.slug,
      isPublic: this.isPublic,
    };
  }
}
