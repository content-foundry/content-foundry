import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { walk } from "@std/fs/walk";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { extractYaml } from "@std/front-matter";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

enum BlogPostStatus {
  Draft = "draft",
  Published = "published",
}

type BlogPostFrontmatter = Partial<{
  author: string;
  cta: string;
  authorTwitter: string;
  summary: string;
  title: string;
  status: BlogPostStatus;
}>;

type MaybeBlogPostFrontmatter = Partial<BlogPostFrontmatter>;

/**
 * Default frontmatter values for blog posts
 */
export const DEFAULT_BLOG_POST_FRONTMATTER: BlogPostFrontmatter = {
  author: "Unknown",
  cta: "Read more",
  summary: "No summary provided",
  title: "Untitled",
  status: BlogPostStatus.Draft,
};

// Import safeExtractFrontmatter from our utils
// No longer using safeExtractFrontmatter directly

type BfBlogPostProps = MaybeBlogPostFrontmatter & {
  content: string;
  status: BlogPostStatus;
};

export class BfBlogPost extends BfNodeBase<BfBlogPostProps> {
  private static _postsCache: Map<BfGid, BfBlogPost>;

  static async getPostsCache() {
    logger.debug("Starting getPostsCache");
    if (this._postsCache) {
      logger.debug("Returning existing posts cache");
      return this._postsCache;
    }

    this._postsCache = new Map();
    const iterable = walk(new URL(import.meta.resolve("content/blog")));
    const loggedOutCV = BfCurrentViewer.createLoggedOut(import.meta);
    logger.debug("Walking content/blog directory");

    for await (const entry of iterable) {
      if (entry.isFile) {
        let addableText = "";
        let props: BlogPostFrontmatter = {};
        // Remove the extension from the ID
        const id = entry.path
          .split(import.meta.resolve("content/blog/").replace("file://", ""))[1]
          .replace(/\.(md|mdx)$/, "") as BfGid;

        if (entry.path.endsWith(".md") || entry.path.endsWith(".mdx")) {
          const text = await Deno.readTextFile(entry.path);
          addableText = text;
          if (text.startsWith("---")) {
            const { body, attrs } = extractYaml(text);
            props = attrs as BlogPostFrontmatter;
            addableText = body;
          }
        }

        const creationMetadata = {
          bfGid: id,
        };
        logger.debug(
          `Creating blog post with title: ${props.title || "untitled"}`,
        );
        const post = await this.__DANGEROUS__createUnattached(
          loggedOutCV,
          { ...props, content: addableText },
          creationMetadata,
        );
        this._postsCache.set(id, post);
        logger.debug(`Added post to cache with ID: ${id}`);
      }
    }
    return this._postsCache;
  }

  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    const postsCache = await this.getPostsCache();
    const item = postsCache.get(id);
    if (item) {
      return item as unknown as T;
    }
    logger.info(`Post not found: ${id}`);
    throw new BfErrorNodeNotFound();
  }

  static override async query<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(): Promise<Array<T>> {
    const postsCache = await this.getPostsCache();
    return Array.from(postsCache.values()) as unknown as Array<T>;
  }

  override async save() {
    return await this;
  }

  override async delete() {
    return await false;
  }

  override async load() {
    return await this;
  }
}
