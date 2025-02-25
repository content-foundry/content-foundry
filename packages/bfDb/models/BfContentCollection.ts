// Simplified implementation for packages/bfDb/models/BfContentCollection.ts

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
import { basename, dirname, join, normalize } from "@std/path";
import { exists } from "@std/fs/exists";

const logger = getLogger(import.meta);

type ContentCollectionFrontmatter = Partial<{
  title: string;
  description: string;
  date: string;
  tags: string[];
  author: string;
  featured: boolean;
}>;

type BfContentCollectionProps = ContentCollectionFrontmatter & {
  content: string;
  path: string;
};

export class BfContentCollection extends BfNodeBase<BfContentCollectionProps> {
  private static _collectionsCache: Map<BfGid, BfContentCollection>;

  static getCollectionsCache() {
    logger.debug("Starting getCollectionsCache");
    if (this._collectionsCache) {
      logger.debug("Returning existing collections cache");
      return this._collectionsCache;
    }

    this._collectionsCache = new Map();
    logger.debug("Initializing collections cache");

    return this._collectionsCache;
  }

  static async loadCollection(path: string) {
    logger.debug(`Loading collection from path: ${path}`);
    const _collectionsCache = await this.getCollectionsCache();
    const loggedOutCV = BfCurrentViewer.createLoggedOut(import.meta);

    try {
      // Normalize the path to handle any path separators consistently
      const resolvedPath = normalize(path);

      logger.debug(`Resolved path: ${resolvedPath}`);

      // Check if the path exists
      const pathExists = await exists(resolvedPath);
      if (!pathExists) {
        logger.debug(`Path does not exist: ${resolvedPath}`);
        return false;
      }

      const pathInfo = await Deno.stat(resolvedPath);

      if (pathInfo.isDirectory) {
        // Process directory
        logger.debug(`Processing directory: ${resolvedPath}`);
        const iterable = walk(resolvedPath);
        for await (const entry of iterable) {
          if (entry.isFile) {
            await this.processContentFile(entry.path, resolvedPath, loggedOutCV);
          }
        }
      } else if (pathInfo.isFile) {
        // Process single file
        logger.debug(`Processing file: ${resolvedPath}`);
        await this.processContentFile(resolvedPath, dirname(resolvedPath), loggedOutCV);
      }

      return true;
    } catch (error) {
      logger.error(`Error loading collection from ${path}:`, error);
      return false;
    }
  }

  private static async processContentFile(
    filePath: string,
    basePath: string,
    cv: BfCurrentViewer,
  ) {
    if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
      return;
    }

    try {
      // Use the normalized full path of the file as the ID
      const normalizedPath = normalize(filePath);

      // Remove extension to create the ID
      const idPath = normalizedPath.replace(/\.(md|mdx)$/, "");
      const id = toBfGid(idPath);

      // Read and process the file
      const text = await Deno.readTextFile(filePath);
      let content = text;
      let frontmatter: ContentCollectionFrontmatter = {};

      if (text.startsWith("---")) {
        const { body, attrs } = extractYaml(text);
        frontmatter = attrs as ContentCollectionFrontmatter;
        content = body;
      }

      logger.debug(`Creating content collection item with id: ${id}`);
      const collection = await this.__DANGEROUS__createUnattached(
        cv,
        {
          ...frontmatter,
          content,
          path: basePath, // Store the original basePath
        },
        {
          bfGid: id,
        },
      );

      this._collectionsCache.set(id, collection);
      logger.debug(`Added content item to cache with ID: ${id}`);
    } catch (error) {
      logger.error(`Error processing file ${filePath}:`, error);
    }
  }

  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    logger.debug(`Finding content collection with id: ${id}`);
    const collectionsCache = this.getCollectionsCache();

    // Check if the item is already in cache
    const cachedItem = collectionsCache.get(id);
    if (cachedItem) {
      return cachedItem as unknown as T;
    }

    // Try to load based on base directory
    const idStr = String(id);
    let basePath = dirname(idStr);

    try {
      // Try loading the collection containing this item
      logger.debug(`Loading collection for base path: ${basePath}`);
      const loaded = await this.loadCollection(basePath);

      if (loaded) {
        // Check if it was loaded into the cache
        const loadedItem = collectionsCache.get(id);
        if (loadedItem) {
          return loadedItem as unknown as T;
        }
      }

      // If not found, try to load the specific file directly
      logger.debug(`Trying to load specific file: ${id}.md`);
      const mdPath = `${idStr}.md`;
      if (await exists(mdPath)) {
        await this.loadCollection(mdPath);
      }

      const mdxPath = `${idStr}.mdx`;
      if (await exists(mdxPath)) {
        await this.loadCollection(mdxPath);
      }

      const finalItem = collectionsCache.get(id);
      if (finalItem) {
        return finalItem as unknown as T;
      }
    } catch (error) {
      logger.error(`Error finding item with id ${id}:`, error);
    }

    logger.info(`Content item not found: ${id}`);
    throw new BfErrorNodeNotFound(`Content item not found: ${id}`);
  }

  static override async query<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    metadata?: Record<string, unknown>,
    props?: Record<string, unknown>,
  ): Promise<Array<T>> {
    const collectionsCache = this.getCollectionsCache();

    // If a path is specified in props, load that collection first
    const pathFilter = props?.path as string | undefined;
    if (pathFilter) {
      await this.loadCollection(pathFilter);
    }

    // Get all items from cache
    let items = Array.from(collectionsCache.values());

    // Filter by path if provided
    if (pathFilter) {
      // Normalize the filter path for consistent comparison
      const normalizedPath = normalize(pathFilter);

      // Only include items that match this path
      items = items.filter(item => item.props.path === normalizedPath);
    }

    // Apply metadata filters if provided
    if (metadata) {
      items = items.filter((item) => {
        for (const [key, value] of Object.entries(metadata)) {
          if (
            key in item.metadata &&
            item.metadata[key as keyof typeof item.metadata] !== value
          ) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply the rest of props filters if provided
    if (props) {
      items = items.filter((item) => {
        for (const [key, value] of Object.entries(props)) {
          if (key === "path") continue; // Skip path since we handled it separately
          if (
            key in item.props &&
            item.props[key as keyof typeof item.props] !== value
          ) {
            return false;
          }
        }
        return true;
      });
    }

    return items as unknown as Array<T>;
  }

  override save() {
    // Since this is reading from disk, we don't actually save changes
    // But we need to implement the method
    return Promise.resolve(this);
  }

  override delete() {
    // Since this is reading from disk, we don't actually delete
    // But we need to implement the method
    return Promise.resolve(false);
  }

  override load() {
    // Since we load on find/query, this is a no-op
    return Promise.resolve(this);
  }
}

// Helper function needed by the test
function toBfGid(value: string): BfGid {
  return value as BfGid;
}