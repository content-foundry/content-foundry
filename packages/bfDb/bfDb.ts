import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import { getLogger } from "packages/logger.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import type {
  Connection,
  ConnectionArguments,
  Edge,
  PageInfo,
} from "graphql-relay";

// Import the abstract backend interface and concrete implementations
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { DatabaseBackendPostgres } from "packages/bfDb/backend/DatabaseBackendPostgres.ts";

const logger = getLogger(import.meta);

type BfDbMetadata = BfMetadataNode & Partial<BfMetadataEdge>;

type DbItem<T extends Props> = {
  props: T;
  metadata: BfDbMetadata;
};

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | Array<JSONValue>;

type Props = Record<string, JSONValue>;
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

function rowToMetadata(row: Row): BfDbMetadata {
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

// Singleton instance of the database backend
let databaseBackend: DatabaseBackend | null = null;

/**
 * Get the appropriate database backend based on environment configuration
 */
function getBackend(): DatabaseBackend {
  if (databaseBackend) {
    return databaseBackend;
  }

  logger.info("Using PostgreSQL database backend");
  databaseBackend = new DatabaseBackendPostgres();

  // Initialize the backend
  databaseBackend.initialize()
    .catch((error) => {
      logger.error("Failed to initialize database backend", error);
      throw new BfErrorDb("Failed to initialize database backend");
    });

  return databaseBackend;
}

/**
 * Put an item into the database
 */
export async function bfPutItem(
  props: Record<string, unknown>,
  metadata: {
    className: string;
    bfGid: BfGid;
    bfOid: BfGid;
    bfCid: BfGid;
    bfSClassName?: string;
    bfSid?: BfGid;
    bfTClassName?: string;
    bfTid?: BfGid;
    sortValue: number;
  },
): Promise<void> {
  try {
    await getBackend().putItem(
      metadata.className,
      metadata.bfGid,
      props,
      metadata.sortValue,
      metadata.bfSClassName,
      metadata.bfSid,
      metadata.bfTClassName,
      metadata.bfTid,
    );
  } catch (error) {
    logger.error("Error in bfPutItem:", error);
    throw error;
  }
}

/**
 * Get an item from the database by ID
 */
export async function bfGetItem(
  bfOid: BfGid,
  bfGid: BfGid,
): Promise<
  {
    props: Record<string, unknown>;
    metadata: {
      className: string;
      bfGid: BfGid;
      bfOid: BfGid;
      bfCid: BfGid;
      bfSClassName?: string;
      bfSid?: BfGid;
      bfTClassName?: string;
      bfTid?: BfGid;
      sortValue: number;
      createdAt: Date;
      lastUpdated: Date;
    };
  } | null
> {
  try {
    const item = await getBackend().getItem(
      bfOid.toString(),
      bfGid,
    );

    if (!item) {
      return null;
    }

    return {
      props: item.props,
      metadata: {
        className: item.id.toString().split("/")[0],
        bfGid: item.id,
        bfOid: bfOid,
        bfCid: toBfGid(item.id.toString().split("/")[1]),
        bfSClassName: item.s_className,
        bfSid: item.sid,
        bfTClassName: item.t_className,
        bfTid: item.tid,
        sortValue: item.sortValue,
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
    };
  } catch (error) {
    logger.error("Error in bfGetItem:", error);
    throw error;
  }
}

/**
 * Query items from the database based on metadata and props
 */
export async function bfQueryItems(
  metadata: Record<string, unknown>,
  props?: Record<string, unknown>,
  bfGids?: Array<BfGid>,
): Promise<
  Array<{
    props: Record<string, unknown>;
    metadata: {
      className: string;
      bfGid: BfGid;
      bfOid: BfGid;
      bfCid: BfGid;
      bfSClassName?: string;
      bfSid?: BfGid;
      bfTClassName?: string;
      bfTid?: BfGid;
      sortValue: number;
      createdAt: Date;
      lastUpdated: Date;
    };
  }>
> {
  try {
    // Extract the className from metadata
    const className = metadata.className as string;
    if (!className) {
      throw new BfErrorDb("className is required for query");
    }

    // Build query parameters
    const queryParams: Record<string, unknown> = {};

    // Add metadata fields to the query
    for (const [key, value] of Object.entries(metadata)) {
      if (key !== "className" && value !== undefined) {
        queryParams[key] = value;
      }
    }

    // Add props to the query if provided
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) {
          queryParams[key] = value;
        }
      }
    }

    // Get items from the backend
    const items = await getBackend().queryItems(className, queryParams);

    // Filter by bfGids if provided
    let filteredItems = items;
    if (bfGids && bfGids.length > 0) {
      const gidStrings = bfGids.map((gid) => gid.toString());
      filteredItems = items.filter((item) =>
        gidStrings.includes(item.id.toString())
      );
    }

    // Convert to the expected return format
    return filteredItems.map((item) => ({
      props: item.props,
      metadata: {
        className,
        bfGid: item.id,
        bfOid: toBfGid(metadata.bfOid as string),
        bfCid: toBfGid(item.id.toString().split("/")[1]),
        bfSClassName: item.s_className,
        bfSid: item.sid,
        bfTClassName: item.t_className,
        bfTid: item.tid,
        sortValue: item.sortValue,
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
    }));
  } catch (error) {
    logger.error("Error in bfQueryItems:", error);
    throw error;
  }
}

