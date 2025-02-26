import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Content Item type definitions
export type BfContentItemProps = {
  title: string;
  body: string;
  slug: string;
  // Add more properties as needed
};

// Content Collection type definitions
export type BfContentCollectionProps = {
  name: string;
  slug: string;
  description: string;
  items?: BfContentItemProps[];
};

/**
 * BfContentCollection: A collection of content items
 */
export class BfContentCollection extends BfNodeBase<BfContentCollectionProps> {
  private static _collectionsCache: Map<BfGid, BfContentCollection>;

  // Mock data for content collections
  private static readonly MOCK_COLLECTIONS: Record<
    string,
    BfContentCollectionProps
  > = {
    "collection-home": {
      name: "Home Collection",
      slug: "home",
      description: "Content displayed on the home page",
      items: [
        {
          title: "Welcome to Content Foundry",
          body:
            "Content Foundry is a platform for creating and managing digital content. This is an example content item for demonstration purposes.",
          slug: "welcome",
        },
        {
          title: "Getting Started Guide",
          body:
            "Learn how to create and manage content collections and items in Content Foundry with this comprehensive guide.",
          slug: "getting-started",
        },
        {
          title: "Content Management Best Practices",
          body:
            "Discover the best practices for organizing and structuring your content in Content Foundry.",
          slug: "best-practices",
        },
      ],
    },
    "collection-blog": {
      name: "Blog Collection",
      slug: "blog",
      description: "Blog posts and articles",
      items: [
        {
          title: "Introduction to Content Management",
          body:
            "An introduction to content management systems and how they can help your organization.",
          slug: "intro-to-cms",
        },
        {
          title: "Content Strategy 101",
          body:
            "Learn the basics of developing an effective content strategy for your digital presence.",
          slug: "content-strategy-101",
        },
      ],
    },
    "collection-default": {
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
  };

  /**
   * Get or initialize the collections cache
   */
  static async getCollectionsCache(): Promise<Map<BfGid, BfContentCollection>> {
    if (this._collectionsCache) {
      return this._collectionsCache;
    }

    // Initialize the cache
    this._collectionsCache = new Map();
    const loggedOutCV = BfCurrentViewer.createLoggedOut(import.meta);

    // Populate with mock data
    for (const [id, collectionData] of Object.entries(this.MOCK_COLLECTIONS)) {
      const bfGid = toBfGid(id);
      logger.debug(`Creating content collection with id: ${id}`);

      const collection = await this.__DANGEROUS__createUnattached(
        loggedOutCV,
        collectionData,
        { bfGid },
      );

      this._collectionsCache.set(bfGid, collection);
      logger.debug(`Added collection to cache with ID: ${id}`);
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
    const collectionsCache = await this.getCollectionsCache();
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
  >(): Promise<Array<T>> {
    const collectionsCache = await this.getCollectionsCache();
    return Array.from(collectionsCache.values()) as unknown as Array<T>;
  }

  /**
   * Get content items for this collection
   */
  getContentItems(): BfContentItemProps[] {
    return this.props.items || [];
  }

}
