import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, serial, bigint, numeric, char, smallint, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";

// Analytics-related enums
export const eventTypeEnum = pgEnum('event_type', ['open', 'lp_click', 'reg', 'deposit', 'sale', 'lead', 'lp_leave']);

// Clicks table for tracking system
export const clicks = pgTable("clicks", {
  clickid: text("clickid").primaryKey(), // Generated clickid (12-character random string)
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id), // NULL if no partner
  campaignId: varchar("campaign_id"), // Future campaigns table
  offerId: varchar("offer_id").references(() => offers.id),
  flowId: varchar("flow_id"), // Future flows table
  site: text("site"), // Landing page URL
  referrer: text("referrer"), // HTTP referrer
  
  // Sub parameters (sub1-sub10 standard + sub2 special handling)
  sub1: text("sub1"),
  sub2Raw: text("sub2_raw"), // Raw sub2 string (key-value|key2-value2)
  sub2Map: jsonb("sub2_map"), // Parsed sub2 as JSONB {"key":"value","key2":"value2"}
  sub3: text("sub3"),
  sub4: text("sub4"),
  sub5: text("sub5"),
  sub6: text("sub6"),
  sub7: text("sub7"),
  sub8: text("sub8"),
  sub9: text("sub9"),
  sub10: text("sub10"),
  sub11: text("sub11"),
  sub12: text("sub12"),
  sub13: text("sub13"),
  sub14: text("sub14"),
  sub15: text("sub15"),
  sub16: text("sub16"),
  
  // UTM parameters
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  utmMedium: text("utm_medium"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  
  // IP and geo data
  ip: text("ip"), // INET type in PostgreSQL, stored as text in Drizzle
  countryIso: text("country_iso"), // 2-letter country code
  region: text("region"), // State/region
  city: text("city"), // City name
  isp: text("isp"), // Internet service provider
  operator: text("operator"), // Mobile operator
  isProxy: boolean("is_proxy").default(false), // VPN/Proxy detection
  
  // User agent parsing
  userAgent: text("user_agent"), // Full user agent string
  browserName: text("browser_name"), // Chrome, Firefox, Safari, etc.
  browserVersion: text("browser_version"), // Browser version
  osName: text("os_name"), // Windows, macOS, iOS, Android, etc.
  osVersion: text("os_version"), // OS version
  deviceModel: text("device_model"), // Device model (iPhone 14, Samsung Galaxy S21, etc.)
  deviceType: text("device_type"), // mobile, tablet, desktop
  connection: text("connection"), // wifi, mobile, cable
  lang: text("lang"), // Accept-Language header
  
  // Timestamps
  ts: timestamp("ts").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickid: text("clickid").notNull().references(() => clicks.clickid),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  
  // Event type and data
  type: eventTypeEnum("type").notNull(), // open, lp_click, reg, deposit, sale, lead, lp_leave
  revenue: decimal("revenue", { precision: 18, scale: 6 }), // Up to 6 decimal places for crypto
  currency: text("currency").default('USD'), // 3-letter currency code
  txid: text("txid"), // Transaction ID for deduplication
  
  // Additional event data
  timeOnPageMs: integer("time_on_page_ms"), // Time on page in milliseconds for lp_leave event
  
  // Timestamps
  ts: timestamp("ts").defaultNow(),
}, (table) => ({
  // Unique constraint for idempotency: (clickid, type, coalesce(txid,''))
  uniqueEvent: sql`UNIQUE (clickid, type, COALESCE(txid, ''))`,
}));

// Enhanced postback and conversion tables with proper indexing
export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  advertiserId: bigint("advertiser_id", { mode: "number" }).notNull(),
  partnerId: bigint("partner_id", { mode: "number" }),
  campaignId: bigint("campaign_id", { mode: "number" }),
  offerId: bigint("offer_id", { mode: "number" }),
  flowId: bigint("flow_id", { mode: "number" }),

  clickid: text("clickid").notNull(),
  type: text("type").$type<"reg"|"purchase"|"rebill"|"refund"|"chargeback">().notNull(),
  txid: text("txid").notNull(),
  revenue: numeric("revenue", { precision: 18, scale: 6 }).default("0"),
  currency: char("currency", { length: 3 }),

  conversionStatus: text("conversion_status").$type<
    "initiated"|"pending"|"approved"|"declined"|"refunded"|"chargeback"|"duplicate"|"test"
  >().notNull(),

  statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).defaultNow().notNull(),

  antifraudLevel: text("antifraud_level").$type<"ok"|"soft"|"hard">(),
  antifraudScore: integer("antifraud_score"),
  antifraudReasons: jsonb("antifraud_reasons").$type<Record<string, unknown>>().default({}),

  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // Indexes for performance
  ix_conv_clickid: index("ix_conv_clickid").on(t.clickid),
  ix_conv_status: index("ix_conv_status").on(t.conversionStatus),
  ix_conv_advertiser: index("ix_conv_advertiser").on(t.advertiserId),
  ix_conv_partner: index("ix_conv_partner").on(t.partnerId),
  // Unique constraint
  uniqTx: { columns: [t.advertiserId, t.type, t.txid], unique: true },
}));

