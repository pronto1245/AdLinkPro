import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { ticketStatusEnum, postbackStatusEnum } from "./enums";
import { users } from "./user-tables";
import { offers } from "./offer-tables";

// Tickets table
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default('open'),
  priority: text("priority").default('normal'), // 'low', 'normal', 'high', 'critical'
  category: text("category"), // 'technical', 'billing', 'general', 'offers'
  assignedTo: varchar("assigned_to").references(() => users.id),
  lastReplyBy: varchar("last_reply_by").references(() => users.id),
  lastReplyAt: timestamp("last_reply_at"),
  closedAt: timestamp("closed_at"),
  closedBy: varchar("closed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket Messages table
export const ticketMessages = pgTable("ticket_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => tickets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachments: jsonb("attachments").default([]), // Array of file URLs
  isInternal: boolean("is_internal").default(false), // Internal notes not visible to user
  createdAt: timestamp("created_at").defaultNow(),
});

// Postbacks table
export const postbacks = pgTable("postbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array().default([]), // Array of events to trigger postback
  status: postbackStatusEnum("status").default('active'),
  
  // Postback configuration
  method: text("method").default('GET'), // 'GET', 'POST'
  headers: jsonb("headers").default({}), // Custom headers
  parameters: jsonb("parameters").default({}), // URL parameters template
  
  // Security and authentication
  requireAuth: boolean("require_auth").default(false),
  authType: text("auth_type"), // 'basic', 'bearer', 'custom'
  authCredentials: text("auth_credentials"), // Encrypted credentials
  
  // Filtering and conditions
  offerIds: text("offer_ids").array().default([]), // Specific offers (empty = all)
  countries: text("countries").array().default([]), // Specific countries (empty = all)
  minPayout: integer("min_payout"), // Minimum payout to trigger
  
  // Retry and delivery settings
  maxRetries: integer("max_retries").default(3),
  retryDelay: integer("retry_delay").default(60), // seconds
  timeout: integer("timeout").default(30), // seconds
  
  // Statistics
  totalSent: integer("total_sent").default(0),
  totalSuccess: integer("total_success").default(0),
  totalFailed: integer("total_failed").default(0),
  lastSentAt: timestamp("last_sent_at"),
  lastSuccessAt: timestamp("last_success_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Postback Logs table
export const postbackLogs = pgTable("postback_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postbackId: varchar("postback_id").notNull().references(() => postbacks.id),
  conversionId: varchar("conversion_id"), // ID of the conversion
  clickId: text("click_id"),
  
  // Request details
  requestUrl: text("request_url").notNull(),
  requestMethod: text("request_method").notNull(),
  requestHeaders: jsonb("request_headers"),
  requestBody: text("request_body"),
  
  // Response details
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  responseHeaders: jsonb("response_headers"),
  responseTime: integer("response_time"), // milliseconds
  
  // Delivery status
  status: text("status").notNull(), // 'success', 'failed', 'pending', 'retry'
  attempt: integer("attempt").default(1),
  errorMessage: text("error_message"),
  
  // Metadata
  processedAt: timestamp("processed_at"),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud Alerts table
export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  type: text("type").notNull(), // 'click_fraud', 'conversion_fraud', 'unusual_activity'
  severity: text("severity").default('medium'), // 'low', 'medium', 'high', 'critical'
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Alert data
  alertData: jsonb("alert_data"), // Detailed alert information
  triggerRules: text("trigger_rules").array().default([]), // Rules that triggered alert
  confidence: integer("confidence"), // 0-100 confidence score
  
  // Geographic and technical details
  ipAddress: text("ip_address"),
  country: text("country"),
  userAgent: text("user_agent"),
  device: text("device"),
  
  // Resolution
  status: text("status").default('open'), // 'open', 'investigating', 'resolved', 'false_positive'
  investigatedBy: varchar("investigated_by").references(() => users.id),
  investigatedAt: timestamp("investigated_at"),
  resolution: text("resolution"),
  resolutionNotes: text("resolution_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance Rules table
export const complianceRules = pgTable("compliance_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ruleType: text("rule_type").notNull(), // 'traffic_quality', 'geo_restriction', 'device_restriction', 'fraud_detection'
  
  // Rule configuration
  conditions: jsonb("conditions").notNull(), // Rule conditions as JSON
  actions: jsonb("actions").notNull(), // Actions to take when rule triggers
  
  // Scope
  offerId: varchar("offer_id").references(() => offers.id), // null = global rule
  advertiserId: varchar("advertiser_id").references(() => users.id), // null = system-wide
  
  // Settings
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(100), // Lower number = higher priority
  
  // Statistics
  triggerCount: integer("trigger_count").default(0),
  lastTriggered: timestamp("last_triggered"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Notifications table
export const systemNotifications = pgTable("system_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Recipient info
  userId: varchar("user_id").references(() => users.id), // null for broadcast notifications
  userRole: text("user_role"), // Target specific roles if userId is null
  
  // Notification content
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default('info'), // 'info', 'warning', 'error', 'success'
  category: text("category"), // 'system', 'payment', 'offer', 'security'
  
  // Notification data
  data: jsonb("data"), // Additional structured data
  actionUrl: text("action_url"), // URL to navigate when clicked
  actionText: text("action_text"), // Text for action button
  
  // Status and delivery
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  deliveryMethod: text("delivery_method").array().default(['in_app']), // 'in_app', 'email', 'sms', 'push'
  
  // Scheduling
  scheduledAt: timestamp("scheduled_at"), // When to deliver (null = immediate)
  expiresAt: timestamp("expires_at"), // When notification expires
  
  // Metadata
  priority: integer("priority").default(0), // Higher number = higher priority
  tags: text("tags").array().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  type: text("type").default('json'), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  category: text("category"), // 'general', 'payment', 'security', 'integration'
  isPublic: boolean("is_public").default(false), // Whether setting can be read by non-admins
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud Reports table
export const fraudReports = pgTable('fraud_reports', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  type: text('type').notNull(), // 'ip_fraud' | 'device_fraud' | 'geo_fraud' | etc.
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  status: text('status').default('pending'), // 'pending' | 'reviewing' | 'confirmed' | 'rejected' | 'resolved'
  offerId: text('offer_id').references(() => offers.id),
  partnerId: text('partner_id').references(() => users.id),
  trackingLinkId: text('tracking_link_id'),
  clickId: text('click_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceFingerprint: text('device_fingerprint'),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  description: text('description').notNull(),
  detectionRules: jsonb('detection_rules'),
  evidenceData: jsonb('evidence_data'),
  autoBlocked: boolean('auto_blocked').default(false),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// IP Analysis table
export const ipAnalysis = pgTable('ip_analysis', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text('ip_address').notNull().unique(),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  isp: text('isp'),
  organization: text('organization'),
  isProxy: boolean('is_proxy').default(false),
  isVpn: boolean('is_vpn').default(false),
  isTor: boolean('is_tor').default(false),
  isHosting: boolean('is_hosting').default(false),
  isMalicious: boolean('is_malicious').default(false),
  riskScore: integer('risk_score').default(0),
  threatTypes: jsonb('threat_types'),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
  clickCount: integer('click_count').default(0),
  conversionCount: integer('conversion_count').default(0),
  uniquePartnersCount: integer('unique_partners_count').default(0),
  flaggedAt: timestamp('flagged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Fraud Blocks - Blocked entities
export const fraudBlocks = pgTable('fraud_blocks', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  type: text('type').notNull(), // 'ip' | 'device' | 'partner' | 'offer' | 'traffic_source'
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  reportId: text('report_id').references(() => fraudReports.id),
  autoBlocked: boolean('auto_blocked').default(false),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  blockedBy: text('blocked_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Notifications table
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // registration, block, login, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional notification data
  channel: text("channel").notNull(), // email, telegram, system
  status: text("status").default('pending'), // pending, sent, failed
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Postback Templates table
export const postbackTemplates = pgTable("postback_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  level: text("level").notNull(), // 'global' or 'offer'
  url: text("url").notNull(),
  events: jsonb("events").notNull(), // ['lead', 'sale', 'rejected', 'hold']
  parameters: jsonb("parameters"), // Available parameters like {click_id}, {status}, etc.
  headers: jsonb("headers"), // Custom headers
  retryAttempts: integer("retry_attempts").default(3),
  timeout: integer("timeout").default(30),
  isActive: boolean("is_active").default(true),
  offerId: varchar("offer_id").references(() => offers.id), // null for global
  advertiserId: varchar("advertiser_id").references(() => users.id), // who created this
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Roles table
export const customRoles = pgTable("custom_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // Array of permission strings
  advertiserId: varchar("advertiser_id").references(() => users.id), // null = global role
  ipRestrictions: jsonb("ip_restrictions"), // Array of allowed IPs
  geoRestrictions: jsonb("geo_restrictions"), // Array of allowed countries
  timeRestrictions: jsonb("time_restrictions"), // Time-based access restrictions
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Role Assignments table
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  customRoleId: varchar("custom_role_id").notNull().references(() => customRoles.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Optional role expiration
  createdAt: timestamp("created_at").defaultNow(),
});