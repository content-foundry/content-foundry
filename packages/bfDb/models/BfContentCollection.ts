import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { walk } from "@std/fs/walk";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { getLogger } from "packages/logger.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { exists } from "@std/fs/exists";
import { extractYaml } from "@std/front-matter";

const logger = getLogger(import.meta);

export type BfContentItemProps = {
  title: string;
  body: string;
  slug: string;
  filePath?: string;
};

export interface BfContentCollectionProps extends BfNodeBaseProps {
  name: string;
  slug: string;
  description: string;
  items: BfContentItemProps[];
}

type ContentItemFrontmatterProps = Partial<{
  title: string;
}>;

class BfContentCollection extends BfNodeBase<BfContentCollectionProps> {
  private static _collectionsCache: Map<BfGid, BfContentCollection>;

  /**
   * Scans the content directory and builds collections based on folder structure
   */
  private static async scanContentDirectory(
    _cv: BfCurrentViewer,
  ): Promise<Map<string, BfContentCollectionProps>> {
    const collections = new Map<string, BfContentCollectionProps>();
    const contentBasePath = "content";

    logger.info(`Scanning content directory: ${contentBasePath}`);

    // Check if content directory exists
    if (!await exists(contentBasePath)) {
      logger.warn("Content directory not found at:", contentBasePath);
      return collections;
    }

    // Create a map of folder paths to collection objects
    try {
      logger.info("Starting first pass: identifying directories");
      // First pass: identify all directories that will become collections
      for await (
        const entry of walk(contentBasePath, {
          includeFiles: false,
          includeDirs: true,
          maxDepth: 2,
        })
      ) {
        logger.info(`Found directory: ${entry.path}`);
        if (entry.isDirectory && entry.path !== contentBasePath) {
          const relativePath = entry.path;
          const slug = relativePath;
          const name = relativePath.split("/").pop() || "Unknown";

          logger.info(
            `Creating collection for directory: ${relativePath} with slug: ${slug}`,
          );
          collections.set(slug, {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            slug,
            description: `Content from ${relativePath}`,
            items: [],
          });
        }
      }

      // Second pass: scan for MDX/MD files to add as items to their respective collections
      logger.info("Starting second pass: scanning for MDX/MD files");
      // Check specifically if marketing directory exists and make sure it creates a collection
      if (await exists("content/marketing")) {
        logger.info(
          "Marketing directory exists. Ensuring marketing collection is created",
        );
        if (!collections.has("content/marketing")) {
          logger.info("Creating marketing collection manually");
          collections.set("content/marketing", {
            name: "Marketing",
            slug: "content/marketing",
            description: "Content from marketing",
            items: [],
          });
        }
      } else {
        logger.warn("Marketing directory does not exist!");
      }

      for await (
        const entry of walk(contentBasePath, {
          includeDirs: false,
          exts: [".mdx", ".md"],
        })
      ) {
        if (entry.isFile) {
          const filePath = entry.path;
          const parts = filePath.split("/");
          parts.pop(); // Remove filename

          const dirPath = parts.join("/");
          logger.info(`Processing file: ${filePath} in directory: ${dirPath}`);
          const fileContent = await Deno.readTextFile(filePath);

          let title = entry.name.replace(/\.(mdx|md)$/, "");
          let frontMatter = {} as ContentItemFrontmatterProps;

          try {
            // Check if the content has frontmatter (starts with ---)
            let body = fileContent;
            let attrs = {};

            if (fileContent.trim().startsWith("---")) {
              try {
                const extracted = extractYaml(fileContent);
                attrs = extracted.attrs || {};
                body = extracted.body || fileContent;
              } catch (frontmatterErr) {
                logger.warn(
                  `Malformed front matter in ${filePath}, using fallback`,
                  frontmatterErr,
                );
                // Continue with empty attrs and original content as body
              }
            } else {
              logger.info(
                `No front matter found in ${filePath}, using fallback metadata`,
              );
              // No frontmatter - continue with empty attrs and original content as body
            }

            frontMatter = attrs as ContentItemFrontmatterProps;
            title = frontMatter.title || title;

            // Add this file as an item to its collection
            if (collections.has(dirPath)) {
              const collection = collections.get(dirPath)!;
              logger.info(
                `Found collection for ${dirPath}, adding item: ${entry.name}`,
              );

              // Special case for content/marketing - only include home.mdx
              if (
                dirPath === "content/marketing" && entry.name !== "home.mdx"
              ) {
                logger.info(
                  `Skipping non-home.mdx file in marketing directory: ${entry.name}`,
                );
                continue;
              }

              collection.items.push({
                title,
                body: body.slice(0, 300) + (body.length > 300 ? "..." : ""),
                slug: entry.name.replace(/\.(mdx|md)$/, ""),
                filePath: entry.path,
              });
            }
          } catch (err) {
            logger.warn(`Failed to process content file ${filePath}:`, err);

            // Still add the file to the collection with default values
            if (collections.has(dirPath)) {
              const collection = collections.get(dirPath)!;

              // Special case for content/marketing - only include home.mdx
              if (
                dirPath === "content/marketing" && entry.name !== "home.mdx"
              ) {
                continue;
              }

              collection.items.push({
                title: entry.name.replace(/\.(mdx|md)$/, ""),
                body:
                  "Content could not be processed. This may be due to malformed content.",
                slug: entry.name.replace(/\.(mdx|md)$/, ""),
                filePath: entry.path,
              });

              logger.info(`Added ${filePath} with fallback content`);
            }
          }
        }
      }
    } catch (err) {
      logger.error("Error scanning content directory:", err);
    }

    return collections;
  }

