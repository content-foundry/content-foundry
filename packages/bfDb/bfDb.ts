import { neon, type Pool } from "@neondatabase/serverless";

import { getLogger } from "packages/logger.ts";
import type {
  BfMetadata,
  BfMetadataDefault,
} from "packages/bfDb/classes/BfNodeMetadata.ts";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfError } from "packages/BfError.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

export type EdgeRecord<
  T extends Record<string, unknown> = Record<string, unknown>,
  C = string | null | undefined,
> = {
  cursor: C;
  node: T;
};

export type EdgeRecords<
  T extends Record<string, unknown> = Record<string, unknown>,
  C = string | null | undefined,
> = Array<EdgeRecord<T, C>>;

// export type PageInfo = {
//   endCursor: string | null | undefined;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
//   startCursor: string | null | undefined;
// };

// export type ConnectionInterface<
//   T extends Record<string, unknown> = Record<string, unknown>,
// > = { pageInfo: PageInfo; edges: Array<EdgeRecord<T>>; count: number };

type DbItem<T extends Props> = {
  props: T;
  metadata: BfMetadata;
};

const databaseUrl = getConfigurationVariable("DATABASE_URL");
if (!databaseUrl) {
  throw new BfErrorDb("DATABASE_URL is not set");
}
const sql = neon(databaseUrl);

const connectionString = getConfigurationVariable("BF_ENV") === "DEVELOPMENT"
  ? getConfigurationVariable("DATABASE_URL") ??
    getConfigurationVariable("DATABASE_URL")
  : getConfigurationVariable("DATABASE_URL");

// const pool = new Pool({ connectionString });
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
  sort_value: string;
};

// export type BfModelUpdateNotification = {
//   operation: "INSERT" | "UPDATE" | "DELETE";
//   bfGid: BfGid;
//   bfOid: BfOid;
// };

// export type BfConnectionUpdateNotification = BfModelUpdateNotification & {
//   bfTid: BfTid;
//   bfTClassName: BfClassName;
//   sortValue: number;
//   cursor: string;
// };

// type NotificationResponseMessage = {
//   length: number;
//   processId: number;
//   channel: string;
//   payload: string;
//   name: string;
// };

// type BfClassName = string;

// const bfModelUpdateSubjects = new Map<
//   BfOid,
//   Map<BfGid, Set<Subject<BfModelUpdateNotification>>>
// >();

// const bfConnectionUpdateSubjects = new Map<
//   BfOid,
//   Map<BfSid, Map<BfClassName, Set<Subject<BfConnectionUpdateNotification>>>>
// >();

// function respondToConnectionChangeNotification(
//   message: NotificationResponseMessage,
// ) {
//   logger.debug(message);
//   const { operation, bf_oid, bf_sid, bf_t_class_name, bf_tid, sort_value } =
//     JSON.parse(message.payload);
//   const oidSubscribers = bfConnectionUpdateSubjects.get(bf_oid);
//   if (!oidSubscribers) {
//     return;
//   }
//   const sidSubscribers = oidSubscribers.get(bf_sid);
//   if (!sidSubscribers) {
//     return;
//   }
//   const classNameSubscribers = sidSubscribers.get(bf_t_class_name);
//   if (!classNameSubscribers) {
//     return;
//   }
//   logger.info(`Notifying ${classNameSubscribers.size} subscribers`);
//   classNameSubscribers.forEach((subject) =>
//     subject.next({
//       operation,
//       bfOid: bf_oid,
//       bfGid: bf_sid,
//       bfTClassName: bf_t_class_name,
//       bfTid: bf_tid,
//       sortValue: sort_value,
//       cursor: sortValueToCursor(sort_value),
//     })
//   );
// }

// function respondToNotification(message: NotificationResponseMessage) {
//   logger.debug(`Received notification: `, message);
//   const { operation, bf_gid, bf_oid, bf_sid, bf_t_class_name } = JSON.parse(
//     message.payload,
//   );
//   if (bf_sid && bf_t_class_name) {
//     return respondToConnectionChangeNotification(message);
//   }
//   const oidSubscribers = bfModelUpdateSubjects.get(bf_oid);
//   if (oidSubscribers) {
//     const gidSubjects = oidSubscribers.get(bf_gid);
//     if (gidSubjects) {
//       gidSubjects.forEach((subject) =>
//         subject.next({ operation, bfGid: bf_gid, bfOid: bf_oid })
//       );
//     }
//   }
// }

// let areNotificationsInitialized = false;
// async function initializeSubscriptions() {
//   if (areNotificationsInitialized) {
//     logger.debug("Notifications are already configured");
//     return;
//   }
//   areNotificationsInitialized = true;
//   const client = await pool.connect();
//   client.on("end", () => {
//     logger.debug("Client disconnected");
//   });
//   client.on("error", (error) => {
//     logger.error("Client error", error);
//   })
//   await client.connect();
//   // @ts-expect-error this must be out of date or something... not sure why it doesn't know about notif type
//   client.on("notification", respondToNotification);
//   await client.query("LISTEN item_changes");
//   logger.info("Notifications configured.");
// }

