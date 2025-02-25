// packages/bfDb/models/BfBlogPost.ts

import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { extractYaml } from "@std/front-matter";
import { walk } from "@std/fs";
import { getLogger } from "packages/logger.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { BfBlog } from "packages/bfDb/models/BfBlog.ts";

const logger = getLogger(import.meta);

export enum BlogPostStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export type BlogPostFrontmatter = {
  author?: string;
  authorTwitter?: string;
  cta?: string;
  summary?: string;
  title?: string;
  status?: BlogPostStatus;
  tags?: string[];
  publishedAt?: Date;
};

export type BfBlogPostProps = BlogPostFrontmatter & {
  content: string;
  status: BlogPostStatus;
  slug?: string;
};

export class BfBlogPost extends BfNode<BfBlogPostProps> {
  private static _postsCache: Map<BfGid, BfBlogPost>;

  /**
   * Get the cached posts
   */
  static async getPostsCache(cv: BfCurrentViewer) {
    logger.debug("Starting getPostsCache");
    if (this._postsCache) {
      logger.debug("Returning existing posts cache");
      return this._postsCache;
    }

    this._postsCache = new Map();
    try {
      const iterable = walk(new URL(import.meta.resolve("content/blog")));

      logger.debug("Walking content/blog directory");

      for await (const entry of iterable) {
        if (entry.isFile) {
          let addableText = "";
          let props: Partial<BfBlogPostProps> = {};
          // Remove the extension from the ID
          const id = entry.path
            .split(
              import.meta.resolve("content/blog/").replace("file://", ""),
            )[1]
            .replace(/\.(md|mdx)$/, "") as BfGid;

          if (entry.path.endsWith(".md") || entry.path.endsWith(".mdx")) {
            const text = await Deno.readTextFile(entry.path);
            addableText = text;
            if (text.startsWith("---")) {
              const { body, attrs } = extractYaml(text);
              props = attrs as Partial<BfBlogPostProps>;
              addableText = body;
            }
          }

          // Generate a proper slug if not provided
          const slug = props.slug || id;

          const creationMetadata = {
            bfGid: id,
          };

          logger.debug(
            `Creating blog post with title: ${props.title || "untitled"}`,
          );

          const post = new this(
            cv,
            {
              ...props,
              content: addableText,
              status: props.status || BlogPostStatus.Draft,
              slug,
            },
            creationMetadata,
          );

          this._postsCache.set(id, post);
          logger.debug(`Added post to cache with ID: ${id}`);
        }
      }
    } catch (error) {
      logger.error("Error loading posts from filesystem:", error);
    }

    return this._postsCache;
  }

