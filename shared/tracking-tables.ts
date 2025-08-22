import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { eventTypeEnum } from "./enums";
import { users } from "./user-tables";
import { offers } from "./offer-tables";

// Tracking Links table
export const trackingLinks = pgTable("tracking_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  url: text("url").notNull(),
  subId: text("sub_id"), // Partner's sub ID for tracking
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tracking Clicks table (comprehensive tracking with all parameters)
export const trackingClicks = pgTable("tracking_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id"), // Unique 12-character ID
  
  // IDs as strings (no foreign key constraints to avoid migration issues)
  advertiserId: varchar("advertiser_id"),
  offerId: varchar("offer_id"),
  partnerId: varchar("partner_id"),
  partnerNumber: text("partner_number"), // 8-character partner ID
  
  // Tracking link data
  trackingLinkId: varchar("tracking_link_id"), // Reference to tracking link used
  domain: text("domain"), // Tracking domain used
  
  // Click details
  clickTime: timestamp("click_time").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  
  // Geographic data
  country: text("country"),
  countryCode: text("country_code"), // ISO country code
  region: text("region"),
  city: text("city"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  timezone: text("timezone"),
  
  // Device and browser data
  device: text("device"), // mobile, desktop, tablet
  deviceModel: text("device_model"),
  deviceBrand: text("device_brand"),
  os: text("os"),
  osVersion: text("os_version"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  screenResolution: text("screen_resolution"),
  language: text("language"),
  
  // Network data
  isp: text("isp"), // Internet Service Provider
  connectionType: text("connection_type"), // wifi, cellular, etc.
  carrier: text("carrier"), // Mobile carrier if applicable
  
  // SubID parameters (sub1-sub16)
  sub1: text("sub_1"),
  sub2: text("sub_2"),
  sub3: text("sub_3"),
  sub4: text("sub_4"),
  sub5: text("sub_5"),
  sub6: text("sub_6"),
  sub7: text("sub_7"),
  sub8: text("sub_8"),
  sub9: text("sub_9"),
  sub10: text("sub_10"),
  sub11: text("sub_11"),
  sub12: text("sub_12"),
  sub13: text("sub_13"),
  sub14: text("sub_14"),
  sub15: text("sub_15"),
  sub16: text("sub_16"),
  
  // Traffic source data
  trafficSource: text("traffic_source"), // facebook, google, etc.
  campaign: text("campaign"),
  adGroup: text("ad_group"),
  creative: text("creative"),
  keyword: text("keyword"),
  placement: text("placement"),
  
  // Custom parameters
  customParams: jsonb("custom_params"), // Additional custom tracking parameters
  
  // Conversion data
  isConverted: boolean("is_converted").default(false),
  conversionTime: timestamp("conversion_time"),
  conversionType: text("conversion_type"), // lead, sale, registration, deposit
  conversionValue: decimal("conversion_value", { precision: 12, scale: 2 }),
  payout: decimal("payout", { precision: 12, scale: 2 }),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  
  // Fraud detection
  isFraud: boolean("is_fraud").default(false),
  isBot: boolean("is_bot").default(false),
  fraudScore: integer("fraud_score").default(0), // 0-100 fraud probability
  fraudReason: text("fraud_reason"),
  fraudRules: jsonb("fraud_rules"), // Applied fraud rules
  
  // Quality metrics
  timeOnSite: integer("time_on_site"), // seconds
  pageViews: integer("page_views").default(1),
  bounceRate: boolean("is_bounce").default(false),
  
  // Postback data
  postbackSent: boolean("postback_sent").default(false),
  postbackTime: timestamp("postback_time"),
  postbackStatus: text("postback_status"),
  postbackUrl: text("postback_url"),
  postbackResponse: text("postback_response"),
  
  // Attribution and tracking
  firstClick: boolean("is_first_click").default(false), // First click from this user
  sessionId: text("session_id"),
  fingerprint: text("fingerprint"), // Device fingerprint
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Statistics table
export const statistics = pgTable("statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  trackingLinkId: varchar("tracking_link_id").references(() => trackingLinks.id),
  date: timestamp("date").notNull().defaultNow(),
  
  // Basic metrics
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  leads: integer("leads").default(0), 
  sales: integer("sales").default(0),
  conversions: integer("conversions").default(0),
  
  // Financial metrics
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0.00"),
  payout: decimal("payout", { precision: 12, scale: 2 }).default("0.00"),
  
  // Performance metrics
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
  epc: decimal("epc", { precision: 8, scale: 2 }).default("0.00"), // Earnings Per Click
  
  // Geo and device info for aggregation
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ip: text("ip"),
});

// Daily statistics aggregation table
export const dailyStatistics = pgTable("daily_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  
  // IDs for filtering (no foreign keys)
  advertiserId: varchar("advertiser_id"),
  offerId: varchar("offer_id"),
  partnerId: varchar("partner_id"),
  
  // Breakdown dimensions
  country: text("country"),
  device: text("device"),
  trafficSource: text("traffic_source"),
  sub1: text("sub_1"),
  sub2: text("sub_2"),
  sub3: text("sub_3"),
  sub4: text("sub_4"),
  sub5: text("sub_5"),
  
  // Core metrics
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  impressions: integer("impressions").default(0),
  leads: integer("leads").default(0),
  conversions: integer("conversions").default(0),
  
  // Financial metrics
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default('0.00'),
  payout: decimal("payout", { precision: 15, scale: 2 }).default('0.00'),
  profit: decimal("profit", { precision: 15, scale: 2 }).default('0.00'),
  
  // Performance metrics
  cr: decimal("cr", { precision: 5, scale: 2 }).default('0.00'), // Conversion Rate
  epc: decimal("epc", { precision: 8, scale: 2 }).default('0.00'), // Earnings Per Click
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default('0.00'), // Click Through Rate
  roi: decimal("roi", { precision: 5, scale: 2 }).default('0.00'), // Return on Investment
  
  // Quality metrics
  avgTimeOnSite: integer("avg_time_on_site").default(0),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default('0.00'),
  
  // Fraud metrics
  fraudClicks: integer("fraud_clicks").default(0),
  botClicks: integer("bot_clicks").default(0),
  fraudRate: decimal("fraud_rate", { precision: 5, scale: 2 }).default('0.00'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hourly statistics for real-time analytics
export const hourlyStatistics = pgTable("hourly_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hour: timestamp("hour").notNull(), // Hour timestamp
  
  // IDs for filtering (no foreign keys)
  advertiserId: varchar("advertiser_id"),
  offerId: varchar("offer_id"),
  partnerId: varchar("partner_id"),
  
  // Breakdown dimensions
  country: text("country"),
  device: text("device"),
  trafficSource: text("traffic_source"),
  
  // Core metrics
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0.00'),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table for tracking various conversion events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id").notNull(),
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  type: eventTypeEnum("type").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  currency: text("currency").default('USD'),
  data: jsonb("data"), // Additional event data
  ip: text("ip"),
  userAgent: text("user_agent"),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ts: timestamp("ts").defaultNow(),
});

// Legacy clicks table (keeping for backward compatibility)
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  trackingLinkId: varchar("tracking_link_id").references(() => trackingLinks.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  referrer: text("referrer"),
  
  // SubID parameters
  sub1: text("sub1"),
  sub2: text("sub2"),
  sub3: text("sub3"),
  sub4: text("sub4"),
  sub5: text("sub5"),
  
  // Conversion data
  isConverted: boolean("is_converted").default(false),
  conversionTime: timestamp("conversion_time"),
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }),
  
  // Fraud flags
  isFraud: boolean("is_fraud").default(false),
  isBot: boolean("is_bot").default(false),
  fraudReason: text("fraud_reason"),
  
  // Postback tracking
  postbackSent: boolean("postback_sent").default(false),
  postbackTime: timestamp("postback_time"),
  postbackStatus: text("postback_status"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversion Data table for detailed conversion tracking
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
  conversionTime: timestamp("conversion_time"),
  conversionType: text("conversion_type"), // lead, sale, registration, etc.
  conversionValue: decimal("conversion_value", { precision: 12, scale: 2 }),
  currency: text("currency").default('USD'),
  payout: decimal("payout", { precision: 12, scale: 2 }),
  
  // Additional data
  conversionData: jsonb("conversion_data"), // Additional conversion details
  
  createdAt: timestamp("created_at").defaultNow(),
});