// export function bfSubscribeToItemChanges(bfOid: BfOid, bfGid: BfGid) {
//   if (!areNotificationsInitialized) {
//     initializeSubscriptions();
//   }
//   if (!bfModelUpdateSubjects.has(bfOid)) {
//     bfModelUpdateSubjects.set(bfOid, new Map());
//   }
//   const oidSubscribers = bfModelUpdateSubjects.get(bfOid)!;
//   if (!oidSubscribers.has(bfGid)) {
//     oidSubscribers.set(bfGid, new Set());
//   }
//   const gidSubjects = oidSubscribers.get(bfGid)!;
//   const subject = new Subject<BfModelUpdateNotification>();
//   gidSubjects.add(subject);
//   // send a first one so the listener gets something immediately.
//   setTimeout(() => {
//     subject.next({ operation: "UPDATE", bfGid, bfOid });
//   }, 0);
//   return observableToAsyncIterable<BfModelUpdateNotification>(
//     subject.asObservable(),
//   );
// }

// export function bfSubscribeToConnectionChanges(
//   bfOid: BfOid,
//   bfSid: BfSid,
//   bfTClassName: BfClassName,
// ) {
//   if (!areNotificationsInitialized) {
//     initializeSubscriptions();
//   }
//   if (!bfConnectionUpdateSubjects.has(bfOid)) {
//     bfConnectionUpdateSubjects.set(bfOid, new Map());
//   }
//   const oidSubscribers = bfConnectionUpdateSubjects.get(bfOid)!;
//   if (!oidSubscribers.has(bfSid)) {
//     oidSubscribers.set(bfSid, new Map());
//   }
//   const sidSubscribers = oidSubscribers.get(bfSid)!;
//   if (!sidSubscribers.has(bfTClassName)) {
//     sidSubscribers.set(bfTClassName, new Set());
//   }
//   const classNameSubscribers = sidSubscribers.get(bfTClassName)!;
//   const subject = new Subject<BfConnectionUpdateNotification>();
//   classNameSubscribers.add(subject);
//   return observableToAsyncIterable<BfConnectionUpdateNotification>(
//     subject.asObservable(),
//   );
// }

