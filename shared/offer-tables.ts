import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { offerStatusEnum, accessRequestStatusEnum, domainStatusEnum, domainTypeEnum } from "./enums";
import { users } from "./user-tables";

// Offers table
export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number"), // Offer number
  name: text("name").notNull(),
  description: jsonb("description"), // Multilingual: { "en": "English text", "ru": "Russian text" }
  logo: text("logo"), // Logo URL
  image: text("image"), // Offer image URL
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
  payoutByGeo: jsonb("payout_by_geo"), // Object with country-specific payouts
  
  // Creative assets
  creatives: text("creatives"), // Path to zip archive with creative materials
  creativesUrl: text("creatives_url"), // Direct download URL for creatives
  
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
  partnerApprovalType: text("partner_approval_type").default('by_request'), // 'auto', 'manual', 'by_request', 'whitelist_only'
  
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
  status: domainStatusEnum("status").default('pending'),
  type: domainTypeEnum("type").default('redirect'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner Offers (many-to-many relationship)
export const partnerOffers = pgTable("partner_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  isApproved: boolean("is_approved").default(false),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offer Access Requests table
export const offerAccessRequests = pgTable("offer_access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  status: accessRequestStatusEnum("status").default('pending'),
  message: text("message"), // Partner's message with request
  responseMessage: text("response_message"), // Admin's response message
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  
  // Additional info from partner
  expectedVolume: integer("expected_volume"), // Expected conversions per month
  trafficSource: text("traffic_source"),
  websiteUrl: text("website_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creative Files tables
export const creativeFiles = pgTable("creative_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // 'image', 'video', 'archive', 'document'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(), // Path in object storage
  publicUrl: text("public_url"), // URL for public access
  dimensions: text("dimensions"), // "1920x1080" for images/videos
  duration: integer("duration"), // Duration in seconds for videos
  description: text("description"),
  tags: text("tags").array().default([]), // Tags for categorization
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creativeSets = pgTable("creative_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version").default('1.0'),
  isDefault: boolean("is_default").default(false),
  archivePath: text("archive_path"), // Path to ZIP archive
  archiveSize: integer("archive_size"),
  downloadCount: integer("download_count").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creativeSetFiles = pgTable("creative_set_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  setId: varchar("set_id").notNull().references(() => creativeSets.id),
  fileId: varchar("file_id").notNull().references(() => creativeFiles.id),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Domains table
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