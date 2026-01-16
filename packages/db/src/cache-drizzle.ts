import type { MutationOption } from "drizzle-orm/cache/core";
import { Cache } from "drizzle-orm/cache/core";
import type { CacheConfig } from "drizzle-orm/cache/core/types";
import { entityKind } from "drizzle-orm/entity";
import type { Sql } from "postgres";
import { DEFAULT_TTL_SECONDS, decodeValue, encodeValue } from "./cache-core";

const DRIZZLE_CACHE_PREFIX = "__drizzle__:";
const AUTO_PREFIX = `${DRIZZLE_CACHE_PREFIX}auto:`;
const MANUAL_PREFIX = `${DRIZZLE_CACHE_PREFIX}manual:`;
const TAG_PREFIX = `${DRIZZLE_CACHE_PREFIX}tag:`;

const getCacheKey = (key: string, isTag: boolean, autoInvalidate: boolean) => {
  const autoPrefix = autoInvalidate ? AUTO_PREFIX : MANUAL_PREFIX;
  const tagPrefix = isTag ? TAG_PREFIX : "";
  return `${autoPrefix}${tagPrefix}${key}`;
};

export type DrizzleCacheConfig = {
  defaultTtlSeconds?: number;
  global?: boolean;
};

export class DrizzlePostgresCache extends Cache {
  static readonly [entityKind] = "DrizzlePostgresCache";

  private readonly client: Sql;
  private readonly defaultTtlSeconds: number;
  private readonly useGlobally: boolean;

  constructor(client: Sql, config?: DrizzleCacheConfig) {
    super();
    this.client = client;
    this.defaultTtlSeconds = config?.defaultTtlSeconds ?? DEFAULT_TTL_SECONDS;
    this.useGlobally = config?.global ?? false;
  }

  strategy(): "explicit" | "all" {
    return this.useGlobally ? "all" : "explicit";
  }

  async get(
    key: string,
    _tables: string[],
    isTag: boolean,
    isAutoInvalidate?: boolean
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<any[] | undefined> {
    const autoInvalidate = isAutoInvalidate ?? true;
    const cacheKey = getCacheKey(key, isTag, autoInvalidate);
    const rows = (await this.client`
      select value, expires_at
      from query_cache
      where key = ${cacheKey}
      limit 1
    `) as { value: Uint8Array; expires_at: string }[];

    if (!rows.length) {
      return;
    }

    const row = rows[0];
    if (!row) {
      return;
    }

    const expiresAt = new Date(row.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      await this.client`
        delete from query_cache
        where key = ${cacheKey}
      `;
      return;
    }

    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return decodeValue(row.value) as any[];
  }

  // biome-ignore lint/nursery/useMaxParams: <TODO>
  async put(
    key: string,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    response: any,
    tables: string[],
    isTag: boolean,
    config?: CacheConfig
  ): Promise<void> {
    const ttlMs = config?.px
      ? config.px
      : (config?.ex ?? this.defaultTtlSeconds) * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);
    const expiresAtValue = expiresAt.toISOString();
    const autoInvalidate = tables.length > 0;
    const cacheKey = getCacheKey(key, isTag, autoInvalidate);
    const value = encodeValue(response);

    await this.client`
      insert into query_cache (key, value, expires_at, updated_at)
      values (${cacheKey}, ${value}, ${expiresAtValue}, now())
      on conflict (key)
      do update set
        value = excluded.value,
        expires_at = excluded.expires_at,
        updated_at = now()
    `;
  }

  async onMutate(_params: MutationOption): Promise<void> {
    await this.client`
      delete from query_cache
      where key like ${`${AUTO_PREFIX}%`}
    `;
  }
}
