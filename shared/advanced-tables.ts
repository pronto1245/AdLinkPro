import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user-tables";
import { offers } from "./offer-tables";
import { trackingClicks } from "./tracking-tables";

// Fraud Rules table (enhanced fraud detection)
export const fraudRules = pgTable("fraud_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ip_velocity', 'geo_mismatch', 'device_fingerprint', 'click_pattern'
  conditions: jsonb("conditions").notNull(), // Rule conditions as JSON
  actions: jsonb("actions").notNull(), // Actions to take: block, flag, alert
  severity: text("severity").default('medium'), // 'low', 'medium', 'high', 'critical'
  isActive: boolean("is_active").default(true),
  autoBlock: boolean("auto_block").default(false),
  triggeredCount: integer("triggered_count").default(0),
  lastTriggered: timestamp("last_triggered"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device Tracking table (for fraud detection)
export const deviceTracking = pgTable("device_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceFingerprint: text("device_fingerprint").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  screenResolution: text("screen_resolution"),
  timezone: text("timezone"),
  language: text("language"),
  plugins: jsonb("plugins"),
  webglRenderer: text("webgl_renderer"),
  canvasFingerprint: text("canvas_fingerprint"),
  clickId: text("click_id"),
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  isBlocked: boolean("is_blocked").default(false),
  riskScore: integer("risk_score").default(0), // 0-100
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  clickCount: integer("click_count").default(0),
  conversionCount: integer("conversion_count").default(0),
});

// Global Postbacks table (platform-wide postbacks)
export const globalPostbacks = pgTable("global_postbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  method: text("method").default('GET'), // 'GET', 'POST'
  events: text("events").array().default([]), // Events to trigger
  conditions: jsonb("conditions").default({}), // Filtering conditions
  parameters: jsonb("parameters").default({}), // URL parameters template
  headers: jsonb("headers").default({}), // Custom headers
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // Execution order
  retryCount: integer("retry_count").default(3),
  timeout: integer("timeout").default(30), // seconds
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Postback Delivery Logs table (detailed logging)
export const postbackDeliveryLogs = pgTable("postback_delivery_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postbackId: varchar("postback_id"), // Can be user postback or global postback
  globalPostbackId: varchar("global_postback_id").references(() => globalPostbacks.id),
  clickId: text("click_id"),
  conversionId: varchar("conversion_id"),
  eventType: text("event_type").notNull(), // 'click', 'lead', 'sale', etc.
  url: text("url").notNull(),
  method: text("method").notNull(),
  requestHeaders: jsonb("request_headers"),
  requestBody: text("request_body"),
  responseStatus: integer("response_status"),
  responseHeaders: jsonb("response_headers"),
  responseBody: text("response_body"),
  responseTime: integer("response_time"), // milliseconds
  attempt: integer("attempt").default(1),
  maxRetries: integer("max_retries").default(3),
  status: text("status").notNull(), // 'success', 'failed', 'pending', 'retry'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  nextRetryAt: timestamp("next_retry_at"),
});

// Webhooks table (for external integrations)
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // null for global webhooks
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array().notNull(), // Array of events to listen for
  secret: text("secret"), // For HMAC verification
  isActive: boolean("is_active").default(true),
  contentType: text("content_type").default('application/json'),
  customHeaders: jsonb("custom_headers").default({}),
  timeout: integer("timeout").default(30), // seconds
  maxRetries: integer("max_retries").default(3),
  lastDelivery: timestamp("last_delivery"),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blacklist table (global blocking)
export const blacklist = pgTable("blacklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'ip', 'ip_range', 'country', 'domain', 'user_agent', 'device_id'
  value: text("value").notNull(), // The actual blocked value
  reason: text("reason"), // Reason for blocking
  category: text("category"), // 'fraud', 'spam', 'bot', 'manual'
  severity: text("severity").default('medium'), // 'low', 'medium', 'high'
  isActive: boolean("is_active").default(true),
  addedBy: varchar("added_by").references(() => users.id),
  expiresAt: timestamp("expires_at"), // Optional expiration
  hitCount: integer("hit_count").default(0), // How many times blocked
  lastHit: timestamp("last_hit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Commissions table (revenue sharing)
export const platformCommissions = pgTable("platform_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'percentage', 'fixed', 'tiered'
  name: text("name").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 10, scale: 4 }).notNull(), // Percentage or fixed amount
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }), // Minimum transaction amount
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }), // Maximum transaction amount
  currency: text("currency").default('USD'),
  applicableTo: text("applicable_to").array().default([]), // ['all', 'advertisers', 'partners', 'specific_users']
  userIds: text("user_ids").array().default([]), // Specific user IDs if applicable
  offerIds: text("offer_ids").array().default([]), // Specific offer IDs if applicable
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner Team table (team management within partner accounts)
export const partnerTeam = pgTable("partner_team", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  memberId: varchar("member_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'member', 'manager', 'analyst'
  permissions: jsonb("permissions").default([]), // Specific permissions
  canViewFinancials: boolean("can_view_financials").default(false),
  canCreateLinks: boolean("can_create_links").default(true),
  canEditProfile: boolean("can_edit_profile").default(false),
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Traffic Sources table (predefined traffic sources)
export const trafficSources = pgTable("traffic_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"), // Icon URL or class
  category: text("category"), // 'social', 'search', 'display', 'native', 'push', 'email'
  description: text("description"),
  trackingTemplate: text("tracking_template"), // Template for tracking parameters
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false), // Some sources need approval
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversions table (separate from clicks for better performance)
export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id").notNull(),
  conversionId: text("conversion_id").notNull().unique(), // External conversion ID
  offerId: varchar("offer_id").references(() => offers.id),
  partnerId: varchar("partner_id").references(() => users.id),
  advertiserId: varchar("advertiser_id").references(() => users.id),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected', 'held'
  type: text("type").notNull(), // 'lead', 'sale', 'install', 'registration', 'deposit'
  value: decimal("value", { precision: 15, scale: 2 }).default('0'), // Conversion value
  payout: decimal("payout", { precision: 12, scale: 2 }).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  currency: text("currency").default('USD'),
  subId: text("sub_id"), // Partner's sub ID
  clickTime: timestamp("click_time").notNull(),
  conversionTime: timestamp("conversion_time").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  isValid: boolean("is_valid").default(true), // Fraud validation result
  fraudScore: integer("fraud_score").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Postback Profiles (more advanced postback management)
export const enhancedPostbackProfiles = pgTable("enhanced_postback_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  endpoints: jsonb("endpoints").notNull(), // Array of endpoint configurations
  filters: jsonb("filters").default({}), // Filtering conditions
  transformations: jsonb("transformations").default({}), // Data transformation rules
  authentication: jsonb("authentication").default({}), // Auth configuration
  retryPolicy: jsonb("retry_policy").default({}), // Retry configuration
  rateLimit: integer("rate_limit").default(100), // Requests per minute
  isActive: boolean("is_active").default(true),
  version: integer("version").default(1), // For versioning
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics Data table (aggregated analytics)
export const analyticsData = pgTable("analytics_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  hour: integer("hour"), // 0-23 for hourly data
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  advertiserId: varchar("advertiser_id").references(() => users.id),
  country: text("country"),
  trafficSource: text("traffic_source"),
  device: text("device"), // 'desktop', 'mobile', 'tablet'
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  conversions: integer("conversions").default(0),
  approvedConversions: integer("approved_conversions").default(0),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default('0'),
  payout: decimal("payout", { precision: 15, scale: 2 }).default('0'),
  profit: decimal("profit", { precision: 15, scale: 2 }).default('0'),
  epc: decimal("epc", { precision: 10, scale: 4 }).default('0'), // Earnings per click
  cr: decimal("cr", { precision: 5, scale: 2 }).default('0'), // Conversion rate
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default('0'), // Click-through rate
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password Reset Tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Analytics table (user behavior analytics)
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  loginCount: integer("login_count").default(0),
  activeTime: integer("active_time").default(0), // seconds
  pagesViewed: integer("pages_viewed").default(0),
  actionsPerformed: integer("actions_performed").default(0),
  lastActivity: timestamp("last_activity"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Tokens table (for API access management)
export const apiTokens = pgTable("api_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  token: text("token").notNull().unique(),
  permissions: jsonb("permissions").default([]), // Array of API permissions
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  rateLimitPerHour: integer("rate_limit_per_hour").default(3600),
  rateLimitPerDay: integer("rate_limit_per_day").default(86400),
  allowedIps: text("allowed_ips").array().default([]), // IP whitelist
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});