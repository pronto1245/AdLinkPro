import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

// System-related enums
export const domainStatusEnum = pgEnum('domain_status', ['pending', 'active', 'inactive', 'suspended', 'expired']);
export const domainTypeEnum = pgEnum('domain_type', ['main', 'redirect', 'tracking', 'landing']);

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  permissions: jsonb("permissions").notNull(), // Array of permissions
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Tokens table
export const apiTokens = pgTable("api_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  permissions: jsonb("permissions"), // Array of allowed permissions
  ipWhitelist: jsonb("ip_whitelist"), // Array of allowed IPs
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").notNull(), // Array of system events
  secret: text("secret"), // For signature verification
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings for global configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").notNull(), // fraud, finance, general, etc.
  isPublic: boolean("is_public").default(false), // Can non-admin users see this setting?
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blacklist for fraud prevention
export const blacklist = pgTable("blacklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // ip, clickid, subid, device_id, etc.
  value: text("value").notNull(),
  reason: text("reason"),
  addedBy: varchar("added_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration
});

// Custom domains
export const customDomains = pgTable("custom_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: varchar("domain", { length: 255 }).notNull(),
  advertiserId: varchar("advertiser_id", { length: 255 }).notNull().references(() => users.id),
  type: domainTypeEnum("type").notNull(),
  status: domainStatusEnum("status").notNull().default('pending'),
  verificationValue: varchar("verification_value", { length: 255 }).notNull(),
  targetValue: varchar("target_value", { length: 255 }),
  errorMessage: text("error_message"),
  lastChecked: timestamp("last_checked"),
  nextCheck: timestamp("next_check"),
  // SSL Certificate fields
  sslStatus: varchar("ssl_status", { length: 50 }).default('none'), // none, pending, issued, expired, failed
  sslCertificate: text("ssl_certificate"),
  sslPrivateKey: text("ssl_private_key"),
  sslValidUntil: timestamp("ssl_valid_until"),
  sslIssuer: varchar("ssl_issuer", { length: 255 }),
  sslErrorMessage: text("ssl_error_message"),
  isActive: boolean("is_active").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  advertiser: one(users, {
    fields: [apiTokens.advertiserId],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const blacklistRelations = relations(blacklist, ({ one }) => ({
  addedByUser: one(users, {
    fields: [blacklist.addedBy],
    references: [users.id],
  }),
}));

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  advertiser: one(users, {
    fields: [customDomains.advertiserId],
    references: [users.id],
  }),
}));

// Schema validations
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export const insertApiTokenSchema = createInsertSchema(apiTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertBlacklistSchema = createInsertSchema(blacklist).omit({
  id: true,
  createdAt: true,
});

export const insertCustomDomainSchema = createInsertSchema(customDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type Blacklist = typeof blacklist.$inferSelect;
export type InsertBlacklist = z.infer<typeof insertBlacklistSchema>;
export type CustomDomain = typeof customDomains.$inferSelect;
export type InsertCustomDomain = z.infer<typeof insertCustomDomainSchema>;