/**
 * Delete an item from the database
 */
export async function bfDeleteItem(
  className: string,
  bfGid: BfGid,
): Promise<void> {
  try {
    await getBackend().deleteItem(className, bfGid);
  } catch (error) {
    logger.error("Error in bfDeleteItem:", error);
    throw error;
  }
}

const VALID_METADATA_COLUMN_NAMES = [
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

const defaultClause = "1=1";

export async function bfQueryAncestorsByClassName<
  TProps extends Props,
>(
  bfOid: string,
  targetBfGid: string,
  sourceBfClassName: string,
  depth: number = 10,
): Promise<Array<DbItem<TProps>>> {
  try {
    const rows = await getSql()`
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
      metadata: rowToMetadata(row as Row),
    } as DbItem<TProps>));
    return items;
  } catch (error) {
    logger.error("Error finding ancestors by class name:", error);
    throw error;
  }
}

export async function bfQueryDescendantsByClassName<
  TProps extends Props = Props,
>(
  bfOid: string,
  sourceBfGid: string,
  targetBfClassName: string,
  depth: number = 10,
): Promise<Array<DbItem<TProps>>> {
  try {
    const rows = await getSql()`
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
      metadata: rowToMetadata(row as Row),
    } as DbItem<TProps>));
    return items;
  } catch (error) {
    logger.error("Error finding descendants by class name:", error);
    throw error;
  }
}

