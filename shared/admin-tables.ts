import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user-tables";
import { offers } from "./offer-tables";

// Creatives table (moved from original schema)
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

// Offer Logs table
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

// Offer Categories table
export const offerCategories = pgTable("offer_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id").references(() => offerCategories.id),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Moderation Templates table
export const moderationTemplates = pgTable("moderation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'approval', 'rejection', 'revision_request'
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  language: text("language").default('en'),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White Labels table  
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Members table
export const staffMembers = pgTable("staff_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'manager', 'account_manager', 'support', 'analyst'
  permissions: jsonb("permissions").default([]), // Array of permissions
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC Documents table
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'passport', 'id_card', 'driver_license', 'utility_bill', 'bank_statement'
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected', 'expired'
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Received Offers table (for external offers)
export const receivedOffers = pgTable("received_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalOfferId: text("external_offer_id").notNull(),
  sourceNetwork: text("source_network").notNull(), // 'clickdealer', 'zeydoo', etc.
  name: text("name").notNull(),
  description: text("description"),
  payout: decimal("payout", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  countries: jsonb("countries"), // Array of country codes
  category: text("category"),
  landingPageUrl: text("landing_page_url"),
  previewUrl: text("preview_url"),
  status: text("status").default('active'), // 'active', 'paused', 'stopped'
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AB Test Groups table
export const abTestGroups = pgTable("ab_test_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  name: text("name").notNull(),
  description: text("description"),
  trafficSplit: integer("traffic_split").notNull(), // Percentage 0-100
  landingPageUrl: text("landing_page_url").notNull(),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Login Logs table  
export const loginLogs = pgTable("login_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email"), // For failed logins where user doesn't exist
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"), // 'invalid_credentials', 'account_locked', 'ip_blocked'
  sessionId: text("session_id"),
  country: text("country"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Summaries table (for caching)
export const financialSummaries = pgTable("financial_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  date: timestamp("date").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default('0'),
  totalPayout: decimal("total_payout", { precision: 15, scale: 2 }).default('0'),
  totalClicks: integer("total_clicks").default(0),
  totalConversions: integer("total_conversions").default(0),
  averageEpc: decimal("average_epc", { precision: 10, scale: 4 }).default('0'),
  averageCr: decimal("average_cr", { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout Requests table
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  method: text("method").notNull(), // 'bank_transfer', 'paypal', 'crypto', 'wire'
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected', 'processing', 'completed'
  paymentDetails: jsonb("payment_details"), // Bank account, wallet address, etc.
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  transactionHash: text("transaction_hash"), // For crypto payouts
  notes: text("notes"),
});