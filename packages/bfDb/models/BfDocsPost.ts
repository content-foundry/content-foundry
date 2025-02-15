import {
  BfNodeBase,
  type BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfNodeCache } from "packages/bfDb/classes/BfNodeBase.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";
import { walk } from "@std/fs/walk";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { extractYaml } from "@std/front-matter";

const logger = getLogger(import.meta);

enum DocsPostStatus {
  Draft = "draft",
  Published = "published",
}

type DocsPostFrontmatter = {
  author: string;
  status: DocsPostStatus;
  summary: string;
  title: string;
  slug: string;
};

type MaybeDocsPostFrontmatter = Partial<DocsPostFrontmatter>;

export type BfDocsPostProps = MaybeDocsPostFrontmatter & {
  content: string;
  status: DocsPostStatus;
};

export class BfDocsPost extends BfNodeBase<BfDocsPostProps> {
  private static _postsCache: Map<BfGid, BfDocsPost>;

  static async getPostsCache() {
    logger.debug("Starting getPostsCache for docs");
    if (this._postsCache) {
      logger.debug("Returning existing docs cache");
      return this._postsCache;
    }

    this._postsCache = new Map();
    const iterable = walk(
      new URL(import.meta.resolve("content/documentation")),
    );
    const loggedOutCV = BfCurrentViewer.createLoggedOut(import.meta);
    logger.debug("Walking documentation directory");

    for await (const entry of iterable) {
      if (!entry.isFile || !entry.path.endsWith(".md")) continue;

      const maybeId = entry.path.split(".md")[0].split("/").pop();
      if (maybeId == null) {
        logger.debug(`Skipping entry with invalid path: ${entry.path}`);
        continue;
      }

      const id = toBfGid(maybeId);
      logger.debug(`Processing file: ${entry.path} with ID: ${id}`);

      let content = await Deno.readTextFile(entry.path);
      let metadata = {} as MaybeDocsPostFrontmatter;

      try {
        const { body, attrs } = extractYaml(content);
        content = body;
        metadata = attrs as MaybeDocsPostFrontmatter;
        logger.debug(`Successfully parsed front matter for ${id}`);
      } catch {
        logger.warn(`Failed to parse front matter for ${id}`);
      }

      const props: BfDocsPostProps = {
        ...(metadata as MaybeDocsPostFrontmatter),
        content,
        status: metadata.status ?? DocsPostStatus.Published,
      };

      logger.debug(
        `Creating docs post with title: ${metadata.title || "untitled"}`,
      );
      const creationMetadata = {
        bfGid: id,
      };
      const post = await this.__DANGEROUS__createUnattached(
        loggedOutCV,
        props,
        creationMetadata,
      );
      this._postsCache.set(id, post);
      logger.debug(`Added docs post to cache with ID: ${id}`);
    }

    logger.debug("Completed getPostsCache for docs");
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
