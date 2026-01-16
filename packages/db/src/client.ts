import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import { DrizzlePostgresCache } from "./cache-drizzle";
// biome-ignore lint/performance/noNamespaceImport: valid import
import * as schema from "./schema";

const sql = postgres(env.DATABASE_URL, {
  max: 5,
});

const cache = new DrizzlePostgresCache(sql, {
  defaultTtlSeconds: 60,
  global: true,
});

export const db = drizzle(sql, {
  schema,
  casing: "snake_case",
  cache,
});
