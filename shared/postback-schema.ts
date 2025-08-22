import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, offers } from "./schema";

// Additional enums for postback system
export const ownerScopeEnum = pgEnum('owner_scope', ['owner', 'advertiser', 'partner']);
export const postbackScopeTypeEnum = pgEnum('postback_scope_type', ['global', 'campaign', 'offer', 'flow']);
export const postbackMethodEnum = pgEnum('postback_method', ['GET', 'POST']);
export const postbackIdParamEnum = pgEnum('postback_id_param', ['subid', 'clickid']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'success', 'failed', 'retrying']);
export const eventTypeEnum = pgEnum('event_type', ['open', 'lp_click', 'reg', 'deposit', 'sale', 'lead', 'lp_leave']);

// Sub2 configuration
export const sub2Config = {
  allowedKeys: [
    'geo', 'dev', 'src', 'adset', 'lang', 'tier', 'risk', 'abtest', 
    'cohort', 'pp', 'fpr', 'anti', 'seg'
  ],
  maxPairs: 8,
  maxLength: 200
};

// Enhanced clicks table for comprehensive tracking
export const trackingClicks = pgTable("tracking_clicks", {
  clickid: text("clickid").primaryKey(),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  campaignId: varchar("campaign_id"),
  offerId: varchar("offer_id").references(() => offers.id),
  flowId: varchar("flow_id"),
  site: text("site"),
  referrer: text("referrer"),
  
  // Sub parameters
  sub1: text("sub1"),
  sub2Raw: text("sub2_raw"), // Raw sub2 string as received
  sub2Map: jsonb("sub2_map"), // Parsed key-value pairs
  sub3: text("sub3"),
  sub4: text("sub4"),
  sub5: text("sub5"),
  sub6: text("sub6"),
  sub7: text("sub7"),
  sub8: text("sub8"),
  sub9: text("sub9"),
  sub10: text("sub10"),
  
  // UTM parameters
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  utmMedium: text("utm_medium"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  
  // Client and server data
  ip: text("ip"),
  countryIso: text("country_iso"),
  region: text("region"),
  city: text("city"),
  isp: text("isp"),
  operator: text("operator"),
  isProxy: boolean("is_proxy").default(false),
  
  userAgent: text("user_agent"),
  browserName: text("browser_name"),
  browserVersion: text("browser_version"),
  osName: text("os_name"),
  osVersion: text("os_version"),
  deviceModel: text("device_model"),
  deviceType: text("device_type"),
  connection: text("connection"),
  lang: text("lang"),
  
  ts: timestamp("ts").defaultNow(),
});

// Enhanced events table for tracking conversions
export const trackingEvents = pgTable("tracking_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickid: text("clickid").notNull().references(() => trackingClicks.clickid),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  type: eventTypeEnum("type").notNull(),
  revenue: decimal("revenue", { precision: 18, scale: 6 }),
  currency: text("currency"),
  txid: text("txid"),
  timeOnPageMs: integer("time_on_page_ms"),
  ts: timestamp("ts").defaultNow(),
});

