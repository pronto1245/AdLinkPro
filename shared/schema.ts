import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'advertiser', 'affiliate', 'staff']);
export const adminRoleEnum = pgEnum('admin_role', ['super', 'financial', 'technical', 'moderator', 'analyst']);
export const offerStatusEnum = pgEnum('offer_status', ['active', 'paused', 'draft', 'pending', 'archived', 'on_request']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'approved', 'rejected']);
export const postbackStatusEnum = pgEnum('postback_status', ['pending', 'sent', 'failed', 'retry']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject']);
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked', 'deleted', 'pending_verification']);
export const userTypeEnum = pgEnum('user_type', ['advertiser', 'affiliate', 'staff', 'admin']);
export const walletTypeEnum = pgEnum('wallet_type', ['platform', 'user']);
export const cryptoCurrencyEnum = pgEnum('crypto_currency', ['BTC', 'ETH', 'USDT', 'USDC', 'TRX', 'LTC', 'BCH', 'XRP']);
export const walletStatusEnum = pgEnum('wallet_status', ['active', 'suspended', 'maintenance']);

// Users table  
export const users: any = pgTable("users", {
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
  telegram: text("telegram"),
  country: text("country"),
  language: text("language").default('en'),
  timezone: text("timezone").default('UTC'),
  currency: text("currency").default('USD'),
  kycStatus: kycStatusEnum("kyc_status").default('pending'),
  isActive: boolean("is_active").default(true),
  status: userStatusEnum("status").default('active'),
  userType: userTypeEnum("user_type").default('affiliate'),
  lastLoginAt: timestamp("last_login_at"),
  registrationIp: text("registration_ip"),
  geoRestrictions: jsonb("geo_restrictions"), // Array of allowed countries
  timeRestrictions: jsonb("time_restrictions"), // Login time restrictions
  isBlocked: boolean("is_blocked").default(false),
  blockReason: text("block_reason"),
  blockedAt: timestamp("blocked_at"),
  blockedBy: varchar("blocked_by").references(() => users.id),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id),
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
  description: jsonb("description"), // Multilingual: { "en": "English text", "ru": "Russian text" }
  logo: text("logo"), // Logo URL
  category: text("category").notNull(),
  vertical: text("vertical"), // Industry vertical
  goals: jsonb("goals"), // Offer goals/objectives - Multilingual
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  payout: decimal("payout", { precision: 10, scale: 2 }).notNull().default("0.00"),
  payoutType: text("payout_type").notNull(), // 'cpa', 'cps', 'cpl', 'cpm', 'cpc', 'cpi', 'cro', 'revshare', 'hybrid', 'fixed'
  currency: text("currency").default('USD'),
  countries: jsonb("countries"), // Array of country codes
  geoTargeting: text("geo_targeting"), // Free text geo targeting
  
  // Landing pages and URLs  
  trackingUrl: text("tracking_url"), // Generated tracking URL template
  landingPageUrl: text("landing_page_url"), // Main landing page URL
  landingPages: jsonb("landing_pages"), // Array of landing pages with different prices
  baseUrl: text("base_url"), // Base URL for automatic partner link generation
  previewUrl: text("preview_url"), // Preview link for partners
  
  // Geo and pricing
  geoPricing: jsonb("geo_pricing"), // Array of geo-specific pricing
  
  // Device and OS targeting
  allowedApps: jsonb("allowed_apps"), // Array of allowed apps or app types
  
  // Restrictions and traffic
  kpiConditions: jsonb("kpi_conditions"), // KPI conditions - Multilingual: { "en": "English text", "ru": "Russian text" }
  trafficSources: jsonb("traffic_sources"), // Allowed traffic sources
  allowedApplications: jsonb("allowed_applications").default([]), // PWA App, WebView App, APK, iOS App, etc.
  
  // Limits and caps
  dailyLimit: integer("daily_limit"), // Daily conversion limit
  monthlyLimit: integer("monthly_limit"), // Monthly conversion limit
  
  // Partner approval and settings
  autoApprovePartners: boolean("auto_approve_partners").default(false),
  partnerApprovalType: text("partner_approval_type").default('manual'), // 'auto', 'manual', 'by_request', 'whitelist_only'
  
  // Anti-fraud settings
  antifraudEnabled: boolean("antifraud_enabled").default(true),
  antifraudMethods: jsonb("antifraud_methods").default([]), // Selected antifraud protection methods
  
  // Status and moderation
  status: offerStatusEnum("status").default('draft'),
  moderationStatus: text("moderation_status").default('pending'), // pending, approved, rejected, needs_revision
  moderationComment: text("moderation_comment"), // Admin comment for moderation
  
  // Technical settings 
  restrictions: text("restrictions"),
  fraudRestrictions: text("fraud_restrictions"), // Global fraud restrictions set by admin
  macros: text("macros"), // JSON string of macros
  smartlinkEnabled: boolean("smartlink_enabled").default(false),
  
  // Flags and visibility
  kycRequired: boolean("kyc_required").default(false),
  isPrivate: boolean("is_private").default(false),
  isBlocked: boolean("is_blocked").default(false),
  blockedReason: text("blocked_reason"),
  isArchived: boolean("is_archived").default(false),
  regionVisibility: jsonb("region_visibility"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Offer domains (for custom redirect domains)
export const offerDomains = pgTable("offer_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  domain: text("domain").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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

// Tracking clicks for postback system
export const trackingClicks = pgTable("tracking_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id").notNull().unique(), // Generated clickid for macros
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  trackingLinkId: varchar("tracking_link_id").references(() => trackingLinks.id),
  ip: text("ip"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  subId1: text("sub_id_1"),
  subId2: text("sub_id_2"),
  subId3: text("sub_id_3"),
  subId4: text("sub_id_4"),
  subId5: text("sub_id_5"),
  subId6: text("sub_id_6"),
  subId7: text("sub_id_7"),
  subId8: text("sub_id_8"),
  subId9: text("sub_id_9"),
  subId10: text("sub_id_10"),
  subId11: text("sub_id_11"),
  subId12: text("sub_id_12"),
  subId13: text("sub_id_13"),
  subId14: text("sub_id_14"),
  subId15: text("sub_id_15"),
  subId16: text("sub_id_16"),
  subId17: text("sub_id_17"),
  subId18: text("sub_id_18"),
  subId19: text("sub_id_19"),
  subId20: text("sub_id_20"),
  subId21: text("sub_id_21"),
  subId22: text("sub_id_22"),
  subId23: text("sub_id_23"),
  subId24: text("sub_id_24"),
  subId25: text("sub_id_25"),
  subId26: text("sub_id_26"),
  subId27: text("sub_id_27"),
  subId28: text("sub_id_28"),
  subId29: text("sub_id_29"),
  subId30: text("sub_id_30"),
  // Fraud and Bot Detection fields
  fraudScore: integer("fraud_score").default(0),
  isBot: boolean("is_bot").default(false),
  vpnDetected: boolean("vpn_detected").default(false),
  riskLevel: text("risk_level").default('low'), // 'low', 'medium', 'high'
  // Additional analytics fields
  mobileCarrier: text("mobile_carrier"),
  connectionType: text("connection_type"), // 'wifi', 'mobile', 'cable'
  timeOnLanding: integer("time_on_landing"), // seconds
  landingUrl: text("landing_url"),
  isUnique: boolean("is_unique").default(true),
  status: text("status").default('active'), // 'active', 'converted', 'rejected'
  conversionData: jsonb("conversion_data"), // Additional conversion details
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
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").default('USD'),
  status: transactionStatusEnum("status").default('pending'),
  description: text("description"),
  reference: text("reference"),
  paymentMethod: text("payment_method"),
  txHash: text("tx_hash"), // Transaction hash for crypto transactions
  fromAddress: text("from_address"), // Source crypto address
  toAddress: text("to_address"), // Destination crypto address
  confirmations: integer("confirmations").default(0), // Number of confirmations for crypto tx
  requiredConfirmations: integer("required_confirmations").default(1),
  networkFee: decimal("network_fee", { precision: 18, scale: 8 }).default('0'), // Network fee for crypto tx
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Crypto Wallets table
export const cryptoWallets = pgTable("crypto_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // null for platform wallets
  walletType: walletTypeEnum("wallet_type").notNull(),
  currency: cryptoCurrencyEnum("currency").notNull(),
  address: text("address").notNull().unique(),
  privateKey: text("private_key"), // Encrypted
  publicKey: text("public_key"),
  mnemonic: text("mnemonic"), // Encrypted
  balance: decimal("balance", { precision: 18, scale: 8 }).default('0'),
  lockedBalance: decimal("locked_balance", { precision: 18, scale: 8 }).default('0'),
  network: text("network").notNull(), // 'bitcoin', 'ethereum', 'tron', etc.
  derivationPath: text("derivation_path"),
  isActive: boolean("is_active").default(true),
  status: walletStatusEnum("status").default('active'),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crypto Transactions table
export const cryptoTransactions = pgTable("crypto_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => cryptoWallets.id),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  txHash: text("tx_hash").notNull().unique(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: cryptoCurrencyEnum("currency").notNull(),
  networkFee: decimal("network_fee", { precision: 18, scale: 8 }).default('0'),
  confirmations: integer("confirmations").default(0),
  requiredConfirmations: integer("required_confirmations").default(1),
  status: transactionStatusEnum("status").default('pending'),
  blockNumber: text("block_number"),
  blockHash: text("block_hash"),
  network: text("network").notNull(),
  isIncoming: boolean("is_incoming").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Postbacks
export const postbacks = pgTable("postbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id), // Specific offer or null for global
  name: text("name").notNull(),
  url: text("url").notNull(),
  method: text("method").default('GET'),
  events: jsonb("events"), // ['click', 'lead', 'ftd', 'deposit', 'approve', 'reject', 'hold']
  macros: jsonb("macros"), // Custom macro mappings
  signatureKey: text("signature_key"), // For HMAC protection
  ipWhitelist: jsonb("ip_whitelist"), // Array of allowed IPs
  isActive: boolean("is_active").default(true),
  retryEnabled: boolean("retry_enabled").default(true),
  maxRetries: integer("max_retries").default(3),
  retryDelay: integer("retry_delay").default(60), // seconds
  timeout: integer("timeout").default(30), // seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Received offers from suppliers (for advertisers)
export const receivedOffers = pgTable("received_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  geo: jsonb("geo").notNull(), // Array of country codes/names
  devices: jsonb("devices").notNull(), // Array of device types
  payoutType: text("payout_type").notNull(), // 'cpa', 'cpl', 'revshare'
  supplierRate: decimal("supplier_rate", { precision: 10, scale: 2 }).notNull(), // Cost from supplier
  partnerRate: decimal("partner_rate", { precision: 10, scale: 2 }).notNull(), // Rate for partners
  targetUrl: text("target_url").notNull(), // Supplier's landing page
  postbackUrl: text("postback_url").notNull(), // Where to send conversions
  conditions: text("conditions"), // Terms and restrictions
  supplierSource: text("supplier_source"), // Source/network name
  status: text("status").default('active'), // 'active', 'paused', 'draft'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  postbackId: varchar("postback_id").references(() => postbackTemplates.id),
  clickId: varchar("click_id").references(() => trackingClicks.id),
  eventType: text("event_type").notNull(), // 'click', 'lead', 'deposit', etc.
  url: text("url").notNull(),
  method: text("method").notNull(),
  headers: jsonb("headers"),
  payload: jsonb("payload"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  responseTime: integer("response_time"), // ms
  retryCount: integer("retry_count").default(0),
  status: postbackStatusEnum("status").default('pending'),
  errorMessage: text("error_message"),
  signature: text("signature"), // HMAC signature sent
  sentAt: timestamp("sent_at"),
  nextRetryAt: timestamp("next_retry_at"),
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

// Fraud Detection Tables

// Fraud Reports - Main fraud incidents table
export const fraudReports = pgTable('fraud_reports', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  type: text('type').$type<'ip_fraud' | 'device_fraud' | 'geo_fraud' | 'anomaly_ctr' | 'anomaly_cr' | 'anomaly_epc' | 'duplicate_actions' | 'click_speed' | 'mass_registration' | 'device_spoofing'>().notNull(),
  severity: text('severity').$type<'low' | 'medium' | 'high' | 'critical'>().notNull(),
  status: text('status').$type<'pending' | 'reviewing' | 'confirmed' | 'rejected' | 'resolved'>().default('pending'),
  offerId: text('offer_id').references(() => offers.id),
  partnerId: text('partner_id').references(() => users.id),
  trackingLinkId: text('tracking_link_id').references(() => trackingLinks.id),
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

// Fraud Rules Configuration
export const fraudRules = pgTable('fraud_rules', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  type: text('type').$type<'ip_fraud' | 'device_fraud' | 'geo_fraud' | 'anomaly_ctr' | 'anomaly_cr' | 'anomaly_epc' | 'duplicate_actions' | 'click_speed' | 'mass_registration' | 'device_spoofing'>().notNull(),
  scope: text('scope').$type<'platform' | 'offer' | 'partner' | 'traffic_source'>().notNull(),
  targetId: text('target_id'),
  isActive: boolean('is_active').default(true),
  autoBlock: boolean('auto_block').default(false),
  severity: text('severity').$type<'low' | 'medium' | 'high' | 'critical'>().notNull(),
  conditions: jsonb('conditions').notNull(),
  actions: jsonb('actions').notNull(),
  thresholds: jsonb('thresholds'),
  createdBy: text('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Device Tracking
export const deviceTracking = pgTable('device_tracking', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  deviceFingerprint: text('device_fingerprint').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  screenResolution: text('screen_resolution'),
  timezone: text('timezone'),
  language: text('language'),
  plugins: jsonb('plugins'),
  webglRenderer: text('webgl_renderer'),
  canvasFingerprint: text('canvas_fingerprint'),
  clickId: text('click_id'),
  trackingLinkId: text('tracking_link_id').references(() => trackingLinks.id),
  partnerId: text('partner_id').references(() => users.id),
  offerId: text('offer_id').references(() => offers.id),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  isp: text('isp'),
  isProxy: boolean('is_proxy').default(false),
  isVpn: boolean('is_vpn').default(false),
  isTor: boolean('is_tor').default(false),
  isMobile: boolean('is_mobile').default(false),
  isBot: boolean('is_bot').default(false),
  riskScore: integer('risk_score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// IP Analysis
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
  type: text('type').$type<'ip' | 'device' | 'partner' | 'offer' | 'traffic_source'>().notNull(),
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

// Enhanced postbacks management
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

// Postback delivery logs with detailed tracking
export const postbackDeliveryLogs = pgTable("postback_delivery_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postbackId: varchar("postback_id").references(() => postbackTemplates.id),
  conversionId: varchar("conversion_id"), // Related conversion ID
  offerId: varchar("offer_id").references(() => offers.id),
  partnerId: varchar("partner_id").references(() => users.id),
  url: text("url").notNull(), // Final URL with replaced parameters
  method: text("method").default('GET'),
  headers: jsonb("headers"),
  payload: jsonb("payload"),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  responseTime: integer("response_time"), // in milliseconds
  status: text("status").notNull(), // 'success', 'failed', 'pending', 'retry'
  errorMessage: text("error_message"),
  attempt: integer("attempt").default(1),
  maxAttempts: integer("max_attempts").default(3),
  nextRetryAt: timestamp("next_retry_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Креативы будут добавлены после основных таблиц

// Команда партнёра - байеры и аналитики
export const partnerTeam = pgTable("partner_team", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'buyer', 'analyst', 'manager'
  permissions: jsonb("permissions").notNull(), // разрешения на ссылки, креативы, статистику
  subIdPrefix: text("sub_id_prefix"), // уникальный префикс для SubID
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Источники трафика партнёров
export const trafficSources = pgTable("traffic_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),  
  name: text("name").notNull(),
  type: text("type").notNull(), // 'push', 'pop', 'native', 'seo', 'social', 'email', 'display', 'search'
  description: text("description"),
  website: text("website"),
  volume: integer("volume"), // daily volume estimate
  quality: text("quality").default('medium'), // 'low', 'medium', 'high'
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advanced analytics and statistics aggregation
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
  fraudReason: text("fraud_reason"),
  
  // Postback tracking
  postbackSent: boolean("postback_sent").default(false),
  postbackTime: timestamp("postback_time"),
  postbackStatus: text("postback_status"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Новые таблицы будут добавлены после исправления дублирования

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

// User roles and permissions management
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

// User role assignments
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  customRoleId: varchar("custom_role_id").notNull().references(() => customRoles.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Optional role expiration
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions for tracking active sessions
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notifications
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

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User analytics for dashboard
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers24h: integer("active_users_24h").default(0),
  activeUsers7d: integer("active_users_7d").default(0),
  activeUsers30d: integer("active_users_30d").default(0),
  newRegistrations: integer("new_registrations").default(0),
  usersByRole: jsonb("users_by_role"), // Breakdown by role
  usersByStatus: jsonb("users_by_status"), // Breakdown by status
  usersByCountry: jsonb("users_by_country"), // Geographic breakdown
  fraudAlerts: integer("fraud_alerts").default(0),
  blockedUsers: integer("blocked_users").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertReceivedOfferSchema = createInsertSchema(receivedOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create offer schema for frontend (without required backend fields)
export const createOfferFrontendSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.union([z.string(), z.object({ ru: z.string(), en: z.string() })]).optional(),
  goals: z.union([z.string(), z.object({ ru: z.string(), en: z.string() })]).optional(),
  logo: z.string().optional(),
  status: z.string().optional(),
  payoutType: z.string().optional(),
  currency: z.string().optional(),
  landingPages: z.any().optional(),
  kpiConditions: z.union([z.string(), z.object({ ru: z.string(), en: z.string() })]).optional(),
  allowedTrafficSources: z.array(z.string()).optional(),
  trafficSources: z.array(z.string()).optional(),
  allowedApps: z.array(z.string()).optional(),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
  antifraudEnabled: z.boolean().optional(),
  autoApprovePartners: z.boolean().optional(),
  // Allow additional fields that might come from the complex form
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
  goals_ru: z.string().optional(), 
  goals_en: z.string().optional(),
  kpiConditions_ru: z.string().optional(),
  kpiConditions_en: z.string().optional(),
}).transform((data) => {
  // Transform separate language fields into objects
  const result: any = { ...data };
  
  if (data.description_ru !== undefined || data.description_en !== undefined) {
    result.description = {
      ru: data.description_ru || '',
      en: data.description_en || ''
    };
    delete result.description_ru;
    delete result.description_en;
  }
  
  if (data.goals_ru !== undefined || data.goals_en !== undefined) {
    result.goals = {
      ru: data.goals_ru || '',
      en: data.goals_en || ''
    };
    delete result.goals_ru;
    delete result.goals_en;
  }
  
  if (data.kpiConditions_ru !== undefined || data.kpiConditions_en !== undefined) {
    result.kpiConditions = {
      ru: data.kpiConditions_ru || '',
      en: data.kpiConditions_en || ''
    };
    delete result.kpiConditions_ru;
    delete result.kpiConditions_en;
  }
  
  // Map allowedTrafficSources to trafficSources
  if (data.allowedTrafficSources && !data.trafficSources) {
    result.trafficSources = data.allowedTrafficSources;
  }
  
  return result;
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

export const insertPostbackTemplateSchema = createInsertSchema(postbackTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostbackDeliveryLogSchema = createInsertSchema(postbackDeliveryLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingClickSchema = createInsertSchema(trackingClicks).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;
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
export type InsertTrackingClick = z.infer<typeof insertTrackingClickSchema>;
export type TrackingClick = typeof trackingClicks.$inferSelect;
export type InsertReceivedOffer = z.infer<typeof insertReceivedOfferSchema>;
export type ReceivedOffer = typeof receivedOffers.$inferSelect;

// Analytics data schemas
export const insertAnalyticsDataSchema = createInsertSchema(analyticsData);
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type AnalyticsData = typeof analyticsData.$inferSelect;

// Conversion data schemas  
export const insertConversionDataSchema = createInsertSchema(conversionData);
export type InsertConversionData = z.infer<typeof insertConversionDataSchema>;
export type ConversionData = typeof conversionData.$inferSelect;

export const insertCustomRoleSchema = createInsertSchema(customRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomRole = z.infer<typeof insertCustomRoleSchema>;
export type CustomRole = typeof customRoles.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;
export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;

// Fraud detection schemas
export const insertFraudReportSchema = createInsertSchema(fraudReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudRuleSchema = createInsertSchema(fraudRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceTrackingSchema = createInsertSchema(deviceTracking).omit({
  id: true,
  createdAt: true,
});

export const insertIpAnalysisSchema = createInsertSchema(ipAnalysis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudBlockSchema = createInsertSchema(fraudBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FraudReport = typeof fraudReports.$inferSelect;
export type InsertFraudReport = z.infer<typeof insertFraudReportSchema>;
export type FraudRule = typeof fraudRules.$inferSelect;
export type InsertFraudRule = z.infer<typeof insertFraudRuleSchema>;
export type DeviceTracking = typeof deviceTracking.$inferSelect;
export type InsertDeviceTracking = z.infer<typeof insertDeviceTrackingSchema>;
export type IpAnalysis = typeof ipAnalysis.$inferSelect;
export type InsertIpAnalysis = z.infer<typeof insertIpAnalysisSchema>;
export type FraudBlock = typeof fraudBlocks.$inferSelect;
export type InsertFraudBlock = z.infer<typeof insertFraudBlockSchema>;

// Offer domains schemas and types  
export const insertOfferDomainSchema = createInsertSchema(offerDomains).omit({
  id: true,
  createdAt: true,
});

export type OfferDomain = typeof offerDomains.$inferSelect;
export type InsertOfferDomain = z.infer<typeof insertOfferDomainSchema>;