  /**
   * Find a post by ID
   */
  static override async find(
    cv: BfCurrentViewer,
    id: BfGid,
  ): Promise<BfBlogPost | null> {
    try {
      return await this.findX(cv, id);
    } catch (error) {
      if (error instanceof BfErrorNodeNotFound) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find a post by its ID
   */
  static override async findX(
    cv: BfCurrentViewer,
    id: BfGid,
  ): Promise<BfBlogPost> {
    const postsCache = await this.getPostsCache(cv);
    const item = postsCache.get(id);
    if (item) {
      return item;
    }
    logger.info(`Post not found: ${id}`);
    throw new BfErrorNodeNotFound(`Post with id ${id} not found`);
  }

  /**
   * Query posts with optional filters
   */
  static override async query(
    cv: BfCurrentViewer,
    metadata: Record<string, unknown> = {},
    props: Partial<BfBlogPostProps> = {},
  ): Promise<BfBlogPost[]> {
    const postsCache = await this.getPostsCache(cv);
    let posts = Array.from(postsCache.values());

    // Filter by props if provided
    if (Object.keys(props).length > 0) {
      posts = posts.filter((post) => {
        return Object.entries(props).every(([key, value]) => {
          return post.props[key as keyof BfBlogPostProps] === value;
        });
      });
    }

    // Filter by metadata if provided
    if (Object.keys(metadata).length > 0) {
      posts = posts.filter((post) => {
        return Object.entries(metadata).every(([key, value]) => {
          return post.metadata[key as keyof typeof post.metadata] === value;
        });
      });
    }

    return posts;
  }

  /**
   * Find a post by its slug
   */
  static async findBySlug(
    cv: BfCurrentViewer,
    slug: string,
  ): Promise<BfBlogPost | null> {
    const postsCache = await this.getPostsCache(cv);
    const posts = Array.from(postsCache.values());

    return posts.find((post) => post.slug === slug) || null;
  }

  /**
   * Create a new blog post
   */
  static async createPost(
    cv: BfCurrentViewer,
    props: Partial<BfBlogPostProps>,
    blogId?: BfGid,
  ): Promise<BfBlogPost> {
    // Set defaults
    const fullProps: BfBlogPostProps = {
      title: props.title || "Untitled Post",
      content: props.content || "",
      status: props.status || BlogPostStatus.Draft,
      slug: props.slug || `post-${Date.now()}`,
      author: props.author,
      cta: props.cta || "Read more",
      summary: props.summary || "",
      publishedAt: props.publishedAt || new Date(),
      tags: props.tags || [],
    };

    // Create the post
    const post = await this.__DANGEROUS__createUnattached(
      cv,
      fullProps,
    );

    // Connect to blog if specified
    if (blogId) {
      const blog = await BfBlog.find(cv, blogId);
      if (blog) {
        await blog.addPost(post);
      }
    }

    return post;
  }

  /**
   * Get the post title
   */
  get title(): string {
    return this.props.title || "Untitled Post";
  }

  /**
   * Get the post content
   */
  get content(): string {
    return this.props.content || "";
  }

  /**
   * Get the post author
   */
  get author(): string | undefined {
    return this.props.author;
  }

  /**
   * Get the post status
   */
  get status(): BlogPostStatus {
    return this.props.status || BlogPostStatus.Draft;
  }

  /**
   * Get the post slug
   */
  get slug(): string {
    return this.props.slug || this.metadata.bfGid;
  }

  /**
   * Get the post summary
   */
  get summary(): string {
    return this.props.summary || "";
  }

  /**
   * Get the post CTA (Call to Action)
   */
  get cta(): string {
    return this.props.cta || "Read more";
  }

  /**
   * Get the post tags
   */
  get tags(): string[] {
    return this.props.tags || [];
  }

  /**
   * Get the post URL
   */
  get href(): string {
    return `/blog/${this.slug}`;
  }

  /**
   * Get the published date
   */
  get publishedAt(): Date | null {
    return this.props.publishedAt || null;
  }

  /**
   * Check if the post is published
   */
  get isPublished(): boolean {
    return this.status === BlogPostStatus.Published;
  }

  /**
   * Find all blogs this post belongs to
   */
  async getBlogs(): Promise<BfBlog[]> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    // Find all edges where this post is the target
    const edges = await BfEdgeBlog.findByTarget(
      this.cv,
      this,
      "BfBlog",
    );

    // Get the blog objects
    const blogs = await Promise.all(
      edges.map(async (edge) => {
        return await BfBlog.find(this.cv, edge.sourceId) as BfBlog;
      }),
    );

    // Filter out any null blogs
    return blogs.filter(Boolean);
  }

  /**
   * Check if this post is featured in a specific blog
   */
  async isFeaturedIn(blogId: BfGid): Promise<boolean> {
    const { BfEdgeBlog } = await import("packages/bfDb/models/BfEdgeBlog.ts");

    const blog = await BfBlog.find(this.cv, blogId);
    if (!blog) {
      return false;
    }

    const edge = await BfEdgeBlog.findBySourceAndTarget(
      this.cv,
      blog,
      this,
    ) as BfEdgeBlog;

    return edge ? edge.isFeatured : false;
  }

  /**
   * Attach this post to a blog
   */
  async attachToBlog(
    blogId: BfGid,
    options: {
      featured?: boolean;
      order?: number;
    } = {},
  ): Promise<void> {
    const blog = await BfBlog.find(this.cv, blogId);
    if (!blog) {
      throw new BfErrorNodeNotFound(`Blog with id ${blogId} not found`);
    }

    await blog.addPost(this, options);
  }

  /**
   * Override save to handle filesystem persistence if needed
   */
  override async save(): Promise<this> {
    // For filesystem-based posts, we could write back to disk here
    // But for now, we'll just return this
    return this;
  }

  /**
   * Override delete to handle filesystem deletion if needed
   */
  override async delete(): Promise<boolean> {
    // For filesystem-based posts, we could delete the file here
    // But for now, we'll just return false
    return false;
  }

  /**
   * Override toGraphql to include custom fields
   */
  override toGraphql() {
    const baseGraphql = super.toGraphql();

    return {
      ...baseGraphql,
      title: this.title,
      content: this.content,
      author: this.author,
      status: this.status,
      slug: this.slug,
      summary: this.summary,
      cta: this.cta,
      tags: this.tags,
      href: this.href,
      publishedAt: this.publishedAt ? this.publishedAt.toISOString() : null,
      isPublished: this.isPublished,
    };
  }
}