export async function bfQueryItemsUnified<
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
    if (VALID_METADATA_COLUMN_NAMES.includes(key)) {
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

  if (metadataConditions.length === 0) metadataConditions.push(defaultClause);
  if (propsConditions.length === 0) propsConditions.push(defaultClause);
  if (specificIdConditions.length === 0) {
    specificIdConditions.push(defaultClause);
  }

  if (countOnly) {
    const allConditions = [
      ...metadataConditions,
      ...propsConditions,
      ...specificIdConditions,
    ].filter(Boolean).join(" AND ");
    const query = await getSql()(
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
      const rows = await getSql()(query, variables) as Array<Row<TProps>>;

      if (rows.length === 0) break; // No more results

      for (const row of rows) {
        if (totalLimit && itemCount >= totalLimit) {
          return allItems; // Exit if we've reached the total limit
        }
        const item: DbItem<TProps> = {
          props: row.props,
          metadata: rowToMetadata(row),
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

export function bfQueryItemsWithSizeLimit<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: keyof Row = "sort_value",
  cursorValue?: number | string,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB in bytes
  batchSize: number = 4,
): Promise<Array<DbItem<TProps>>> {
  return bfQueryItemsUnified(
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

export async function bfQueryItemsForGraphQLConnection<
  TProps extends Props = Props,
  TMetadata extends BfDbMetadata = BfDbMetadata,
>(
  metadata: Partial<TMetadata>,
  props: Partial<TProps> = {},
  connectionArgs: ConnectionArguments,
  bfGids: Array<string>,
): Promise<Connection<DbItem<TProps>> & { count: number }> {
  logger.debug({ metadata, props, connectionArgs });
  const { first, last, after, before } = connectionArgs;

  let orderDirection: "ASC" | "DESC" = "ASC";
  let cursorValue: number | undefined;
  let limit: number = 10;

  if (first != undefined) {
    orderDirection = "ASC";
    limit = first + 1; // Fetch one extra for next page check
    if (after) {
      cursorValue = cursorToSortValue(after);
    }
  } else if (last != undefined) {
    orderDirection = "DESC";
    limit = last + 1; // Fetch one extra for previous page check
    if (before) {
      cursorValue = cursorToSortValue(before);
    }
  }

  const results = await bfQueryItemsUnified(
    metadata,
    props,
    bfGids,
    orderDirection,
    "sort_value",
    {
      useSizeLimit: false,
      cursorValue,
      batchSize: 4,
      totalLimit: limit,
    },
  );

  const edges: Array<Edge<DbItem<TProps>>> = results.map((
    item,
  ) => ({
    cursor: sortValueToCursor(item.metadata.sortValue),
    node: item as DbItem<TProps>,
  }));

  let hasNextPage = false;
  let hasPreviousPage = false;

  if (first != undefined && edges.length > first) {
    hasNextPage = true;
    edges.pop(); // Remove the extra item
  } else if (last != undefined && edges.length > last) {
    hasPreviousPage = true;
    edges.shift(); // Remove the extra item from the beginning
  }

  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  const pageInfo = {
    startCursor,
    endCursor,
    hasNextPage,
    hasPreviousPage,
  } as PageInfo;

  const arrayWithEmptyElements = await bfQueryItemsUnified(
    metadata,
    props,
    bfGids,
    orderDirection,
    "sort_value",
    {
      countOnly: true,
    },
  );
  const count = arrayWithEmptyElements.length;
  return {
    edges,
    pageInfo,
    count,
  };
}

// Function to convert sortValue to base64 cursor
export function sortValueToCursor(sortValue: number = Date.now()): string {
  // Convert number to string and then Uint8Array
  const uint8Array = new TextEncoder().encode(sortValue.toString());
  // Convert Uint8Array to base64
  return btoa(String.fromCharCode(...uint8Array));
}

// Function to convert base64 cursor back to sortValue
function cursorToSortValue(cursor: string): number {
  // Convert base64 to string
  const decodedString = atob(cursor);
  // Convert string to Uint8Array
  const uint8Array = new Uint8Array(
    [...decodedString].map((char) => char.charCodeAt(0)),
  );
  // Decode Uint8Array to original string and convert to number
  return parseInt(new TextDecoder().decode(uint8Array), 10);
}

let _sql: NeonQueryFunction<false, false> | null = null;
function getSql() {
  if (_sql === null) {
    const databaseUrl = getConfigurationVariable("DATABASE_URL");
    if (!databaseUrl) {
      throw new BfErrorDb("DATABASE_URL is not set");
    }
    _sql = neon(databaseUrl);
  }
  return _sql;
}

export async function CLEAR_FOR_DEBUGGING() {
  if (getConfigurationVariable("BF_ENV") === "DEVELOPMENT") {
    await getSql()`
WITH class_names AS (
  SELECT unnest(ARRAY['BfJob', 'BfJobLarge', 'BfMedia', 'BfCollection', 'BfMediaNode', 'BfMediaNodeVideoGoogleDriveResource', 'BfMediaNodeTranscript', 'BfMediaNodeVideo', 'BfGoogleDriveResource', 'BfMediaSequence']) AS name
)
DELETE FROM bfdb
WHERE class_name IN (SELECT name FROM class_names)
   OR bf_s_class_name IN (SELECT name FROM class_names)
   OR bf_t_class_name IN (SELECT name FROM class_names);
`;
  }
}