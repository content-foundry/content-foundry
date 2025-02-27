
import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { neon } from "@neondatabase/serverless";
import { BfErrorDb } from "packages/bfDb/classes/BfErrorDb.ts";
import { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";

const logger = getLogger(import.meta);

export class PostgresBackend implements DatabaseBackend {
  private sql: ReturnType<typeof neon> | null = null;

  private getSql() {
    if (this.sql) {
      return this.sql;
    }

    const databaseUrl = getConfigurationVariable("DATABASE_URL");
    if (!databaseUrl) {
      throw new BfErrorDb("DATABASE_URL is not set");
    }
    
    this.sql = neon(databaseUrl);
    return this.sql;
  }

  async initialize(): Promise<void> {
    const sql = this.getSql();
    try {
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
      
      await sql`
      CREATE OR REPLACE FUNCTION notify_item_change() RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify(
          'item_changes',
          json_build_object(
            'operation', TG_OP,
            'bf_gid', NEW.bf_gid,
            'bf_oid', NEW.bf_oid,
            'bf_sid', NEW.bf_sid,
            'bf_tid', NEW.bf_tid,
            'bf_s_class_name', NEW.bf_s_class_name,
            'bf_t_class_name', NEW.bf_t_class_name,
            'sort_value', NEW.sort_value
          )::text
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      `;
      
      await sql`
      CREATE TRIGGER item_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON bfdb
      FOR EACH ROW EXECUTE FUNCTION notify_item_change();
      `;
      
      logger.info("PostgreSQL schema created");
      
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
        await sql(`CREATE INDEX IF NOT EXISTS idx_${index} ON bfdb(${index})`);
      }
      
      logger.info("PostgreSQL indexes created", indexes);
    } finally {
      // Keep connection open
    }
  }

  async putItem(
    className: string,
    id: BfGid,
    props: Record<string, unknown>,
    sortValue: number,
    s_className?: string,
    sid?: BfGid,
    t_className?: string,
    tid?: BfGid,
  ): Promise<void> {
    const sql = this.getSql();
    const now = new Date().toISOString();
    
    await sql`
      INSERT INTO bfdb (
        class_name, bf_gid, last_updated, created_at, bf_oid, bf_cid,
        bf_s_class_name, bf_sid, bf_t_class_name, bf_tid, sort_value, props
      ) VALUES (
        ${className}, ${id.toString()}, ${now}, ${now}, ${id.toString()}, ${className},
        ${s_className || null}, ${sid?.toString() || null}, ${t_className || null}, ${tid?.toString() || null},
        ${sortValue}, ${JSON.stringify(props)}
      )
      ON CONFLICT (bf_gid) DO UPDATE SET
        last_updated = ${now},
        props = ${JSON.stringify(props)},
        sort_value = ${sortValue},
        bf_s_class_name = ${s_className || null},
        bf_sid = ${sid?.toString() || null},
        bf_t_class_name = ${t_className || null},
        bf_tid = ${tid?.toString() || null}
    `;
  }

  async queryItems(
    className: string,
    query: Record<string, unknown>,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDescending?: boolean;
    } = {},
  ): Promise<Array<{
    id: BfGid;
    props: Record<string, unknown>;
    sortValue: number;
    s_className?: string;
    sid?: BfGid;
    t_className?: string;
    tid?: BfGid;
  }>> {
    const sql = this.getSql();
    
    // Build query conditions
    let conditions = sql`class_name = ${className}`;
    
    for (const [key, value] of Object.entries(query)) {
      if (key === "bf_sid" || key === "bf_tid") {
        conditions = sql`${conditions} AND ${sql.unsafe(key)} = ${value}`;
      } else if (key === "bf_s_class_name" || key === "bf_t_class_name") {
        conditions = sql`${conditions} AND ${sql.unsafe(key)} = ${value}`;
      } else {
        conditions = sql`${conditions} AND props->>${key} = ${String(value)}`;
      }
    }
    
    // Build order by clause
    let orderBy = sql`sort_value`;
    if (options.orderBy) {
      orderBy = sql.unsafe(`${options.orderBy}`);
    }
    
    const direction = options.orderDescending ? sql`DESC` : sql`ASC`;
    
    // Build limit and offset
    const limit = options.limit ? sql`LIMIT ${options.limit}` : sql``;
    const offset = options.offset ? sql`OFFSET ${options.offset}` : sql``;
    
    const result = await sql`
      SELECT bf_gid, props, sort_value, bf_s_class_name, bf_sid, bf_t_class_name, bf_tid
      FROM bfdb
      WHERE ${conditions}
      ORDER BY ${orderBy} ${direction}
      ${limit} ${offset}
    `;
    
    return result.map((item) => ({
      id: item.bf_gid as unknown as BfGid,
      props: item.props,
      sortValue: item.sort_value,
      s_className: item.bf_s_class_name,
      sid: item.bf_sid as unknown as BfGid | undefined,
      t_className: item.bf_t_class_name,
      tid: item.bf_tid as unknown as BfGid | undefined,
    }));
  }

  async getItem(
    className: string,
    id: BfGid,
  ): Promise<{
    id: BfGid;
    props: Record<string, unknown>;
    sortValue: number;
    s_className?: string;
    sid?: BfGid;
    t_className?: string;
    tid?: BfGid;
  } | null> {
    const sql = this.getSql();
    
    const result = await sql`
      SELECT bf_gid, props, sort_value, bf_s_class_name, bf_sid, bf_t_class_name, bf_tid
      FROM bfdb
      WHERE class_name = ${className} AND bf_gid = ${id.toString()}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const item = result[0];
    return {
      id: item.bf_gid as unknown as BfGid,
      props: item.props,
      sortValue: item.sort_value,
      s_className: item.bf_s_class_name,
      sid: item.bf_sid as unknown as BfGid | undefined,
      t_className: item.bf_t_class_name,
      tid: item.bf_tid as unknown as BfGid | undefined,
    };
  }

  async deleteItem(className: string, id: BfGid): Promise<void> {
    const sql = this.getSql();
    
    await sql`
      DELETE FROM bfdb
      WHERE class_name = ${className} AND bf_gid = ${id.toString()}
    `;
  }
}
