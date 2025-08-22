import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

// Offer-related enums
export const offerStatusEnum = pgEnum('offer_status', ['draft', 'pending', 'approved', 'rejected', 'paused', 'archived']);
export const accessRequestStatusEnum = pgEnum('access_request_status', ['pending', 'approved', 'rejected']);

// Core offers table
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

// Offer access requests (partner request access to specific offers)
export const offerAccessRequests = pgTable("offer_access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  partnerId: varchar("partner_id").notNull().references(() => users.id), // Partner requesting access
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id), // Offer owner
  status: accessRequestStatusEnum("status").notNull().default('pending'),
  requestNote: text("request_note"), // Optional note from partner
  responseNote: text("response_note"), // Optional note from advertiser
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  // Additional metadata
  partnerMessage: text("partner_message"), // Custom message from partner
  advertiserResponse: text("advertiser_response"), // Response from advertiser
  expiresAt: timestamp("expires_at"), // Optional expiration date for access
});

// Offer logs for tracking changes
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
  parentId: varchar("parent_id"), // Self-reference for nested categories
  createdAt: timestamp("created_at").defaultNow(),
});

// Received offers (from external networks)
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const offersRelations = relations(offers, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [offers.advertiserId],
    references: [users.id],
  }),
  partnerOffers: many(partnerOffers),
  offerDomains: many(offerDomains),
  offerAccessRequests: many(offerAccessRequests),
  offerLogs: many(offerLogs),
}));

export const offerDomainsRelations = relations(offerDomains, ({ one }) => ({
  offer: one(offers, {
    fields: [offerDomains.offerId],
    references: [offers.id],
  }),
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

export const offerAccessRequestsRelations = relations(offerAccessRequests, ({ one }) => ({
  offer: one(offers, {
    fields: [offerAccessRequests.offerId],
    references: [offers.id],
  }),
  partner: one(users, {
    fields: [offerAccessRequests.partnerId],
    references: [users.id],
    relationName: 'partnerRequests'
  }),
  advertiser: one(users, {
    fields: [offerAccessRequests.advertiserId],
    references: [users.id],
    relationName: 'advertiserRequests'
  }),
  reviewer: one(users, {
    fields: [offerAccessRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewerRequests'
  }),
}));

export const offerLogsRelations = relations(offerLogs, ({ one }) => ({
  offer: one(offers, {
    fields: [offerLogs.offerId],
    references: [offers.id],
  }),
  user: one(users, {
    fields: [offerLogs.userId],
    references: [users.id],
  }),
}));

export const offerCategoriesRelations = relations(offerCategories, ({ one, many }) => ({
  parent: one(offerCategories, {
    fields: [offerCategories.parentId],
    references: [offerCategories.id],
    relationName: 'parentCategory'
  }),
  children: many(offerCategories, { relationName: 'parentCategory' }),
}));

export const receivedOffersRelations = relations(receivedOffers, ({ one }) => ({
  advertiser: one(users, {
    fields: [receivedOffers.advertiserId],
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
    relationName: 'advertiserRatings'
  }),
}));

export const whiteLabelsRelations = relations(whiteLabels, ({ one }) => ({
  advertiser: one(users, {
    fields: [whiteLabels.advertiserId],
    references: [users.id],
  }),
}));

// Schema validations
export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOfferAccessRequestSchema = createInsertSchema(offerAccessRequests).omit({
  id: true,
  requestedAt: true,
});

export const insertReceivedOfferSchema = createInsertSchema(receivedOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerRatingSchema = createInsertSchema(partnerRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhiteLabelSchema = createInsertSchema(whiteLabels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type OfferDomain = typeof offerDomains.$inferSelect;
export type PartnerOffer = typeof partnerOffers.$inferSelect;
export type OfferAccessRequest = typeof offerAccessRequests.$inferSelect;
export type InsertOfferAccessRequest = z.infer<typeof insertOfferAccessRequestSchema>;
export type OfferLog = typeof offerLogs.$inferSelect;
export type OfferCategory = typeof offerCategories.$inferSelect;
export type ReceivedOffer = typeof receivedOffers.$inferSelect;
export type InsertReceivedOffer = z.infer<typeof insertReceivedOfferSchema>;
export type PartnerRating = typeof partnerRatings.$inferSelect;
export type InsertPartnerRating = z.infer<typeof insertPartnerRatingSchema>;
export type WhiteLabel = typeof whiteLabels.$inferSelect;
export type InsertWhiteLabel = z.infer<typeof insertWhiteLabelSchema>;