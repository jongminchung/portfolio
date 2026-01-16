import { customType, pgTable } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

export const queryCache = pgTable("query_cache", (t) => ({
  key: t.text().primaryKey().notNull(),
  value: bytea("value").notNull(),
  expiresAt: t.timestamp({ withTimezone: true }).notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).notNull(),
}));