  /**
   * Get or initialize the collections cache
   */
  static async getCollectionsCache(
    cv: BfCurrentViewer,
  ): Promise<Map<BfGid, BfContentCollection>> {
    if (this._collectionsCache) {
      logger.info("Using existing collections cache");
      // Output all cached collections for debugging
      for (const [id, collection] of this._collectionsCache.entries()) {
        logger.info(`Cached collection: ${id}, slug: ${collection.props.slug}`);
      }
      return this._collectionsCache;
    }

    logger.info("Initializing collections cache");
    // Initialize the cache
    this._collectionsCache = new Map();

    // Scan content directory to build collections
    const collectionData = await this.scanContentDirectory(cv);

    logger.info(`Found ${collectionData.size} collections from directory scan`);
    // Log all found collections
    for (const [slug, data] of collectionData.entries()) {
      logger.info(`Found collection: ${slug} with ${data.items.length} items`);
    }

    // Create collection objects and add to cache
    for (const [slug, data] of collectionData.entries()) {
      const collectionId = toBfGid(`collection-${slug.replace(/\//g, "-")}`);
      logger.info(
        `Creating content collection with id: ${collectionId}, slug: ${slug}`,
      );

      const collection = await this.__DANGEROUS__createUnattached(
        cv,
        data,
        { bfGid: collectionId },
      );

      this._collectionsCache.set(collectionId, collection);
    }

    // If no collections were found, add a default one
    if (this._collectionsCache.size === 0) {
      logger.info("No collections found, creating default collection");
      const defaultId = toBfGid("collection-default");
      const defaultCollection = await this.__DANGEROUS__createUnattached(
        cv,
        {
          name: "Default Collection",
          slug: "default",
          description: "Default content collection",
          items: [
            {
              title: "Default Content Item",
              body:
                "This is a default content item that appears when no specific collection is requested.",
              slug: "default-item",
            },
          ],
        },
        { bfGid: defaultId },
      );

      this._collectionsCache.set(defaultId, defaultCollection);
    }

    // Log all cached collections after initialization
    logger.info(
      `Cache initialized with ${this._collectionsCache.size} collections:`,
    );
    for (const [id, collection] of this._collectionsCache.entries()) {
      logger.info(`Cached collection: ${id}, slug: ${collection.props.slug}`);
    }

    return this._collectionsCache;
  }

  /**
   * Find a content collection by ID
   */
  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    const collectionsCache = await this.getCollectionsCache(_cv);

    // Try direct lookup first
    const collection = collectionsCache.get(id);
    if (collection) {
      return collection as unknown as T;
    }

    // Handle short names: if "collection-marketing", try "collection-content-marketing"
    const idStr = id.toString();
    if (idStr.startsWith("collection-") && !idStr.startsWith("collection-content-")) {
      // Extract the part after "collection-"
      const shortName = idStr.substring("collection-".length);
      const alternativeId = toBfGid(`collection-content-${shortName}`);
      logger.info(
        `Attempting to find ${idStr} as ${alternativeId}`,
      );
      
      const alternativeCollection = collectionsCache.get(alternativeId);
      if (alternativeCollection) {
        logger.info(`Found collection using alternative ID: ${alternativeId}`);
        return alternativeCollection as unknown as T;
      }
    }

    // Debug: Log all available collections
    logger.info(`Collection not found: ${id}. Available collections:`);
    for (const [cachedId, cachedCollection] of collectionsCache.entries()) {
      logger.info(
        `Available collection: ${cachedId}, slug: ${cachedCollection.props.slug}`,
      );
    }

    throw new BfErrorNodeNotFound();
  }

  /**
   * Find a content collection by slug
   */
  static async findBySlug(
    cv: BfCurrentViewer,
    slug: string,
  ): Promise<BfContentCollection | null> {
    logger.info(`Looking for collection with slug: ${slug}`);
    const collectionsCache = await this.getCollectionsCache(cv);

    for (const collection of collectionsCache.values()) {
      logger.info(`Checking collection slug: ${collection.props.slug}`);
      if (collection.props.slug === slug) {
        logger.info(`Found collection with slug: ${slug}`);
        return collection;
      }
    }

    logger.info(`No collection found with slug: ${slug}`);
    return null;
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
   * Get content items for this collection
   */
  getContentItems(): BfContentItemProps[] {
    return this.props.items || [];
  }

  /**
   * Get a specific content item by slug
   */
  getContentItem(slug: string): BfContentItemProps | null {
    const items = this.getContentItems();
    return items.find((item) => item.slug === slug) || null;
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

export { BfContentCollection };
