import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getLogger } from "packages/logger.ts";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import type { DbItem, Props } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

type BfDbMetadata = BfMetadataNode & Partial<BfMetadataEdge>;

type Row<
  TProps extends Props = Props,
> = {
  props: TProps;
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

export class DatabaseBackendNeon implements DatabaseBackend {
  private _sql: NeonQueryFunction<false, false> | null = null;

  private getSql(): NeonQueryFunction<false, false> {
    if (this._sql === null) {
      const databaseUrl = getConfigurationVariable("DATABASE_URL");
      if (!databaseUrl) {
        throw new BfErrorDb("DATABASE_URL is not set");
      }
      this._sql = neon(databaseUrl);
    }
    return this._sql;
  }

  private rowToMetadata(row: Row): BfDbMetadata {
    return {
      bfGid: toBfGid(row.bf_gid),
      bfOid: toBfGid(row.bf_oid),
      bfCid: toBfGid(row.bf_cid),
      bfSid: toBfGid(row.bf_sid),
      bfTid: toBfGid(row.bf_tid),
      bfTClassName: row.bf_t_class_name,
      bfSClassName: row.bf_s_class_name,
      className: row.class_name,
      createdAt: new Date(row.created_at),
      lastUpdated: new Date(row.last_updated),
      sortValue: row.sort_value,
    };
  }

  async getItem<TProps extends Props = Props>(
    bfOid: BfGid,
    bfGid: BfGid,
  ): Promise<DbItem<TProps> | null> {
    try {
      logger.trace("getItem", bfOid, bfGid);
      const rows = await this
        .getSql()`SELECT * FROM bfdb WHERE bf_oid = ${bfOid} AND bf_gid = ${bfGid}` as Array<
          Row<TProps>
        >;

      if (rows.length === 0) {
        return null;
      }
      const firstRow = rows[0];
      const props: TProps = firstRow.props;
      logger.trace(firstRow);
      const metadata = this.rowToMetadata(firstRow);

      return { props, metadata };
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async getItemByBfGid<TProps extends Props = Props>(
    bfGid: string,
    className?: string,
  ): Promise<DbItem<TProps> | null> {
    try {
      logger.trace("getItemByBfGid", { bfGid, className });
      let queryPromise;
      if (className) {
        queryPromise = this
          .getSql()`SELECT * FROM bfdb WHERE bf_gid = ${bfGid} AND class_name = ${className}`;
      } else {
        queryPromise = this
          .getSql()`SELECT * FROM bfdb WHERE bf_gid = ${bfGid}`;
      }
      const rows = await queryPromise as Array<Row>;
      if (rows.length === 0) {
        return null;
      }
      const firstRow = rows[0];
      const props = firstRow.props as TProps;
      logger.trace(props);
      const metadata = this.rowToMetadata(firstRow);
      return { props, metadata };
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async getItemsByBfGid<TProps extends Props = Props>(
    bfGids: Array<string>,
    className?: string,
  ): Promise<Array<DbItem<TProps>>> {
    try {
      logger.trace("getItemsByBfGid", { bfGids, className });
      let queryPromise;
      if (className) {
        queryPromise = this
          .getSql()`SELECT * FROM bfdb WHERE bf_gid = ANY(${bfGids}) AND class_name = ${className}`;
      } else {
        queryPromise = this
          .getSql()`SELECT * FROM bfdb WHERE bf_gid = ANY(${bfGids})`;
      }
      const rows = await queryPromise as Array<Row>;
      return rows.map((row) => {
        const props = row.props as TProps;
        const metadata = this.rowToMetadata(row);
        return { props: props, metadata };
      });
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

    try {
      let createdAtTimestamp, lastUpdatedTimestamp;

      if (itemMetadata.createdAt instanceof Date) {
        createdAtTimestamp = itemMetadata.createdAt.toISOString();
      } else if (typeof itemMetadata.createdAt === "number") {
        createdAtTimestamp = new Date(itemMetadata.createdAt).toISOString();
      }

      if (itemMetadata.lastUpdated instanceof Date) {
        lastUpdatedTimestamp = itemMetadata.lastUpdated.toISOString();
      } else if (typeof itemMetadata.lastUpdated === "number") {
        lastUpdatedTimestamp = new Date(itemMetadata.lastUpdated).toISOString();
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

      // Insert or Update with conditional sort_value
      await this.getSql()`
      INSERT INTO bfdb(
        bf_gid, bf_oid, bf_cid, bf_sid, bf_tid, class_name, created_at, last_updated, props, sort_value, bf_t_class_name, bf_s_class_name
      )
      VALUES(
        ${itemMetadata.bfGid}, ${itemMetadata.bfOid}, ${itemMetadata.bfCid}, ${bfSid}, ${bfTid}, ${itemMetadata.className}, ${createdAtTimestamp}, ${lastUpdatedTimestamp}, ${
        JSON.stringify(itemProps)
      }, ${sortValue}, ${bfTClassName}, ${bfSClassName}
      ) 
      ON CONFLICT (bf_gid) DO UPDATE SET
        bf_oid = EXCLUDED.bf_oid,
        bf_cid = EXCLUDED.bf_cid,
        bf_sid = EXCLUDED.bf_sid,
        bf_tid = EXCLUDED.bf_tid,
        class_name = EXCLUDED.class_name,
        created_at = EXCLUDED.created_at,
        last_updated = CURRENT_TIMESTAMP,
        props = EXCLUDED.props,
        sort_value = CASE WHEN bfdb.created_at IS NULL THEN EXCLUDED.sort_value ELSE bfdb.sort_value END,
        bf_t_class_name = EXCLUDED.bf_t_class_name,
        bf_s_class_name = EXCLUDED.bf_s_class_name;`;
      logger.trace(
        `putItem: Successfully inserted or updated item with ${
          JSON.stringify(itemMetadata)
        }`,
      );
    } catch (e) {
      logger.error("Error in putItem:", e);
      logger.trace(e);
      throw e;
    }
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

  async queryItems<TProps extends Props = Props>(
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
      orderBy as keyof Row,
      {
        useSizeLimit: false,
      },
    );
  }

  async queryItemsWithSizeLimit<TProps extends Props = Props>(
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
      orderBy as keyof Row,
      {
        useSizeLimit: true,
        cursorValue,
        maxSizeBytes,
        batchSize,
      },
    );
  }

  private async queryItemsUnified<
    TProps extends Props = Props,
  >(
    metadataToQuery: Partial<BfDbMetadata>,
    propsToQuery: Partial<TProps> = {},
    bfGids?: Array<string>,
    orderDirection: "ASC" | "DESC" = "ASC",
    orderBy: keyof Row = "sort_value",
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
      const key = originalKey.replace(/([a-z])([A-Z])/g, "$1_$2").replace(
        /([A-Z])(?=[A-Z])/g,
        "$1_",
      ).toLowerCase();
      if (DatabaseBackendNeon.VALID_METADATA_COLUMN_NAMES.includes(key)) {
        variables.push(value);
        metadataConditions.push(`${key} = $${variables.length}`);
      } else {
        logger.warn(`Invalid metadata column name`, originalKey, key);
      }
    }

    // Process props conditions
    for (const [key, value] of Object.entries(propsToQuery)) {
      variables.push(key);
      variables.push(value);
      propsConditions.push(
        `props->>$${variables.length - 1} = $${variables.length}`,
      );
    }

    // Process bfGids
    if (bfGids && bfGids.length > 0) {
      const bfGidConditions = bfGids.map((bfGid) => {
        variables.push(bfGid);
        return `bf_gid = $${variables.length}`;
      });
      specificIdConditions.push(`(${bfGidConditions.join(" OR ")})`);
    }

    if (metadataConditions.length === 0) {
      metadataConditions.push(DatabaseBackendNeon.defaultClause);
    }
    if (propsConditions.length === 0) {
      propsConditions.push(DatabaseBackendNeon.defaultClause);
    }
    if (specificIdConditions.length === 0) {
      specificIdConditions.push(DatabaseBackendNeon.defaultClause);
    }

    if (countOnly) {
      const allConditions = [
        ...metadataConditions,
        ...propsConditions,
        ...specificIdConditions,
      ].filter(Boolean).join(" AND ");
      const query = await this.getSql()(
        `SELECT COUNT(*) FROM bfdb WHERE ${allConditions}`,
        variables,
      );
      return Array.from(
        { length: parseInt(query[0].count, 10) },
        () => ({} as DbItem<TProps>),
      );
    }

    const buildQuery = (offset: number) => {
      const allConditions = [
        ...metadataConditions,
        ...propsConditions,
        ...specificIdConditions,
      ].filter(Boolean).join(" AND ");

      return `
        SELECT *
        FROM bfdb
        WHERE ${allConditions}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT ${batchSize} OFFSET ${offset}
      `;
    };

    const allItems: Array<DbItem<TProps>> = [];
    let offset = 0;
    let totalSize = 0;
    let itemCount = 0;

    while (true) {
      const query = buildQuery(offset);
      try {
        logger.debug("Executing query", query, variables);
        const rows = await this.getSql()(query, variables) as Array<
          Row<TProps>
        >;

        if (rows.length === 0) break; // No more results

        for (const row of rows) {
          if (totalLimit && itemCount >= totalLimit) {
            return allItems; // Exit if we've reached the total limit
          }
          const item: DbItem<TProps> = {
            props: row.props,
            metadata: this.rowToMetadata(row),
          };

          if (useSizeLimit) {
            const itemSize = JSON.stringify(item).length;
            if (totalSize + itemSize > maxSizeBytes) return allItems;
            totalSize += itemSize;
          }

          allItems.push(item);
          itemCount++;
        }

        offset += batchSize;

        if (rows.length < batchSize) break; // Last batch
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }

    return allItems;
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
      const rows = await this.getSql()`
        WITH RECURSIVE AncestorTree(bf_sid, bf_s_class_name, path, depth) AS (
          SELECT 
            bf_sid, 
            bf_s_class_name, 
            ARRAY[bf_tid::text, bf_sid::text]::text[] AS path, 
            1 AS depth
          FROM bfdb
          WHERE bf_tid = ${targetBfGid} AND bf_oid = ${bfOid}
          UNION ALL
          SELECT 
            b.bf_sid, 
            b.bf_s_class_name, 
            at.path || b.bf_sid::text, 
            at.depth + 1
          FROM bfdb AS b
          INNER JOIN AncestorTree AS at ON b.bf_tid = at.bf_sid
          WHERE 
            at.depth < ${depth} AND 
            b.bf_oid = ${bfOid} AND 
            NOT b.bf_sid::text = ANY(at.path)
        )
        SELECT b.*, at.depth
        FROM bfdb b
        JOIN AncestorTree at ON b.bf_gid = at.bf_sid
        WHERE 
          at.bf_s_class_name = ${sourceBfClassName} AND 
          b.bf_gid != ${targetBfGid}
        ORDER BY at.depth ASC;
      `;
      const items = rows.map((row) => ({
        props: row.props,
        metadata: this.rowToMetadata(row as Row),
      } as DbItem<TProps>));
      return items;
    } catch (error) {
      logger.error("Error finding ancestors by class name:", error);
      throw error;
    }
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
      const rows = await this.getSql()`
        WITH RECURSIVE DescendantTree(bf_tid, bf_t_class_name, path, depth) AS (
          SELECT 
            bf_tid, 
            bf_t_class_name, 
            ARRAY[bf_sid::text, bf_tid::text]::text[] AS path, 
            1 AS depth
          FROM bfdb
          WHERE bf_sid = ${sourceBfGid} AND bf_oid = ${bfOid}
          UNION ALL
          SELECT 
            b.bf_tid, 
            b.bf_t_class_name, 
            dt.path || b.bf_tid::text, 
            dt.depth + 1
          FROM bfdb AS b
          INNER JOIN DescendantTree AS dt ON b.bf_sid = dt.bf_tid
          WHERE 
            dt.depth < ${depth} AND 
            b.bf_oid = ${bfOid} AND 
            NOT b.bf_tid::text = ANY(dt.path)
        )
        SELECT b.*, dt.depth
        FROM bfdb b
        JOIN DescendantTree dt ON b.bf_gid = dt.bf_tid
        WHERE 
          dt.bf_t_class_name = ${targetBfClassName} AND 
          b.bf_gid != ${sourceBfGid}
        ORDER BY dt.depth ASC;
      `;
      const items = rows.map((row) => ({
        props: row.props,
        metadata: this.rowToMetadata(row as Row),
      } as DbItem<TProps>));
      return items;
    } catch (error) {
      logger.error("Error finding descendants by class name:", error);
      throw error;
    }
  }

  async deleteItem(bfOid: BfGid, bfGid: BfGid): Promise<void> {
    try {
      logger.debug("deleteItem", { bfOid, bfGid });
      await this.getSql()`
        DELETE FROM bfdb
        WHERE bf_oid = ${bfOid} AND bf_gid = ${bfGid}
      `;
      logger.debug(`Deleted item with bfOid: ${bfOid} and bfGid: ${bfGid}`);
    } catch (e) {
      logger.error(e);
      throw new BfErrorDb(`Failed to delete item ${bfGid} from the database`);
    }
  }

  async initialize(): Promise<void> {
    const sql = this.getSql();
    await sql`
    CREATE TABLE IF NOT EXISTS bfdb (
      class_name VARCHAR(255),
      bf_gid VARCHAR(255) PRIMARY KEY,
      last_updated TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE,
      bf_oid VARCHAR(255) NOT NULL,
      bf_cid VARCHAR(255) NOT NULL,
      bf_s_class_name VARCHAR(255),
      bf_sid VARCHAR(255),
      bf_t_class_name VARCHAR(255),
      bf_tid VARCHAR(255),
      sort_value BIGINT NOT NULL,
      props JSONB NOT NULL
    );
    `;

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

    for (const index of indexes) {
      try {
        await sql`CREATE INDEX IF NOT EXISTS ${
          sql(`idx_bfdb_${index}`)
        } ON bfdb (${sql(index)})`;
      } catch (e) {
        logger.warn(`Index creation for ${index} failed, may already exist`, e);
      }
    }

    logger.info("Database schema initialized");
  }
}
