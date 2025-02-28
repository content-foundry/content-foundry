import { DatabaseSync, type StatementSync } from "sqlite";
import { getLogger } from "packages/logger.ts";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import type { DbItem, Props } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

// Export the SQLite changeset constants
export const SQLITE_CONSTANTS = {
  // Conflict resolution constants
  SQLITE_CHANGESET_DATA: 1,
  SQLITE_CHANGESET_NOTFOUND: 2,
  SQLITE_CHANGESET_CONFLICT: 3,
  SQLITE_CHANGESET_CONSTRAINT: 4,
  SQLITE_CHANGESET_FOREIGN_KEY: 5,

  // Constants returned from conflict handler
  SQLITE_CHANGESET_OMIT: 0,
  SQLITE_CHANGESET_REPLACE: 1,
  SQLITE_CHANGESET_ABORT: 2,
};

type BfDbMetadata = BfMetadataNode & Partial<BfMetadataEdge>;

type Row<
  TProps extends Props = Props,
> = {
  props: string; // SQLite returns JSON as string
  bf_gid: BfGid;
  bf_sid: BfGid;
  bf_oid: BfGid;
  bf_tid: BfGid;
  bf_cid: BfGid;
  bf_t_class_name: string;
  bf_s_class_name: string;
  class_name: string;
  created_at: string;
  last_updated: string;
  sort_value: number;
};

export class DatabaseBackendSqlite implements DatabaseBackend {
  private _db: DatabaseSync | null = null;
  private _statements: Map<string, StatementSync> = new Map();

  private getDb(): DatabaseSync {
    if (this._db === null) {
      // Get custom path or use default in tmp directory
      const customDbPath = getConfigurationVariable("SQLITE_DB_PATH");
      const dbPath = customDbPath || "tmp/bfdb.sqlite";
      
      // Ensure tmp directory exists
      try {
        Deno.mkdirSync("tmp", { recursive: true });
      } catch (e) {
        if (!(e instanceof Deno.errors.AlreadyExists)) {
          throw e;
        }
      }
      
      logger.info(`Opening SQLite database at ${dbPath}`);

      // Create the database with appropriate options
      this._db = new DatabaseSync(dbPath, {
        enableForeignKeyConstraints: true,
        enableDoubleQuotedStringLiterals: false,
        readOnly: false,
      });

      // Enable WAL mode for better concurrency
      this._db.exec("PRAGMA journal_mode=WAL;");

      // Set a longer default timeout for busy situations
      this._db.exec("PRAGMA busy_timeout=5000;");

      // More aggressive synchronization
      this._db.exec("PRAGMA synchronous=NORMAL;");
    }
    return this._db;
  }

  private rowToMetadata(row: Row): BfDbMetadata {
    return {
      bfGid: toBfGid(row.bf_gid),
      bfOid: toBfGid(row.bf_oid),
      bfCid: toBfGid(row.bf_cid),
      bfSid: toBfGid(row.bf_sid || ""),
      bfTid: toBfGid(row.bf_tid || ""),
      bfTClassName: row.bf_t_class_name || "",
      bfSClassName: row.bf_s_class_name || "",
      className: row.class_name,
      createdAt: new Date(row.created_at),
      lastUpdated: new Date(row.last_updated),
      sortValue: row.sort_value,
    };
  }

