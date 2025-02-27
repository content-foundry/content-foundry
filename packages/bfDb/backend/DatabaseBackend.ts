import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";



/**
 * Interface for database backend implementations.
 * This allows for swapping between PostgreSQL and SQLite backends.
 */
export interface DatabaseBackend {
  /**
   * Put an item into the database
   */
  putItem(
    className: string,
    id: BfGid,
    props: Record<string, unknown>,
    sortValue: number,
    s_className?: string,
    sid?: BfGid,
    t_className?: string,
    tid?: BfGid,
  ): Promise<void>;

  /**
   * Query items from the database
   */
  queryItems(
    className: string,
    query: Record<string, unknown>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDescending?: boolean;
    }
  ): Promise<Array<{
    id: BfGid;
    props: Record<string, unknown>;
    sortValue: number;
    s_className?: string;
    sid?: BfGid;
    t_className?: string;
    tid?: BfGid;
  }>>;

  /**
   * Get an item from the database by ID
   */
  getItem(
    className: string,
    id: BfGid
  ): Promise<{
    id: BfGid;
    props: Record<string, unknown>;
    sortValue: number;
    s_className?: string;
    sid?: BfGid;
    t_className?: string;
    tid?: BfGid;
  } | null>;

  /**
   * Delete an item from the database by ID
   */
  deleteItem(className: string, id: BfGid): Promise<void>;

  /**
   * Initialize the database
   */
  initialize(): Promise<void>;
}
