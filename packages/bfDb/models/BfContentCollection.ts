import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { getLogger } from "packages/logger.ts";
import { BfEdgeBase } from "packages/bfDb/classes/BfEdgeBase.ts";
import { walk } from "@std/fs";
import * as path from "@std/path";
import { parse as parseYaml } from "@std/yaml";
import type { JSONValue } from "packages/bfDb/bfDb.ts";
// BfContentItem is imported dynamically to avoid circular dependencies
// But we still need to import the type for proper typing
import type { BfContentItem } from "./BfContentItem.ts";

const logger = getLogger(import.meta);

// Simple front-matter parser for our content
function parseFrontmatter(
  content: string,
): { data: Record<string, unknown>; content: string } {
  if (!content.startsWith("---")) {
    // No frontmatter
    return { data: {}, content };
  }

  try {
    // Extract the frontmatter section
    const frontMatterMatch = content.match(
      /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/,
    );
    if (!frontMatterMatch) {
      return { data: {}, content };
    }

    const [, frontMatterContent, bodyContent] = frontMatterMatch;

    // Parse frontmatter as YAML
    const data = parseYaml(frontMatterContent) as Record<string, unknown>;
    return { data, content: bodyContent };
  } catch (error) {
    logger.warn("Failed to parse frontmatter, ignoring:", error);
    return { data: {}, content };
  }
}

// Content Item type definitions
export type BfContentItemProps = BfNodeBaseProps & {
  title: string;
  content: string;
  slug: string;
  filePath: string;
  fileType: string;
  metadata: Record<string, JSONValue>;
};

// Content Collection type definitions
export type BfContentCollectionProps = BfNodeBaseProps & {
  name: string;
  slug: string;
  description: string;
  path: string;
};

// Edge role constants
const EDGE_ROLES = {
  COLLECTION_CONTAINS_COLLECTION: "collection_contains_collection",
  COLLECTION_CONTAINS_ITEM: "collection_contains_item",
};

/**
 * BfContentCollection: A collection of content items from the filesystem
 */
export class BfContentCollection extends BfNodeBase<BfContentCollectionProps> {
  private static _collectionsCache: Map<BfGid, BfContentCollection>;
  private static _itemsCache: Map<BfGid, BfContentItem>;
  private static _edgesCache: Map<string, BfEdgeBase>;
  private static _initialized = false;

  /**
   * Initialize content collections from the filesystem
   */
  static async initFromFilesystem(cv: BfCurrentViewer): Promise<void> {
    if (this._initialized) {
      return;
    }

    // Initialize caches
    this._collectionsCache = new Map();
    this._itemsCache = new Map();
    this._edgesCache = new Map();
    
    // Share the items cache with BfContentItem
    const { BfContentItem } = await import("./BfContentItem.ts");
    BfContentItem.setItemsCache(this._itemsCache);

    const contentRootPath = path.resolve(Deno.cwd(), "content");
    logger.info(`Initializing content collections from: ${contentRootPath}`);

    // Create root collection
    const rootCollection = await this.__DANGEROUS__createUnattached(
      cv,
      {
        name: "Content",
        slug: "content",
        description: "Root content collection",
        path: contentRootPath,
      },
      {
        bfGid: toBfGid(contentRootPath),
      },
    );
    this._collectionsCache.set(rootCollection.metadata.bfGid, rootCollection);

    // Scan the directory and create collections/items
    await this.scanDirectory(cv, contentRootPath, rootCollection);

    this._initialized = true;
    logger.info(
      `Initialized ${this._collectionsCache.size} collections and ${this._itemsCache.size} items`,
    );
  }

