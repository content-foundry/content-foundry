import {
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { getLogger } from "packages/logger.ts";
import type { BfContentItemProps } from "./BfContentCollection.ts";
import * as path from "@std/path";
import type { JSONValue } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

/**
 * BfContentItem: A single content item in a content collection
 */
export class BfContentItem extends BfNodeBase<BfContentItemProps> {
  private static _itemsCache: Map<BfGid, BfContentItem>;

  /**
   * Get or initialize the items cache (typically handled by BfContentCollection)
   */
  static getItemsCache(_cv: BfCurrentViewer): Promise<Map<BfGid, BfContentItem>> {
    // This would usually be populated by BfContentCollection.initFromFilesystem
    if (!this._itemsCache) {
      this._itemsCache = new Map();
      logger.debug("Initialized empty items cache");
    }
    return Promise.resolve(this._itemsCache);
  }
  
  /**
   * Set the items cache (used by BfContentCollection for initialization)
   */
  static setItemsCache(cache: Map<BfGid, BfContentItem>): void {
    this._itemsCache = cache;
  }

  /**
   * Find a content item by ID
   */
  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    const itemsCache = await this.getItemsCache(cv);
    const item = itemsCache.get(id);

    if (item) {
      return item as unknown as T;
    }

    logger.info(`Content item not found: ${id}`);
    throw new BfErrorNodeNotFound();
  }

  /**
   * Query all content items
   */
  static override async query<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(cv: BfCurrentViewer): Promise<Array<T>> {
    const itemsCache = await this.getItemsCache(cv);
    return Array.from(itemsCache.values()) as unknown as Array<T>;
  }

  /**
   * Get the file path on disk for this content item
   */
  get filePath(): string {
    return this.props.filePath;
  }

  /**
   * Get the file type (extension) for this content item
   */
  get fileType(): string {
    return this.props.fileType;
  }

  /**
   * Get the content of this item
   */
  get content(): string {
    return this.props.content;
  }

  /**
   * Get the title of this item
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Get the filename of this item
   */
  get fileName(): string {
    return path.basename(this.props.filePath);
  }

  /**
   * Get frontmatter metadata for this item
   */
  get frontmatterMetadata(): Record<string, JSONValue> {
    return this.props.metadata;
  }

  /**
   * Get a specific frontmatter property with proper typing
   */
  getFrontmatterProperty<T>(key: string, defaultValue: T): T {
    const value = this.props.metadata[key];
    if (value === undefined) {
      return defaultValue;
    }
    return value as T;
  }

  /**
   * Get the URL path for this content item
   */
  get href(): string {
    // Generate a URL path based on the file path
    const filePathParts = this.props.filePath.split("/");
    
    // Remove 'content' from the beginning if it exists
    if (filePathParts[0] === "content") {
      filePathParts.shift();
    }
    
    // Remove the file extension
    const lastPartIndex = filePathParts.length - 1;
    filePathParts[lastPartIndex] = path.basename(
      filePathParts[lastPartIndex], 
      path.extname(filePathParts[lastPartIndex]),
    );
    
    return `/${filePathParts.join("/")}`;
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