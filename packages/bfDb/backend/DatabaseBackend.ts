
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { JSONValue } from "packages/bfDb/bfDb.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";

type Props = Record<string, JSONValue>;
type DbItem<T extends Props> = {
  props: T;
  metadata: BfDbMetadata;
};

 export type BfDbMetadata = BfMetadataNode | (BfMetadataNode & BfMetadataEdge);
/**
 * Interface for database backend implementations.
 * This allows for swapping between PostgreSQL and SQLite backends.
 */
export interface DatabaseBackend {
  /**
   * Get an item from the database by ID
   */
  getItem<TProps extends Props = Props>(
    bfOid: BfGid,
    bfGid: BfGid
  ): Promise<DbItem<TProps> | null>;

  /**
   * Get an item by its BfGid
   */
  getItemByBfGid<TProps extends Props = Props>(
    bfGid: string,
    className?: string
  ): Promise<DbItem<TProps> | null>;

  /**
   * Get multiple items by their BfGids
   */
  getItemsByBfGid<TProps extends Props = Props>(
    bfGids: Array<string>,
    className?: string
  ): Promise<Array<DbItem<TProps>>>;

  /**
   * Put an item into the database
   */
  putItem<TProps extends Props = Props>(
    itemProps: TProps,
    itemMetadata: BfMetadataNode | BfMetadataEdge,
    sortValue?: number
  ): Promise<void>;

  /**
   * Query items from the database
   */
  queryItems<TProps extends Props = Props>(
    metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
    propsToQuery?: Partial<TProps>,
    bfGids?: Array<string>,
    orderDirection?: "ASC" | "DESC",
    orderBy?: string
  ): Promise<Array<DbItem<TProps>>>;

  /**
   * Query items with size limit
   */
  queryItemsWithSizeLimit<TProps extends Props = Props>(
    metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
    propsToQuery?: Partial<TProps>,
    bfGids?: Array<string>,
    orderDirection?: "ASC" | "DESC",
    orderBy?: string,
    cursorValue?: number | string,
    maxSizeBytes?: number,
    batchSize?: number
  ): Promise<Array<DbItem<TProps>>>;

  /**
   * Query ancestors by class name
   */
  queryAncestorsByClassName<TProps extends Props = Props>(
    bfOid: string,
    targetBfGid: string,
    sourceBfClassName: string,
    depth?: number
  ): Promise<Array<DbItem<TProps>>>;

  /**
   * Query descendants by class name
   */
  queryDescendantsByClassName<TProps extends Props = Props>(
    bfOid: string,
    sourceBfGid: string,
    targetBfClassName: string,
    depth?: number
  ): Promise<Array<DbItem<TProps>>>;

  /**
   * Delete an item from the database by ID
   */
  deleteItem(bfOid: BfGid, bfGid: BfGid): Promise<void>;

  /**
   * Initialize the database
   */
  initialize(): Promise<void>;
}
