import { pgTable, serial, text, bigint } from 'drizzle-orm/pg-core';

export const postbackProfiles = pgTable("postback_profiles", {
  id: serial("id").primaryKey(),
  ownerScope: text("owner_scope").$type<"owner" | "advertiser" | "partner">().notNull(),
  ownerId: bigint("owner_id", { mode: "number" }).notNull(),
  scopeType: text("scope_type").$type<"global" | "campaign" | "offer" | "flow">().notNull(),
  scopeId: bigint("scope_id", { mode: "number" }),
  name: text("name").notNull(),
});