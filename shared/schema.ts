import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'advertiser', 'affiliate', 'staff']);
export const adminRoleEnum = pgEnum('admin_role', ['super', 'financial', 'technical', 'moderator', 'analyst']);
export const offerStatusEnum = pgEnum('offer_status', ['active', 'paused', 'draft', 'archived']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'approved', 'rejected']);
export const postbackStatusEnum = pgEnum('postback_status', ['pending', 'sent', 'failed', 'retry']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('affiliate'),
  adminRole: adminRoleEnum("admin_role"), // For super_admin users - defines their specific admin permissions
  ipRestrictions: jsonb("ip_restrictions"), // Array of allowed IP addresses for admin access
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  lastIpAddress: text("last_ip_address"),
  sessionToken: text("session_token"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  phone: text("phone"),
  country: text("country"),
  language: text("language").default('en'),
  timezone: text("timezone").default('UTC'),
  currency: text("currency").default('USD'),
  kycStatus: kycStatusEnum("kyc_status").default('pending'),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Hierarchy fields - who created/owns this user
  ownerId: varchar("owner_id"), // Who created this user (advertiser creates staff/affiliates)
  // Advertiser specific fields  
  advertiserId: varchar("advertiser_id"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default('0.00'),
  holdAmount: decimal("hold_amount", { precision: 15, scale: 2 }).default('0.00'),
  registrationApproved: boolean("registration_approved").default(false),
  documentsVerified: boolean("documents_verified").default(false),
  // Settings
  settings: jsonb("settings"),
});

// Offers table
export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number"), // Offer number
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"), // Logo URL
  category: text("category").notNull(),
  vertical: text("vertical"), // Industry vertical
  goals: text("goals"), // Offer goals/objectives
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  payout: decimal("payout", { precision: 10, scale: 2 }).notNull(),
  payoutType: text("payout_type").notNull(), // 'cpa', 'cps', 'cpl', 'cpm', 'cpc', 'cpi', 'cro', 'revshare', 'hybrid', 'fixed'
  currency: text("currency").default('USD'),
  countries: jsonb("countries"), // Array of country codes
  geoTargeting: text("geo_targeting"), // Free text geo targeting
  landingPages: jsonb("landing_pages"), // Array of landing pages with different prices
  geoPricing: jsonb("geo_pricing"), // Array of geo-specific pricing
  kpiConditions: text("kpi_conditions"), // KPI conditions
  trafficSources: jsonb("traffic_sources"), // Allowed traffic sources
  dailyLimit: integer("daily_limit"), // Daily conversion limit
  monthlyLimit: integer("monthly_limit"), // Monthly conversion limit
  antifraudEnabled: boolean("antifraud_enabled").default(true),
  autoApprovePartners: boolean("auto_approve_partners").default(false),
  status: offerStatusEnum("status").default('draft'),
  moderationStatus: text("moderation_status").default('pending'), // pending, approved, rejected, needs_revision
  moderationComment: text("moderation_comment"), // Admin comment for moderation
  trackingUrl: text("tracking_url"),
  landingPageUrl: text("landing_page_url"),
  previewUrl: text("preview_url"), // Preview link for partners
  restrictions: text("restrictions"),
  fraudRestrictions: text("fraud_restrictions"), // Global fraud restrictions set by admin
  macros: text("macros"), // JSON string of macros
  kycRequired: boolean("kyc_required").default(false),
  isPrivate: boolean("is_private").default(false),
  smartlinkEnabled: boolean("smartlink_enabled").default(false),
  isBlocked: boolean("is_blocked").default(false),
  blockedReason: text("blocked_reason"),
  isArchived: boolean("is_archived").default(false),
  regionVisibility: jsonb("region_visibility"), // Regions where offer is visible
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner assignments (many-to-many between affiliates and offers)
export const partnerOffers = pgTable("partner_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  isApproved: boolean("is_approved").default(false),
  customPayout: decimal("custom_payout", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tracking links
export const trackingLinks = pgTable("tracking_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  trackingCode: text("tracking_code").notNull().unique(),
  url: text("url").notNull(),
  subId1: text("sub_id_1"),
  subId2: text("sub_id_2"),
  subId3: text("sub_id_3"),
  subId4: text("sub_id_4"),
  subId5: text("sub_id_5"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Statistics
export const statistics = pgTable("statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  trackingLinkId: varchar("tracking_link_id").references(() => trackingLinks.id),
  date: timestamp("date").notNull(),
  clicks: integer("clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  leads: integer("leads").default(0),
  approvedLeads: integer("approved_leads").default(0),
  rejectedLeads: integer("rejected_leads").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  payout: decimal("payout", { precision: 10, scale: 2 }).default('0'),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ip: text("ip"),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'commission', 'payout'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  status: transactionStatusEnum("status").default('pending'),
  description: text("description"),
  reference: text("reference"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Postbacks
export const postbacks = pgTable("postbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  method: text("method").default('GET'),
  events: jsonb("events"), // Array of events to trigger on
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").default('open'),
  priority: text("priority").default('medium'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fraud alerts
export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  type: text("type").notNull(), // 'suspicious_activity', 'high_velocity', 'duplicate_conversion'
  severity: text("severity").default('medium'),
  description: text("description"),
  data: jsonb("data"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creative assets for offers
export const creatives = pgTable("creatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'banner', 'video', 'text', 'prelanding'
  format: text("format"), // 'jpg', 'png', 'gif', 'mp4', 'html'
  size: text("size"), // '300x250', '728x90'
  url: text("url").notNull(),
  preview: text("preview"),
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default('0'),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  moderationStatus: text("moderation_status").default('pending'), // pending, approved, rejected
  moderationComment: text("moderation_comment"),
  targetGeo: jsonb("target_geo"), // Array of country codes
  targetDevice: text("target_device"), // 'desktop', 'mobile', 'tablet'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Offer modification logs
export const offerLogs = pgTable("offer_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  userId: varchar("user_id").notNull().references(() => users.id), // Who made the change
  action: text("action").notNull(), // 'created', 'updated', 'approved', 'rejected', 'blocked', 'archived'
  fieldChanged: text("field_changed"), // Which field was changed
  oldValue: text("old_value"), // Previous value
  newValue: text("new_value"), // New value
  comment: text("comment"), // Admin comment
  createdAt: timestamp("created_at").defaultNow(),
});

// Offer categories/verticals  
export const offerCategories = pgTable("offer_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  parentId: varchar("parent_id"), // Self-reference will be added later
  createdAt: timestamp("created_at").defaultNow(),
});

// Moderation templates
export const moderationTemplates = pgTable("moderation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rejection', 'revision_request', 'approval'
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// White label settings for advertisers
export const whiteLabels = pgTable("white_labels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  brandName: text("brand_name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default('#0066cc'),
  secondaryColor: text("secondary_color").default('#ffffff'),
  domain: text("domain"),
  customCss: text("custom_css"),
  favicon: text("favicon"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff members for advertisers
export const staffMembers = pgTable("staff_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'manager', 'support', 'analyst', 'accountant'
  permissions: jsonb("permissions"), // Array of permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC documents
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'passport', 'id_card', 'selfie', 'address'
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  fileUrl: text("file_url").notNull(),
  notes: text("notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner ratings and achievements
export const partnerRatings = pgTable("partner_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  advertiserId: varchar("advertiser_id").references(() => users.id),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default('0'),
  epc: decimal("epc", { precision: 8, scale: 2 }).default('0'),
  fraudScore: integer("fraud_score").default(0), // 0-100
  trafficQuality: integer("traffic_quality").default(0), // 0-100
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'), // 0-5
  rank: integer("rank").default(0),
  achievements: jsonb("achievements"), // Array of achievement IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// A/B test groups for offers
export const abTestGroups = pgTable("ab_test_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  offerIds: jsonb("offer_ids").notNull(), // Array of offer IDs
  trafficSplit: jsonb("traffic_split").notNull(), // Object with percentages
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  winnerOfferId: varchar("winner_offer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance rules
export const complianceRules = pgTable("compliance_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  type: text("type").notNull(), // 'kyc_required', 'geo_restriction', 'traffic_source'
  rule: jsonb("rule").notNull(), // Rule configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// API keys for external integrations
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

// Postback logs
export const postbackLogs = pgTable("postback_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postbackId: varchar("postback_id").notNull().references(() => postbacks.id),
  url: text("url").notNull(),
  method: text("method").notNull(),
  payload: jsonb("payload"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  retryCount: integer("retry_count").default(0),
  status: text("status").default('pending'), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login logs table for security tracking
export const loginLogs = pgTable("login_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").defaultNow(),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"),
  sessionId: text("session_id"),
});

// Audit logs table for tracking all admin actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: auditActionEnum("action").notNull(),
  resourceType: text("resource_type").notNull(), // users, offers, transactions, etc.
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  description: text("description"),
});

// Global postbacks configuration
export const globalPostbacks = pgTable("global_postbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").notNull(), // Array of events to trigger postback
  macros: jsonb("macros"), // Macro replacements
  headers: jsonb("headers"), // Custom headers
  isActive: boolean("is_active").default(true),
  retryAttempts: integer("retry_attempts").default(3),
  timeout: integer("timeout").default(30),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhooks configuration
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

// Platform commissions
export const platformCommissions = pgTable("platform_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  type: text("type").notNull(), // percentage, fixed, revenue_share
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  currency: text("currency").default('USD'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  offers: many(offers),
  partnerOffers: many(partnerOffers),
  trackingLinks: many(trackingLinks),
  statistics: many(statistics),
  transactions: many(transactions),
  postbacks: many(postbacks),
  tickets: many(tickets),
  assignedTickets: many(tickets, { relationName: 'assignedTickets' }),
  fraudAlerts: many(fraudAlerts),
  advertiser: one(users, {
    fields: [users.advertiserId],
    references: [users.id],
    relationName: 'advertiserStaff'
  }),
  staff: many(users, { relationName: 'advertiserStaff' }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [offers.advertiserId],
    references: [users.id],
  }),
  partnerOffers: many(partnerOffers),
  trackingLinks: many(trackingLinks),
  statistics: many(statistics),
  fraudAlerts: many(fraudAlerts),
}));

export const partnerOffersRelations = relations(partnerOffers, ({ one }) => ({
  partner: one(users, {
    fields: [partnerOffers.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [partnerOffers.offerId],
    references: [offers.id],
  }),
}));

export const trackingLinksRelations = relations(trackingLinks, ({ one, many }) => ({
  partner: one(users, {
    fields: [trackingLinks.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [trackingLinks.offerId],
    references: [offers.id],
  }),
  statistics: many(statistics),
}));

export const statisticsRelations = relations(statistics, ({ one }) => ({
  partner: one(users, {
    fields: [statistics.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [statistics.offerId],
    references: [offers.id],
  }),
  trackingLink: one(trackingLinks, {
    fields: [statistics.trackingLinkId],
    references: [trackingLinks.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const postbacksRelations = relations(postbacks, ({ one }) => ({
  user: one(users, {
    fields: [postbacks.userId],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: 'assignedTickets'
  }),
}));

export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [fraudAlerts.offerId],
    references: [offers.id],
  }),
}));

export const creativesRelations = relations(creatives, ({ one }) => ({
  offer: one(offers, {
    fields: [creatives.offerId],
    references: [offers.id],
  }),
}));

export const whiteLabelsRelations = relations(whiteLabels, ({ one }) => ({
  advertiser: one(users, {
    fields: [whiteLabels.advertiserId],
    references: [users.id],
  }),
}));

export const staffMembersRelations = relations(staffMembers, ({ one }) => ({
  advertiser: one(users, {
    fields: [staffMembers.advertiserId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [staffMembers.userId],
    references: [users.id],
  }),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycDocuments.reviewedBy],
    references: [users.id],
  }),
}));

export const partnerRatingsRelations = relations(partnerRatings, ({ one }) => ({
  partner: one(users, {
    fields: [partnerRatings.partnerId],
    references: [users.id],
  }),
  advertiser: one(users, {
    fields: [partnerRatings.advertiserId],
    references: [users.id],
  }),
}));

export const complianceRulesRelations = relations(complianceRules, ({ one }) => ({
  offer: one(offers, {
    fields: [complianceRules.offerId],
    references: [offers.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const postbackLogsRelations = relations(postbackLogs, ({ one }) => ({
  postback: one(postbacks, {
    fields: [postbackLogs.postbackId],
    references: [postbacks.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create offer schema for frontend (without required backend fields)
export const createOfferFrontendSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  status: z.string().optional(),
  payoutType: z.string().optional(),
  currency: z.string().optional(),
  landingPages: z.any().optional(),
  kpiConditions: z.string().optional(),
  allowedTrafficSources: z.array(z.string()).optional(),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
  antifraudEnabled: z.boolean().optional(),
  autoApprovePartners: z.boolean().optional(),
});

export const insertPartnerOfferSchema = createInsertSchema(partnerOffers).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingLinkSchema = createInsertSchema(trackingLinks).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertPostbackSchema = createInsertSchema(postbacks).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertCreativeSchema = createInsertSchema(creatives).omit({
  id: true,
  createdAt: true,
});

export const insertWhiteLabelSchema = createInsertSchema(whiteLabels).omit({
  id: true,
  createdAt: true,
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerRatingSchema = createInsertSchema(partnerRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAbTestGroupSchema = createInsertSchema(abTestGroups).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceRuleSchema = createInsertSchema(complianceRules).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export const insertPostbackLogSchema = createInsertSchema(postbackLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertPartnerOffer = z.infer<typeof insertPartnerOfferSchema>;
export type PartnerOffer = typeof partnerOffers.$inferSelect;
export type InsertTrackingLink = z.infer<typeof insertTrackingLinkSchema>;
export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertPostback = z.infer<typeof insertPostbackSchema>;
export type Postback = typeof postbacks.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertCreative = z.infer<typeof insertCreativeSchema>;
export type Creative = typeof creatives.$inferSelect;
export type InsertWhiteLabel = z.infer<typeof insertWhiteLabelSchema>;
export type WhiteLabel = typeof whiteLabels.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertPartnerRating = z.infer<typeof insertPartnerRatingSchema>;
export type PartnerRating = typeof partnerRatings.$inferSelect;
export type InsertAbTestGroup = z.infer<typeof insertAbTestGroupSchema>;
export type AbTestGroup = typeof abTestGroups.$inferSelect;
export type InsertComplianceRule = z.infer<typeof insertComplianceRuleSchema>;
export type ComplianceRule = typeof complianceRules.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertPostbackLog = z.infer<typeof insertPostbackLogSchema>;
export type PostbackLog = typeof postbackLogs.$inferSelect;
