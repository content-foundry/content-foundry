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

const logger = getLogger(import.meta);

/**
 * BfContentItem: A single content item in a content collection
 */
export class BfContentItem extends BfNodeBase<BfContentItemProps> {
  private static _itemsCache: Map<BfGid, BfContentItem>;

  /**
   * Get or initialize the items cache
   */
  static  getItemsCache(): Promise<Map<BfGid, BfContentItem>> {
    if (this._itemsCache) {
      return Promise.resolve(this._itemsCache);
    }

    // Initialize the cache - this would typically be populated from a database
    this._itemsCache = new Map();
    // Items are typically created via collections, not directly
    return Promise.resolve(this._itemsCache);
  }

  /**
   * Find a content item by ID
   */
  static override async findX<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<T> {
    const itemsCache = await this.getItemsCache();
    const item = itemsCache.get(id);

    if (item) {
      return item as unknown as T;
    }

    logger.info(`Content item not found: ${id}`);
    throw new BfErrorNodeNotFound();
  }

  /**
   * Get the URL path for this content item
   */
  get href(): string {
    return `/content/${this.props.slug || this.metadata.bfGid}`;
  }

}
