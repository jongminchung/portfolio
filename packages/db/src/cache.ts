import { eq, sql } from "drizzle-orm";
import { decodeValue, encodeValue } from "./cache-core";
import { db } from "./client";
import { queryCache } from "./schema/cache.schema";

export const ensureCacheTable = async (): Promise<void> => {
  await db.execute(sql`
    create unlogged table if not exists query_cache (
      key text primary key,
      value bytea not null,
      expires_at timestamptz not null,
      updated_at timestamptz not null
    )
  `);

  await db.execute(sql`
    alter table query_cache set unlogged
  `);

  await db.execute(sql`
    create index if not exists query_cache_expires_at_idx
      on query_cache (expires_at)
  `);
};

export const getCache = async (key: string): Promise<unknown | null> => {
  const now = new Date();
  const rows = await db
    .select({
      value: queryCache.value,
      expiresAt: queryCache.expiresAt,
    })
    .from(queryCache)
    .where(eq(queryCache.key, key))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (!row) {
    return null;
  }

  if (row.expiresAt <= now) {
    await db.delete(queryCache).where(eq(queryCache.key, key));
    return null;
  }

  return decodeValue(row.value);
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> => {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const expiresAtValue = expiresAt.toISOString();
  const encodedValue = encodeValue(value);

  await db.execute(sql`
    insert into query_cache (key, value, expires_at, updated_at)
    values (${key}, ${encodedValue}, ${expiresAtValue}, now())
    on conflict (key)
    do update set
      value = excluded.value,
      expires_at = excluded.expires_at,
      updated_at = now()
  `);
};

export const delCache = async (key: string): Promise<void> => {
  await db.delete(queryCache).where(eq(queryCache.key, key));
};

export const purgeExpiredCache = async (limit: number): Promise<number> => {
  const result = await db.execute(sql`
    delete from query_cache
    where key in (
      select key from query_cache
      where expires_at < now()
      limit ${limit}
    )
    returning key
  `);

  const rows = "rows" in result ? result.rows : result;
  return Array.isArray(rows) ? rows.length : 0;
};

export const deleteExpiredBatch = async (limit: number): Promise<number> => {
  const result = await db.execute(sql`
    delete from query_cache
    where key in (
      select key from query_cache
      where expires_at < now()
      limit ${limit}
    )
    returning key
  `);

  const rows = "rows" in result ? result.rows : result;
  return Array.isArray(rows) ? rows.length : 0;
};
