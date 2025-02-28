import { getLogger } from "packages/logger.ts";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import type {
  Connection,
  ConnectionArguments,
  Edge,
  PageInfo,
} from "graphql-relay";
import type { BfDbMetadata } from "packages/bfDb/backend/DatabaseBackend.ts";
import { closeBackend, getBackend } from "packages/bfDb/bfDbBackend.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | Array<JSONValue>;

export type Props = Record<string, JSONValue>;

export type DbItem<T extends Props> = {
  props: T;
  metadata: BfDbMetadata;
};

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

export async function bfGetItem<
  TProps extends Props,
>(bfOid: BfGid, bfGid: BfGid): Promise<DbItem<TProps> | null> {
  logger.trace("getItem", bfOid, bfGid);
  const backend = await getBackend();
  return await backend.getItem<TProps>(bfOid, bfGid);
}

export async function bfGetItemByBfGid<
  TProps extends Props = Props,
>(
  bfGid: string,
  className?: string,
): Promise<DbItem<TProps> | null> {
  logger.trace("getItemByBfGid", { bfGid, className });
  const backend = await getBackend();
  return await backend.getItemByBfGid<TProps>(bfGid, className);
}

export async function bfGetItemsByBfGid<
  TProps extends Props = Props,
>(
  bfGids: Array<string>,
  className?: string,
): Promise<Array<DbItem<TProps>>> {
  logger.trace("getItemsByBfGid", { bfGids, className });
  const backend = await getBackend();
  return await backend.getItemsByBfGid<TProps>(bfGids, className);
}

export async function bfPutItem<
  TProps extends Props = Props,
>(
  itemProps: TProps,
  itemMetadata: BfMetadataNode | BfMetadataEdge,
  sortValue = Date.now(),
): Promise<void> {
  const backend = await getBackend();
  await backend.putItem<TProps>(itemProps, itemMetadata, sortValue);
}

export async function bfDeleteItem(
  bfOid: BfGid,
  bfGid: BfGid,
): Promise<void> {
  logger.trace("deleteItem", bfOid, bfGid);
  const backend = await getBackend();
  await backend.deleteItem(bfOid, bfGid);
}

export async function bfQueryAncestorsByClassName<
  TProps extends Props,
>(
  bfOid: string,
  targetBfGid: string,
  sourceBfClassName: string,
  depth: number = 10,
): Promise<Array<DbItem<TProps>>> {
  try {
    const backend = await getBackend();
    return await backend.queryAncestorsByClassName<TProps>(
      bfOid,
      targetBfGid,
      sourceBfClassName,
      depth,
    );
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
    const backend = await getBackend();
    return await backend.queryDescendantsByClassName<TProps>(
      bfOid,
      sourceBfGid,
      targetBfClassName,
      depth,
    );
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

  const backend = await getBackend();

  if (useSizeLimit) {
    return await backend.queryItemsWithSizeLimit<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      cursorValue,
      maxSizeBytes,
      batchSize,
    );
  }

  // For count only or other special cases, we'll need more implementation
  // This is simplified for now
  if (countOnly) {
    const items = await backend.queryItems<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return Array.from(
      { length: items.length },
      () => ({} as DbItem<TProps>),
    );
  }

  if (totalLimit) {
    // This would need more implementation to match the original behavior
    // For now, we'll just fetch and slice
    const items = await backend.queryItems<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return items.slice(0, totalLimit);
  }

  return await backend.queryItems<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );
}

export async function bfQueryItems<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<Array<DbItem<TProps>>> {
  logger.debug({
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  });
  const backend = await getBackend();
  return await backend.queryItems<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );
}