  /**
   * Recursively scan a directory to build collections and items
   */
  private static async scanDirectory(
    cv: BfCurrentViewer,
    dirPath: string,
    parentCollection: BfContentCollection,
  ): Promise<void> {
    for await (
      const entry of walk(dirPath, {
        maxDepth: 1,
        includeFiles: true,
        includeDirs: true,
      })
    ) {
      // Skip the parent directory itself
      if (entry.path === dirPath) {
        continue;
      }

      const relativePath = path.relative(Deno.cwd(), entry.path);
      const name = path.basename(entry.path);
      const slug = path.basename(entry.path, path.extname(entry.path))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      if (entry.isDirectory) {
        // Create a subcollection for the directory
        const collection = await this.__DANGEROUS__createUnattached(
          cv,
          {
            name,
            slug,
            description: `${name} content collection`,
            path: entry.path,
          },
          {
            bfGid: toBfGid(entry.path),
          },
        );
        this._collectionsCache.set(collection.metadata.bfGid, collection);

        // Create an edge "manually" to avoid the type issues with BfEdgeBase.createBetweenNodes
        const edge = new BfEdgeBase(
          cv,
          { role: EDGE_ROLES.COLLECTION_CONTAINS_COLLECTION },
          {
            bfSid: parentCollection.metadata.bfGid,
            bfSClassName: parentCollection.metadata.className,
            bfTid: collection.metadata.bfGid,
            bfTClassName: collection.metadata.className,
          },
        );

        this._edgesCache.set(
          `${parentCollection.metadata.bfGid}:${collection.metadata.bfGid}`,
          edge,
        );

        // Recursively scan the subdirectory
        await this.scanDirectory(cv, entry.path, collection);
      } else if (entry.isFile) {
        // Check if it's a content file we can process
        const ext = path.extname(entry.path).toLowerCase();
        if ([".md", ".mdx", ".ipynb", ".tsx", ".ts"].includes(ext)) {
          try {
            // Parse the file content
            const fileContent = await Deno.readTextFile(entry.path);
            const result = parseFrontmatter(fileContent);

            // Dynamically import BfContentItem to avoid circular dependencies
            const { BfContentItem } = await import("./BfContentItem.ts");
            
            // Create content item
            const item = new BfContentItem(
              cv,
              {
                title: (result.data.title as string) || name,
                content: result.content,
                slug,
                filePath: relativePath,
                fileType: ext.substring(1), // Remove the leading dot
                metadata: result.data as Record<string, JSONValue>,
              },
              {
                bfGid: toBfGid(entry.path),
              },
            );

            await item.save();
            this._itemsCache.set(item.metadata.bfGid, item);

            // Create an edge "manually" to avoid the type issues with BfEdgeBase.createBetweenNodes
            const edge = new BfEdgeBase(
              cv,
              { role: EDGE_ROLES.COLLECTION_CONTAINS_ITEM },
              {
                bfSid: parentCollection.metadata.bfGid,
                bfSClassName: parentCollection.metadata.className,
                bfTid: item.metadata.bfGid,
                bfTClassName: item.metadata.className,
              },
            );

            this._edgesCache.set(
              `${parentCollection.metadata.bfGid}:${item.metadata.bfGid}`,
              edge,
            );
          } catch (error: unknown) {
            const errorMessage = error instanceof Error
              ? error.message
              : String(error);
            logger.warn(
              `Error processing file ${entry.path}: ${errorMessage}`,
            );
          }
        }
      }
    }
  }

  /**
   * Get or initialize the collections cache
   */
  static async getCollectionsCache(
    cv: BfCurrentViewer,
  ): Promise<Map<BfGid, BfContentCollection>> {
    await this.initFromFilesystem(cv);
    return this._collectionsCache;
  }

  /**
   * Find a content collection by ID
   */
  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    const collectionsCache = await this.getCollectionsCache(cv);
    const collection = collectionsCache.get(id);

    if (collection) {
      return collection as unknown as T;
    }

    logger.info(`Collection not found: ${id}`);
    throw new BfErrorNodeNotFound();
  }

  /**
   * Query all content collections
   */
  static override async query<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(cv: BfCurrentViewer): Promise<Array<T>> {
    const collectionsCache = await this.getCollectionsCache(cv);
    return Array.from(collectionsCache.values()) as unknown as Array<T>;
  }

  /**
   * Get subcollections for this collection
   */
  async getSubcollections(): Promise<BfContentCollection[]> {
    if (!BfContentCollection._edgesCache) {
      await BfContentCollection.initFromFilesystem(this.cv);
    }

    const subcollections: BfContentCollection[] = [];

    // Find edges where this collection is the source and role is COLLECTION_CONTAINS_COLLECTION
    for (const edge of BfContentCollection._edgesCache.values()) {
      if (
        edge.sourceId === this.metadata.bfGid &&
        edge.role === EDGE_ROLES.COLLECTION_CONTAINS_COLLECTION
      ) {
        const subcollection = BfContentCollection._collectionsCache.get(
          edge.targetId,
        );
        if (subcollection) {
          subcollections.push(subcollection);
        }
      }
    }

    return subcollections;
  }

  /**
   * Get content items for this collection
   */
  async getContentItems(): Promise<BfContentItem[]> {
    if (!BfContentCollection._edgesCache) {
      await BfContentCollection.initFromFilesystem(this.cv);
    }

    const items: BfContentItem[] = [];

    // Find edges where this collection is the source and role is COLLECTION_CONTAINS_ITEM
    for (const edge of BfContentCollection._edgesCache.values()) {
      if (
        edge.sourceId === this.metadata.bfGid &&
        edge.role === EDGE_ROLES.COLLECTION_CONTAINS_ITEM
      ) {
        const item = BfContentCollection._itemsCache.get(edge.targetId);
        if (item) {
          items.push(item);
        }
      }
    }

    return items;
  }

  /**
   * Get the filesystem path for this collection
   */
  get path(): string {
    return this.props.path;
  }

  /**
   * Get the URL path for this collection
   */
  get href(): string {
    return `/collection/${this.props.slug}`;
  }

  override save() {
    return Promise.resolve(this);
  }
  override delete() {
    return Promise.resolve(false);
  }
  override load() {
    return Promise.resolve(this);
  }
}