  getItem<TProps extends Props = Props>(
    bfOid: BfGid,
    bfGid: BfGid,
  ): Promise<DbItem<TProps> | null> {
    try {
      logger.trace("getItem", bfOid, bfGid);
      const db = this.getDb();

      let stmt = this._statements.get("getItem");
      if (!stmt) {
        stmt = db.prepare("SELECT * FROM bfdb WHERE bf_oid = ? AND bf_gid = ?");
        stmt.setReadBigInts(true);
        this._statements.set("getItem", stmt);
      }

      const row = stmt.get(bfOid, bfGid);

      if (!row) {
        return Promise.resolve(null);
      }

      const props = JSON.parse(row.props) as TProps;
      const metadata = this.rowToMetadata(row);

      return Promise.resolve({ props, metadata });
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  getItemByBfGid<TProps extends Props = Props>(
    bfGid: string,
    className?: string,
  ): Promise<DbItem<TProps> | null> {
    try {
      logger.trace("getItemByBfGid", { bfGid, className });
      const db = this.getDb();

      let stmt: StatementSync;
      const key = className ? `getItemByBfGid_${className}` : "getItemByBfGid";

      stmt = this._statements.get(key) as StatementSync;
      if (!stmt) {
        if (className) {
          stmt = db.prepare(
            "SELECT * FROM bfdb WHERE bf_gid = ? AND class_name = ?",
          );
        } else {
          stmt = db.prepare("SELECT * FROM bfdb WHERE bf_gid = ?");
        }
        stmt.setReadBigInts(true);
        this._statements.set(key, stmt);
      }

      const row = className ? stmt.get(bfGid, className) : stmt.get(bfGid);

      if (!row) {
        return Promise.resolve(null);
      }

      const props = JSON.parse(row.props) as TProps;
      const metadata = this.rowToMetadata(row);

      return Promise.resolve({ props, metadata });
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  getItemsByBfGid<TProps extends Props = Props>(
    bfGids: Array<string>,
    className?: string,
  ): Promise<Array<DbItem<TProps>>> {
    try {
      logger.trace("getItemsByBfGid", { bfGids, className });
      const db = this.getDb();

      // SQLite doesn't support array parameters, so we need to build a query with placeholders
      const placeholders = bfGids.map(() => "?").join(",");

      let query: string;
      let params: unknown[];

      if (className) {
        query =
          `SELECT * FROM bfdb WHERE bf_gid IN (${placeholders}) AND class_name = ?`;
        params = [...bfGids, className];
      } else {
        query = `SELECT * FROM bfdb WHERE bf_gid IN (${placeholders})`;
        params = [...bfGids];
      }

      const stmt = db.prepare(query);
      stmt.setReadBigInts(true);

      const rows = stmt.all(...params);

      return Promise.resolve(rows.map((row: Row<TProps>) => {
        const props = JSON.parse(row.props) as TProps;
        const metadata = this.rowToMetadata(row);
        return { props, metadata };
      }));
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async putItem<TProps extends Props = Props>(
    itemProps: TProps,
    itemMetadata: BfMetadataNode | BfMetadataEdge,
    sortValue = Date.now(),
  ): Promise<void> {
    logger.trace({ itemProps, itemMetadata });

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const db = this.getDb();

        let createdAtTimestamp, lastUpdatedTimestamp;
        if (itemMetadata.createdAt instanceof Date) {
          createdAtTimestamp = itemMetadata.createdAt.toISOString();
        } else if (typeof itemMetadata.createdAt === "number") {
          createdAtTimestamp = new Date(itemMetadata.createdAt).toISOString();
        }
        if (itemMetadata.lastUpdated instanceof Date) {
          lastUpdatedTimestamp = itemMetadata.lastUpdated.toISOString();
        } else if (typeof itemMetadata.lastUpdated === "number") {
          lastUpdatedTimestamp = new Date(itemMetadata.lastUpdated)
            .toISOString();
        }

        let bfSid: BfGid | null = null;
        let bfTid: BfGid | null = null;
        let bfSClassName: string | null = null;
        let bfTClassName: string | null = null;

        if ("bfTid" in itemMetadata) {
          bfSid = itemMetadata.bfSid;
          bfTid = itemMetadata.bfTid;
          bfSClassName = itemMetadata.bfSClassName;
          bfTClassName = itemMetadata.bfTClassName;
        }

        // Check if item exists and get its sort_value if it does
        const existItemStmt = db.prepare(
          "SELECT sort_value FROM bfdb WHERE bf_gid = ?",
        );
        const existingItem = existItemStmt.get(itemMetadata.bfGid);

        // Determine what sort_value to use
        const finalSortValue = existingItem
          ? existingItem.sort_value
          : sortValue;

        if (existingItem) {
          // Update existing item
          const updateStmt = db.prepare(`
            UPDATE bfdb SET
              bf_oid = ?,
              bf_cid = ?,
              bf_sid = ?,
              bf_tid = ?,
              class_name = ?,
              created_at = ?,
              last_updated = ?,
              props = ?,
              sort_value = ?,
              bf_t_class_name = ?,
              bf_s_class_name = ?
            WHERE bf_gid = ?
          `);

          updateStmt.run(
            itemMetadata.bfOid,
            itemMetadata.bfCid,
            bfSid,
            bfTid,
            itemMetadata.className,
            createdAtTimestamp,
            new Date().toISOString(), // Always update last_updated to current time
            JSON.stringify(itemProps),
            finalSortValue,
            bfTClassName,
            bfSClassName,
            itemMetadata.bfGid,
          );
        } else {
          // Insert new item
          const insertStmt = db.prepare(`
            INSERT INTO bfdb(
              bf_gid, bf_oid, bf_cid, bf_sid, bf_tid, class_name, created_at, last_updated, 
              props, sort_value, bf_t_class_name, bf_s_class_name
            )
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insertStmt.run(
            itemMetadata.bfGid,
            itemMetadata.bfOid,
            itemMetadata.bfCid,
            bfSid,
            bfTid,
            itemMetadata.className,
            createdAtTimestamp,
            lastUpdatedTimestamp,
            JSON.stringify(
              itemProps,
              (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
            ),
            finalSortValue,
            bfTClassName,
            bfSClassName,
          );
        }

        logger.trace(
          `putItem: Successfully inserted or updated item with ${
            JSON.stringify(itemProps, (key, value) =>
              typeof value === "bigint" ? value.toString() : value)
          }`,
        );

        // Operation successful, exit the retry loop
        return;
      } catch (e) {
        // Check if error is database locked error
        if (
          e instanceof Error &&
          e.message &&
          e.message.includes("database is locked") &&
          attempt < maxRetries - 1
        ) {
          attempt++;
          // Calculate backoff time with exponential backoff
          const backoffTime = 100 * Math.pow(2, attempt);
          logger.warn(
            `Database locked, retrying in ${backoffTime}ms (attempt ${attempt}/${maxRetries})`,
          );

          // Wait for the backoff period before retrying
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          // This is either not a database locked error or we've reached max retries
          logger.error("Error in putItem:", e);
          logger.trace(e);
          throw e;
        }
      }
    }

    // If we've exhausted all retries and still failed
    throw new BfErrorDb(`Failed to put item after ${maxRetries} attempts`);
  }

  private static readonly VALID_METADATA_COLUMN_NAMES = [
    "bf_gid",
    "bf_oid",
    "bf_cid",
    "bf_sid",
    "bf_tid",
    "bf_t_class_name",
    "bf_s_class_name",
    "class_name",
    "sort_value",
  ];

  private static readonly defaultClause = "1=1";

  queryItems<TProps extends Props = Props>(
    metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
    propsToQuery: Partial<TProps> = {},
    bfGids?: Array<string>,
    orderDirection: "ASC" | "DESC" = "ASC",
    orderBy: string = "sort_value",
  ): Promise<Array<DbItem<TProps>>> {
    return this.queryItemsUnified(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      {
        useSizeLimit: false,
      },
    );
  }

  queryItemsWithSizeLimit<TProps extends Props = Props>(
    metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
    propsToQuery: Partial<TProps> = {},
    bfGids?: Array<string>,
    orderDirection: "ASC" | "DESC" = "ASC",
    orderBy: string = "sort_value",
    cursorValue?: number | string,
    maxSizeBytes: number = 10 * 1024 * 1024, // 10MB in bytes
    batchSize: number = 4,
  ): Promise<Array<DbItem<TProps>>> {
    return this.queryItemsUnified(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      {
        useSizeLimit: true,
        cursorValue,
        maxSizeBytes,
        batchSize,
      },
    );
  }

  private normalizeValueForSqlite(value: unknown): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? 1 : 0; // SQLite stores booleans as 0/1
    }

    // Convert to string for comparison
    return String(value);
  }

  private queryItemsUnified<
    TProps extends Props = Props,
  >(
    metadataToQuery: Partial<BfDbMetadata>,
    propsToQuery: Partial<TProps> = {},
    bfGids?: Array<string>,
    orderDirection: "ASC" | "DESC" = "ASC",
    orderBy: string = "sort_value",
    options: {
      useSizeLimit?: boolean;
      cursorValue?: number | string;
      maxSizeBytes?: number;
      batchSize?: number;
      totalLimit?: number;
      countOnly?: boolean;
    } = {},
  ): Promise<Array<DbItem<TProps>>> {
    const {
      useSizeLimit = false,
      cursorValue,
      maxSizeBytes = 10 * 1024 * 1024, // 10MB in bytes
      batchSize = 4,
      totalLimit,
      countOnly = false,
    } = options;

    logger.debug({
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      useSizeLimit,
      cursorValue,
      maxSizeBytes,
      batchSize,
    });

    const metadataConditions: string[] = [];
    const propsConditions: string[] = [];
    const specificIdConditions: string[] = [];
    const variables: unknown[] = [];

    // Process metadata conditions
    for (const [originalKey, value] of Object.entries(metadataToQuery)) {
      // Convert camelCase to snake_case for column names - but first check
      // if key is already a valid column name to prevent double conversion
      const key = DatabaseBackendSqlite.VALID_METADATA_COLUMN_NAMES.includes(
          originalKey.toLowerCase(),
        )
        ? originalKey.toLowerCase()
        : originalKey.replace(/([a-z])([A-Z])/g, "$1_$2").replace(
          /([A-Z])(?=[A-Z])/g,
          "$1_",
        ).toLowerCase();

      if (DatabaseBackendSqlite.VALID_METADATA_COLUMN_NAMES.includes(key)) {
        // For null values, use IS NULL instead of = ?
        if (value === null || value === undefined) {
          metadataConditions.push(`${key} IS NULL`);
        } else {
          variables.push(value);
          metadataConditions.push(`${key} = ?`);
        }
      } else {
        logger.warn(`Invalid metadata column name`, originalKey, key);
      }
    }

    // Process props conditions - SQLite doesn't have native JSON operators
    for (const [key, value] of Object.entries(propsToQuery)) {
      if (value === null || value === undefined) {
        propsConditions.push(`json_extract(props, '$.${key}') IS NULL`);
      } else {
        const normalizedValue = this.normalizeValueForSqlite(value);
        variables.push(normalizedValue);

        // Use JSON type function to ensure proper comparison
        if (typeof value === "string") {
          propsConditions.push(`json_extract(props, '$.${key}') = ?`);
        } else if (typeof value === "number") {
          propsConditions.push(
            `CAST(json_extract(props, '$.${key}') AS NUMERIC) = ?`,
          );
        } else if (typeof value === "boolean") {
          propsConditions.push(
            `CAST(json_extract(props, '$.${key}') AS INTEGER) = ?`,
          );
        } else {
          propsConditions.push(`json_extract(props, '$.${key}') = json(?)`);
        }
      }
    }

    // Process bfGids
    if (bfGids && bfGids.length > 0) {
      // Generate placeholders for the IN clause
      const placeholders = bfGids.map(() => "?").join(",");
      specificIdConditions.push(`bf_gid IN (${placeholders})`);
      variables.push(...bfGids);
    }

    if (metadataConditions.length === 0) {
      metadataConditions.push(DatabaseBackendSqlite.defaultClause);
    }
    if (propsConditions.length === 0) {
      propsConditions.push(DatabaseBackendSqlite.defaultClause);
    }
    if (specificIdConditions.length === 0) {
      specificIdConditions.push(DatabaseBackendSqlite.defaultClause);
    }

    const db = this.getDb();

    try {
      if (countOnly) {
        const allConditions = [
          metadataConditions.length > 0
            ? `(${metadataConditions.join(" AND ")})`
            : DatabaseBackendSqlite.defaultClause,
          propsConditions.length > 0
            ? `(${propsConditions.join(" AND ")})`
            : DatabaseBackendSqlite.defaultClause,
          specificIdConditions.length > 0
            ? `(${specificIdConditions.join(" AND ")})`
            : DatabaseBackendSqlite.defaultClause,
        ].join(" AND ");

        const countQuery =
          `SELECT COUNT(*) as count FROM bfdb WHERE ${allConditions}`;
        const stmt = db.prepare(countQuery);
        const result = stmt.get(...variables);

        return Promise.resolve(Array.from(
          { length: result?.count || 0 },
          () => ({} as DbItem<TProps>),
        ));
      }

      // Add cursor condition if needed
      let cursorCondition = "";
      if (cursorValue !== undefined) {
        if (orderDirection === "ASC") {
          variables.push(cursorValue);
          cursorCondition = ` AND ${orderBy} > ?`;
        } else {
          variables.push(cursorValue);
          cursorCondition = ` AND ${orderBy} < ?`;
        }
      }

      const allConditions = [
        metadataConditions.length > 0
          ? `(${metadataConditions.join(" AND ")})`
          : DatabaseBackendSqlite.defaultClause,
        propsConditions.length > 0
          ? `(${propsConditions.join(" AND ")})`
          : DatabaseBackendSqlite.defaultClause,
        specificIdConditions.length > 0
          ? `(${specificIdConditions.join(" AND ")})`
          : DatabaseBackendSqlite.defaultClause,
      ].join(" AND ");

      const allItems: Array<DbItem<TProps>> = [];
      let totalSize = 0;
      let itemCount = 0;
      let hasMoreResults = true;
      let offset = 0;

      while (hasMoreResults) {
        const query = `
          SELECT *
          FROM bfdb
          WHERE ${allConditions} ${cursorCondition}
          ORDER BY ${orderBy} ${orderDirection}
          LIMIT ${batchSize} OFFSET ${offset}
        `;

        logger.debug("Executing query", { query, variables });

        const stmt = db.prepare(query);
        stmt.setReadBigInts(true);
        const rows = stmt.all(...variables);

        if (rows.length === 0) {
          break; // No more results
        }

        for (const row of rows) {
          if (totalLimit && itemCount >= totalLimit) {
            hasMoreResults = false;
            break; // Exit if we've reached the total limit
          }

          const props = JSON.parse(row.props) as TProps;
          const metadata = this.rowToMetadata(row);

          const item: DbItem<TProps> = { props, metadata };

          if (useSizeLimit) {
            const itemSize = JSON.stringify(item).length;
            if (totalSize + itemSize > maxSizeBytes) {
              hasMoreResults = false;
              break;
            }
            totalSize += itemSize;
          }

          allItems.push(item);
          itemCount++;
        }

        if (rows.length < batchSize) {
          hasMoreResults = false; // Last batch
        } else {
          offset += batchSize;
        }
      }

      return Promise.resolve(allItems);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async queryAncestorsByClassName<
    TProps extends Props = Props,
  >(
    bfOid: string,
    targetBfGid: string,
    sourceBfClassName: string,
    depth: number = 10,
  ): Promise<Array<DbItem<TProps>>> {
    try {
      logger.debug("queryAncestorsByClassName", {
        bfOid,
        targetBfGid,
        sourceBfClassName,
        depth,
      });

      const results: Array<DbItem<TProps>> = [];

      // Start with direct ancestors
      let current = await this.getDirectAncestors<TProps>(
        bfOid,
        targetBfGid,
        sourceBfClassName,
      );

      let currentDepth = 1;
      const processed = new Set<string>();

      // Add direct ancestors to results
      for (const item of current) {
        if (!processed.has(item.metadata.bfGid)) {
          results.push(item);
          processed.add(item.metadata.bfGid);
        }
      }

      // Continue with indirect ancestors up to the specified depth
      while (currentDepth < depth && current.length > 0) {
        const nextLevel: Array<DbItem<TProps>> = [];

        for (const item of current) {
          const ancestors = await this.getDirectAncestors<TProps>(
            bfOid,
            item.metadata.bfGid,
            sourceBfClassName,
          );

          for (const ancestor of ancestors) {
            if (!processed.has(ancestor.metadata.bfGid)) {
              nextLevel.push(ancestor);
              results.push(ancestor);
              processed.add(ancestor.metadata.bfGid);
            }
          }
        }

        current = nextLevel;
        currentDepth++;
      }

      return results;
    } catch (error) {
      logger.error("Error finding ancestors by class name:", error);
      throw error;
    }
  }

  private async getDirectAncestors<TProps extends Props = Props>(
    bfOid: string,
    targetBfGid: string,
    sourceBfClassName: string,
  ): Promise<Array<DbItem<TProps>>> {
    const db = this.getDb();

    // This query finds nodes that point to our target node
    const query = `
      SELECT * FROM bfdb 
      WHERE bf_gid IN (
        SELECT bf_sid FROM bfdb
        WHERE bf_tid = ? AND bf_oid = ?
      )
      AND class_name = ?
      AND bf_oid = ?
    `;

    const stmt = db.prepare(query);
    stmt.setReadBigInts(true);
    const rows = stmt.all(targetBfGid, bfOid, sourceBfClassName, bfOid);

    return rows.map((row: Row<TProps>) => {
      const props = JSON.parse(row.props) as TProps;
      const metadata = this.rowToMetadata(row);
      return { props, metadata };
    });
  }

  async queryDescendantsByClassName<
    TProps extends Props = Props,
  >(
    bfOid: string,
    sourceBfGid: string,
    targetBfClassName: string,
    depth: number = 10,
  ): Promise<Array<DbItem<TProps>>> {
    try {
      logger.debug("queryDescendantsByClassName", {
        bfOid,
        sourceBfGid,
        targetBfClassName,
        depth,
      });

      const results: Array<DbItem<TProps>> = [];

      // Start with direct descendants
      let current = await this.getDirectDescendants<TProps>(
        bfOid,
        sourceBfGid,
        targetBfClassName,
      );

      let currentDepth = 1;
      const processed = new Set<string>();

      // Add direct descendants to results
      for (const item of current) {
        if (!processed.has(item.metadata.bfGid)) {
          results.push(item);
          processed.add(item.metadata.bfGid);
        }
      }

      // Continue with indirect descendants up to the specified depth
      while (currentDepth < depth && current.length > 0) {
        const nextLevel: Array<DbItem<TProps>> = [];

        for (const item of current) {
          const descendants = await this.getDirectDescendants<TProps>(
            bfOid,
            item.metadata.bfGid,
            targetBfClassName,
          );

          for (const descendant of descendants) {
            if (!processed.has(descendant.metadata.bfGid)) {
              nextLevel.push(descendant);
              results.push(descendant);
              processed.add(descendant.metadata.bfGid);
            }
          }
        }

        current = nextLevel;
        currentDepth++;
      }

      return results;
    } catch (error) {
      logger.error("Error finding descendants by class name:", error);
      throw error;
    }
  }

  private getDirectDescendants<TProps extends Props = Props>(
    bfOid: string,
    sourceBfGid: string,
    targetBfClassName: string,
  ): Promise<Array<DbItem<TProps>>> {
    const db = this.getDb();

    // This query finds nodes that our source node points to
    const query = `
      SELECT * FROM bfdb 
      WHERE bf_gid IN (
        SELECT bf_tid FROM bfdb
        WHERE bf_sid = ? AND bf_oid = ?
      )
      AND class_name = ?
      AND bf_oid = ?
    `;

    const stmt = db.prepare(query);
    stmt.setReadBigInts(true);
    const rows = stmt.all(sourceBfGid, bfOid, targetBfClassName, bfOid);

    return Promise.resolve(rows.map((row: Row<TProps>) => {
      const props = JSON.parse(row.props) as TProps;
      const metadata = this.rowToMetadata(row);
      return { props, metadata };
    }));
  }

  deleteItem(bfOid: BfGid, bfGid: BfGid): Promise<void> {
    try {
      logger.debug("deleteItem", { bfOid, bfGid });
      const db = this.getDb();

      const stmt = db.prepare(
        "DELETE FROM bfdb WHERE bf_oid = ? AND bf_gid = ?",
      );
      stmt.run(bfOid, bfGid);

      logger.debug(`Deleted item with bfOid: ${bfOid} and bfGid: ${bfGid}`);
    } catch (e) {
      logger.error(e);
      throw new BfErrorDb(`Failed to delete item ${bfGid} from the database`);
    }
    return Promise.resolve();
  }

  initialize(): Promise<void> {
    const db = this.getDb();
    try {
      // Create table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS bfdb (
          class_name TEXT,
          bf_gid TEXT PRIMARY KEY,
          last_updated TEXT,
          created_at TEXT,
          bf_oid TEXT NOT NULL,
          bf_cid TEXT NOT NULL,
          bf_s_class_name TEXT,
          bf_sid TEXT,
          bf_t_class_name TEXT,
          bf_tid TEXT,
          sort_value INTEGER NOT NULL,
          props TEXT NOT NULL
        );
      `);

      // Create indexes
      const indexes = [
        "sort_value",
        "bf_gid",
        "bf_oid",
        "bf_cid",
        "bf_s_class_name",
        "bf_sid",
        "bf_t_class_name",
        "bf_tid",
        "class_name",
      ];

      // Execute everything in one transaction for better performance
      db.exec("BEGIN TRANSACTION;");

      try {
        for (const index of indexes) {
          db.exec(`
            CREATE INDEX IF NOT EXISTS idx_bfdb_${index} ON bfdb (${index})
          `);
          logger.debug(`Created index for ${index}`);
        }

        db.exec("COMMIT;");
        logger.info("Database schema initialized with SQLite backend");
      } catch (e) {
        db.exec("ROLLBACK;");
        logger.error("Error creating indexes, transaction rolled back:", e);
        throw e;
      }
    } catch (e) {
      logger.error("Error initializing database:", e);
      throw e;
    }
    return Promise.resolve();
  }

  /**
   * Closes the database connection
   * This is important to prevent connection leaks in tests
   */
  close(): Promise<void> {
    if (this._db) {
      try {
        this._db.close();
        this._db = null;
        // Clear prepared statements cache
        this._statements.clear();
        logger.debug("SQLite database connection closed and reference cleared");
      } catch (err) {
        logger.error("Error closing SQLite database connection", err);
        throw new BfErrorDb("Failed to close SQLite database connection");
      }
    } else {
      logger.debug("No active SQLite database connection to close");
    }
    return Promise.resolve();
  }
}