export async function bfQueryItemsWithSizeLimit<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  cursorValue?: number | string,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB in bytes
  batchSize: number = 4,
): Promise<Array<DbItem<TProps>>> {
  try {
    const backend = await getBackend();
    return await backend.queryItemsWithSizeLimit<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      cursorValue,
      maxSizeBytes,
      batchSize,
    );
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItemsTop<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  topCount = 20,
): Promise<Array<DbItem<TProps>>> {
  try {
    const backend = await getBackend();
    const items = await backend.queryItems<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return items.slice(0, topCount);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItem<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGid?: string,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<DbItem<TProps> | null> {
  try {
    const backend = await getBackend();
    const items = await backend.queryItems<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGid ? [bfGid] : undefined,
      orderDirection,
      orderBy,
    );
    return items[0] ?? null;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItemsStream<TProps extends Props = Props>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<ReadableStream<DbItem<TProps>>> {
  const backend = await getBackend();
  const items = await backend.queryItems<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );

  return new ReadableStream<DbItem<TProps>>({
    start(controller) {
      for (const item of items) {
        controller.enqueue(item);
      }
      controller.close();
    },
  });
}

export async function bfQueryItemsStreamWithSizeLimit<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfMetadataNode | BfMetadataEdge>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  cursorValue?: number | string,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB in bytes
  batchSize = 4,
): Promise<ReadableStream<DbItem<TProps>>> {
  const backend = await getBackend();
  const items = await backend.queryItemsWithSizeLimit<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
    cursorValue,
    maxSizeBytes,
    batchSize,
  );

  return new ReadableStream<DbItem<TProps>>({
    start(controller) {
      for (const item of items) {
        controller.enqueue(item);
      }
      controller.close();
    },
  });
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

  // Count the total number of items
  const countItems = await bfQueryItems(
    metadata,
    props,
    bfGids,
  );
  const count = countItems.length;

  return {
    edges,
    pageInfo,
    count,
  };
}

export async function CLEAR_FOR_DEBUGGING() {
  try {
    const { getConfigurationVariable } = await import(
      "packages/getConfigurationVariable.ts"
    );
    const { neon } = await import("@neondatabase/serverless");

    if (getConfigurationVariable("BF_ENV") === "DEVELOPMENT") {
      const databaseUrl = getConfigurationVariable("DATABASE_URL");
      if (!databaseUrl) {
        throw new BfErrorDb("DATABASE_URL is not set");
      }
      const sql = neon(databaseUrl);

      await sql`
      WITH class_names AS (
        SELECT unnest(ARRAY['BfJob', 'BfJobLarge', 'BfMedia', 'BfCollection', 'BfMediaNode', 'BfMediaNodeVideoGoogleDriveResource', 'BfMediaNodeTranscript', 'BfMediaNodeVideo', 'BfGoogleDriveResource', 'BfMediaSequence']) AS name
      )
      DELETE FROM bfdb
      WHERE class_name IN (SELECT name FROM class_names)
         OR bf_s_class_name IN (SELECT name FROM class_names)
         OR bf_t_class_name IN (SELECT name FROM class_names);
      `;
    }
  } catch (error) {
    logger.error("Error in CLEAR_FOR_DEBUGGING:", error);
    throw error;
  }
}

/**
 * Closes the database connection
 * Primarily used in tests to prevent connection leaks
 */
export async function bfCloseConnection(): Promise<void> {
  logger.debug("Closing database connection");
  await closeBackend();
}

// Modify or add this function to the bfDb.ts file
// This function ensures database operations are properly isolated,
// especially useful for testing scenarios
export async function withIsolatedDb<T>(
  operation: () => Promise<T>,
  options: {
    forceBackendType?: string;
    customDbPath?: string;
  } = {},
): Promise<T> {
  // Store original environment values
  const originalDbPath = getConfigurationVariable("SQLITE_DB_PATH");
  const originalBackend = getConfigurationVariable("FORCE_DB_BACKEND");

  try {
    // Set temporary environment values if provided
    if (options.customDbPath) {
      Deno.env.set("SQLITE_DB_PATH", options.customDbPath);
    }

    if (options.forceBackendType) {
      Deno.env.set("FORCE_DB_BACKEND", options.forceBackendType);
    }

    // Make sure any existing connection is closed
    await bfCloseConnection();

    // Run the operation with fresh connection
    return await operation();
  } finally {
    // Close the connection
    await bfCloseConnection();

    // Restore original environment values
    if (options.customDbPath) {
      if (originalDbPath) {
        Deno.env.set("SQLITE_DB_PATH", originalDbPath);
      } else {
        Deno.env.delete("SQLITE_DB_PATH");
      }
    }

    if (options.forceBackendType) {
      if (originalBackend) {
        Deno.env.set("FORCE_DB_BACKEND", originalBackend);
      } else {
        Deno.env.delete("FORCE_DB_BACKEND");
      }
    }

    // If using a custom SQLite path, try to clean up the file
    if (options.customDbPath && options.forceBackendType === "sqlite") {
      try {
        await Deno.remove(options.customDbPath);
        logger.debug(
          `Removed temporary SQLite database: ${options.customDbPath}`,
        );
      } catch {
        // Ignore errors if file doesn't exist or can't be removed
      }
    }
  }
}