// Comprehensive postback profiles configuration
export const postbackProfiles = pgTable("postback_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerScope: ownerScopeEnum("owner_scope").notNull(), // 'owner', 'advertiser', 'partner'
  ownerId: varchar("owner_id").notNull().references(() => users.id), // ID владельца уровня
  scopeType: postbackScopeTypeEnum("scope_type").notNull(), // 'global', 'campaign', 'offer', 'flow'
  scopeId: varchar("scope_id"), // ID области (campaign/offer/flow), null для global
  
  name: text("name").notNull(),
  enabled: boolean("enabled").default(true),
  priority: integer("priority").default(100),
  
  // Endpoint configuration
  endpointUrl: text("endpoint_url").notNull(),
  method: postbackMethodEnum("method").notNull(),
  idParam: postbackIdParamEnum("id_param").notNull(), // 'subid' или 'clickid'
  
  // Authentication
  authQueryKey: text("auth_query_key"),
  authQueryVal: text("auth_query_val"),
  authHeaderName: text("auth_header_name"),
  authHeaderVal: text("auth_header_val"),
  
  // Status mapping and parameters
  statusMap: jsonb("status_map").default('{}'), // {reg: 'lead', deposit: 'sale'}
  paramsTemplate: jsonb("params_template").default('{}'), // Mustache template
  urlEncode: boolean("url_encode").default(true),
  
  // HMAC configuration
  hmacEnabled: boolean("hmac_enabled").default(false),
  hmacSecret: text("hmac_secret"),
  hmacPayloadTpl: text("hmac_payload_tpl"),
  hmacParamName: text("hmac_param_name"),
  
  // Retry configuration
  retries: integer("retries").default(5),
  timeoutMs: integer("timeout_ms").default(4000),
  backoffBaseSec: integer("backoff_base_sec").default(2),
  
  // Filters
  filterRevenueGt0: boolean("filter_revenue_gt0").default(false),
  filterCountryWhitelist: text("filter_country_whitelist").array(),
  filterCountryBlacklist: text("filter_country_blacklist").array(),
  filterExcludeBots: boolean("filter_exclude_bots").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Detailed postback delivery logs
export const postbackDeliveries = pgTable("postback_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => postbackProfiles.id, { onDelete: 'cascade' }),
  eventId: varchar("event_id").references(() => trackingEvents.id),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  clickid: text("clickid").notNull(),
  
  // Delivery attempt info
  attempt: integer("attempt").notNull(),
  maxAttempts: integer("max_attempts").notNull(),
  
  // Request details
  requestMethod: text("request_method").notNull(),
  requestUrl: text("request_url").notNull(),
  requestBody: text("request_body"),
  requestHeaders: jsonb("request_headers"),
  
  // Response details
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  error: text("error"),
  durationMs: integer("duration_ms"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Queue for managing postback delivery tasks
export const deliveryQueue = pgTable("delivery_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => postbackProfiles.id),
  eventId: varchar("event_id").notNull().references(() => trackingEvents.id),
  clickid: text("clickid").notNull(),
  payload: jsonb("payload").notNull(),
  
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(5),
  status: deliveryStatusEnum("status").default('pending'),
  
  scheduledAt: timestamp("scheduled_at").defaultNow(),
  lastAttemptAt: timestamp("last_attempt_at"),
  nextRetryAt: timestamp("next_retry_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const trackingClicksRelations = relations(trackingClicks, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [trackingClicks.advertiserId],
    references: [users.id],
  }),
  partner: one(users, {
    fields: [trackingClicks.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [trackingClicks.offerId],
    references: [offers.id],
  }),
  events: many(trackingEvents),
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  click: one(trackingClicks, {
    fields: [trackingEvents.clickid],
    references: [trackingClicks.clickid],
  }),
  advertiser: one(users, {
    fields: [trackingEvents.advertiserId],
    references: [users.id],
  }),
  partner: one(users, {
    fields: [trackingEvents.partnerId],
    references: [users.id],
  }),
}));

export const postbackProfilesRelations = relations(postbackProfiles, ({ one, many }) => ({
  owner: one(users, {
    fields: [postbackProfiles.ownerId],
    references: [users.id],
  }),
  deliveries: many(postbackDeliveries),
}));

export const postbackDeliveriesRelations = relations(postbackDeliveries, ({ one }) => ({
  profile: one(postbackProfiles, {
    fields: [postbackDeliveries.profileId],
    references: [postbackProfiles.id],
  }),
  event: one(trackingEvents, {
    fields: [postbackDeliveries.eventId],
    references: [trackingEvents.id],
  }),
  advertiser: one(users, {
    fields: [postbackDeliveries.advertiserId],
    references: [users.id],
  }),
  partner: one(users, {
    fields: [postbackDeliveries.partnerId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const clickEventSchema = z.object({
  // Attribution (optional for click)
  campaign_id: z.string().optional(),
  source_id: z.string().optional(),
  flow_id: z.string().optional(),
  offer_id: z.string().optional(),
  landing_id: z.string().optional(),
  ad_campaign_id: z.string().optional(),
  external_id: z.string().optional(),
  creative_id: z.string().optional(),
  
  // Marketing
  referrer: z.string().optional(),
  site: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  // Subs
  sub1: z.string().optional(),
  sub2: z.string().max(sub2Config.maxLength).optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  sub6: z.string().optional(),
  sub7: z.string().optional(),
  sub8: z.string().optional(),
  sub9: z.string().optional(),
  sub10: z.string().optional(),
  
  // Client data
  user_agent: z.string(),
  lang: z.string().optional(),
  tz: z.string().optional(),
  screen: z.string().optional(), // WxH
  connection: z.string().optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  
  // Visitor tracking
  visitor_code: z.string().uuid().optional(),
  
  // Client timestamp
  ts_client: z.number().optional(),
});

export const conversionEventSchema = z.object({
  // Required
  clickid: z.string().max(64),
  visitor_code: z.string().uuid(),
  type: z.enum(['open', 'lp_click', 'reg', 'deposit', 'sale', 'lead', 'lp_leave']),
  
  // Revenue data
  revenue: z.number().optional(),
  currency: z.string().length(3).optional(),
  txid: z.string().optional(),
  
  // Special fields
  time_on_page_ms: z.number().optional(), // For lp_leave events
  
  // Client timestamp
  ts_client: z.number().optional(),
});

export const createPostbackProfileSchema = createInsertSchema(postbackProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePostbackProfileSchema = createPostbackProfileSchema.partial();

export type PostbackProfile = typeof postbackProfiles.$inferSelect;
export type CreatePostbackProfile = z.infer<typeof createPostbackProfileSchema>;
export type UpdatePostbackProfile = z.infer<typeof updatePostbackProfileSchema>;
// TrackingClick type moved to tracking-schema.ts to eliminate duplication
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type PostbackDelivery = typeof postbackDeliveries.$inferSelect;
export type ClickEvent = z.infer<typeof clickEventSchema>;
export type ConversionEvent = z.infer<typeof conversionEventSchema>;