function rowToMetadata(row: Row): BfMetadata {
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

export async function bfGetItem<
  TProps extends Props,
>(bfOid: BfGid, bfGid: BfGid): Promise<DbItem<TProps> | null> {
  try {
    logger.trace("bfGetItem", bfOid, bfGid);
    const rows =
      await sql`SELECT * FROM bfdb WHERE bf_oid = ${bfOid} AND bf_gid = ${bfGid}` as Array<
        Row<TProps>
      >;

    if (rows.length === 0) {
      return null;
    }
    const firstRow = rows[0];
    const props: TProps = firstRow.props;
    logger.trace(firstRow);
    const metadata = rowToMetadata(firstRow);

    return { props, metadata };
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfGetItemByBfGid<
  TProps extends Props = Props,
>(
  bfGid: string,
  className?: string,
): Promise<DbItem<TProps> | null> {
  try {
    logger.trace("bfGetItemByBfGid", { bfGid, className });
    let queryPromise;
    if (className) {
      queryPromise =
        sql`SELECT * FROM bfdb WHERE bf_gid = ${bfGid} AND class_name = ${className}`;
    } else {
      queryPromise = sql`SELECT * FROM bfdb WHERE bf_gid = ${bfGid}`;
    }
    const rows = await queryPromise as Array<Row>;
    if (rows.length === 0) {
      return null;
    }
    const firstRow = rows[0];
    const props = firstRow.props as TProps;
    logger.trace(props);
    const metadata = rowToMetadata(firstRow);
    return { props, metadata };
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfGetItemsByBfGid<
  TProps extends Props = Props,
>(
  bfGids: Array<string>,
  className?: string,
): Promise<Array<DbItem<TProps>>> {
  try {
    logger.trace("bfGetItemsByBfGid", { bfGids, className });
    let queryPromise;
    if (className) {
      queryPromise =
        sql`SELECT * FROM bfdb WHERE bf_gid = ANY(${bfGids}) AND class_name = ${className}`;
    } else {
      queryPromise = sql`SELECT * FROM bfdb WHERE bf_gid = ANY(${bfGids})`;
    }
    const rows = await queryPromise as Array<Row>;
    return rows.map((row) => {
      const props = row.props as TProps;
      const metadata = rowToMetadata(row);
      return { props: props, metadata };
    });
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfPutItem<
  TProps extends Props = Props,
>(
  itemProps: TProps,
  itemMetadata: BfMetadata,
): Promise<void> {
  logger.trace({ itemProps, itemMetadata });

  const sortValue = Date.now();

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
    await sql`
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
      `bfPutItem: Successfully inserted or updated item with ${
        JSON.stringify(itemMetadata)
      }`,
    );
  } catch (e) {
    logger.error("Error in bfPutItem:", e);
    logger.trace(e);
    throw e;
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
    const rows = await sql`
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
    const rows = await sql`
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
  metadataToQuery: Partial<BfMetadata>,
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
    const query = await sql(
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
      const rows = await sql(query, variables) as Array<Row<TProps>>;

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

export function bfQueryItems<
  TProps extends Props = Props,
  TMetadata extends BfMetadata = BfMetadataDefault,
>(
  metadataToQuery: Partial<TMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<string>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: keyof Row = "sort_value",
): Promise<Array<DbItem<TProps>>> {
  logger.debug({
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  });

  return bfQueryItemsUnified(
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

export function bfQueryItemsWithSizeLimit<
  TProps extends Props = Props,
  TMetadata extends BfMetadata = BfMetadataDefault,
>(
  metadataToQuery: Partial<TMetadata>,
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

export async function bfDeleteItem(bfOid: BfGid, bfGid: BfGid): Promise<void> {
  try {
    logger.debug("bfDeleteItem", { bfOid, bfGid });
    await sql`
      DELETE FROM bfdb
      WHERE bf_oid = ${bfOid} AND bf_gid = ${bfGid}
    `;
    logger.debug(`Deleted item with bfOid: ${bfOid} and bfGid: ${bfGid}`);
  } catch (e) {
    logger.error(e);
    throw new BfErrorDb(`Failed to delete item ${bfGid} from the database`);
  }
}

// export async function bfQueryItemsForGraphQLConnection<
//   TProps extends Props = Props,
//   TMetadata extends BfBaseModelMetadata = BfBaseModelMetadata,
// >(
//   metadata: Partial<TMetadata>,
//   props: Partial<TProps> = {},
//   connectionArgs: ConnectionArguments,
//   bfGids: Array<string>,
// ): Promise<ConnectionInterface<DbItem<TProps>> & { count: number }> {
//   logger.debug({ metadata, props, connectionArgs });
//   const { first, last, after, before } = connectionArgs;

//   let orderDirection: "ASC" | "DESC" = "ASC";
//   let cursorValue: number | undefined;
//   let limit: number = 10;

//   if (first != undefined) {
//     orderDirection = "ASC";
//     limit = first + 1; // Fetch one extra for next page check
//     if (after) {
//       cursorValue = cursorToSortValue(after);
//     }
//   } else if (last != undefined) {
//     orderDirection = "DESC";
//     limit = last + 1; // Fetch one extra for previous page check
//     if (before) {
//       cursorValue = cursorToSortValue(before);
//     }
//   }

//   const results = await bfQueryItemsUnified<TProps, TMetadata>(
//     metadata,
//     props,
//     bfGids,
//     orderDirection,
//     "sort_value",
//     {
//       useSizeLimit: false,
//       cursorValue,
//       batchSize: 4,
//       totalLimit: limit,
//     },
//   );

//   const edges: EdgeRecords<DbItem<TProps>> = results.map((
//     item,
//   ) => ({
//     cursor: sortValueToCursor(item.metadata.sortValue),
//     node: item as DbItem<TProps>,
//   }));

//   let hasNextPage = false;
//   let hasPreviousPage = false;

//   if (first != undefined && edges.length > first) {
//     hasNextPage = true;
//     edges.pop(); // Remove the extra item
//   } else if (last != undefined && edges.length > last) {
//     hasPreviousPage = true;
//     edges.shift(); // Remove the extra item from the beginning
//   }

//   const pageInfo: PageInfo = {
//     startCursor: edges.length > 0 ? edges[0].cursor : null,
//     endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
//     hasNextPage,
//     hasPreviousPage,
//   };

//   const arrayWithEmptyElements = await bfQueryItemsUnified<TProps, TMetadata>(
//     metadata,
//     props,
//     bfGids,
//     orderDirection,
//     "sort_value",
//     {
//       countOnly: true,
//     },
//   );
//   const count = arrayWithEmptyElements.length;
//   return {
//     edges,
//     pageInfo,
//     count,
//   };
// }

// // Function to convert sortValue to base64 cursor
// export function sortValueToCursor(sortValue: number = Date.now()): string {
//   // Convert number to string and then Uint8Array
//   const uint8Array = new TextEncoder().encode(sortValue.toString());
//   // Convert Uint8Array to base64
//   return btoa(String.fromCharCode(...uint8Array));
// }

// // Function to convert base64 cursor back to sortValue
// function cursorToSortValue(cursor: string): number {
//   // Convert base64 to string
//   const decodedString = atob(cursor);
//   // Convert string to Uint8Array
//   const uint8Array = new Uint8Array(
//     [...decodedString].map((char) => char.charCodeAt(0)),
//   );
//   // Decode Uint8Array to original string and convert to number
//   return parseInt(new TextDecoder().decode(uint8Array), 10);
// }

export async function CLEAR_FOR_DEBUGGING() {
  if (getConfigurationVariable("BF_ENV") === "DEVELOPMENT") {
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
}