// Enhanced postback profiles
export const enhancedPostbackProfiles = pgTable("enhanced_postback_profiles", {
  id: serial("id").primaryKey(),
  ownerScope: text("owner_scope").$type<"owner"|"advertiser"|"partner">().notNull(),
  ownerId: bigint("owner_id", { mode: "number" }).notNull(),

  scopeType: text("scope_type").$type<"global"|"campaign"|"offer"|"flow">().notNull(),
  scopeId: bigint("scope_id", { mode: "number" }),

  name: text("name").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  priority: integer("priority").default(100).notNull(),

  endpointUrl: text("endpoint_url").notNull(),
  method: text("method").$type<"GET"|"POST">().notNull(),
  idParam: text("id_param").$type<"subid"|"clickid">().notNull(),
  authQueryKey: text("auth_query_key"),
  authQueryVal: text("auth_query_val"),
  authHeaderName: text("auth_header_name"),
  authHeaderVal: text("auth_header_val"),

  paramsTemplate: jsonb("params_template").$type<Record<string, string>>().default({}).notNull(),
  statusMap: jsonb("status_map").$type<Record<string, Record<string, string>>>().default({}).notNull(),

  hmacEnabled: boolean("hmac_enabled").default(false).notNull(),
  hmacSecret: text("hmac_secret"),
  hmacPayloadTpl: text("hmac_payload_tpl"),
  hmacParamName: text("hmac_param_name"),

  retries: smallint("retries").default(5).notNull(),
  timeoutMs: integer("timeout_ms").default(4000).notNull(),
  backoffBaseSec: integer("backoff_base_sec").default(2).notNull(),

  filterRevenueGt0: boolean("filter_revenue_gt0").default(false).notNull(),
  filterExcludeFraudHard: boolean("filter_exclude_fraud_hard").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // Index for scope-based queries
  ix_pb_scope: index("ix_pb_scope").on(t.ownerScope, t.ownerId, t.scopeType),
  ix_pb_enabled: index("ix_pb_enabled").on(t.enabled),
}));

// Analytics data
export const analyticsData = pgTable("analytics_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  partnerId: varchar("partner_id").references(() => users.id),
  date: timestamp("date").notNull(),
  
  // Core metrics
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  leads: integer("leads").default(0),
  conversions: integer("conversions").default(0),
  
  // Financial metrics  
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default('0.00'),
  payout: decimal("payout", { precision: 15, scale: 2 }).default('0.00'),
  profit: decimal("profit", { precision: 15, scale: 2 }).default('0.00'),
  
  // Performance metrics
  cr: decimal("cr", { precision: 5, scale: 2 }).default('0.00'), // Conversion Rate
  epc: decimal("epc", { precision: 8, scale: 2 }).default('0.00'), // Earnings Per Click
  roi: decimal("roi", { precision: 5, scale: 2 }).default('0.00'), // Return on Investment
  
  // Additional data  
  geo: text("geo"),
  device: text("device"),
  trafficSource: text("traffic_source"),
  subId: text("sub_id"),
  clickId: text("click_id"),
  
  // Fraud detection
  fraudClicks: integer("fraud_clicks").default(0),
  botClicks: integer("bot_clicks").default(0),
  fraudScore: integer("fraud_score").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Click tracking and conversion data
export const conversionData = pgTable("conversion_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id").notNull().unique(),
  subId: text("sub_id"),
  
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  
  // Click data
  clickTime: timestamp("click_time").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  
  // Location and device
  country: text("country"),
  city: text("city"),
  device: text("device"),
  os: text("os"),
  browser: text("browser"),
  
  // Conversion data
  isConverted: boolean("is_converted").default(false),
  conversionTime: timestamp("conversion_time"),
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }),
  
  // Fraud flags
  isFraud: boolean("is_fraud").default(false),
  isBot: boolean("is_bot").default(false),
  riskScore: integer("risk_score").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const clicksRelations = relations(clicks, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [clicks.advertiserId],
    references: [users.id],
    relationName: 'advertiserClicks'
  }),
  partner: one(users, {
    fields: [clicks.partnerId],
    references: [users.id],
    relationName: 'partnerClicks'
  }),
  offer: one(offers, {
    fields: [clicks.offerId],
    references: [offers.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  click: one(clicks, {
    fields: [events.clickid],
    references: [clicks.clickid],
  }),
  advertiser: one(users, {
    fields: [events.advertiserId],
    references: [users.id],
    relationName: 'advertiserEvents'
  }),
  partner: one(users, {
    fields: [events.partnerId],
    references: [users.id],
    relationName: 'partnerEvents'
  }),
}));

export const analyticsDataRelations = relations(analyticsData, ({ one }) => ({
  advertiser: one(users, {
    fields: [analyticsData.advertiserId],
    references: [users.id],
    relationName: 'advertiserAnalytics'
  }),
  offer: one(offers, {
    fields: [analyticsData.offerId],
    references: [offers.id],
  }),
  partner: one(users, {
    fields: [analyticsData.partnerId],
    references: [users.id],
    relationName: 'partnerAnalytics'
  }),
}));

export const conversionDataRelations = relations(conversionData, ({ one }) => ({
  advertiser: one(users, {
    fields: [conversionData.advertiserId],
    references: [users.id],
    relationName: 'advertiserConversions'
  }),
  offer: one(offers, {
    fields: [conversionData.offerId],
    references: [offers.id],
  }),
  partner: one(users, {
    fields: [conversionData.partnerId],
    references: [users.id],
    relationName: 'partnerConversions'
  }),
}));

// Schema validations
export const insertClickSchema = createInsertSchema(clicks).omit({
  ts: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  ts: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversionDataSchema = createInsertSchema(conversionData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Click = typeof clicks.$inferSelect;
export type InsertClick = z.infer<typeof insertClickSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type EnhancedPostbackProfile = typeof enhancedPostbackProfiles.$inferSelect;
export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type ConversionData = typeof conversionData.$inferSelect;
export type InsertConversionData = z.infer<typeof insertConversionDataSchema>;