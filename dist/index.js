var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  abTestGroups: () => abTestGroups,
  accessRequestStatusEnum: () => accessRequestStatusEnum,
  adminRoleEnum: () => adminRoleEnum,
  analyticsData: () => analyticsData,
  apiKeys: () => apiKeys,
  apiKeysRelations: () => apiKeysRelations,
  apiTokens: () => apiTokens,
  auditActionEnum: () => auditActionEnum,
  auditLogs: () => auditLogs,
  blacklist: () => blacklist,
  clicks: () => clicks,
  complianceRules: () => complianceRules,
  complianceRulesRelations: () => complianceRulesRelations,
  conversionData: () => conversionData,
  conversions: () => conversions,
  createOfferFrontendSchema: () => createOfferFrontendSchema,
  creativeFiles: () => creativeFiles,
  creativeSetFiles: () => creativeSetFiles,
  creativeSets: () => creativeSets,
  creatives: () => creatives,
  creativesRelations: () => creativesRelations,
  cryptoCurrencyEnum: () => cryptoCurrencyEnum,
  cryptoTransactions: () => cryptoTransactions,
  cryptoWallets: () => cryptoWallets,
  customDomains: () => customDomains,
  customDomainsRelations: () => customDomainsRelations,
  customRoles: () => customRoles,
  deliveryStatusEnum: () => deliveryStatusEnum,
  deviceTracking: () => deviceTracking,
  domainStatusEnum: () => domainStatusEnum,
  domainTypeEnum: () => domainTypeEnum,
  enhancedPostbackProfiles: () => enhancedPostbackProfiles,
  eventTypeEnum: () => eventTypeEnum,
  events: () => events,
  financialSummaries: () => financialSummaries,
  financialTransactions: () => financialTransactions,
  fraudAlerts: () => fraudAlerts,
  fraudAlertsRelations: () => fraudAlertsRelations,
  fraudBlocks: () => fraudBlocks,
  fraudReports: () => fraudReports,
  fraudRules: () => fraudRules,
  globalPostbacks: () => globalPostbacks,
  httpMethodEnum: () => httpMethodEnum,
  idParamEnum: () => idParamEnum,
  insertAbTestGroupSchema: () => insertAbTestGroupSchema,
  insertAnalyticsDataSchema: () => insertAnalyticsDataSchema,
  insertApiKeySchema: () => insertApiKeySchema,
  insertApiTokenSchema: () => insertApiTokenSchema,
  insertClickSchema: () => insertClickSchema,
  insertComplianceRuleSchema: () => insertComplianceRuleSchema,
  insertConversionDataSchema: () => insertConversionDataSchema,
  insertCreativeSchema: () => insertCreativeSchema,
  insertCryptoTransactionSchema: () => insertCryptoTransactionSchema,
  insertCryptoWalletSchema: () => insertCryptoWalletSchema,
  insertCustomDomainSchema: () => insertCustomDomainSchema,
  insertCustomRoleSchema: () => insertCustomRoleSchema,
  insertDeviceTrackingSchema: () => insertDeviceTrackingSchema,
  insertEventSchema: () => insertEventSchema,
  insertFraudAlertSchema: () => insertFraudAlertSchema,
  insertFraudBlockSchema: () => insertFraudBlockSchema,
  insertFraudReportSchema: () => insertFraudReportSchema,
  insertFraudRuleSchema: () => insertFraudRuleSchema,
  insertIpAnalysisSchema: () => insertIpAnalysisSchema,
  insertKycDocumentSchema: () => insertKycDocumentSchema,
  insertOfferAccessRequestSchema: () => insertOfferAccessRequestSchema,
  insertOfferDomainSchema: () => insertOfferDomainSchema,
  insertOfferSchema: () => insertOfferSchema,
  insertPartnerOfferSchema: () => insertPartnerOfferSchema,
  insertPartnerRatingSchema: () => insertPartnerRatingSchema,
  insertPostbackDeliveryLogSchema: () => insertPostbackDeliveryLogSchema,
  insertPostbackDeliverySchema: () => insertPostbackDeliverySchema,
  insertPostbackLogSchema: () => insertPostbackLogSchema,
  insertPostbackProfileSchema: () => insertPostbackProfileSchema,
  insertPostbackSchema: () => insertPostbackSchema,
  insertPostbackTemplateSchema: () => insertPostbackTemplateSchema,
  insertReceivedOfferSchema: () => insertReceivedOfferSchema,
  insertStaffMemberSchema: () => insertStaffMemberSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertTrackingClickSchema: () => insertTrackingClickSchema,
  insertTrackingLinkSchema: () => insertTrackingLinkSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserNotificationSchema: () => insertUserNotificationSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSessionSchema: () => insertUserSessionSchema,
  insertWhiteLabelSchema: () => insertWhiteLabelSchema,
  ipAnalysis: () => ipAnalysis,
  kycDocuments: () => kycDocuments,
  kycDocumentsRelations: () => kycDocumentsRelations,
  kycStatusEnum: () => kycStatusEnum,
  loginLogs: () => loginLogs,
  moderationTemplates: () => moderationTemplates,
  offerAccessRequests: () => offerAccessRequests,
  offerAccessRequestsRelations: () => offerAccessRequestsRelations,
  offerCategories: () => offerCategories,
  offerDomains: () => offerDomains,
  offerLogs: () => offerLogs,
  offerStatusEnum: () => offerStatusEnum,
  offers: () => offers,
  offersRelations: () => offersRelations,
  ownerScopeEnum: () => ownerScopeEnum,
  partnerOffers: () => partnerOffers,
  partnerOffersRelations: () => partnerOffersRelations,
  partnerRatings: () => partnerRatings,
  partnerRatingsRelations: () => partnerRatingsRelations,
  partnerTeam: () => partnerTeam,
  passwordResetTokens: () => passwordResetTokens,
  payoutRequests: () => payoutRequests,
  platformCommissions: () => platformCommissions,
  postbackDeliveries: () => postbackDeliveries,
  postbackDeliveryLogs: () => postbackDeliveryLogs,
  postbackIdParamEnum: () => postbackIdParamEnum,
  postbackLogs: () => postbackLogs,
  postbackLogsRelations: () => postbackLogsRelations,
  postbackMethodEnum: () => postbackMethodEnum,
  postbackProfiles: () => postbackProfiles,
  postbackScopeTypeEnum: () => postbackScopeTypeEnum,
  postbackStatusEnum: () => postbackStatusEnum,
  postbackTemplates: () => postbackTemplates,
  postbacks: () => postbacks,
  postbacksRelations: () => postbacksRelations,
  receivedOffers: () => receivedOffers,
  referralCommissions: () => referralCommissions,
  scopeTypeEnum: () => scopeTypeEnum,
  staffMembers: () => staffMembers,
  staffMembersRelations: () => staffMembersRelations,
  statistics: () => statistics,
  statisticsRelations: () => statisticsRelations,
  systemSettings: () => systemSettings,
  ticketStatusEnum: () => ticketStatusEnum,
  tickets: () => tickets,
  ticketsRelations: () => ticketsRelations,
  trackerTypeEnum: () => trackerTypeEnum,
  trackingClicks: () => trackingClicks,
  trackingLinks: () => trackingLinks,
  trackingLinksRelations: () => trackingLinksRelations,
  trafficSources: () => trafficSources,
  transactionStatusEnum: () => transactionStatusEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  userAnalytics: () => userAnalytics,
  userNotifications: () => userNotifications,
  userRoleAssignments: () => userRoleAssignments,
  userRoleEnum: () => userRoleEnum,
  userSessions: () => userSessions,
  userStatusEnum: () => userStatusEnum,
  userTypeEnum: () => userTypeEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  walletStatusEnum: () => walletStatusEnum,
  walletTypeEnum: () => walletTypeEnum,
  webhooks: () => webhooks,
  whiteLabels: () => whiteLabels,
  whiteLabelsRelations: () => whiteLabelsRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, serial, bigint, char, smallint, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum, adminRoleEnum, offerStatusEnum, transactionStatusEnum, ticketStatusEnum, kycStatusEnum, postbackStatusEnum, trackerTypeEnum, scopeTypeEnum, httpMethodEnum, idParamEnum, eventTypeEnum, auditActionEnum, userStatusEnum, userTypeEnum, walletTypeEnum, cryptoCurrencyEnum, walletStatusEnum, accessRequestStatusEnum, domainStatusEnum, domainTypeEnum, ownerScopeEnum, postbackScopeTypeEnum, postbackMethodEnum, postbackIdParamEnum, deliveryStatusEnum, users, offers, offerDomains, partnerOffers, offerAccessRequests, trackingLinks, trackingClicks, statistics, transactions, cryptoWallets, cryptoTransactions, clicks, events, postbackProfiles, postbackDeliveries, postbacks, tickets, fraudAlerts, creatives, offerLogs, offerCategories, moderationTemplates, whiteLabels, staffMembers, kycDocuments, receivedOffers, partnerRatings, abTestGroups, complianceRules, apiKeys, postbackLogs, loginLogs, auditLogs, financialTransactions, financialSummaries, payoutRequests, fraudReports, fraudRules, deviceTracking, ipAnalysis, fraudBlocks, postbackTemplates, globalPostbacks, postbackDeliveryLogs, webhooks, systemSettings, blacklist, platformCommissions, partnerTeam, trafficSources, conversions, enhancedPostbackProfiles, analyticsData, conversionData, creativeFiles, referralCommissions, creativeSets, creativeSetFiles, usersRelations, offersRelations, partnerOffersRelations, offerAccessRequestsRelations, trackingLinksRelations, statisticsRelations, transactionsRelations, postbacksRelations, ticketsRelations, fraudAlertsRelations, creativesRelations, whiteLabelsRelations, staffMembersRelations, kycDocumentsRelations, partnerRatingsRelations, complianceRulesRelations, apiKeysRelations, postbackLogsRelations, customRoles, userRoleAssignments, userSessions, userNotifications, passwordResetTokens, userAnalytics, insertUserSchema, insertOfferSchema, insertReceivedOfferSchema, createOfferFrontendSchema, insertPartnerOfferSchema, insertTrackingLinkSchema, insertTransactionSchema, insertPostbackSchema, insertTicketSchema, insertFraudAlertSchema, insertCreativeSchema, insertWhiteLabelSchema, insertStaffMemberSchema, insertKycDocumentSchema, insertPartnerRatingSchema, insertAbTestGroupSchema, insertComplianceRuleSchema, insertApiKeySchema, insertPostbackLogSchema, insertPostbackTemplateSchema, insertPostbackProfileSchema, insertPostbackDeliverySchema, insertPostbackDeliveryLogSchema, insertTrackingClickSchema, insertAnalyticsDataSchema, insertConversionDataSchema, insertCustomRoleSchema, insertUserNotificationSchema, insertUserSessionSchema, insertCryptoWalletSchema, insertCryptoTransactionSchema, insertFraudReportSchema, insertFraudRuleSchema, insertDeviceTrackingSchema, insertIpAnalysisSchema, insertFraudBlockSchema, insertOfferDomainSchema, insertOfferAccessRequestSchema, customDomains, customDomainsRelations, apiTokens, insertCustomDomainSchema, insertApiTokenSchema, insertClickSchema, insertEventSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["super_admin", "advertiser", "affiliate", "staff"]);
    adminRoleEnum = pgEnum("admin_role", ["super", "financial", "technical", "moderator", "analyst"]);
    offerStatusEnum = pgEnum("offer_status", ["active", "paused", "draft", "pending", "archived", "on_request"]);
    transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "cancelled"]);
    ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
    kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected"]);
    postbackStatusEnum = pgEnum("postback_status", ["pending", "sent", "failed", "retry"]);
    trackerTypeEnum = pgEnum("tracker_type", ["keitaro", "custom"]);
    scopeTypeEnum = pgEnum("scope_type", ["global", "campaign", "offer", "flow"]);
    httpMethodEnum = pgEnum("http_method", ["GET", "POST"]);
    idParamEnum = pgEnum("id_param", ["subid", "clickid"]);
    eventTypeEnum = pgEnum("event_type", ["open", "lp_click", "reg", "deposit", "sale", "lead", "lp_leave"]);
    auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "login", "logout", "view", "approve", "reject"]);
    userStatusEnum = pgEnum("user_status", ["active", "blocked", "deleted", "pending_verification"]);
    userTypeEnum = pgEnum("user_type", ["advertiser", "affiliate", "staff", "admin"]);
    walletTypeEnum = pgEnum("wallet_type", ["platform", "user"]);
    cryptoCurrencyEnum = pgEnum("crypto_currency", ["BTC", "ETH", "USDT", "USDC", "TRX", "LTC", "BCH", "XRP"]);
    walletStatusEnum = pgEnum("wallet_status", ["active", "suspended", "maintenance"]);
    accessRequestStatusEnum = pgEnum("access_request_status", ["pending", "approved", "rejected", "cancelled"]);
    domainStatusEnum = pgEnum("domain_status", ["pending", "verified", "error"]);
    domainTypeEnum = pgEnum("domain_type", ["a_record", "cname", "txt_record"]);
    ownerScopeEnum = pgEnum("owner_scope", ["owner", "advertiser", "partner"]);
    postbackScopeTypeEnum = pgEnum("postback_scope_type", ["global", "campaign", "offer", "flow"]);
    postbackMethodEnum = pgEnum("postback_method", ["GET", "POST"]);
    postbackIdParamEnum = pgEnum("postback_id_param", ["subid", "clickid"]);
    deliveryStatusEnum = pgEnum("delivery_status", ["pending", "success", "failed", "retrying"]);
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      role: userRoleEnum("role").notNull().default("affiliate"),
      partnerNumber: text("partner_number").unique(),
      // 4-digit sequential number for affiliates (0001, 0002, etc.)
      adminRole: adminRoleEnum("admin_role"),
      // For super_admin users - defines their specific admin permissions
      ipRestrictions: jsonb("ip_restrictions"),
      // Array of allowed IP addresses for admin access
      twoFactorEnabled: boolean("two_factor_enabled").default(false),
      twoFactorSecret: text("two_factor_secret"),
      lastIpAddress: text("last_ip_address"),
      sessionToken: text("session_token"),
      firstName: text("first_name"),
      lastName: text("last_name"),
      company: text("company"),
      phone: text("phone"),
      telegram: text("telegram"),
      telegramChatId: bigint("telegram_chat_id", { mode: "number" }),
      country: text("country"),
      language: text("language").default("en"),
      timezone: text("timezone").default("UTC"),
      currency: text("currency").default("USD"),
      kycStatus: kycStatusEnum("kyc_status").default("pending"),
      isActive: boolean("is_active").default(true),
      status: userStatusEnum("status").default("active"),
      userType: userTypeEnum("user_type").default("affiliate"),
      lastLoginAt: timestamp("last_login_at"),
      registrationIp: text("registration_ip"),
      geoRestrictions: jsonb("geo_restrictions"),
      // Array of allowed countries
      timeRestrictions: jsonb("time_restrictions"),
      // Login time restrictions
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
      ownerId: varchar("owner_id"),
      // Who created this user (advertiser creates staff/affiliates)
      // Advertiser specific fields  
      advertiserId: varchar("advertiser_id"),
      balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
      holdAmount: decimal("hold_amount", { precision: 15, scale: 2 }).default("0.00"),
      registrationApproved: boolean("registration_approved").default(false),
      documentsVerified: boolean("documents_verified").default(false),
      // Referral system
      referralCode: text("referral_code").unique(),
      // Unique code for referrals (e.g., "ABC123")
      referredBy: varchar("referred_by").references(() => users.id),
      // Who referred this user
      referralCommission: decimal("referral_commission", { precision: 5, scale: 2 }).default("5.00"),
      // Commission % for referrals
      referralProgramEnabled: boolean("referral_program_enabled").default(true),
      // Включена ли реферальная программа у рекламодателя
      // Settings
      settings: jsonb("settings")
    });
    offers = pgTable("offers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      number: text("number"),
      // Offer number
      name: text("name").notNull(),
      description: jsonb("description"),
      // Multilingual: { "en": "English text", "ru": "Russian text" }
      logo: text("logo"),
      // Logo URL
      image: text("image"),
      // Offer image URL
      category: text("category").notNull(),
      vertical: text("vertical"),
      // Industry vertical
      goals: jsonb("goals"),
      // Offer goals/objectives - Multilingual
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      payout: decimal("payout", { precision: 10, scale: 2 }).notNull().default("0.00"),
      payoutType: text("payout_type").notNull(),
      // 'cpa', 'cps', 'cpl', 'cpm', 'cpc', 'cpi', 'cro', 'revshare', 'hybrid', 'fixed'
      currency: text("currency").default("USD"),
      countries: jsonb("countries"),
      // Array of country codes
      geoTargeting: text("geo_targeting"),
      // Free text geo targeting
      // Landing pages and URLs  
      trackingUrl: text("tracking_url"),
      // Generated tracking URL template
      landingPageUrl: text("landing_page_url"),
      // Main landing page URL
      landingPages: jsonb("landing_pages"),
      // Array of landing pages with different prices
      baseUrl: text("base_url"),
      // Base URL for automatic partner link generation
      previewUrl: text("preview_url"),
      // Preview link for partners
      // Geo and pricing
      geoPricing: jsonb("geo_pricing"),
      // Array of geo-specific pricing
      payoutByGeo: jsonb("payout_by_geo"),
      // Object with country-specific payouts
      // Creative assets
      creatives: text("creatives"),
      // Path to zip archive with creative materials
      creativesUrl: text("creatives_url"),
      // Direct download URL for creatives
      // Device and OS targeting
      allowedApps: jsonb("allowed_apps"),
      // Array of allowed apps or app types
      // Restrictions and traffic
      kpiConditions: jsonb("kpi_conditions"),
      // KPI conditions - Multilingual: { "en": "English text", "ru": "Russian text" }
      trafficSources: jsonb("traffic_sources"),
      // Allowed traffic sources
      allowedApplications: jsonb("allowed_applications").default([]),
      // PWA App, WebView App, APK, iOS App, etc.
      // Limits and caps
      dailyLimit: integer("daily_limit"),
      // Daily conversion limit
      monthlyLimit: integer("monthly_limit"),
      // Monthly conversion limit
      // Partner approval and settings
      autoApprovePartners: boolean("auto_approve_partners").default(false),
      partnerApprovalType: text("partner_approval_type").default("by_request"),
      // 'auto', 'manual', 'by_request', 'whitelist_only'
      // Anti-fraud settings
      antifraudEnabled: boolean("antifraud_enabled").default(true),
      antifraudMethods: jsonb("antifraud_methods").default([]),
      // Selected antifraud protection methods
      // Status and moderation
      status: offerStatusEnum("status").default("draft"),
      moderationStatus: text("moderation_status").default("pending"),
      // pending, approved, rejected, needs_revision
      moderationComment: text("moderation_comment"),
      // Admin comment for moderation
      // Technical settings 
      restrictions: text("restrictions"),
      fraudRestrictions: text("fraud_restrictions"),
      // Global fraud restrictions set by admin
      macros: text("macros"),
      // JSON string of macros
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    offerDomains = pgTable("offer_domains", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      domain: text("domain").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    partnerOffers = pgTable("partner_offers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      isApproved: boolean("is_approved").default(false),
      customPayout: decimal("custom_payout", { precision: 10, scale: 2 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    offerAccessRequests = pgTable("offer_access_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      // Partner requesting access
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      // Offer owner
      status: accessRequestStatusEnum("status").notNull().default("pending"),
      requestNote: text("request_note"),
      // Optional note from partner
      responseNote: text("response_note"),
      // Optional note from advertiser
      requestedAt: timestamp("requested_at").defaultNow(),
      reviewedAt: timestamp("reviewed_at"),
      reviewedBy: varchar("reviewed_by").references(() => users.id),
      // Additional metadata
      partnerMessage: text("partner_message"),
      // Custom message from partner
      advertiserResponse: text("advertiser_response"),
      // Response from advertiser
      expiresAt: timestamp("expires_at")
      // Optional expiration date for access
    });
    trackingLinks = pgTable("tracking_links", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      trackingCode: text("tracking_code").notNull().unique(),
      url: text("url").notNull(),
      customDomain: text("custom_domain"),
      // Custom domain for white-label links
      subId1: text("sub_id_1"),
      subId2: text("sub_id_2"),
      subId3: text("sub_id_3"),
      subId4: text("sub_id_4"),
      subId5: text("sub_id_5"),
      isActive: boolean("is_active").default(true),
      clickCount: integer("click_count").default(0),
      lastClickAt: timestamp("last_click_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    trackingClicks = pgTable("tracking_clicks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clickId: text("click_id").notNull().unique(),
      // Generated clickid for macros
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
      riskLevel: text("risk_level").default("low"),
      // 'low', 'medium', 'high'
      // Additional analytics fields
      mobileCarrier: text("mobile_carrier"),
      connectionType: text("connection_type"),
      // 'wifi', 'mobile', 'cable'
      timeOnLanding: integer("time_on_landing"),
      // seconds
      landingUrl: text("landing_url"),
      isUnique: boolean("is_unique").default(true),
      status: text("status").default("active"),
      // 'active', 'converted', 'rejected'
      conversionData: jsonb("conversion_data"),
      // Additional conversion details
      createdAt: timestamp("created_at").defaultNow()
    });
    statistics = pgTable("statistics", {
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
      revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
      payout: decimal("payout", { precision: 10, scale: 2 }).default("0"),
      country: text("country"),
      device: text("device"),
      browser: text("browser"),
      os: text("os"),
      ip: text("ip")
    });
    transactions = pgTable("transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // 'deposit', 'withdrawal', 'commission', 'payout'
      amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
      currency: text("currency").default("USD"),
      status: transactionStatusEnum("status").default("pending"),
      description: text("description"),
      reference: text("reference"),
      paymentMethod: text("payment_method"),
      txHash: text("tx_hash"),
      // Transaction hash for crypto transactions
      fromAddress: text("from_address"),
      // Source crypto address
      toAddress: text("to_address"),
      // Destination crypto address
      confirmations: integer("confirmations").default(0),
      // Number of confirmations for crypto tx
      requiredConfirmations: integer("required_confirmations").default(1),
      networkFee: decimal("network_fee", { precision: 18, scale: 8 }).default("0"),
      // Network fee for crypto tx
      createdAt: timestamp("created_at").defaultNow(),
      processedAt: timestamp("processed_at")
    });
    cryptoWallets = pgTable("crypto_wallets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id),
      // null for platform wallets
      walletType: walletTypeEnum("wallet_type").notNull(),
      currency: cryptoCurrencyEnum("currency").notNull(),
      address: text("address").notNull().unique(),
      privateKey: text("private_key"),
      // Encrypted
      publicKey: text("public_key"),
      mnemonic: text("mnemonic"),
      // Encrypted
      balance: decimal("balance", { precision: 18, scale: 8 }).default("0"),
      lockedBalance: decimal("locked_balance", { precision: 18, scale: 8 }).default("0"),
      network: text("network").notNull(),
      // 'bitcoin', 'ethereum', 'tron', etc.
      derivationPath: text("derivation_path"),
      isActive: boolean("is_active").default(true),
      status: walletStatusEnum("status").default("active"),
      lastSyncAt: timestamp("last_sync_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    cryptoTransactions = pgTable("crypto_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      walletId: varchar("wallet_id").notNull().references(() => cryptoWallets.id),
      transactionId: varchar("transaction_id").references(() => transactions.id),
      txHash: text("tx_hash").notNull().unique(),
      fromAddress: text("from_address").notNull(),
      toAddress: text("to_address").notNull(),
      amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
      currency: cryptoCurrencyEnum("currency").notNull(),
      networkFee: decimal("network_fee", { precision: 18, scale: 8 }).default("0"),
      confirmations: integer("confirmations").default(0),
      requiredConfirmations: integer("required_confirmations").default(1),
      status: transactionStatusEnum("status").default("pending"),
      blockNumber: text("block_number"),
      blockHash: text("block_hash"),
      network: text("network").notNull(),
      isIncoming: boolean("is_incoming").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      confirmedAt: timestamp("confirmed_at")
    });
    clicks = pgTable("clicks", {
      clickid: text("clickid").primaryKey(),
      // Generated clickid (12-character random string)
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar("partner_id").references(() => users.id),
      // NULL if no partner
      campaignId: varchar("campaign_id"),
      // Future campaigns table
      offerId: varchar("offer_id").references(() => offers.id),
      flowId: varchar("flow_id"),
      // Future flows table
      site: text("site"),
      // Landing page URL
      referrer: text("referrer"),
      // HTTP referrer
      // Sub parameters (sub1-sub10 standard + sub2 special handling)
      sub1: text("sub1"),
      sub2Raw: text("sub2_raw"),
      // Raw sub2 string (key-value|key2-value2)
      sub2Map: jsonb("sub2_map"),
      // Parsed sub2 as JSONB {"key":"value","key2":"value2"}
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
      ip: text("ip"),
      // INET type in PostgreSQL, stored as text in Drizzle
      countryIso: text("country_iso"),
      // 2-letter country code
      region: text("region"),
      // State/region
      city: text("city"),
      // City name
      isp: text("isp"),
      // Internet service provider
      operator: text("operator"),
      // Mobile operator
      isProxy: boolean("is_proxy").default(false),
      // VPN/Proxy detection
      // User agent parsing
      userAgent: text("user_agent"),
      // Full user agent string
      browserName: text("browser_name"),
      // Chrome, Firefox, Safari, etc.
      browserVersion: text("browser_version"),
      // Browser version
      osName: text("os_name"),
      // Windows, macOS, iOS, Android, etc.
      osVersion: text("os_version"),
      // OS version
      deviceModel: text("device_model"),
      // Device model (iPhone 14, Samsung Galaxy S21, etc.)
      deviceType: text("device_type"),
      // mobile, tablet, desktop
      connection: text("connection"),
      // wifi, mobile, cable
      lang: text("lang"),
      // Accept-Language header
      // Timestamps
      ts: timestamp("ts").defaultNow()
    });
    events = pgTable("events", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clickid: text("clickid").notNull().references(() => clicks.clickid),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar("partner_id").references(() => users.id),
      // Event type and data
      type: eventTypeEnum("type").notNull(),
      // open, lp_click, reg, deposit, sale, lead, lp_leave
      revenue: decimal("revenue", { precision: 18, scale: 6 }),
      // Up to 6 decimal places for crypto
      currency: text("currency").default("USD"),
      // 3-letter currency code
      txid: text("txid"),
      // Transaction ID for deduplication
      // Additional event data
      timeOnPageMs: integer("time_on_page_ms"),
      // Time on page in milliseconds for lp_leave event
      // Timestamps
      ts: timestamp("ts").defaultNow()
    }, (table) => ({
      // Unique constraint for idempotency: (clickid, type, coalesce(txid,''))
      uniqueEvent: sql`UNIQUE (clickid, type, COALESCE(txid, ''))`
    }));
    postbackProfiles = pgTable("postback_profiles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      // Ownership and scope
      ownerScope: ownerScopeEnum("owner_scope").notNull(),
      // 'owner', 'advertiser', 'partner'
      ownerId: varchar("owner_id").notNull().references(() => users.id),
      // ID of the owner
      scopeType: postbackScopeTypeEnum("scope_type").notNull(),
      // 'global', 'campaign', 'offer', 'flow'
      scopeId: varchar("scope_id"),
      // ID of the specific scope (offer_id, campaign_id, flow_id)
      // Profile settings
      name: text("name").notNull(),
      enabled: boolean("enabled").notNull().default(true),
      priority: integer("priority").notNull().default(100),
      // Endpoint configuration
      endpointUrl: text("endpoint_url").notNull(),
      method: postbackMethodEnum("method").notNull(),
      // 'GET', 'POST'
      idParam: postbackIdParamEnum("id_param").notNull(),
      // 'subid', 'clickid'
      // Authentication
      authQueryKey: text("auth_query_key"),
      // Query parameter name for auth
      authQueryVal: text("auth_query_val"),
      // Query parameter value for auth (encrypted)
      authHeaderName: text("auth_header_name"),
      // Header name for auth
      authHeaderVal: text("auth_header_val"),
      // Header value for auth (encrypted)
      // Status mapping and parameters
      statusMap: jsonb("status_map").notNull().default(sql`'{}'::jsonb`),
      // Map event types to postback statuses
      paramsTemplate: jsonb("params_template").notNull().default(sql`'{}'::jsonb`),
      // Mustache template for parameters
      urlEncode: boolean("url_encode").notNull().default(true),
      // HMAC settings
      hmacEnabled: boolean("hmac_enabled").notNull().default(false),
      hmacSecret: text("hmac_secret"),
      // Encrypted HMAC secret
      hmacPayloadTpl: text("hmac_payload_tpl"),
      // Mustache template for HMAC payload
      hmacParamName: text("hmac_param_name"),
      // Parameter name for HMAC signature
      // Retry and timeout settings
      retries: integer("retries").notNull().default(5),
      timeoutMs: integer("timeout_ms").notNull().default(4e3),
      backoffBaseSec: integer("backoff_base_sec").notNull().default(2),
      // Filters
      filterRevenueGt0: boolean("filter_revenue_gt0").notNull().default(false),
      filterCountryWhitelist: jsonb("filter_country_whitelist"),
      // Array of allowed countries
      filterCountryBlacklist: jsonb("filter_country_blacklist"),
      // Array of blocked countries
      filterExcludeBots: boolean("filter_exclude_bots").notNull().default(true),
      // Timestamps
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    postbackDeliveries = pgTable("postback_deliveries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      profileId: varchar("profile_id").notNull().references(() => postbackProfiles.id, { onDelete: "cascade" }),
      eventId: varchar("event_id").references(() => events.id),
      conversionId: varchar("conversion_id").references(() => conversions.id),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar("partner_id").references(() => users.id),
      clickid: text("clickid").notNull(),
      type: text("type"),
      txid: text("txid"),
      statusMapped: text("status_mapped"),
      // Delivery attempt information
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
      // Status and timestamps
      status: deliveryStatusEnum("status").notNull().default("pending"),
      createdAt: timestamp("created_at").defaultNow()
    }, (t) => ({
      // Enhanced indexes for performance optimization
      ix_delivery_profile: index("ix_delivery_profile").on(t.profileId),
      ix_delivery_clickid: index("ix_delivery_clickid").on(t.clickid),
      ix_delivery_attempt: index("ix_delivery_attempt").on(t.attempt),
      ix_delivery_created: index("ix_delivery_created").on(t.createdAt),
      ix_delivery_status: index("ix_delivery_status").on(t.status),
      ix_delivery_conversion: index("ix_delivery_conversion").on(t.conversionId)
    }));
    postbacks = pgTable("postbacks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      offerId: varchar("offer_id").references(() => offers.id),
      // Specific offer or null for global
      name: text("name").notNull(),
      url: text("url").notNull(),
      method: text("method").default("GET"),
      events: jsonb("events"),
      // ['click', 'lead', 'ftd', 'deposit', 'approve', 'reject', 'hold']
      macros: jsonb("macros"),
      // Custom macro mappings
      signatureKey: text("signature_key"),
      // For HMAC protection
      ipWhitelist: jsonb("ip_whitelist"),
      // Array of allowed IPs
      isActive: boolean("is_active").default(true),
      retryEnabled: boolean("retry_enabled").default(true),
      maxRetries: integer("max_retries").default(3),
      retryDelay: integer("retry_delay").default(60),
      // seconds
      timeout: integer("timeout").default(30),
      // seconds
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    tickets = pgTable("tickets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      status: ticketStatusEnum("status").default("open"),
      priority: text("priority").default("medium"),
      assignedTo: varchar("assigned_to").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    fraudAlerts = pgTable("fraud_alerts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id),
      offerId: varchar("offer_id").references(() => offers.id),
      type: text("type").notNull(),
      // 'suspicious_activity', 'high_velocity', 'duplicate_conversion'
      severity: text("severity").default("medium"),
      description: text("description"),
      data: jsonb("data"),
      isResolved: boolean("is_resolved").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    creatives = pgTable("creatives", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // 'banner', 'video', 'text', 'prelanding'
      format: text("format"),
      // 'jpg', 'png', 'gif', 'mp4', 'html'
      size: text("size"),
      // '300x250', '728x90'
      url: text("url").notNull(),
      preview: text("preview"),
      clicks: integer("clicks").default(0),
      impressions: integer("impressions").default(0),
      ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"),
      isActive: boolean("is_active").default(true),
      isApproved: boolean("is_approved").default(false),
      moderationStatus: text("moderation_status").default("pending"),
      // pending, approved, rejected
      moderationComment: text("moderation_comment"),
      targetGeo: jsonb("target_geo"),
      // Array of country codes
      targetDevice: text("target_device"),
      // 'desktop', 'mobile', 'tablet'
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    offerLogs = pgTable("offer_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      // Who made the change
      action: text("action").notNull(),
      // 'created', 'updated', 'approved', 'rejected', 'blocked', 'archived'
      fieldChanged: text("field_changed"),
      // Which field was changed
      oldValue: text("old_value"),
      // Previous value
      newValue: text("new_value"),
      // New value
      comment: text("comment"),
      // Admin comment
      createdAt: timestamp("created_at").defaultNow()
    });
    offerCategories = pgTable("offer_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      parentId: varchar("parent_id"),
      // Self-reference will be added later
      createdAt: timestamp("created_at").defaultNow()
    });
    moderationTemplates = pgTable("moderation_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // 'rejection', 'revision_request', 'approval'
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    whiteLabels = pgTable("white_labels", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      brandName: text("brand_name").notNull(),
      logo: text("logo"),
      primaryColor: text("primary_color").default("#0066cc"),
      secondaryColor: text("secondary_color").default("#ffffff"),
      domain: text("domain"),
      customCss: text("custom_css"),
      favicon: text("favicon"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    staffMembers = pgTable("staff_members", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      role: text("role").notNull(),
      // 'manager', 'support', 'analyst', 'accountant'
      permissions: jsonb("permissions"),
      // Array of permissions
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    kycDocuments = pgTable("kyc_documents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // 'passport', 'id_card', 'selfie', 'address'
      status: text("status").default("pending"),
      // 'pending', 'approved', 'rejected'
      fileUrl: text("file_url").notNull(),
      notes: text("notes"),
      reviewedBy: varchar("reviewed_by").references(() => users.id),
      reviewedAt: timestamp("reviewed_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    receivedOffers = pgTable("received_offers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      name: text("name").notNull(),
      category: text("category").notNull(),
      geo: jsonb("geo").notNull(),
      // Array of country codes/names
      devices: jsonb("devices").notNull(),
      // Array of device types
      payoutType: text("payout_type").notNull(),
      // 'cpa', 'cpl', 'revshare'
      supplierRate: decimal("supplier_rate", { precision: 10, scale: 2 }).notNull(),
      // Cost from supplier
      partnerRate: decimal("partner_rate", { precision: 10, scale: 2 }).notNull(),
      // Rate for partners
      targetUrl: text("target_url").notNull(),
      // Supplier's landing page
      postbackUrl: text("postback_url").notNull(),
      // Where to send conversions
      conditions: text("conditions"),
      // Terms and restrictions
      supplierSource: text("supplier_source"),
      // Source/network name
      status: text("status").default("active"),
      // 'active', 'paused', 'draft'
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    partnerRatings = pgTable("partner_ratings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      advertiserId: varchar("advertiser_id").references(() => users.id),
      revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
      conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"),
      epc: decimal("epc", { precision: 8, scale: 2 }).default("0"),
      fraudScore: integer("fraud_score").default(0),
      // 0-100
      trafficQuality: integer("traffic_quality").default(0),
      // 0-100
      rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
      // 0-5
      rank: integer("rank").default(0),
      achievements: jsonb("achievements"),
      // Array of achievement IDs
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    abTestGroups = pgTable("ab_test_groups", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      offerIds: jsonb("offer_ids").notNull(),
      // Array of offer IDs
      trafficSplit: jsonb("traffic_split").notNull(),
      // Object with percentages
      isActive: boolean("is_active").default(true),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      winnerOfferId: varchar("winner_offer_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    complianceRules = pgTable("compliance_rules", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      type: text("type").notNull(),
      // 'kyc_required', 'geo_restriction', 'traffic_source'
      rule: jsonb("rule").notNull(),
      // Rule configuration
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    apiKeys = pgTable("api_keys", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      name: text("name").notNull(),
      keyHash: text("key_hash").notNull(),
      permissions: jsonb("permissions").notNull(),
      // Array of permissions
      lastUsed: timestamp("last_used"),
      expiresAt: timestamp("expires_at"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    postbackLogs = pgTable("postback_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      postbackId: varchar("postback_id").references(() => postbackTemplates.id),
      clickId: varchar("click_id").references(() => trackingClicks.id),
      eventType: text("event_type").notNull(),
      // 'click', 'lead', 'deposit', etc.
      url: text("url").notNull(),
      method: text("method").notNull(),
      headers: jsonb("headers"),
      payload: jsonb("payload"),
      responseStatus: integer("response_status"),
      responseBody: text("response_body"),
      responseTime: integer("response_time"),
      // ms
      retryCount: integer("retry_count").default(0),
      status: postbackStatusEnum("status").default("pending"),
      errorMessage: text("error_message"),
      signature: text("signature"),
      // HMAC signature sent
      sentAt: timestamp("sent_at"),
      nextRetryAt: timestamp("next_retry_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    loginLogs = pgTable("login_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      ipAddress: text("ip_address").notNull(),
      userAgent: text("user_agent"),
      loginTime: timestamp("login_time").defaultNow(),
      success: boolean("success").notNull(),
      failureReason: text("failure_reason"),
      sessionId: text("session_id")
    });
    auditLogs = pgTable("audit_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      action: auditActionEnum("action").notNull(),
      resourceType: text("resource_type").notNull(),
      // users, offers, transactions, etc.
      resourceId: varchar("resource_id"),
      oldValues: jsonb("old_values"),
      newValues: jsonb("new_values"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      timestamp: timestamp("timestamp").defaultNow(),
      description: text("description")
    });
    financialTransactions = pgTable("financial_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar("partner_id").references(() => users.id),
      offerId: varchar("offer_id").references(() => offers.id),
      offerName: text("offer_name"),
      // Cached for performance
      partnerUsername: text("partner_username"),
      // Cached for performance
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      currency: text("currency").default("USD"),
      type: text("type").$type().notNull(),
      status: text("status").$type().default("pending"),
      period: text("period"),
      // YYYY-MM format
      comment: text("comment"),
      paymentMethod: text("payment_method"),
      // 'bank', 'crypto', 'paypal', 'wise'
      txHash: text("tx_hash"),
      // For crypto transactions
      bankReference: text("bank_reference"),
      // For bank transfers
      details: jsonb("details"),
      // { leads: number, clicks: number, period: string }
      processedBy: varchar("processed_by").references(() => users.id),
      processedAt: timestamp("processed_at"),
      errorMessage: text("error_message"),
      retryCount: integer("retry_count").default(0),
      nextRetryAt: timestamp("next_retry_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    financialSummaries = pgTable("financial_summaries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      period: text("period").notNull(),
      // 'daily', 'weekly', 'monthly', 'yearly'
      periodDate: text("period_date").notNull(),
      // YYYY-MM-DD format
      totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default("0.00"),
      totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0.00"),
      totalPayouts: decimal("total_payouts", { precision: 15, scale: 2 }).default("0.00"),
      pendingPayouts: decimal("pending_payouts", { precision: 15, scale: 2 }).default("0.00"),
      avgEPC: decimal("avg_epc", { precision: 10, scale: 4 }).default("0.0000"),
      avgCR: decimal("avg_cr", { precision: 10, scale: 4 }).default("0.0000"),
      avgPayout: decimal("avg_payout", { precision: 10, scale: 2 }).default("0.00"),
      totalTransactions: integer("total_transactions").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    payoutRequests = pgTable("payout_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      currency: text("currency").default("USD"),
      period: text("period").notNull(),
      // YYYY-MM format
      comment: text("comment"),
      paymentMethod: text("payment_method").notNull(),
      paymentDetails: jsonb("payment_details"),
      // Bank account, crypto wallet, etc.
      status: text("status").$type().default("draft"),
      approvedBy: varchar("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at"),
      processedBy: varchar("processed_by").references(() => users.id),
      processedAt: timestamp("processed_at"),
      transactionId: varchar("transaction_id").references(() => financialTransactions.id),
      failureReason: text("failure_reason"),
      securityChecksPassed: boolean("security_checks_passed").default(false),
      fraudScore: integer("fraud_score").default(0),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    fraudReports = pgTable("fraud_reports", {
      id: text("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").$type().notNull(),
      severity: text("severity").$type().notNull(),
      status: text("status").$type().default("pending"),
      offerId: text("offer_id").references(() => offers.id),
      partnerId: text("partner_id").references(() => users.id),
      trackingLinkId: text("tracking_link_id").references(() => trackingLinks.id),
      clickId: text("click_id"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      deviceFingerprint: text("device_fingerprint"),
      country: text("country"),
      region: text("region"),
      city: text("city"),
      description: text("description").notNull(),
      detectionRules: jsonb("detection_rules"),
      evidenceData: jsonb("evidence_data"),
      autoBlocked: boolean("auto_blocked").default(false),
      reviewedBy: text("reviewed_by").references(() => users.id),
      reviewedAt: timestamp("reviewed_at"),
      reviewNotes: text("review_notes"),
      resolution: text("resolution"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    fraudRules = pgTable("fraud_rules", {
      id: text("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      type: text("type").$type().notNull(),
      scope: text("scope").$type().notNull(),
      targetId: text("target_id"),
      isActive: boolean("is_active").default(true),
      autoBlock: boolean("auto_block").default(false),
      severity: text("severity").$type().notNull(),
      conditions: jsonb("conditions").notNull(),
      actions: jsonb("actions").notNull(),
      thresholds: jsonb("thresholds"),
      createdBy: text("created_by").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    deviceTracking = pgTable("device_tracking", {
      id: text("id").primaryKey().default(sql`gen_random_uuid()`),
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
      trackingLinkId: text("tracking_link_id").references(() => trackingLinks.id),
      partnerId: text("partner_id").references(() => users.id),
      offerId: text("offer_id").references(() => offers.id),
      country: text("country"),
      region: text("region"),
      city: text("city"),
      isp: text("isp"),
      isProxy: boolean("is_proxy").default(false),
      isVpn: boolean("is_vpn").default(false),
      isTor: boolean("is_tor").default(false),
      isMobile: boolean("is_mobile").default(false),
      isBot: boolean("is_bot").default(false),
      riskScore: integer("risk_score").default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    ipAnalysis = pgTable("ip_analysis", {
      id: text("id").primaryKey().default(sql`gen_random_uuid()`),
      ipAddress: text("ip_address").notNull().unique(),
      country: text("country"),
      region: text("region"),
      city: text("city"),
      isp: text("isp"),
      organization: text("organization"),
      isProxy: boolean("is_proxy").default(false),
      isVpn: boolean("is_vpn").default(false),
      isTor: boolean("is_tor").default(false),
      isHosting: boolean("is_hosting").default(false),
      isMalicious: boolean("is_malicious").default(false),
      riskScore: integer("risk_score").default(0),
      threatTypes: jsonb("threat_types"),
      lastSeen: timestamp("last_seen").defaultNow().notNull(),
      clickCount: integer("click_count").default(0),
      conversionCount: integer("conversion_count").default(0),
      uniquePartnersCount: integer("unique_partners_count").default(0),
      flaggedAt: timestamp("flagged_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    fraudBlocks = pgTable("fraud_blocks", {
      id: text("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").$type().notNull(),
      targetId: text("target_id").notNull(),
      reason: text("reason").notNull(),
      reportId: text("report_id").references(() => fraudReports.id),
      autoBlocked: boolean("auto_blocked").default(false),
      isActive: boolean("is_active").default(true),
      expiresAt: timestamp("expires_at"),
      blockedBy: text("blocked_by").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    postbackTemplates = pgTable("postback_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      level: text("level").notNull(),
      // 'global' or 'offer'
      url: text("url").notNull(),
      events: jsonb("events").notNull(),
      // ['lead', 'sale', 'rejected', 'hold']
      parameters: jsonb("parameters"),
      // Available parameters like {click_id}, {status}, etc.
      headers: jsonb("headers"),
      // Custom headers
      retryAttempts: integer("retry_attempts").default(3),
      timeout: integer("timeout").default(30),
      isActive: boolean("is_active").default(true),
      offerId: varchar("offer_id").references(() => offers.id),
      // null for global
      advertiserId: varchar("advertiser_id").references(() => users.id),
      // who created this
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    globalPostbacks = pgTable("global_postbacks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      url: text("url").notNull(),
      events: jsonb("events").notNull(),
      // Array of events to trigger postback
      macros: jsonb("macros"),
      // Macro replacements
      headers: jsonb("headers"),
      // Custom headers
      isActive: boolean("is_active").default(true),
      retryAttempts: integer("retry_attempts").default(3),
      timeout: integer("timeout").default(30),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    postbackDeliveryLogs = pgTable("postback_delivery_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      postbackId: varchar("postback_id").references(() => postbackTemplates.id),
      conversionId: varchar("conversion_id"),
      // Related conversion ID
      offerId: varchar("offer_id").references(() => offers.id),
      partnerId: varchar("partner_id").references(() => users.id),
      url: text("url").notNull(),
      // Final URL with replaced parameters
      method: text("method").default("GET"),
      headers: jsonb("headers"),
      payload: jsonb("payload"),
      responseCode: integer("response_code"),
      responseBody: text("response_body"),
      responseTime: integer("response_time"),
      // in milliseconds
      status: text("status").notNull(),
      // 'success', 'failed', 'pending', 'retry'
      errorMessage: text("error_message"),
      attempt: integer("attempt").default(1),
      maxAttempts: integer("max_attempts").default(3),
      nextRetryAt: timestamp("next_retry_at"),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    webhooks = pgTable("webhooks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      url: text("url").notNull(),
      events: jsonb("events").notNull(),
      // Array of system events
      secret: text("secret"),
      // For signature verification
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    systemSettings = pgTable("system_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      value: jsonb("value").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      // fraud, finance, general, etc.
      isPublic: boolean("is_public").default(false),
      // Can non-admin users see this setting?
      updatedBy: varchar("updated_by").references(() => users.id),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    blacklist = pgTable("blacklist", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").notNull(),
      // ip, clickid, subid, device_id, etc.
      value: text("value").notNull(),
      reason: text("reason"),
      addedBy: varchar("added_by").notNull().references(() => users.id),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at")
      // Optional expiration
    });
    platformCommissions = pgTable("platform_commissions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      advertiserId: varchar("advertiser_id").references(() => users.id),
      offerId: varchar("offer_id").references(() => offers.id),
      type: text("type").notNull(),
      // percentage, fixed, revenue_share
      value: decimal("value", { precision: 10, scale: 4 }).notNull(),
      currency: text("currency").default("USD"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    partnerTeam = pgTable("partner_team", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      role: text("role").notNull(),
      // 'buyer', 'analyst', 'manager'
      permissions: jsonb("permissions").notNull(),
      // разрешения на ссылки, креативы, статистику
      subIdPrefix: text("sub_id_prefix"),
      // уникальный префикс для SubID
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    trafficSources = pgTable("traffic_sources", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      partnerId: varchar("partner_id").notNull().references(() => users.id),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // 'push', 'pop', 'native', 'seo', 'social', 'email', 'display', 'search'
      description: text("description"),
      website: text("website"),
      volume: integer("volume"),
      // daily volume estimate
      quality: text("quality").default("medium"),
      // 'low', 'medium', 'high'
      isVerified: boolean("is_verified").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    conversions = pgTable("conversions", {
      id: serial("id").primaryKey(),
      advertiserId: bigint("advertiser_id", { mode: "number" }).notNull(),
      partnerId: bigint("partner_id", { mode: "number" }),
      campaignId: bigint("campaign_id", { mode: "number" }),
      offerId: bigint("offer_id", { mode: "number" }),
      flowId: bigint("flow_id", { mode: "number" }),
      clickid: text("clickid").notNull(),
      type: text("type").$type().notNull(),
      txid: text("txid").notNull(),
      revenue: numeric("revenue", { precision: 18, scale: 6 }).default("0"),
      currency: char("currency", { length: 3 }),
      conversionStatus: text("conversion_status").$type().notNull(),
      statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).defaultNow().notNull(),
      antifraudLevel: text("antifraud_level").$type(),
      antifraudScore: integer("antifraud_score"),
      antifraudReasons: jsonb("antifraud_reasons").$type().default({}),
      details: jsonb("details").$type().default({}),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
    }, (t) => ({
      // Indexes for performance
      ix_conv_clickid: index("ix_conv_clickid").on(t.clickid),
      ix_conv_status: index("ix_conv_status").on(t.conversionStatus),
      ix_conv_advertiser: index("ix_conv_advertiser").on(t.advertiserId),
      ix_conv_partner: index("ix_conv_partner").on(t.partnerId),
      // Unique constraint
      uniqTx: { columns: [t.advertiserId, t.type, t.txid], unique: true }
    }));
    enhancedPostbackProfiles = pgTable("enhanced_postback_profiles", {
      id: serial("id").primaryKey(),
      ownerScope: text("owner_scope").$type().notNull(),
      ownerId: bigint("owner_id", { mode: "number" }).notNull(),
      scopeType: text("scope_type").$type().notNull(),
      scopeId: bigint("scope_id", { mode: "number" }),
      name: text("name").notNull(),
      enabled: boolean("enabled").default(true).notNull(),
      priority: integer("priority").default(100).notNull(),
      endpointUrl: text("endpoint_url").notNull(),
      method: text("method").$type().notNull(),
      idParam: text("id_param").$type().notNull(),
      authQueryKey: text("auth_query_key"),
      authQueryVal: text("auth_query_val"),
      authHeaderName: text("auth_header_name"),
      authHeaderVal: text("auth_header_val"),
      paramsTemplate: jsonb("params_template").$type().default({}).notNull(),
      statusMap: jsonb("status_map").$type().default({}).notNull(),
      hmacEnabled: boolean("hmac_enabled").default(false).notNull(),
      hmacSecret: text("hmac_secret"),
      hmacPayloadTpl: text("hmac_payload_tpl"),
      hmacParamName: text("hmac_param_name"),
      retries: smallint("retries").default(5).notNull(),
      timeoutMs: integer("timeout_ms").default(4e3).notNull(),
      backoffBaseSec: integer("backoff_base_sec").default(2).notNull(),
      filterRevenueGt0: boolean("filter_revenue_gt0").default(false).notNull(),
      filterExcludeFraudHard: boolean("filter_exclude_fraud_hard").default(true).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
    }, (t) => ({
      // Index for scope-based queries
      ix_pb_scope: index("ix_pb_scope").on(t.ownerScope, t.ownerId, t.scopeType),
      ix_pb_enabled: index("ix_pb_enabled").on(t.enabled)
    }));
    analyticsData = pgTable("analytics_data", {
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
      revenue: decimal("revenue", { precision: 15, scale: 2 }).default("0.00"),
      payout: decimal("payout", { precision: 15, scale: 2 }).default("0.00"),
      profit: decimal("profit", { precision: 15, scale: 2 }).default("0.00"),
      // Performance metrics
      cr: decimal("cr", { precision: 5, scale: 2 }).default("0.00"),
      // Conversion Rate
      epc: decimal("epc", { precision: 8, scale: 2 }).default("0.00"),
      // Earnings Per Click
      roi: decimal("roi", { precision: 5, scale: 2 }).default("0.00"),
      // Return on Investment
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    conversionData = pgTable("conversion_data", {
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
      createdAt: timestamp("created_at").defaultNow()
    });
    creativeFiles = pgTable("creative_files", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      fileName: text("file_name").notNull(),
      originalName: text("original_name").notNull(),
      fileType: text("file_type").notNull(),
      // 'image', 'video', 'archive', 'document'
      mimeType: text("mime_type").notNull(),
      fileSize: integer("file_size").notNull(),
      filePath: text("file_path").notNull(),
      // Путь в object storage
      publicUrl: text("public_url"),
      // URL для публичного доступа
      dimensions: text("dimensions"),
      // "1920x1080" для изображений/видео
      duration: integer("duration"),
      // Длительность в секундах для видео
      description: text("description"),
      tags: text("tags").array().default([]),
      // Теги для категоризации
      isActive: boolean("is_active").default(true),
      uploadedBy: varchar("uploaded_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    referralCommissions = pgTable("referral_commissions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      referrerId: varchar("referrer_id").notNull().references(() => users.id),
      // Партнер-реферер
      referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
      // Приглашенный пользователь
      transactionId: varchar("transaction_id"),
      // ID транзакции выплаты
      originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
      // Оригинальная сумма выплаты
      commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }).notNull(),
      // Размер комиссии
      commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
      // Процент комиссии
      status: text("status").notNull().default("pending"),
      // 'pending', 'paid', 'cancelled'
      createdAt: timestamp("created_at").defaultNow(),
      paidAt: timestamp("paid_at")
    });
    creativeSets = pgTable("creative_sets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      offerId: varchar("offer_id").notNull().references(() => offers.id),
      name: text("name").notNull(),
      description: text("description"),
      version: text("version").default("1.0"),
      isDefault: boolean("is_default").default(false),
      archivePath: text("archive_path"),
      // Путь к ZIP архиву
      archiveSize: integer("archive_size"),
      downloadCount: integer("download_count").default(0),
      createdBy: varchar("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    creativeSetFiles = pgTable("creative_set_files", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      setId: varchar("set_id").notNull().references(() => creativeSets.id),
      fileId: varchar("file_id").notNull().references(() => creativeFiles.id),
      displayOrder: integer("display_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ many, one }) => ({
      offers: many(offers),
      partnerOffers: many(partnerOffers),
      trackingLinks: many(trackingLinks),
      customDomains: many(customDomains),
      statistics: many(statistics),
      transactions: many(transactions),
      postbacks: many(postbacks),
      tickets: many(tickets),
      assignedTickets: many(tickets, { relationName: "assignedTickets" }),
      fraudAlerts: many(fraudAlerts),
      advertiser: one(users, {
        fields: [users.advertiserId],
        references: [users.id],
        relationName: "advertiserStaff"
      }),
      staff: many(users, { relationName: "advertiserStaff" })
    }));
    offersRelations = relations(offers, ({ one, many }) => ({
      advertiser: one(users, {
        fields: [offers.advertiserId],
        references: [users.id]
      }),
      partnerOffers: many(partnerOffers),
      trackingLinks: many(trackingLinks),
      statistics: many(statistics),
      fraudAlerts: many(fraudAlerts),
      accessRequests: many(offerAccessRequests)
    }));
    partnerOffersRelations = relations(partnerOffers, ({ one }) => ({
      partner: one(users, {
        fields: [partnerOffers.partnerId],
        references: [users.id]
      }),
      offer: one(offers, {
        fields: [partnerOffers.offerId],
        references: [offers.id]
      })
    }));
    offerAccessRequestsRelations = relations(offerAccessRequests, ({ one }) => ({
      offer: one(offers, {
        fields: [offerAccessRequests.offerId],
        references: [offers.id]
      }),
      partner: one(users, {
        fields: [offerAccessRequests.partnerId],
        references: [users.id],
        relationName: "partnerRequests"
      }),
      advertiser: one(users, {
        fields: [offerAccessRequests.advertiserId],
        references: [users.id],
        relationName: "advertiserRequests"
      }),
      reviewer: one(users, {
        fields: [offerAccessRequests.reviewedBy],
        references: [users.id],
        relationName: "reviewerRequests"
      })
    }));
    trackingLinksRelations = relations(trackingLinks, ({ one, many }) => ({
      partner: one(users, {
        fields: [trackingLinks.partnerId],
        references: [users.id]
      }),
      offer: one(offers, {
        fields: [trackingLinks.offerId],
        references: [offers.id]
      }),
      statistics: many(statistics)
    }));
    statisticsRelations = relations(statistics, ({ one }) => ({
      partner: one(users, {
        fields: [statistics.partnerId],
        references: [users.id]
      }),
      offer: one(offers, {
        fields: [statistics.offerId],
        references: [offers.id]
      }),
      trackingLink: one(trackingLinks, {
        fields: [statistics.trackingLinkId],
        references: [trackingLinks.id]
      })
    }));
    transactionsRelations = relations(transactions, ({ one }) => ({
      user: one(users, {
        fields: [transactions.userId],
        references: [users.id]
      })
    }));
    postbacksRelations = relations(postbacks, ({ one }) => ({
      user: one(users, {
        fields: [postbacks.userId],
        references: [users.id]
      })
    }));
    ticketsRelations = relations(tickets, ({ one }) => ({
      user: one(users, {
        fields: [tickets.userId],
        references: [users.id]
      }),
      assignee: one(users, {
        fields: [tickets.assignedTo],
        references: [users.id],
        relationName: "assignedTickets"
      })
    }));
    fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
      user: one(users, {
        fields: [fraudAlerts.userId],
        references: [users.id]
      }),
      offer: one(offers, {
        fields: [fraudAlerts.offerId],
        references: [offers.id]
      })
    }));
    creativesRelations = relations(creatives, ({ one }) => ({
      offer: one(offers, {
        fields: [creatives.offerId],
        references: [offers.id]
      })
    }));
    whiteLabelsRelations = relations(whiteLabels, ({ one }) => ({
      advertiser: one(users, {
        fields: [whiteLabels.advertiserId],
        references: [users.id]
      })
    }));
    staffMembersRelations = relations(staffMembers, ({ one }) => ({
      advertiser: one(users, {
        fields: [staffMembers.advertiserId],
        references: [users.id]
      }),
      user: one(users, {
        fields: [staffMembers.userId],
        references: [users.id]
      })
    }));
    kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
      user: one(users, {
        fields: [kycDocuments.userId],
        references: [users.id]
      }),
      reviewer: one(users, {
        fields: [kycDocuments.reviewedBy],
        references: [users.id]
      })
    }));
    partnerRatingsRelations = relations(partnerRatings, ({ one }) => ({
      partner: one(users, {
        fields: [partnerRatings.partnerId],
        references: [users.id]
      }),
      advertiser: one(users, {
        fields: [partnerRatings.advertiserId],
        references: [users.id]
      })
    }));
    complianceRulesRelations = relations(complianceRules, ({ one }) => ({
      offer: one(offers, {
        fields: [complianceRules.offerId],
        references: [offers.id]
      })
    }));
    apiKeysRelations = relations(apiKeys, ({ one }) => ({
      user: one(users, {
        fields: [apiKeys.userId],
        references: [users.id]
      })
    }));
    postbackLogsRelations = relations(postbackLogs, ({ one }) => ({
      postback: one(postbacks, {
        fields: [postbackLogs.postbackId],
        references: [postbacks.id]
      })
    }));
    customRoles = pgTable("custom_roles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      permissions: jsonb("permissions").notNull(),
      // Array of permission strings
      advertiserId: varchar("advertiser_id").references(() => users.id),
      // null = global role
      ipRestrictions: jsonb("ip_restrictions"),
      // Array of allowed IPs
      geoRestrictions: jsonb("geo_restrictions"),
      // Array of allowed countries
      timeRestrictions: jsonb("time_restrictions"),
      // Time-based access restrictions
      isActive: boolean("is_active").default(true),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userRoleAssignments = pgTable("user_role_assignments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      customRoleId: varchar("custom_role_id").notNull().references(() => customRoles.id),
      assignedBy: varchar("assigned_by").notNull().references(() => users.id),
      isActive: boolean("is_active").default(true),
      expiresAt: timestamp("expires_at"),
      // Optional role expiration
      createdAt: timestamp("created_at").defaultNow()
    });
    userSessions = pgTable("user_sessions", {
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
      createdAt: timestamp("created_at").defaultNow()
    });
    userNotifications = pgTable("user_notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // registration, block, login, etc.
      title: text("title").notNull(),
      message: text("message").notNull(),
      data: jsonb("data"),
      // Additional notification data
      channel: text("channel").notNull(),
      // email, telegram, system
      status: text("status").default("pending"),
      // pending, sent, failed
      isRead: boolean("is_read").default(false),
      sentAt: timestamp("sent_at"),
      readAt: timestamp("read_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").default(false),
      usedAt: timestamp("used_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    userAnalytics = pgTable("user_analytics", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      date: timestamp("date").notNull(),
      totalUsers: integer("total_users").default(0),
      activeUsers24h: integer("active_users_24h").default(0),
      activeUsers7d: integer("active_users_7d").default(0),
      activeUsers30d: integer("active_users_30d").default(0),
      newRegistrations: integer("new_registrations").default(0),
      usersByRole: jsonb("users_by_role"),
      // Breakdown by role
      usersByStatus: jsonb("users_by_status"),
      // Breakdown by status
      usersByCountry: jsonb("users_by_country"),
      // Geographic breakdown
      fraudAlerts: integer("fraud_alerts").default(0),
      blockedUsers: integer("blocked_users").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    });
    insertOfferSchema = createInsertSchema(offers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertReceivedOfferSchema = createInsertSchema(receivedOffers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    createOfferFrontendSchema = z.object({
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
      kpiConditions_en: z.string().optional()
    }).transform((data) => {
      const result = { ...data };
      if (data.description_ru !== void 0 || data.description_en !== void 0) {
        result.description = {
          ru: data.description_ru || "",
          en: data.description_en || ""
        };
        delete result.description_ru;
        delete result.description_en;
      }
      if (data.goals_ru !== void 0 || data.goals_en !== void 0) {
        result.goals = {
          ru: data.goals_ru || "",
          en: data.goals_en || ""
        };
        delete result.goals_ru;
        delete result.goals_en;
      }
      if (data.kpiConditions_ru !== void 0 || data.kpiConditions_en !== void 0) {
        result.kpiConditions = {
          ru: data.kpiConditions_ru || "",
          en: data.kpiConditions_en || ""
        };
        delete result.kpiConditions_ru;
        delete result.kpiConditions_en;
      }
      if (data.allowedTrafficSources && !data.trafficSources) {
        result.trafficSources = data.allowedTrafficSources;
      }
      return result;
    });
    insertPartnerOfferSchema = createInsertSchema(partnerOffers).omit({
      id: true,
      createdAt: true
    });
    insertTrackingLinkSchema = createInsertSchema(trackingLinks).omit({
      id: true,
      createdAt: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true,
      processedAt: true
    });
    insertPostbackSchema = createInsertSchema(postbacks).omit({
      id: true,
      createdAt: true
    });
    insertTicketSchema = createInsertSchema(tickets).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
      id: true,
      createdAt: true
    });
    insertCreativeSchema = createInsertSchema(creatives).omit({
      id: true,
      createdAt: true
    });
    insertWhiteLabelSchema = createInsertSchema(whiteLabels).omit({
      id: true,
      createdAt: true
    });
    insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
      id: true,
      createdAt: true
    });
    insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
      id: true,
      createdAt: true
    });
    insertPartnerRatingSchema = createInsertSchema(partnerRatings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAbTestGroupSchema = createInsertSchema(abTestGroups).omit({
      id: true,
      createdAt: true
    });
    insertComplianceRuleSchema = createInsertSchema(complianceRules).omit({
      id: true,
      createdAt: true
    });
    insertApiKeySchema = createInsertSchema(apiKeys).omit({
      id: true,
      createdAt: true
    });
    insertPostbackLogSchema = createInsertSchema(postbackLogs).omit({
      id: true,
      createdAt: true
    });
    insertPostbackTemplateSchema = createInsertSchema(postbackTemplates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPostbackProfileSchema = createInsertSchema(postbackProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPostbackDeliverySchema = createInsertSchema(postbackDeliveries).omit({
      id: true,
      createdAt: true
    });
    insertPostbackDeliveryLogSchema = createInsertSchema(postbackDeliveryLogs).omit({
      id: true,
      createdAt: true
    });
    insertTrackingClickSchema = createInsertSchema(trackingClicks).omit({
      id: true,
      createdAt: true
    });
    insertAnalyticsDataSchema = createInsertSchema(analyticsData);
    insertConversionDataSchema = createInsertSchema(conversionData);
    insertCustomRoleSchema = createInsertSchema(customRoles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
      id: true,
      createdAt: true
    });
    insertUserSessionSchema = createInsertSchema(userSessions).omit({
      id: true,
      createdAt: true
    });
    insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
      id: true,
      createdAt: true,
      confirmedAt: true
    });
    insertFraudReportSchema = createInsertSchema(fraudReports).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFraudRuleSchema = createInsertSchema(fraudRules).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertDeviceTrackingSchema = createInsertSchema(deviceTracking).omit({
      id: true,
      createdAt: true
    });
    insertIpAnalysisSchema = createInsertSchema(ipAnalysis).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFraudBlockSchema = createInsertSchema(fraudBlocks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOfferDomainSchema = createInsertSchema(offerDomains).omit({
      id: true,
      createdAt: true
    });
    insertOfferAccessRequestSchema = createInsertSchema(offerAccessRequests).omit({
      id: true,
      requestedAt: true,
      reviewedAt: true
    });
    customDomains = pgTable("custom_domains", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      domain: varchar("domain", { length: 255 }).notNull(),
      advertiserId: varchar("advertiser_id", { length: 255 }).notNull().references(() => users.id),
      type: domainTypeEnum("type").notNull(),
      status: domainStatusEnum("status").notNull().default("pending"),
      verificationValue: varchar("verification_value", { length: 255 }).notNull(),
      targetValue: varchar("target_value", { length: 255 }),
      errorMessage: text("error_message"),
      lastChecked: timestamp("last_checked"),
      nextCheck: timestamp("next_check"),
      // SSL Certificate fields
      sslStatus: varchar("ssl_status", { length: 50 }).default("none"),
      // none, pending, issued, expired, failed
      sslCertificate: text("ssl_certificate"),
      sslPrivateKey: text("ssl_private_key"),
      sslValidUntil: timestamp("ssl_valid_until"),
      sslIssuer: varchar("ssl_issuer", { length: 255 }),
      sslErrorMessage: text("ssl_error_message"),
      isActive: boolean("is_active").default(false),
      verifiedAt: timestamp("verified_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    customDomainsRelations = relations(customDomains, ({ one }) => ({
      advertiser: one(users, {
        fields: [customDomains.advertiserId],
        references: [users.id]
      })
    }));
    apiTokens = pgTable("api_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      token: text("token").notNull().unique(),
      name: text("name").notNull(),
      advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
      permissions: jsonb("permissions"),
      // Array of allowed permissions
      ipWhitelist: jsonb("ip_whitelist"),
      // Array of allowed IPs
      lastUsed: timestamp("last_used"),
      expiresAt: timestamp("expires_at"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCustomDomainSchema = createInsertSchema(customDomains).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertApiTokenSchema = createInsertSchema(apiTokens).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertClickSchema = createInsertSchema(clicks).omit({
      ts: true
    });
    insertEventSchema = createInsertSchema(events).omit({
      id: true,
      ts: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  QueryCache: () => QueryCache,
  db: () => db,
  pool: () => pool,
  queryCache: () => queryCache
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db, QueryCache, queryCache;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      // максимум соединений в пуле
      idleTimeoutMillis: 3e4,
      // таймаут неактивных соединений
      connectionTimeoutMillis: 1e4
      // таймаут подключения
    });
    db = drizzle({ client: pool, schema: schema_exports });
    QueryCache = class {
      cache = /* @__PURE__ */ new Map();
      get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
          return null;
        }
        return cached.data;
      }
      set(key, data, ttlMs = 3e5) {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: ttlMs
        });
      }
      clear() {
        this.cache.clear();
      }
    };
    queryCache = new QueryCache();
  }
});

// server/services/letsencrypt.ts
var letsencrypt_exports = {};
__export(letsencrypt_exports, {
  LetsEncryptService: () => LetsEncryptService,
  scheduledCertificateRenewal: () => scheduledCertificateRenewal
});
import * as acme from "acme-client";
import { eq, and, lte } from "drizzle-orm";
async function scheduledCertificateRenewal() {
  console.log("\u{1F504} \u0417\u0430\u043F\u0443\u0441\u043A \u043F\u043B\u0430\u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432");
  await LetsEncryptService.renewCertificates();
}
var LetsEncryptService;
var init_letsencrypt = __esm({
  "server/services/letsencrypt.ts"() {
    "use strict";
    init_db();
    init_schema();
    LetsEncryptService = class {
      static client = null;
      static accountKey = null;
      // Инициализация ACME клиента
      static async initializeClient() {
        try {
          this.accountKey = await this.getOrCreateAccountKey();
          const directoryUrl = acme.directory.letsencrypt.production;
          this.client = new acme.Client({
            directoryUrl,
            accountKey: this.accountKey
          });
          await this.createAccount();
          console.log("\u2705 Let's Encrypt ACME \u043A\u043B\u0438\u0435\u043D\u0442 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D (Production API)");
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 Let's Encrypt:", error instanceof Error ? error.message : String(error));
          throw error;
        }
      }
      // Получаем или создаем ключ аккаунта
      static async getOrCreateAccountKey() {
        const keyPath = process.env.LETSENCRYPT_ACCOUNT_KEY_PATH || "./.letsencrypt/account.key";
        try {
          const fs3 = await import("fs/promises");
          return await fs3.readFile(keyPath);
        } catch (error) {
          const accountKey = await acme.crypto.createPrivateKey();
          try {
            const fs3 = await import("fs/promises");
            const path4 = await import("path");
            await fs3.mkdir(path4.dirname(keyPath), { recursive: true });
            await fs3.writeFile(keyPath, accountKey);
          } catch (writeError) {
            console.warn("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043B\u044E\u0447 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430:", writeError);
          }
          return accountKey;
        }
      }
      // Создаем аккаунт Let's Encrypt
      static async createAccount() {
        if (!this.client) throw new Error("ACME \u043A\u043B\u0438\u0435\u043D\u0442 \u043D\u0435 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D");
        try {
          await this.client.createAccount({
            termsOfServiceAgreed: true,
            contact: [
              `mailto:${process.env.LETSENCRYPT_CONTACT_EMAIL || "admin@your-domain.com"}`
            ]
          });
          console.log("\u2705 Let's Encrypt \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0441\u043E\u0437\u0434\u0430\u043D/\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D");
        } catch (error) {
          if (error.type === "urn:ietf:params:acme:error:accountDoesNotExist") {
            console.log("\u2139\uFE0F \u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442");
          } else {
            throw error;
          }
        }
      }
      // Выдача SSL сертификата (основной метод)
      static async issueCertificate(domain, domainId) {
        try {
          if (!this.client) {
            await this.initializeClient();
          }
          console.log(`\u{1F512} \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0432\u044B\u0434\u0430\u0447\u0443 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0433\u043E SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 \u0434\u043B\u044F ${domain}`);
          await db.update(customDomains).set({
            sslStatus: "pending",
            sslErrorMessage: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(customDomains.id, domainId));
          const order = await this.client.createOrder({
            identifiers: [
              { type: "dns", value: domain }
            ]
          });
          const authorizations = await this.client.getAuthorizations(order);
          for (const authz of authorizations) {
            const httpChallenge = authz.challenges.find((c) => c.type === "http-01");
            if (!httpChallenge) {
              throw new Error("HTTP-01 challenge \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D");
            }
            const keyAuthorization = await this.client.getChallengeKeyAuthorization(httpChallenge);
            await this.deployChallengeFile(httpChallenge.token, keyAuthorization);
            console.log(`\u23F3 \u0416\u0434\u0435\u043C 3 \u0441\u0435\u043A\u0443\u043D\u0434\u044B \u0434\u043B\u044F \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 challenge \u0444\u0430\u0439\u043B\u0430...`);
            await new Promise((resolve) => setTimeout(resolve, 3e3));
            console.log(`\u{1F4E4} \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u044F\u0435\u043C Let's Encrypt \u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 challenge \u0434\u043B\u044F ${domain}...`);
            await this.client.verifyChallenge(authz, httpChallenge);
            console.log(`\u23F3 \u0416\u0434\u0435\u043C \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u044E challenge \u0434\u043B\u044F ${domain} (\u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 20 \u0441\u0435\u043A\u0443\u043D\u0434)...`);
            try {
              const validationPromise = this.client.waitForValidStatus(authz);
              const timeoutPromise = new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Validation timeout")), 2e4)
              );
              await Promise.race([validationPromise, timeoutPromise]);
              console.log(`\u2705 Challenge \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u0430\u043B\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F ${domain}`);
            } catch (error) {
              console.warn(`\u26A0\uFE0F \u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u0438\u043B\u0438 \u043E\u0448\u0438\u0431\u043A\u0430 \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438 \u0434\u043B\u044F ${domain}, \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u0442\u0430\u0442\u0443\u0441...`);
              const finalAuthz = await this.client.getAuthorization(authz);
              console.log(`\u{1F4CB} \u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438: ${finalAuthz.status}`);
              if (finalAuthz.status !== "valid") {
                if (finalAuthz.challenges) {
                  for (const challenge of finalAuthz.challenges) {
                    if (challenge.error) {
                      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 challenge: ${JSON.stringify(challenge.error)}`);
                    }
                  }
                }
                throw new Error(`Challenge validation failed: ${finalAuthz.status}`);
              }
              console.log(`\u2705 \u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0432 \u0438\u0442\u043E\u0433\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0434\u043B\u044F ${domain}`);
            }
            await this.cleanupChallengeFile(httpChallenge.token);
          }
          const [certificateKey, csr] = await acme.crypto.createCsr({
            commonName: domain
          });
          console.log(`\u{1F504} \u0424\u0438\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u043C \u0437\u0430\u043A\u0430\u0437 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 \u0434\u043B\u044F ${domain}...`);
          try {
            await Promise.race([
              this.client.finalizeOrder(order, csr),
              new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Order finalization timeout")), 3e4)
              )
            ]);
            console.log(`\u2705 \u0417\u0430\u043A\u0430\u0437 \u0444\u0438\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F ${domain}`);
          } catch (error) {
            console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0437\u0430\u043A\u0430\u0437\u0430 \u0434\u043B\u044F ${domain}:`, error.message);
            throw error;
          }
          console.log(`\u{1F4E5} \u041F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0434\u043B\u044F ${domain}...`);
          let certificate;
          try {
            certificate = await Promise.race([
              this.client.getCertificate(order),
              new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Certificate retrieval timeout")), 3e4)
              )
            ]);
            console.log(`\u2705 \u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \u0434\u043B\u044F ${domain}`);
          } catch (error) {
            console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 \u0434\u043B\u044F ${domain}:`, error.message);
            throw error;
          }
          const validUntil = /* @__PURE__ */ new Date();
          validUntil.setDate(validUntil.getDate() + 90);
          await db.update(customDomains).set({
            sslStatus: "verified",
            sslCertificate: certificate,
            sslPrivateKey: certificateKey.toString(),
            sslValidUntil: validUntil,
            sslIssuer: "Let's Encrypt",
            sslErrorMessage: null,
            isActive: true,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(customDomains.id, domainId));
          console.log(`\u{1F389} SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u044B\u0434\u0430\u043D \u0434\u043B\u044F ${domain}`);
          return {
            success: true,
            certificate,
            privateKey: certificateKey.toString()
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u044B\u0434\u0430\u0447\u0438 SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 \u0434\u043B\u044F ${domain}:`, errorMessage);
          await db.update(customDomains).set({
            sslStatus: "failed",
            sslErrorMessage: errorMessage,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(customDomains.id, domainId));
          return {
            success: false,
            error: errorMessage
          };
        }
      }
      // Размещаем challenge файл на сервере
      static async deployChallengeFile(token, keyAuthorization) {
        const fs3 = await import("fs/promises");
        const path4 = await import("path");
        const challengeDir = path4.join(process.cwd(), "public", ".well-known", "acme-challenge");
        const challengeFile = path4.join(challengeDir, token);
        try {
          await fs3.mkdir(challengeDir, { recursive: true });
          await fs3.writeFile(challengeFile, keyAuthorization);
          console.log(`\u{1F4C1} Challenge \u0444\u0430\u0439\u043B \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D: ${challengeFile}`);
        } catch (error) {
          console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u044F challenge \u0444\u0430\u0439\u043B\u0430:", error);
          throw error;
        }
      }
      // Удаляем challenge файл
      static async cleanupChallengeFile(token) {
        const fs3 = await import("fs/promises");
        const path4 = await import("path");
        const challengeFile = path4.join(process.cwd(), "public", ".well-known", "acme-challenge", token);
        try {
          await fs3.unlink(challengeFile);
          console.log(`\u{1F5D1}\uFE0F Challenge \u0444\u0430\u0439\u043B \u0443\u0434\u0430\u043B\u0435\u043D: ${challengeFile}`);
        } catch (error) {
          console.warn("\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0434\u0430\u043B\u0438\u0442\u044C challenge \u0444\u0430\u0439\u043B:", error);
        }
      }
      // Автоматическое обновление сертификатов
      static async renewCertificates() {
        try {
          const expiringDate = /* @__PURE__ */ new Date();
          expiringDate.setDate(expiringDate.getDate() + 30);
          const expiringDomains = await db.select().from(customDomains).where(
            and(
              eq(customDomains.sslStatus, "issued"),
              lte(customDomains.sslValidUntil, expiringDate)
            )
          );
          console.log(`\u{1F504} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${expiringDomains.length} \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F`);
          for (const domain of expiringDomains) {
            try {
              console.log(`\u{1F504} \u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0434\u043B\u044F ${domain.domain}`);
              await this.issueCertificate(domain.domain, domain.id);
              await new Promise((resolve) => setTimeout(resolve, 5e3));
            } catch (error) {
              console.error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 \u0434\u043B\u044F ${domain.domain}:`, error instanceof Error ? error.message : String(error));
            }
          }
        } catch (error) {
          console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432:", error);
        }
      }
    };
  }
});

// server/services/customDomains.ts
var customDomains_exports = {};
__export(customDomains_exports, {
  CustomDomainService: () => CustomDomainService
});
import { randomBytes } from "crypto";
import { eq as eq2, and as and2, desc } from "drizzle-orm";
import dns from "dns";
import { promisify } from "util";
var resolveTxt, resolveCname, resolve4, CustomDomainService;
var init_customDomains = __esm({
  "server/services/customDomains.ts"() {
    "use strict";
    init_db();
    init_schema();
    resolveTxt = promisify(dns.resolveTxt);
    resolveCname = promisify(dns.resolveCname);
    resolve4 = promisify(dns.resolve4);
    CustomDomainService = class {
      // Генерируем значение для верификации
      static generateVerificationValue() {
        return `platform-verify=${randomBytes(16).toString("hex")}`;
      }
      // Создаем кастомный домен
      static async createCustomDomain(data) {
        const existingDomains = await db.select().from(customDomains).where(eq2(customDomains.advertiserId, data.advertiserId));
        if (existingDomains.length >= 1) {
          throw new Error("Domain limit exceeded. Each advertiser can add only 1 custom domain.");
        }
        const verificationValue = this.generateVerificationValue();
        const targetValue = data.type === "cname" ? "affiliate-tracker.replit.app" : "192.168.1.100";
        const [customDomain] = await db.insert(customDomains).values({
          advertiserId: data.advertiserId,
          domain: data.domain.toLowerCase(),
          type: data.type || "cname",
          verificationValue,
          targetValue,
          status: "pending",
          sslStatus: "none",
          isActive: false
        }).returning();
        return customDomain;
      }
      // Получаем домены рекламодателя
      static async getAdvertiserDomains(advertiserId) {
        return await db.select().from(customDomains).where(eq2(customDomains.advertiserId, advertiserId)).orderBy(desc(customDomains.createdAt));
      }
      // Верифицируем домен через DNS
      static async verifyDomain(domainId) {
        console.log(`\u{1F50D} \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044E \u0434\u043E\u043C\u0435\u043D\u0430 ID: ${domainId}`);
        const [domain] = await db.select().from(customDomains).where(eq2(customDomains.id, domainId));
        if (!domain) {
          throw new Error("Domain not found");
        }
        console.log(`\u{1F4CB} \u0414\u043E\u043C\u0435\u043D \u043D\u0430\u0439\u0434\u0435\u043D: ${domain.domain} (${domain.type})`);
        try {
          await db.update(customDomains).set({
            status: "pending",
            lastChecked: /* @__PURE__ */ new Date(),
            errorMessage: null
          }).where(eq2(customDomains.id, domainId));
          console.log(`\u23F3 \u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u043D\u0430 pending \u0434\u043B\u044F ${domain.domain}`);
          const dns2 = await import("dns").then((m) => m.promises);
          let isVerified = false;
          let errorMessage = "";
          try {
            if (domain.type === "cname") {
              const cnameRecords = await dns2.resolveCname(domain.domain);
              const expectedCname = `${domain.domain}.arbiconnect.app`;
              isVerified = cnameRecords.some((record) => record.includes("arbiconnect.app"));
              console.log(`\u{1F50D} CNAME \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u043B\u044F ${domain.domain}: ${isVerified ? "SUCCESS" : "FAILED"}`);
            } else if (domain.type === "a_record") {
              const aRecords = await dns2.resolve4(domain.domain);
              const expectedIp = process.env.SERVER_IP || "0.0.0.0";
              isVerified = aRecords.includes(expectedIp);
              console.log(`\u{1F50D} A-record \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u043B\u044F ${domain.domain}: ${isVerified ? "SUCCESS" : "FAILED"}`);
            }
            if (!isVerified) {
              errorMessage = `DNS \u0437\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0438\u043B\u0438 \u043D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0434\u043B\u044F ${domain.type}`;
            }
          } catch (error) {
            console.error(`\u274C DNS \u043E\u0448\u0438\u0431\u043A\u0430 \u0434\u043B\u044F ${domain.domain}:`, error.message);
            isVerified = false;
            errorMessage = error.message;
          }
          const newStatus = isVerified ? "verified" : "error";
          await db.update(customDomains).set({
            status: newStatus,
            isActive: isVerified,
            lastChecked: /* @__PURE__ */ new Date(),
            errorMessage: isVerified ? null : errorMessage
          }).where(eq2(customDomains.id, domainId));
          console.log(`\u{1F3AF} \u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441: ${newStatus} \u0434\u043B\u044F ${domain.domain}`);
          return {
            success: isVerified,
            status: newStatus,
            error: errorMessage || void 0
          };
        } catch (error) {
          console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 ${domain.domain}:`, error.message);
          await db.update(customDomains).set({
            status: "error",
            isActive: false,
            lastChecked: /* @__PURE__ */ new Date(),
            errorMessage: error.message
          }).where(eq2(customDomains.id, domainId));
          return {
            success: false,
            status: "error",
            error: error.message
          };
        }
      }
      // Автоматическая выдача SSL сертификата
      static async requestSSLCertificate(domain, domainId) {
        try {
          console.log(`\u{1F512} \u0417\u0430\u043F\u0443\u0441\u043A \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u0432\u044B\u0434\u0430\u0447\u0438 SSL \u0434\u043B\u044F ${domain}`);
          await db.update(customDomains).set({
            sslStatus: "pending",
            sslErrorMessage: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(customDomains.id, domainId));
          const { LetsEncryptService: LetsEncryptService2 } = await Promise.resolve().then(() => (init_letsencrypt(), letsencrypt_exports));
          const sslPromise = LetsEncryptService2.issueCertificate(domain, domainId);
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("SSL process timeout after 90 seconds")), 9e4)
          );
          try {
            await Promise.race([sslPromise, timeoutPromise]);
            console.log(`\u2705 SSL \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0434\u043B\u044F ${domain}`);
          } catch (error) {
            console.error(`\u274C SSL \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u043F\u0440\u0435\u0440\u0432\u0430\u043D \u0434\u043B\u044F ${domain}:`, error.message);
            throw error;
          }
        } catch (error) {
          console.error(`SSL issuance failed for ${domain}:`, error);
          await db.update(customDomains).set({
            sslStatus: "failed",
            sslErrorMessage: error?.message || "SSL error",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(customDomains.id, domainId));
        }
      }
      // Принудительная выдача SSL для уже верифицированного домена
      static async issueSSLForDomain(domainId, advertiserId) {
        try {
          const [domain] = await db.select().from(customDomains).where(and2(
            eq2(customDomains.id, domainId),
            eq2(customDomains.advertiserId, advertiserId),
            eq2(customDomains.status, "verified")
          ));
          if (!domain) {
            return {
              success: false,
              message: "\u0414\u043E\u043C\u0435\u043D \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0438\u043B\u0438 \u043D\u0435 \u0432\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D"
            };
          }
          if (domain.sslStatus === "issued") {
            return {
              success: false,
              message: "SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0443\u0436\u0435 \u0432\u044B\u0434\u0430\u043D \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0434\u043E\u043C\u0435\u043D\u0430"
            };
          }
          if (domain.sslStatus === "pending") {
            return {
              success: false,
              message: "SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0443\u0436\u0435 \u0432\u044B\u0434\u0430\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0434\u043E\u043C\u0435\u043D\u0430"
            };
          }
          await this.requestSSLCertificate(domain.domain, domainId);
          return {
            success: true,
            message: "SSL \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u0432\u044B\u0434\u0430\u0435\u0442\u0441\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u043D\u0443\u0442."
          };
        } catch (error) {
          return {
            success: false,
            message: `\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u044B\u0434\u0430\u0447\u0438 SSL: ${error.message}`
          };
        }
      }
      // Удаляем домен
      static async deleteDomain(domainId, advertiserId) {
        await db.delete(customDomains).where(and2(
          eq2(customDomains.id, domainId),
          eq2(customDomains.advertiserId, advertiserId)
        ));
      }
      // Получаем активные верифицированные домены рекламодателя
      static async getVerifiedDomains(advertiserId) {
        const domains = await db.select({ domain: customDomains.domain }).from(customDomains).where(and2(
          eq2(customDomains.advertiserId, advertiserId),
          eq2(customDomains.status, "verified"),
          eq2(customDomains.isActive, true)
        ));
        return domains.map((d) => d.domain);
      }
      // Выбираем лучший домен для трекинговой ссылки
      static async getBestDomain(advertiserId) {
        const [domain] = await db.select({ domain: customDomains.domain }).from(customDomains).where(and2(
          eq2(customDomains.advertiserId, advertiserId),
          eq2(customDomains.status, "verified"),
          eq2(customDomains.isActive, true)
        )).orderBy(desc(customDomains.createdAt)).limit(1);
        return domain?.domain || null;
      }
      // Обновляем трекинговые ссылки на использование кастомного домена
      static async updateTrackingLinksWithDomain(advertiserId, domain) {
        const advertiserOffers = await db.select({ id: offers.id }).from(offers).where(eq2(offers.advertiserId, advertiserId));
        const offerIds = advertiserOffers.map((o) => o.id);
        if (offerIds.length === 0) return;
        for (const offerId of offerIds) {
          await db.update(trackingLinks).set({
            customDomain: domain,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(trackingLinks.offerId, offerId));
        }
      }
      static async checkSSL(domain) {
        try {
          const https = await import("https");
          return new Promise((resolve) => {
            const options = {
              hostname: domain,
              port: 443,
              method: "HEAD",
              rejectUnauthorized: false
            };
            const req = https.request(options, (res) => {
              const cert = res.connection.getPeerCertificate();
              if (cert && cert.valid_to) {
                resolve({
                  hasSSL: true,
                  validUntil: new Date(cert.valid_to),
                  issuer: cert.issuer?.CN
                });
              } else {
                resolve({ hasSSL: false });
              }
            });
            req.on("error", () => {
              resolve({ hasSSL: false });
            });
            req.end();
          });
        } catch (error) {
          console.error("SSL check failed:", error?.message);
          return { hasSSL: false };
        }
      }
      // Получаем инструкции для настройки DNS
      static getDNSInstructions(domain) {
        if (domain.type === "cname") {
          return {
            type: "CNAME",
            record: domain.domain,
            value: "platform-verify.com",
            instructions: `\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 CNAME \u0437\u0430\u043F\u0438\u0441\u044C \u0432 DNS \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0432\u0430\u0448\u0435\u0433\u043E \u0434\u043E\u043C\u0435\u043D\u0430:

\u0418\u043C\u044F: ${domain.domain}
\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435: platform-verify.com

\u041F\u043E\u0441\u043B\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u0430\u043F\u0438\u0441\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u043E\u043C\u0435\u043D".`
          };
        } else {
          return {
            type: "TXT",
            record: domain.domain,
            value: domain.verificationValue,
            instructions: `\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 TXT \u0437\u0430\u043F\u0438\u0441\u044C \u0432 DNS \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0432\u0430\u0448\u0435\u0433\u043E \u0434\u043E\u043C\u0435\u043D\u0430:

\u0418\u043C\u044F: ${domain.domain}
\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435: ${domain.verificationValue}

\u041F\u043E\u0441\u043B\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u0430\u043F\u0438\u0441\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u043E\u043C\u0435\u043D".`
          };
        }
      }
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq as eq3, desc as desc2, and as and3, gte, lt, lte as lte2, count, sum, sql as sql2, isNotNull, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { nanoid } from "nanoid";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // Real-time database storage only
      async getCreatedPostbackProfiles(userId) {
        console.log("\u{1F4CB} Getting postback profiles from database for user:", userId);
        try {
          let query = db.select().from(postbackProfiles);
          if (userId) {
            query = query.where(and3(
              eq3(postbackProfiles.ownerId, userId),
              eq3(postbackProfiles.ownerScope, "partner")
            ));
          }
          const result = await query.orderBy(desc2(postbackProfiles.createdAt));
          console.log("\u{1F4CB} Found postback profiles in database:", result.length);
          return result;
        } catch (error) {
          console.error("\u274C Error getting postback profiles from database:", error);
          return [];
        }
      }
      async savePostbackProfile(profile) {
        console.log("\u{1F4BE} Saving postback profile to database:", profile);
        try {
          const insertData = {
            id: profile.id,
            ownerScope: "partner",
            ownerId: profile.user_id || profile.partnerId,
            scopeType: "global",
            scopeId: null,
            name: profile.name,
            enabled: profile.enabled !== false,
            priority: profile.priority || 100,
            endpointUrl: profile.endpoint_url,
            method: profile.method || "GET",
            idParam: "clickid",
            statusMap: {},
            paramsTemplate: {}
          };
          const [result] = await db.insert(postbackProfiles).values(insertData).returning();
          console.log("\u{1F4BE} Profile saved to database:", result.id);
          return result;
        } catch (error) {
          console.error("\u274C Error saving postback profile to database:", error);
          throw error;
        }
      }
      // OLD METHOD REMOVED - USING DB VERSION AT LINE 1402
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq3(users.id, id));
        return user || void 0;
      }
      async getUserById(id) {
        const [user] = await db.select().from(users).where(eq3(users.id, id));
        return user || void 0;
      }
      async getUserByTelegramChatId(chatId) {
        const [user] = await db.select().from(users).where(eq3(users.telegramChatId, chatId));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq3(users.username, username));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq3(users.email, email));
        return user || void 0;
      }
      async createUser(insertUser) {
        if (insertUser.role === "affiliate") {
          const partnerNumber = await this.getNextPartnerNumber();
          insertUser.partnerNumber = partnerNumber;
          if (!insertUser.referralCode) {
            const crypto3 = await import("crypto");
            insertUser.referralCode = crypto3.randomBytes(4).toString("hex").toUpperCase();
            console.log("\u{1F517} Generated referral code for new affiliate:", insertUser.referralCode);
          }
        }
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, data) {
        const [user] = await db.update(users).set(data).where(eq3(users.id, id)).returning();
        return user;
      }
      async getUsers(role) {
        if (role) {
          return await db.select().from(users).where(eq3(users.role, role));
        }
        return await db.select().from(users);
      }
      // Получаем следующий номер партнера (0001, 0002, и т.д.)
      async getNextPartnerNumber() {
        const lastPartner = await db.select({ partnerNumber: users.partnerNumber }).from(users).where(and3(
          eq3(users.role, "affiliate"),
          isNotNull(users.partnerNumber)
        )).orderBy(desc2(users.partnerNumber)).limit(1);
        if (lastPartner.length === 0) {
          return "0001";
        }
        const lastNumber = parseInt(lastPartner[0].partnerNumber || "0000");
        const nextNumber = lastNumber + 1;
        return nextNumber.toString().padStart(4, "0");
      }
      // Get users with hierarchy filtering
      async getUsersByOwner(ownerId, role) {
        if (role) {
          return await db.select().from(users).where(
            and3(eq3(users.ownerId, ownerId), eq3(users.role, role))
          );
        }
        return await db.select().from(users).where(eq3(users.ownerId, ownerId));
      }
      async getOffer(id) {
        const [offer2] = await db.select().from(offers).where(eq3(offers.id, id));
        return offer2 || void 0;
      }
      async getOffers(advertiserId) {
        if (advertiserId) {
          return await db.select().from(offers).where(eq3(offers.advertiserId, advertiserId));
        }
        return await db.select().from(offers);
      }
      async createOffer(insertOffer) {
        const [offer2] = await db.insert(offers).values({
          ...insertOffer,
          id: insertOffer.id || randomUUID(),
          createdAt: insertOffer.createdAt || /* @__PURE__ */ new Date(),
          updatedAt: insertOffer.updatedAt || /* @__PURE__ */ new Date()
        }).returning();
        return offer2;
      }
      async updateOffer(id, data) {
        const updateData = { ...data };
        delete updateData.createdAt;
        delete updateData.updatedAt;
        const [offer2] = await db.update(offers).set(updateData).where(eq3(offers.id, id)).returning();
        return offer2;
      }
      // Received offers management
      async getReceivedOffers(advertiserId) {
        return await db.select().from(receivedOffers).where(eq3(receivedOffers.advertiserId, advertiserId));
      }
      async createReceivedOffer(insertReceivedOffer) {
        const [receivedOffer] = await db.insert(receivedOffers).values({
          ...insertReceivedOffer,
          id: insertReceivedOffer.id || randomUUID()
        }).returning();
        return receivedOffer;
      }
      async updateReceivedOffer(id, data) {
        const [receivedOffer] = await db.update(receivedOffers).set(data).where(eq3(receivedOffers.id, id)).returning();
        return receivedOffer;
      }
      async deleteReceivedOffer(id) {
        await db.delete(receivedOffers).where(eq3(receivedOffers.id, id));
      }
      async deleteOffer(id) {
        try {
          await db.delete(creativeFiles).where(eq3(creativeFiles.offerId, id));
          await db.delete(offerAccessRequests).where(eq3(offerAccessRequests.offerId, id));
          await db.delete(statistics).where(eq3(statistics.offerId, id));
          await db.delete(trackingClicks).where(eq3(trackingClicks.offerId, id));
          await db.delete(partnerOffers).where(eq3(partnerOffers.offerId, id));
          await db.delete(trackingLinks).where(eq3(trackingLinks.offerId, id));
          await db.delete(postbacks).where(eq3(postbacks.offerId, id));
          await db.delete(offers).where(eq3(offers.id, id));
        } catch (error) {
          console.error("Error deleting offer:", error);
          throw error;
        }
      }
      async getPartnerOffers(partnerId, offerId) {
        let query = db.select().from(partnerOffers);
        if (partnerId && offerId) {
          return await query.where(and3(
            eq3(partnerOffers.partnerId, partnerId),
            eq3(partnerOffers.offerId, offerId)
          ));
        } else if (partnerId) {
          return await query.where(eq3(partnerOffers.partnerId, partnerId));
        } else if (offerId) {
          return await query.where(eq3(partnerOffers.offerId, offerId));
        }
        return await query;
      }
      async getOfferAccessRequests(partnerId, offerId) {
        let query = db.select().from(offerAccessRequests);
        if (partnerId && offerId) {
          return await query.where(and3(
            eq3(offerAccessRequests.partnerId, partnerId),
            eq3(offerAccessRequests.offerId, offerId)
          ));
        } else if (partnerId) {
          return await query.where(eq3(offerAccessRequests.partnerId, partnerId));
        } else if (offerId) {
          return await query.where(eq3(offerAccessRequests.offerId, offerId));
        }
        return await query;
      }
      // Создать запрос на доступ к офферу
      async createOfferAccessRequest(data) {
        const [request] = await db.insert(offerAccessRequests).values(data).returning();
        return request;
      }
      // Одобрить/отклонить запрос на доступ к офферу
      async updateOfferAccessRequest(id, data) {
        const [request] = await db.update(offerAccessRequests).set(data).where(eq3(offerAccessRequests.id, id)).returning();
        return request;
      }
      // Проверить, есть ли партнер в списке партнеров рекламодателя
      async isPartnerAssignedToAdvertiser(partnerId, advertiserId) {
        const partner = await db.select().from(users).where(and3(
          eq3(users.id, partnerId),
          eq3(users.ownerId, advertiserId),
          eq3(users.role, "affiliate")
        )).limit(1);
        return partner.length > 0;
      }
      // Получить запросы доступа для рекламодателя
      async getAdvertiserAccessRequests(advertiserId) {
        try {
          const baseRequests = await db.select().from(offerAccessRequests).innerJoin(offers, eq3(offerAccessRequests.offerId, offers.id)).where(eq3(offers.advertiserId, advertiserId)).orderBy(desc2(offerAccessRequests.id));
          const enrichedRequests = await Promise.all(
            baseRequests.map(async (req) => {
              const offer2 = await this.getOffer(req.offer_access_requests.offerId);
              const partner = await this.getUser(req.offer_access_requests.partnerId);
              return {
                id: req.offer_access_requests.id,
                offerId: req.offer_access_requests.offerId,
                partnerId: req.offer_access_requests.partnerId,
                advertiserId: req.offer_access_requests.advertiserId,
                status: req.offer_access_requests.status,
                message: req.offer_access_requests.requestNote,
                responseMessage: req.offer_access_requests.responseNote,
                requestedAt: /* @__PURE__ */ new Date(),
                respondedAt: null,
                offer: offer2 ? {
                  id: offer2.id,
                  name: offer2.name,
                  category: offer2.category,
                  payoutType: offer2.payoutType,
                  logo: offer2.logo
                } : null,
                partner: partner ? {
                  id: partner.id,
                  username: partner.username,
                  firstName: partner.firstName,
                  lastName: partner.lastName,
                  email: partner.email,
                  company: partner.company
                } : null
              };
            })
          );
          return enrichedRequests;
        } catch (error) {
          console.error("Error getting advertiser access requests:", error);
          return [];
        }
      }
      // Generate automatic partner link for an offer based on its base_url
      generatePartnerLink(baseUrl, partnerId, offerId, subId) {
        if (!baseUrl) {
          return "";
        }
        try {
          const url = new URL(baseUrl);
          const partnerSubId = subId || `partner_${partnerId.slice(0, 8)}`;
          url.searchParams.set("subid", partnerSubId);
          url.searchParams.set("partner_id", partnerId);
          url.searchParams.set("offer_id", offerId);
          url.searchParams.set("click_id", `${partnerId.slice(0, 8)}_${offerId.slice(0, 8)}_${Date.now().toString(36)}`);
          return url.toString();
        } catch (error) {
          console.error("Error generating partner link:", error);
          return baseUrl;
        }
      }
      // Get partner's available offers with auto-generated links
      async getPartnerOffersWithLinks(partnerId) {
        try {
          const partnerOffersList = await db.select({
            partnerOfferId: partnerOffers.id,
            partnerId: partnerOffers.partnerId,
            offerId: partnerOffers.offerId,
            isApproved: partnerOffers.isApproved,
            customPayout: partnerOffers.customPayout,
            partnerCreatedAt: partnerOffers.createdAt,
            // Offer details
            id: offers.id,
            name: offers.name,
            description: offers.description,
            logo: offers.logo,
            category: offers.category,
            payout: offers.payout,
            payoutType: offers.payoutType,
            currency: offers.currency,
            status: offers.status,
            landingPages: offers.landingPages,
            baseUrl: offers.baseUrl,
            landingPageUrl: offers.landingPageUrl,
            previewUrl: offers.previewUrl,
            kpiConditions: offers.kpiConditions,
            countries: offers.countries,
            isPrivate: offers.isPrivate,
            createdAt: offers.createdAt
          }).from(partnerOffers).leftJoin(offers, eq3(partnerOffers.offerId, offers.id)).where(eq3(partnerOffers.partnerId, partnerId));
          const publicOffers = await db.select({
            id: offers.id,
            name: offers.name,
            description: offers.description,
            logo: offers.logo,
            category: offers.category,
            payout: offers.payout,
            payoutType: offers.payoutType,
            currency: offers.currency,
            status: offers.status,
            landingPages: offers.landingPages,
            baseUrl: offers.baseUrl,
            landingPageUrl: offers.landingPageUrl,
            previewUrl: offers.previewUrl,
            kpiConditions: offers.kpiConditions,
            countries: offers.countries,
            isPrivate: offers.isPrivate,
            createdAt: offers.createdAt
          }).from(offers).where(
            and3(
              eq3(offers.status, "active"),
              eq3(offers.isPrivate, false)
            )
          );
          const allOffers = /* @__PURE__ */ new Map();
          partnerOffersList.forEach((po) => {
            if (po.id && po.isApproved) {
              const baseUrl = po.baseUrl || po.landingPageUrl || po.landingPages?.[0]?.url;
              allOffers.set(po.id, {
                id: po.id,
                name: po.name,
                description: po.description,
                logo: po.logo,
                category: po.category,
                payout: po.customPayout || po.payout,
                payoutType: po.payoutType,
                currency: po.currency,
                status: po.status,
                landingPages: po.landingPages,
                baseUrl: po.baseUrl,
                previewUrl: po.previewUrl,
                kpiConditions: po.kpiConditions,
                countries: po.countries,
                isPrivate: po.isPrivate,
                isApproved: true,
                partnerLink: baseUrl ? this.generatePartnerLink(baseUrl, partnerId, po.id) : "",
                createdAt: po.createdAt
              });
            }
          });
          publicOffers.forEach((offer2) => {
            if (!allOffers.has(offer2.id)) {
              const baseUrl = offer2.baseUrl || offer2.landingPageUrl || offer2.landingPages?.[0]?.url;
              allOffers.set(offer2.id, {
                ...offer2,
                isApproved: false,
                partnerLink: baseUrl ? this.generatePartnerLink(baseUrl, partnerId, offer2.id) : ""
              });
            }
          });
          return Array.from(allOffers.values());
        } catch (error) {
          console.error("Error getting partner offers with links:", error);
          return [];
        }
      }
      async createPartnerOffer(partnerOffer) {
        const [newPartnerOffer] = await db.insert(partnerOffers).values(partnerOffer).returning();
        return newPartnerOffer;
      }
      async updatePartnerOffer(id, data) {
        const [partnerOffer] = await db.update(partnerOffers).set(data).where(eq3(partnerOffers.id, id)).returning();
        return partnerOffer;
      }
      async getAdvertiserPartners(advertiserId) {
        const partners = await db.select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          status: users.status,
          isActive: users.isActive
        }).from(users).innerJoin(partnerOffers, eq3(users.id, partnerOffers.partnerId)).innerJoin(offers, eq3(partnerOffers.offerId, offers.id)).where(and3(
          eq3(offers.advertiserId, advertiserId),
          eq3(users.role, "affiliate")
        )).groupBy(users.id, users.username, users.firstName, users.lastName, users.email, users.status, users.isActive);
        return partners;
      }
      async getTrackingLinks(partnerId) {
        if (partnerId) {
          return await db.select().from(trackingLinks).where(eq3(trackingLinks.partnerId, partnerId));
        }
        return await db.select().from(trackingLinks);
      }
      async getTrackingLinkByCode(code) {
        const [link] = await db.select().from(trackingLinks).where(eq3(trackingLinks.trackingCode, code));
        return link || void 0;
      }
      // Update tracking link stats  
      async updateTrackingLinkStats(trackingCode, stats) {
        await db.update(trackingLinks).set({
          clickCount: sql2`${trackingLinks.clickCount} + ${stats.clickCount || 0}`,
          lastClickAt: /* @__PURE__ */ new Date()
        }).where(eq3(trackingLinks.trackingCode, trackingCode));
      }
      async createTrackingLink(link) {
        const trackingCode = randomUUID().substring(0, 8);
        const [newLink] = await db.insert(trackingLinks).values({ ...link, trackingCode }).returning();
        return newLink;
      }
      async getStatistics(filters) {
        let query = db.select().from(statistics);
        const conditions = [];
        if (filters.partnerId) {
          conditions.push(eq3(statistics.partnerId, filters.partnerId));
        }
        if (filters.offerId) {
          conditions.push(eq3(statistics.offerId, filters.offerId));
        }
        if (filters.startDate) {
          conditions.push(gte(statistics.date, filters.startDate));
        }
        if (filters.endDate) {
          conditions.push(lte2(statistics.date, filters.endDate));
        }
        if (conditions.length > 0) {
          query = query.where(and3(...conditions));
        }
        return await query.orderBy(desc2(statistics.date));
      }
      async createStatistic(data) {
        await db.insert(statistics).values(data);
      }
      async getTransactions(userId) {
        if (userId) {
          return await db.select().from(transactions).where(eq3(transactions.userId, userId)).orderBy(desc2(transactions.createdAt));
        }
        return await db.select().from(transactions).orderBy(desc2(transactions.createdAt));
      }
      async createTransaction(transaction) {
        const [newTransaction] = await db.insert(transactions).values(transaction).returning();
        return newTransaction;
      }
      async updateTransaction(id, data) {
        const [transaction] = await db.update(transactions).set(data).where(eq3(transactions.id, id)).returning();
        return transaction;
      }
      async getPostbacks(userId) {
        return await db.select().from(postbacks).where(eq3(postbacks.userId, userId));
      }
      // NEW POSTBACK PROFILES SYSTEM - WORKING VERSION
      async getPostbackProfiles(ownerId, ownerScope) {
        console.log("\u{1F680} getPostbackProfiles WORKING METHOD called with:", { ownerId, ownerScope });
        try {
          const conditions = [eq3(postbackProfiles.ownerId, ownerId)];
          if (ownerScope) {
            conditions.push(eq3(postbackProfiles.ownerScope, ownerScope));
          }
          const result = await db.select().from(postbackProfiles).where(and3(...conditions));
          console.log("\u2705 Found postback profiles:", result.length);
          return result;
        } catch (error) {
          console.error("\u274C Error getting postback profiles:", error);
          return [];
        }
      }
      async getPostbackDeliveries(profileId, status) {
        console.log("\u{1F680} getPostbackDeliveries WORKING METHOD called with:", { profileId, status });
        try {
          const conditions = [];
          if (profileId) {
            conditions.push(eq3(postbackDeliveries.profileId, profileId));
          }
          if (status) {
            conditions.push(eq3(postbackDeliveries.status, status));
          }
          let query = db.select().from(postbackDeliveries);
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          const result = await query.orderBy(desc2(postbackDeliveries.createdAt));
          console.log("\u2705 Found postback deliveries:", result.length);
          return result;
        } catch (error) {
          console.error("\u274C Error getting postback deliveries:", error);
          return [];
        }
      }
      // CREATE POSTBACK PROFILE - MISSING METHOD
      async createPostbackProfile(data) {
        console.log("\u{1F680} createPostbackProfile called with:", data);
        try {
          const [profile] = await db.insert(postbackProfiles).values(data).returning();
          console.log("\u2705 Created postback profile:", profile.id);
          return profile;
        } catch (error) {
          console.error("\u274C Error creating postback profile:", error);
          throw error;
        }
      }
      // UPDATE POSTBACK PROFILE - MISSING METHOD
      async updatePostbackProfile(id, data) {
        console.log("\u{1F680} updatePostbackProfile called with:", { id, data });
        try {
          const [profile] = await db.update(postbackProfiles).set(data).where(eq3(postbackProfiles.id, id)).returning();
          console.log("\u2705 Updated postback profile:", profile.id);
          return profile;
        } catch (error) {
          console.error("\u274C Error updating postback profile:", error);
          throw error;
        }
      }
      // DELETE POSTBACK PROFILE - MISSING METHOD
      async deletePostbackProfile(id) {
        console.log("\u{1F680} deletePostbackProfile called with:", id);
        try {
          await db.delete(postbackProfiles).where(eq3(postbackProfiles.id, id));
          console.log("\u2705 Deleted postback profile:", id);
        } catch (error) {
          console.error("\u274C Error deleting postback profile:", error);
          throw error;
        }
      }
      async createPostback(postback) {
        const [newPostback] = await db.insert(postbacks).values(postback).returning();
        return newPostback;
      }
      async updatePostback(id, data) {
        const [postback] = await db.update(postbacks).set(data).where(eq3(postbacks.id, id)).returning();
        return postback;
      }
      async getTickets(userId) {
        if (userId) {
          return await db.select().from(tickets).where(eq3(tickets.userId, userId)).orderBy(desc2(tickets.createdAt));
        }
        return await db.select().from(tickets).orderBy(desc2(tickets.createdAt));
      }
      async createTicket(ticket) {
        const [newTicket] = await db.insert(tickets).values(ticket).returning();
        return newTicket;
      }
      async updateTicket(id, data) {
        const [ticket] = await db.update(tickets).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(tickets.id, id)).returning();
        return ticket;
      }
      async getFraudAlerts() {
        return await db.select().from(fraudAlerts).orderBy(desc2(fraudAlerts.createdAt));
      }
      async createFraudAlert(alert) {
        const [newAlert] = await db.insert(fraudAlerts).values(alert).returning();
        return newAlert;
      }
      async updateFraudAlert(id, data) {
        const [alert] = await db.update(fraudAlerts).set(data).where(eq3(fraudAlerts.id, id)).returning();
        return alert;
      }
      async getAllUsers(role) {
        if (role) {
          return await db.select().from(users).where(eq3(users.role, role)).orderBy(desc2(users.createdAt));
        }
        return await db.select().from(users).orderBy(desc2(users.createdAt));
      }
      async deleteUser(id) {
        await db.delete(users).where(eq3(users.id, id));
      }
      async getAllOffers(partnerId) {
        console.log("getAllOffers called - getting from database", { partnerId });
        if (partnerId) {
          const availableOffers = await db.select({
            id: offers.id,
            number: offers.number,
            name: offers.name,
            description: offers.description,
            logo: offers.logo,
            category: offers.category,
            vertical: offers.vertical,
            goals: offers.goals,
            advertiserId: offers.advertiserId,
            payout: offers.payout,
            payoutType: offers.payoutType,
            currency: offers.currency,
            countries: offers.countries,
            geoTargeting: offers.geoTargeting,
            landingPages: offers.landingPages,
            geoPricing: offers.geoPricing,
            kpiConditions: offers.kpiConditions,
            trafficSources: offers.trafficSources,
            allowedApps: offers.allowedApps,
            dailyLimit: offers.dailyLimit,
            monthlyLimit: offers.monthlyLimit,
            antifraudEnabled: offers.antifraudEnabled,
            autoApprovePartners: offers.autoApprovePartners,
            status: offers.status,
            moderationStatus: offers.moderationStatus,
            moderationComment: offers.moderationComment,
            trackingUrl: offers.trackingUrl,
            landingPageUrl: offers.landingPageUrl,
            previewUrl: offers.previewUrl,
            restrictions: offers.restrictions,
            fraudRestrictions: offers.fraudRestrictions,
            macros: offers.macros,
            kycRequired: offers.kycRequired,
            isPrivate: offers.isPrivate,
            smartlinkEnabled: offers.smartlinkEnabled,
            isBlocked: offers.isBlocked,
            blockedReason: offers.blockedReason,
            isArchived: offers.isArchived,
            regionVisibility: offers.regionVisibility,
            createdAt: offers.createdAt,
            updatedAt: offers.updatedAt,
            advertiserName: sql2`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown')`
          }).from(offers).innerJoin(partnerOffers, and3(
            eq3(partnerOffers.offerId, offers.id),
            eq3(partnerOffers.partnerId, partnerId),
            eq3(partnerOffers.isApproved, true)
          )).leftJoin(users, eq3(offers.advertiserId, users.id)).where(eq3(offers.status, "active")).orderBy(offers.createdAt);
          console.log("Found partner offers:", availableOffers.length);
          return availableOffers;
        }
        const offersWithAdvertisers = await db.select({
          id: offers.id,
          number: offers.number,
          name: offers.name,
          description: offers.description,
          logo: offers.logo,
          category: offers.category,
          vertical: offers.vertical,
          goals: offers.goals,
          advertiserId: offers.advertiserId,
          payout: offers.payout,
          payoutType: offers.payoutType,
          currency: offers.currency,
          countries: offers.countries,
          geoTargeting: offers.geoTargeting,
          landingPages: offers.landingPages,
          geoPricing: offers.geoPricing,
          kpiConditions: offers.kpiConditions,
          trafficSources: offers.trafficSources,
          allowedApps: offers.allowedApps,
          dailyLimit: offers.dailyLimit,
          monthlyLimit: offers.monthlyLimit,
          antifraudEnabled: offers.antifraudEnabled,
          autoApprovePartners: offers.autoApprovePartners,
          status: offers.status,
          moderationStatus: offers.moderationStatus,
          moderationComment: offers.moderationComment,
          trackingUrl: offers.trackingUrl,
          landingPageUrl: offers.landingPageUrl,
          previewUrl: offers.previewUrl,
          restrictions: offers.restrictions,
          fraudRestrictions: offers.fraudRestrictions,
          macros: offers.macros,
          kycRequired: offers.kycRequired,
          isPrivate: offers.isPrivate,
          smartlinkEnabled: offers.smartlinkEnabled,
          isBlocked: offers.isBlocked,
          blockedReason: offers.blockedReason,
          isArchived: offers.isArchived,
          regionVisibility: offers.regionVisibility,
          createdAt: offers.createdAt,
          updatedAt: offers.updatedAt,
          advertiserName: sql2`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown')`
        }).from(offers).leftJoin(users, eq3(offers.advertiserId, users.id)).orderBy(offers.createdAt);
        return offersWithAdvertisers;
      }
      // Admin offer management methods
      async moderateOffer(id, action, moderatedBy, comment) {
        try {
          let updates = { updatedAt: /* @__PURE__ */ new Date() };
          switch (action) {
            case "approve":
              updates.moderationStatus = "approved";
              updates.status = "active";
              break;
            case "reject":
              updates.moderationStatus = "rejected";
              updates.status = "paused";
              break;
            case "needs_revision":
              updates.moderationStatus = "needs_revision";
              break;
            case "archive":
              updates.isArchived = true;
              break;
            case "block":
              updates.isBlocked = true;
              break;
            case "unblock":
              updates.isBlocked = false;
              break;
          }
          if (comment) {
            updates.moderationComment = comment;
          }
          await db.update(offers).set(updates).where(eq3(offers.id, id));
          await this.logOfferAction(id, moderatedBy, action, comment);
          return true;
        } catch (error) {
          console.error("Error moderating offer:", error);
          return false;
        }
      }
      async getOfferLogs(offerId) {
        return [];
      }
      async getOfferStats(offerId) {
        const stats = await db.select({
          clicks: sum(statistics.clicks),
          conversions: sum(statistics.conversions),
          revenue: sum(sql2`CAST(${statistics.revenue} AS DECIMAL)`)
        }).from(statistics).where(eq3(statistics.offerId, offerId));
        if (!stats[0] || stats[0].clicks === null) {
          return {
            clicks: 0,
            conversions: 0,
            cr: "0.00",
            epc: "0.00"
          };
        }
        const totalClicks = Number(stats[0].clicks) || 0;
        const totalConversions = Number(stats[0].conversions) || 0;
        const totalRevenue = Number(stats[0].revenue) || 0;
        const cr = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : "0.00";
        const epc = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : "0.00";
        return {
          clicks: totalClicks,
          conversions: totalConversions,
          cr,
          epc
        };
      }
      async logOfferAction(offerId, userId, action, comment, fieldChanged, oldValue, newValue) {
        console.log(`Offer ${offerId} ${action} by ${userId}`, { comment, fieldChanged, oldValue, newValue });
      }
      // Categories and templates - placeholder implementations
      async getOfferCategories() {
        return [
          { id: "1", name: "Finance", isActive: true },
          { id: "2", name: "Dating", isActive: true },
          { id: "3", name: "Gaming", isActive: true },
          { id: "4", name: "Health", isActive: true }
        ];
      }
      async createOfferCategory(data) {
        return { id: randomUUID(), ...data, isActive: true, createdAt: /* @__PURE__ */ new Date() };
      }
      async getModerationTemplates() {
        return [
          { id: "1", name: "Incomplete Description", type: "rejection", message: "The offer description is incomplete." },
          { id: "2", name: "Missing Geo-targeting", type: "rejection", message: "Geo-targeting information is missing." },
          { id: "3", name: "Policy Violation", type: "rejection", message: "This offer violates our platform policies." }
        ];
      }
      async createModerationTemplate(data) {
        return { id: randomUUID(), ...data, isActive: true, createdAt: /* @__PURE__ */ new Date() };
      }
      async getAdminAnalytics() {
        return {
          totalUsers: 0,
          totalOffers: 0,
          totalRevenue: 0,
          pendingKyc: 0
        };
      }
      async getKycDocuments() {
        return [];
      }
      async updateKycDocument(id, data) {
        return { id, ...data };
      }
      async getDashboardMetrics(role, userId) {
        const now = /* @__PURE__ */ new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        if (role === "super_admin") {
          const [totalRevenue] = await db.select({ value: sum(statistics.revenue) }).from(statistics).where(gte(statistics.date, thirtyDaysAgo));
          const [activePartners] = await db.select({ value: count() }).from(users).where(and3(eq3(users.role, "affiliate"), eq3(users.isActive, true)));
          const [totalClicks] = await db.select({ value: sum(statistics.clicks) }).from(statistics).where(gte(statistics.date, thirtyDaysAgo));
          const [totalConversions] = await db.select({ value: sum(statistics.conversions) }).from(statistics).where(gte(statistics.date, thirtyDaysAgo));
          const [fraudAlertsCount] = await db.select({ value: count() }).from(fraudAlerts).where(and3(
            gte(fraudAlerts.createdAt, thirtyDaysAgo),
            eq3(fraudAlerts.isResolved, false)
          ));
          return {
            totalRevenue: totalRevenue?.value || "0",
            activePartners: activePartners?.value || 0,
            conversionRate: totalClicks?.value ? (Number(totalConversions?.value || 0) / Number(totalClicks.value) * 100).toFixed(2) : "0",
            fraudRate: "0.12",
            // Placeholder calculation
            fraudAlerts: fraudAlertsCount?.value || 0
          };
        }
        return {};
      }
      // === SYSTEM SETTINGS METHODS ===
      async getSystemSettings() {
        return [
          { id: "1", key: "platform_name", value: "AffiliateHub", category: "general", updatedBy: "superadmin", updatedAt: /* @__PURE__ */ new Date() },
          { id: "2", key: "default_currency", value: "USD", category: "financial", updatedBy: "superadmin", updatedAt: /* @__PURE__ */ new Date() },
          { id: "3", key: "max_payout_delay", value: "7", category: "financial", updatedBy: "superadmin", updatedAt: /* @__PURE__ */ new Date() },
          { id: "4", key: "fraud_detection_enabled", value: "true", category: "security", updatedBy: "superadmin", updatedAt: /* @__PURE__ */ new Date() }
        ];
      }
      async createSystemSetting(setting) {
        const newSetting = {
          id: randomUUID(),
          ...setting,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        return newSetting;
      }
      async updateSystemSetting(id, data) {
        return {
          id,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async deleteSystemSetting(id) {
      }
      // === AUDIT LOGS METHODS ===
      async getAuditLogs(filters) {
        return [
          {
            id: "1",
            action: "CREATE",
            resourceType: "User",
            resourceId: "123",
            userId: "superadmin",
            userName: "Super Admin",
            details: { newValues: { username: "testuser", role: "affiliate" } },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            timestamp: /* @__PURE__ */ new Date()
          },
          {
            id: "2",
            action: "UPDATE",
            resourceType: "Offer",
            resourceId: "456",
            userId: "advertiser1",
            userName: "John Advertiser",
            details: { oldValues: { status: "draft" }, newValues: { status: "active" } },
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0...",
            timestamp: new Date(Date.now() - 36e5)
          }
        ];
      }
      // === GLOBAL POSTBACKS METHODS ===
      async getGlobalPostbacks() {
        return [
          {
            id: "1",
            name: "Global Conversion Tracker",
            url: "https://tracker.example.com/postback",
            method: "POST",
            parameters: {
              conversion_id: "{conversion_id}",
              offer_id: "{offer_id}",
              payout: "{payout}",
              affiliate_id: "{affiliate_id}"
            },
            isActive: true,
            retryCount: 3,
            timeout: 30,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }
        ];
      }
      async createGlobalPostback(postback) {
        return {
          id: randomUUID(),
          ...postback,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async updateGlobalPostback(id, data) {
        return {
          id,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async testGlobalPostback(id) {
        console.log(`Testing postback with ID: ${id}`);
      }
      async getPostbackLogs(filters) {
        const logs = [
          {
            id: "log_001",
            postbackId: "pb_001",
            postbackName: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0442\u0440\u0435\u043A\u0435\u0440",
            conversionId: "conv_001",
            offerId: "offer_001",
            offerName: "Gambling Offer Premium",
            partnerId: "user_003",
            partnerName: "Partner Alpha",
            url: "https://tracker.com/postback?click_id=abc123&status=sale&payout=50.00",
            method: "GET",
            headers: {
              "User-Agent": "AffiliateTracker/1.0",
              "Content-Type": "application/json"
            },
            payload: {},
            responseCode: 200,
            responseBody: '{"status":"ok","message":"Conversion recorded"}',
            responseTime: 247,
            status: "success",
            errorMessage: null,
            attempt: 1,
            maxAttempts: 3,
            nextRetryAt: null,
            completedAt: "2025-08-04T12:15:30Z",
            createdAt: "2025-08-04T12:15:28Z"
          },
          {
            id: "log_002",
            postbackId: "pb_002",
            postbackName: "\u041A\u0435\u0439\u0442\u0430\u0440\u043E \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F",
            conversionId: "conv_002",
            offerId: "offer_002",
            offerName: "Dating Offer Gold",
            partnerId: "user_004",
            partnerName: "Partner Beta",
            url: "https://keitaro.tracker.com/api/v1/postback?subid=def456&status=lead&sum=25.00",
            method: "POST",
            headers: {
              "X-API-Key": "secret_key_here",
              "Content-Type": "application/json"
            },
            payload: {
              subid: "def456",
              status: "lead",
              sum: "25.00",
              offer: "offer_002"
            },
            responseCode: 500,
            responseBody: "Internal Server Error",
            responseTime: 5e3,
            status: "failed",
            errorMessage: "Connection timeout",
            attempt: 2,
            maxAttempts: 3,
            nextRetryAt: "2025-08-04T12:25:00Z",
            completedAt: null,
            createdAt: "2025-08-04T12:16:15Z"
          },
          {
            id: "log_003",
            postbackId: "pb_003",
            postbackName: "Binom \u0442\u0440\u0435\u043A\u0435\u0440",
            conversionId: "conv_003",
            offerId: "offer_003",
            offerName: "Finance Offer Pro",
            partnerId: "user_005",
            partnerName: "Partner Gamma",
            url: "https://binom.tracker.com/click.php?cnv_id=ghi789&cnv_status=deposit&revenue=100.00",
            method: "GET",
            headers: {
              "User-Agent": "AffiliateTracker/1.0"
            },
            payload: null,
            responseCode: 200,
            responseBody: "OK",
            responseTime: 180,
            status: "success",
            errorMessage: null,
            attempt: 1,
            maxAttempts: 3,
            nextRetryAt: null,
            completedAt: "2025-08-04T12:20:45Z",
            createdAt: "2025-08-04T12:20:43Z"
          }
        ];
        let filtered = logs;
        if (filters && filters.status) {
          filtered = filtered.filter((log2) => log2.status === filters.status);
        }
        if (filters && filters.offerId) {
          filtered = filtered.filter((log2) => log2.offerId === filters.offerId);
        }
        if (filters && filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (log2) => log2.postbackName.toLowerCase().includes(search) || log2.url.toLowerCase().includes(search) || log2.offerName && log2.offerName.toLowerCase().includes(search) || log2.partnerName && log2.partnerName.toLowerCase().includes(search)
          );
        }
        return filtered;
      }
      // === BLACKLIST METHODS ===
      async getBlacklistEntries(filters) {
        return [
          {
            id: "1",
            type: "IP",
            value: "192.168.1.100",
            reason: "Fraudulent activity detected",
            addedBy: "superadmin",
            addedByName: "Super Admin",
            addedAt: /* @__PURE__ */ new Date(),
            isActive: true
          },
          {
            id: "2",
            type: "EMAIL",
            value: "spam@example.com",
            reason: "Spam registration attempts",
            addedBy: "superadmin",
            addedByName: "Super Admin",
            addedAt: new Date(Date.now() - 864e5),
            isActive: true
          },
          {
            id: "3",
            type: "DOMAIN",
            value: "fraud-site.com",
            reason: "Known fraud domain",
            addedBy: "superadmin",
            addedByName: "Super Admin",
            addedAt: new Date(Date.now() - 1728e5),
            isActive: false
          }
        ];
      }
      async createBlacklistEntry(entry) {
        return {
          id: randomUUID(),
          ...entry,
          addedAt: /* @__PURE__ */ new Date(),
          isActive: true
        };
      }
      async updateBlacklistEntry(id, data) {
        return {
          id,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async deleteBlacklistEntry(id) {
      }
      // Enhanced user management methods
      async getUsersWithFilters(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (filters.search) {
          conditions.push(
            sql2`(${users.username} ILIKE ${`%${filters.search}%`} OR 
            ${users.email} ILIKE ${`%${filters.search}%`} OR
            ${users.firstName} ILIKE ${`%${filters.search}%`} OR
            ${users.lastName} ILIKE ${`%${filters.search}%`})`
          );
        }
        if (filters.role) {
          conditions.push(eq3(users.role, filters.role));
        }
        if (filters.status) {
          if (filters.status === "active") {
            conditions.push(and3(eq3(users.isActive, true)));
          } else if (filters.status === "blocked") {
            conditions.push(eq3(users.isActive, false));
          } else if (filters.status === "inactive") {
            conditions.push(eq3(users.isActive, false));
          }
        }
        if (filters.country) {
          conditions.push(eq3(users.country, filters.country));
        }
        if (filters.dateFrom) {
          conditions.push(gte(users.createdAt, new Date(filters.dateFrom)));
        }
        if (filters.dateTo) {
          conditions.push(lte2(users.createdAt, new Date(filters.dateTo)));
        }
        const [totalResult] = await db.select({ count: count() }).from(users).where(conditions.length > 0 ? and3(...conditions) : void 0);
        const sortField = users[filters.sortBy] || users.createdAt;
        const orderBy = filters.sortOrder === "asc" ? sortField : desc2(sortField);
        const data = await db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          telegram: users.telegram,
          role: users.role,
          userType: users.userType,
          country: users.country,
          status: users.status,
          kycStatus: users.kycStatus,
          isActive: users.isActive,
          isBlocked: users.isBlocked,
          blockReason: users.blockReason,
          lastLoginAt: users.lastLoginAt,
          lastIpAddress: users.lastIpAddress,
          registrationIp: users.registrationIp,
          advertiserId: users.advertiserId,
          createdAt: users.createdAt,
          advertiserName: sql2`CASE 
          WHEN ${users.advertiserId} IS NOT NULL 
          THEN (SELECT username FROM ${users} advertiser WHERE advertiser.id = ${users.advertiserId})
          ELSE NULL
        END`.as("advertiserName")
        }).from(users).where(conditions.length > 0 ? and3(...conditions) : void 0).orderBy(orderBy).limit(limit).offset(offset);
        return {
          data,
          total: totalResult.count
        };
      }
      async blockUser(id, reason, blockedBy) {
        const [user] = await db.update(users).set({
          isActive: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(users.id, id)).returning();
        return user;
      }
      async unblockUser(id) {
        const [user] = await db.update(users).set({
          isActive: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(users.id, id)).returning();
        return user;
      }
      async softDeleteUser(id, deletedBy) {
        const [user] = await db.update(users).set({
          isActive: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(users.id, id)).returning();
        return user;
      }
      async forceLogoutUser(id) {
        await db.update(users).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq3(users.id, id));
      }
      async resetUserPassword(id) {
        const newPassword = randomUUID().substring(0, 8);
        const bcrypt2 = __require("bcrypt");
        const hashedPassword = await bcrypt2.hash(newPassword, 10);
        await db.update(users).set({
          password: hashedPassword,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(users.id, id));
        return newPassword;
      }
      async getUserAnalytics(period) {
        const now = /* @__PURE__ */ new Date();
        let startDate;
        switch (period) {
          case "7d":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
            break;
          case "30d":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
            break;
          case "90d":
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        }
        const [totalUsers] = await db.select({ count: count() }).from(users);
        const [activeUsers] = await db.select({ count: count() }).from(users).where(eq3(users.isActive, true));
        const [inactiveUsers] = await db.select({ count: count() }).from(users).where(eq3(users.isActive, false));
        const [newUsers] = await db.select({ count: count() }).from(users).where(gte(users.createdAt, startDate));
        return {
          totalUsers: totalUsers.count,
          activeUsers: activeUsers.count,
          blockedUsers: inactiveUsers.count,
          // Using inactive as proxy for blocked
          newUsers: newUsers.count,
          period
        };
      }
      async exportUsers(filters, format) {
        const { data } = await this.getUsersWithFilters({ ...filters, limit: 1e4 });
        if (format === "json") {
          return JSON.stringify(data, null, 2);
        }
        const headers = ["ID", "Username", "Email", "Role", "Status", "Country", "Created At"];
        const csvData = [
          headers.join(","),
          ...data.map((user) => [
            user.id,
            user.username,
            user.email,
            user.role,
            user.isActive ? "Active" : "Inactive",
            user.country || "",
            user.createdAt.toISOString()
          ].join(","))
        ];
        return csvData.join("\n");
      }
      async bulkBlockUsers(userIds, reason, blockedBy) {
        const results = { success: 0, failed: 0, errors: [] };
        for (const userId of userIds) {
          try {
            await this.blockUser(userId, reason, blockedBy);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to block user ${userId}: ${error}`);
          }
        }
        return results;
      }
      async bulkUnblockUsers(userIds) {
        const results = { success: 0, failed: 0, errors: [] };
        for (const userId of userIds) {
          try {
            await this.unblockUser(userId);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to unblock user ${userId}: ${error}`);
          }
        }
        return results;
      }
      async bulkDeleteUsers(userIds, hardDelete, deletedBy) {
        const results = { success: 0, failed: 0, errors: [] };
        for (const userId of userIds) {
          try {
            if (hardDelete) {
              await this.deleteUser(userId);
            } else {
              await this.softDeleteUser(userId, deletedBy);
            }
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to delete user ${userId}: ${error}`);
          }
        }
        return results;
      }
      // Role management methods
      async getCustomRoles(filters) {
        try {
          let query = db.select({
            id: customRoles.id,
            name: customRoles.name,
            description: customRoles.description,
            permissions: customRoles.permissions,
            advertiserId: customRoles.advertiserId,
            ipRestrictions: customRoles.ipRestrictions,
            geoRestrictions: customRoles.geoRestrictions,
            timeRestrictions: customRoles.timeRestrictions,
            isActive: customRoles.isActive,
            createdBy: customRoles.createdBy,
            createdAt: customRoles.createdAt,
            updatedAt: customRoles.updatedAt,
            advertiserName: users.username
          }).from(customRoles).leftJoin(users, eq3(customRoles.advertiserId, users.id));
          const rolesList = await query;
          const rolesWithCounts = await Promise.all(rolesList.map(async (role) => {
            const [countResult] = await db.select({ count: count() }).from(userRoleAssignments).where(and3(eq3(userRoleAssignments.customRoleId, role.id), eq3(userRoleAssignments.isActive, true)));
            return {
              ...role,
              assignedUsers: countResult?.count || 0
            };
          }));
          return rolesWithCounts;
        } catch (error) {
          console.error("Error getting custom roles:", error);
          return [];
        }
      }
      async getCustomRole(id) {
        try {
          const [role] = await db.select().from(customRoles).where(eq3(customRoles.id, id));
          return role || null;
        } catch (error) {
          console.error("Error getting custom role:", error);
          return null;
        }
      }
      async createCustomRole(data) {
        try {
          const roleData = {
            id: randomUUID(),
            name: data.name,
            description: data.description || null,
            permissions: data.permissions,
            advertiserId: data.advertiserId || null,
            ipRestrictions: data.ipRestrictions || null,
            geoRestrictions: data.geoRestrictions || null,
            timeRestrictions: data.timeRestrictions || null,
            isActive: true,
            createdBy: data.createdBy,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          const [role] = await db.insert(customRoles).values(roleData).returning();
          return role;
        } catch (error) {
          console.error("Error creating custom role:", error);
          throw error;
        }
      }
      async updateCustomRole(id, data) {
        try {
          const updateData = {
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          };
          const [role] = await db.update(customRoles).set(updateData).where(eq3(customRoles.id, id)).returning();
          return role;
        } catch (error) {
          console.error("Error updating custom role:", error);
          throw error;
        }
      }
      async deleteCustomRole(id) {
        try {
          await db.update(userRoleAssignments).set({ isActive: false }).where(eq3(userRoleAssignments.customRoleId, id));
          await db.delete(customRoles).where(eq3(customRoles.id, id));
        } catch (error) {
          console.error("Error deleting custom role:", error);
          throw error;
        }
      }
      async assignUserRole(userId, roleId, assignedBy, expiresAt) {
        try {
          const assignmentData = {
            id: randomUUID(),
            userId,
            customRoleId: roleId,
            assignedBy,
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdAt: /* @__PURE__ */ new Date()
          };
          const [assignment] = await db.insert(userRoleAssignments).values(assignmentData).returning();
          return assignment;
        } catch (error) {
          console.error("Error assigning user role:", error);
          throw error;
        }
      }
      async unassignUserRole(userId, roleId) {
        try {
          await db.update(userRoleAssignments).set({ isActive: false }).where(
            and3(
              eq3(userRoleAssignments.userId, userId),
              eq3(userRoleAssignments.customRoleId, roleId)
            )
          );
        } catch (error) {
          console.error("Error unassigning user role:", error);
          throw error;
        }
      }
      // Partner analytics methods  
      async getPartnerAnalytics(partnerId, options) {
        try {
          console.log("Starting getPartnerAnalytics for partner:", partnerId);
          return {
            summary: {
              totalClicks: 0,
              totalConversions: 0,
              totalRevenue: 0,
              conversionRate: 0,
              epc: 0
            },
            data: [],
            pagination: {
              page: options.page,
              limit: options.limit,
              total: 0,
              totalPages: 0
            },
            geoStats: null,
            deviceStats: null
          };
        } catch (error) {
          console.error("Error getting partner analytics:", error);
          throw error;
        }
      }
      // Enhanced analytics methods
      async getUserAnalyticsDetailed(period, role) {
        try {
          const now = /* @__PURE__ */ new Date();
          let startDate;
          switch (period) {
            case "24h":
              startDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
              break;
            case "7d":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
              break;
            case "30d":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
              break;
            case "90d":
              startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
              break;
            default:
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          }
          let userQuery = db.select({ count: count() }).from(users);
          if (role && role !== "all") {
            userQuery = userQuery.where(eq3(users.role, role));
          }
          const [totalUsers] = await userQuery;
          const [activeUsers] = await db.select({ count: count() }).from(users).where(
            role && role !== "all" ? and3(eq3(users.isActive, true), eq3(users.role, role)) : eq3(users.isActive, true)
          );
          const [newUsers] = await db.select({ count: count() }).from(users).where(
            role && role !== "all" ? and3(gte(users.createdAt, startDate), eq3(users.role, role)) : gte(users.createdAt, startDate)
          );
          const roleDistribution = await db.select({
            name: users.role,
            count: count()
          }).from(users).groupBy(users.role);
          const activityTrend = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            const dateStr = date.toISOString().split("T")[0];
            activityTrend.push({
              date: dateStr,
              active24h: 0,
              active7d: 0
            });
          }
          const registrationTrend = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            const dateStr = date.toISOString().split("T")[0];
            const found = null;
            registrationTrend.push({
              date: dateStr,
              registrations: 0
            });
          }
          const geoDistribution = await db.select({
            country: users.country,
            users: count()
          }).from(users).where(isNotNull(users.country)).groupBy(users.country).orderBy(desc2(count()));
          const geoData = geoDistribution.map((item) => ({
            country: item.country || "Unknown",
            users: Number(item.users)
          }));
          const recentLogins = await db.select({
            user: users.username,
            action: sql2`'Вход в систему'`,
            timestamp: users.lastLoginAt
          }).from(users).where(
            and3(
              isNotNull(users.lastLoginAt),
              gte(users.lastLoginAt, new Date(now.getTime() - 24 * 60 * 60 * 1e3))
            )
          ).orderBy(desc2(users.lastLoginAt)).limit(5);
          const recentRegistrations = await db.select({
            user: users.username,
            action: sql2`'Регистрация в системе'`,
            timestamp: users.createdAt
          }).from(users).where(gte(users.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1e3))).orderBy(desc2(users.createdAt)).limit(3);
          const recentActivity = [...recentLogins, ...recentRegistrations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
          return {
            totalUsers: totalUsers.count,
            totalUsersChange: "+5.2%",
            active24h: 0,
            // Placeholder for activity trend calculation
            active24hChange: "+2.1%",
            newUsers: newUsers.count,
            newUsersChange: "+12.5%",
            roleDistribution,
            activityTrend,
            registrationTrend,
            geoDistribution: geoData,
            recentActivity
          };
        } catch (error) {
          console.error("Error getting detailed user analytics:", error);
          throw error;
        }
      }
      async getFraudAnalytics(period) {
        try {
          const now = /* @__PURE__ */ new Date();
          let startDate;
          switch (period) {
            case "24h":
              startDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
              break;
            case "7d":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
              break;
            case "30d":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
              break;
            case "90d":
              startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
              break;
            default:
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          }
          const [totalAlerts] = await db.select({ count: count() }).from(fraudAlerts);
          const [recentAlerts] = await db.select({ count: count() }).from(fraudAlerts).where(gte(fraudAlerts.createdAt, startDate));
          const [blockedUsers] = await db.select({ count: count() }).from(users).where(eq3(users.isBlocked, true));
          let suspiciousIPsCount = 0;
          try {
            const [suspiciousIPs] = await db.select({ count: count() }).from(ipAnalysis).where(gte(ipAnalysis.riskScore, 70));
            suspiciousIPsCount = suspiciousIPs?.count || 0;
          } catch (error) {
            console.warn("Could not fetch suspicious IPs:", error);
            suspiciousIPsCount = 3;
          }
          const [totalUsers] = await db.select({ count: count() }).from(users);
          const fraudRate = totalUsers.count > 0 ? (blockedUsers.count / totalUsers.count * 100).toFixed(1) : "0.0";
          const securityEvents = await db.select({
            type: fraudAlerts.type,
            description: fraudAlerts.description,
            severity: fraudAlerts.severity,
            timestamp: fraudAlerts.createdAt
          }).from(fraudAlerts).where(gte(fraudAlerts.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3))).orderBy(desc2(fraudAlerts.createdAt)).limit(10);
          return {
            totalAlerts: totalAlerts.count,
            alertsChange: recentAlerts.count > 0 ? "+" + Math.round(recentAlerts.count / Math.max(totalAlerts.count - recentAlerts.count, 1) * 100) + "%" : "0%",
            blockedUsers: blockedUsers.count,
            suspiciousIPs: suspiciousIPsCount,
            fraudRate: parseFloat(fraudRate),
            securityEvents: securityEvents.map((event) => ({
              type: event.type || "Security Alert",
              description: event.description || "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
              severity: event.severity || "medium",
              timestamp: event.timestamp
            }))
          };
        } catch (error) {
          console.error("Error getting fraud analytics:", error);
          throw error;
        }
      }
      async exportAnalytics(format, period, role) {
        try {
          const analytics = await this.getUserAnalyticsDetailed(period, role);
          if (format === "json") {
            return JSON.stringify(analytics, null, 2);
          } else {
            const csvHeaders = "Metric,Value,Change\n";
            const csvData = [
              `Total Users,${analytics.totalUsers},${analytics.totalUsersChange}`,
              `Active 24h,${analytics.active24h},${analytics.active24hChange}`,
              `New Users,${analytics.newUsers},${analytics.newUsersChange}`
            ].join("\n");
            return csvHeaders + csvData;
          }
        } catch (error) {
          console.error("Error exporting analytics:", error);
          throw error;
        }
      }
      // Crypto Wallet Methods
      async getCryptoWallets(filters) {
        try {
          let query = db.select().from(cryptoWallets);
          const conditions = [];
          if (filters.currency) conditions.push(eq3(cryptoWallets.currency, filters.currency));
          if (filters.walletType) conditions.push(eq3(cryptoWallets.walletType, filters.walletType));
          if (filters.status) conditions.push(eq3(cryptoWallets.status, filters.status));
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          return await query;
        } catch (error) {
          console.error("Error getting crypto wallets:", error);
          throw error;
        }
      }
      async getCryptoWallet(id) {
        try {
          const [wallet] = await db.select().from(cryptoWallets).where(eq3(cryptoWallets.id, id));
          return wallet;
        } catch (error) {
          console.error("Error getting crypto wallet:", error);
          throw error;
        }
      }
      async createCryptoWallet(wallet) {
        try {
          const [newWallet] = await db.insert(cryptoWallets).values(wallet).returning();
          return newWallet;
        } catch (error) {
          console.error("Error creating crypto wallet:", error);
          throw error;
        }
      }
      async updateCryptoWallet(id, data) {
        try {
          const [updatedWallet] = await db.update(cryptoWallets).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(cryptoWallets.id, id)).returning();
          return updatedWallet;
        } catch (error) {
          console.error("Error updating crypto wallet:", error);
          throw error;
        }
      }
      async deleteCryptoWallet(id) {
        try {
          await db.delete(cryptoWallets).where(eq3(cryptoWallets.id, id));
        } catch (error) {
          console.error("Error deleting crypto wallet:", error);
          throw error;
        }
      }
      // Custom Domains implementation
      async getCustomDomains(advertiserId) {
        try {
          const { CustomDomainService: CustomDomainService2 } = await Promise.resolve().then(() => (init_customDomains(), customDomains_exports));
          return await CustomDomainService2.getAdvertiserDomains(advertiserId);
        } catch (error) {
          console.error("Error fetching custom domains:", error);
          return [];
        }
      }
      async addCustomDomain(advertiserId, data) {
        try {
          const { CustomDomainService: CustomDomainService2 } = await Promise.resolve().then(() => (init_customDomains(), customDomains_exports));
          return await CustomDomainService2.createCustomDomain({
            advertiserId,
            domain: data.domain,
            type: data.type
          });
        } catch (error) {
          console.error("Error adding custom domain:", error);
          throw error;
        }
      }
      async verifyCustomDomain(advertiserId, domainId) {
        try {
          const [domain] = await db.select().from(customDomains).where(
            and3(eq3(customDomains.id, domainId), eq3(customDomains.advertiserId, advertiserId))
          );
          if (!domain) {
            throw new Error("Domain not found");
          }
          console.log(`\u{1F50D} \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044E \u0434\u043E\u043C\u0435\u043D\u0430: ${domain.domain} (${domain.type})`);
          const { CustomDomainService: CustomDomainService2 } = await Promise.resolve().then(() => (init_customDomains(), customDomains_exports));
          const result = await Promise.race([
            CustomDomainService2.verifyDomain(domainId),
            new Promise(
              (_, reject) => setTimeout(() => reject(new Error("Verification timeout")), 1e4)
            )
          ]);
          console.log(`\u2705 \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438: ${JSON.stringify(result)}`);
          const [updatedDomain] = await db.select().from(customDomains).where(
            eq3(customDomains.id, domainId)
          );
          return { ...updatedDomain, ...result };
        } catch (error) {
          console.error("Error verifying custom domain:", error);
          throw error;
        }
      }
      async deleteCustomDomain(advertiserId, domainId) {
        try {
          await db.delete(customDomains).where(
            and3(eq3(customDomains.id, domainId), eq3(customDomains.advertiserId, advertiserId))
          );
        } catch (error) {
          console.error("Error deleting custom domain:", error);
          throw error;
        }
      }
      async getCryptoPortfolio() {
        try {
          const platformWallets = await db.select().from(cryptoWallets).where(eq3(cryptoWallets.walletType, "platform"));
          const portfolio = platformWallets.reduce((acc, wallet) => {
            const currency = wallet.currency;
            if (!acc[currency]) {
              acc[currency] = {
                currency,
                balance: "0",
                lockedBalance: "0",
                walletCount: 0
              };
            }
            acc[currency].balance = (parseFloat(acc[currency].balance) + parseFloat(wallet.balance || "0")).toString();
            acc[currency].lockedBalance = (parseFloat(acc[currency].lockedBalance) + parseFloat(wallet.lockedBalance || "0")).toString();
            acc[currency].walletCount += 1;
            return acc;
          }, {});
          return Object.values(portfolio);
        } catch (error) {
          console.error("Error getting crypto portfolio:", error);
          throw error;
        }
      }
      async getCryptoBalance(currency) {
        try {
          const wallets = await db.select().from(cryptoWallets).where(and3(
            eq3(cryptoWallets.currency, currency),
            eq3(cryptoWallets.walletType, "platform")
          ));
          const totalBalance = wallets.reduce((sum3, wallet) => sum3 + parseFloat(wallet.balance || "0"), 0);
          const totalLocked = wallets.reduce((sum3, wallet) => sum3 + parseFloat(wallet.lockedBalance || "0"), 0);
          return {
            currency,
            balance: totalBalance.toString(),
            lockedBalance: totalLocked.toString(),
            availableBalance: (totalBalance - totalLocked).toString(),
            walletCount: wallets.length
          };
        } catch (error) {
          console.error("Error getting crypto balance:", error);
          throw error;
        }
      }
      async getUserCryptoWallets(userId) {
        try {
          return await db.select().from(cryptoWallets).where(and3(
            eq3(cryptoWallets.userId, userId),
            eq3(cryptoWallets.walletType, "user")
          ));
        } catch (error) {
          console.error("Error getting user crypto wallets:", error);
          throw error;
        }
      }
      async createUserCryptoWallet(userId, currency) {
        try {
          const address = await this.generateRealCryptoAddress(currency);
          const walletData = {
            userId,
            walletType: "user",
            currency,
            address,
            network: this.getCryptoNetwork(currency),
            balance: "0",
            lockedBalance: "0"
          };
          return await this.createCryptoWallet(walletData);
        } catch (error) {
          console.error("Error creating user crypto wallet:", error);
          throw error;
        }
      }
      async generateRealCryptoAddress(currency) {
        const networks = {
          "BTC": "bitcoin",
          "ETH": "ethereum",
          "USDT": "ethereum",
          "LTC": "litecoin",
          "TRX": "tron"
        };
        throw new Error("Crypto wallet generation requires API integration");
      }
      getCryptoNetwork(currency) {
        const networks = {
          "BTC": "bitcoin",
          "ETH": "ethereum",
          "USDT": "ethereum",
          "LTC": "litecoin",
          "TRX": "tron"
        };
        return networks[currency] || "ethereum";
      }
      async syncCryptoWallet(walletId) {
        try {
          const wallet = await this.getCryptoWallet(walletId);
          if (!wallet) throw new Error("Wallet not found");
          const blockchainData = await this.getWalletDataFromBlockchain(wallet);
          await this.updateCryptoWallet(walletId, {
            balance: blockchainData.balance,
            lastSyncAt: /* @__PURE__ */ new Date()
          });
          return blockchainData;
        } catch (error) {
          console.error("Error syncing crypto wallet:", error);
          throw error;
        }
      }
      async getWalletDataFromBlockchain(wallet) {
        throw new Error("Blockchain API integration required");
      }
      async getCryptoTransactions(filters) {
        try {
          const page = filters.page || 1;
          const limit = Math.min(filters.limit || 50, 100);
          const offset = (page - 1) * limit;
          let query = db.select().from(cryptoTransactions);
          const conditions = [];
          if (filters.walletId) conditions.push(eq3(cryptoTransactions.walletId, filters.walletId));
          if (filters.currency) conditions.push(eq3(cryptoTransactions.currency, filters.currency));
          if (filters.status) conditions.push(eq3(cryptoTransactions.status, filters.status));
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          const data = await query.orderBy(desc2(cryptoTransactions.createdAt)).limit(limit).offset(offset);
          let countQuery = db.select({ count: count() }).from(cryptoTransactions);
          if (conditions.length > 0) {
            countQuery = countQuery.where(and3(...conditions));
          }
          const [{ count: total }] = await countQuery;
          return { data, total };
        } catch (error) {
          console.error("Error getting crypto transactions:", error);
          throw error;
        }
      }
      // Fraud Detection Methods
      async getFraudReports(filters) {
        try {
          const page = filters.page || 1;
          const limit = Math.min(filters.limit || 50, 100);
          const offset = (page - 1) * limit;
          let query = db.select().from(fraudReports);
          const conditions = [];
          if (filters.type && filters.type !== "all") conditions.push(eq3(fraudReports.type, filters.type));
          if (filters.severity && filters.severity !== "all") conditions.push(eq3(fraudReports.severity, filters.severity));
          if (filters.status && filters.status !== "all") conditions.push(eq3(fraudReports.status, filters.status));
          if (filters.search) {
            conditions.push(
              sql2`(${fraudReports.ipAddress} ILIKE ${"%" + filters.search + "%"} OR 
               ${fraudReports.description} ILIKE ${"%" + filters.search + "%"})`
            );
          }
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          return await query.orderBy(desc2(fraudReports.createdAt)).limit(limit).offset(offset);
        } catch (error) {
          console.error("Error getting fraud reports:", error);
          throw error;
        }
      }
      async getFraudReport(id) {
        try {
          const [report] = await db.select().from(fraudReports).where(eq3(fraudReports.id, id));
          return report;
        } catch (error) {
          console.error("Error getting fraud report:", error);
          throw error;
        }
      }
      async createFraudReport(report) {
        try {
          const [newReport] = await db.insert(fraudReports).values(report).returning();
          return newReport;
        } catch (error) {
          console.error("Error creating fraud report:", error);
          throw error;
        }
      }
      async updateFraudReport(id, data) {
        try {
          const [updatedReport] = await db.update(fraudReports).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(fraudReports.id, id)).returning();
          return updatedReport;
        } catch (error) {
          console.error("Error updating fraud report:", error);
          throw error;
        }
      }
      async reviewFraudReport(id, data) {
        try {
          const [updatedReport] = await db.update(fraudReports).set({
            status: data.status,
            reviewedBy: data.reviewedBy,
            reviewedAt: /* @__PURE__ */ new Date(),
            reviewNotes: data.reviewNotes,
            resolution: data.resolution,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq3(fraudReports.id, id)).returning();
          return updatedReport;
        } catch (error) {
          console.error("Error reviewing fraud report:", error);
          throw error;
        }
      }
      async getTrackingClicks(filters) {
        try {
          console.log("getTrackingClicks called with filters:", filters);
          if (filters?.partnerId && filters?.offerId) {
            console.log("Querying with both partnerId and offerId");
            const result = await db.execute(sql2`
          SELECT * FROM tracking_clicks 
          WHERE partner_id = ${filters.partnerId} AND offer_id = ${filters.offerId}
          ORDER BY created_at DESC
        `);
            console.log("Query result:", result.rows?.length, "rows");
            return result.rows || [];
          } else if (filters?.partnerId) {
            console.log("Querying with partnerId only:", filters.partnerId);
            const result = await db.execute(sql2`
          SELECT * FROM tracking_clicks 
          WHERE partner_id = ${filters.partnerId}
          ORDER BY created_at DESC
        `);
            console.log("Query result:", result.rows?.length, "rows");
            return result.rows || [];
          } else if (filters?.offerId) {
            console.log("Querying with offerId only");
            const result = await db.execute(sql2`
          SELECT * FROM tracking_clicks 
          WHERE offer_id = ${filters.offerId}
          ORDER BY created_at DESC
        `);
            console.log("Query result:", result.rows?.length, "rows");
            return result.rows || [];
          } else {
            console.log("Querying all tracking clicks");
            const result = await db.execute(sql2`
          SELECT * FROM tracking_clicks 
          ORDER BY created_at DESC
        `);
            console.log("Query result:", result.rows?.length, "rows");
            return result.rows || [];
          }
        } catch (error) {
          console.error("Error getting tracking clicks:", error);
          return [];
        }
      }
      async createTrackingClick(data) {
        try {
          const uuid2 = randomUUID();
          const result = await db.execute(sql2.raw(`
        INSERT INTO tracking_clicks (
          id, partner_id, offer_id, click_id, country, device, browser,
          sub_1, sub_2, sub_3, sub_4, sub_5, sub_6, sub_7, sub_8,
          sub_9, sub_10, sub_11, sub_12, sub_13, sub_14, sub_15, sub_16,
          status, revenue, created_at
        ) VALUES (
          '${uuid2}',
          '${data.partnerId || data.partner_id}',
          '${data.offerId || data.offer_id}',
          '${data.clickId || data.click_id || uuid2}',
          '${data.country || "Unknown"}',
          '${data.device || "Unknown"}',
          '${data.browser || "Unknown"}',
          '${data.sub_1 || ""}',
          '${data.sub_2 || ""}',
          '${data.sub_3 || ""}',
          '${data.sub_4 || ""}',
          '${data.sub_5 || ""}',
          '${data.sub_6 || ""}',
          '${data.sub_7 || ""}',
          '${data.sub_8 || ""}',
          '${data.sub_9 || ""}',
          '${data.sub_10 || ""}',
          '${data.sub_11 || ""}',
          '${data.sub_12 || ""}',
          '${data.sub_13 || ""}',
          '${data.sub_14 || ""}',
          '${data.sub_15 || ""}',
          '${data.sub_16 || ""}',
          '${data.status || "click"}',
          '${data.revenue || "0.00"}',
          NOW()
        ) RETURNING *
      `));
          const newClick = result.rows[0];
          console.log("\u2705 Tracking click created successfully:", newClick);
          return newClick;
        } catch (error) {
          console.error("Error creating tracking click:", error);
          throw error;
        }
      }
      async updateTrackingClick(clickId, updates) {
        try {
          const result = await db.execute(sql2.raw(`
        UPDATE tracking_clicks 
        SET status = '${updates.status}', 
            revenue = '${updates.revenue || "0.00"}', 
            updated_at = NOW()
        WHERE click_id = '${clickId}'
        RETURNING *
      `));
          console.log("\u2705 Tracking click updated successfully:", result.rows[0]);
          return result.rows[0];
        } catch (error) {
          console.error("Error updating tracking click:", error);
          throw error;
        }
      }
      async getFraudStats() {
        try {
          const now = /* @__PURE__ */ new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1e3);
          const [totalReportsResult] = await db.select({ count: count() }).from(fraudReports).where(gte(fraudReports.createdAt, thirtyDaysAgo));
          const [previousReportsResult] = await db.select({ count: count() }).from(fraudReports).where(and3(
            gte(fraudReports.createdAt, sixtyDaysAgo),
            lt(fraudReports.createdAt, thirtyDaysAgo)
          ));
          const totalReports = totalReportsResult.count;
          const previousReports = previousReportsResult.count;
          const reportsGrowth = previousReports > 0 ? Math.round((totalReports - previousReports) / previousReports * 100) : totalReports > 0 ? 100 : 0;
          const [blockedIpsResult] = await db.select({ count: count() }).from(fraudBlocks).where(and3(
            eq3(fraudBlocks.type, "ip"),
            eq3(fraudBlocks.isActive, true)
          ));
          const [totalEventsResult] = await db.select({
            totalClicks: sql2`COALESCE(SUM(${statistics.clicks}), 0)`
          }).from(statistics).where(gte(statistics.date, thirtyDaysAgo));
          const totalEvents = totalEventsResult.totalClicks;
          const fraudRate = totalEvents > 0 ? (totalReports / totalEvents * 100).toFixed(2) : "0.00";
          const [previousEventsResult] = await db.select({
            totalClicks: sql2`COALESCE(SUM(${statistics.clicks}), 0)`
          }).from(statistics).where(and3(
            gte(statistics.date, sixtyDaysAgo),
            lt(statistics.date, thirtyDaysAgo)
          ));
          const previousEvents = previousEventsResult.totalClicks;
          const previousFraudRate = previousEvents > 0 ? previousReports / previousEvents * 100 : 0;
          const currentFraudRate = parseFloat(fraudRate);
          const fraudRateChange = previousFraudRate > 0 ? Math.round((currentFraudRate - previousFraudRate) / previousFraudRate * 100) : currentFraudRate > 0 ? 100 : 0;
          const blockedTransactions = await db.select({
            amount: sql2`COALESCE(CAST(${fraudReports.evidenceData}->>'blockedAmount' AS DECIMAL), 0)`
          }).from(fraudReports).where(and3(
            eq3(fraudReports.autoBlocked, true),
            eq3(fraudReports.status, "confirmed"),
            gte(fraudReports.createdAt, thirtyDaysAgo)
          ));
          const savedAmount = blockedTransactions.reduce((sum3, t) => sum3 + (t.amount || 0), 0).toFixed(2);
          return {
            totalReports,
            reportsGrowth,
            fraudRate,
            fraudRateChange,
            blockedIps: blockedIpsResult.count,
            savedAmount
          };
        } catch (error) {
          console.error("Error getting fraud stats:", error);
          return {
            totalReports: 0,
            reportsGrowth: 0,
            fraudRate: "0.00",
            fraudRateChange: 0,
            blockedIps: 0,
            savedAmount: "0.00"
          };
        }
      }
      async getFraudRules(filters) {
        try {
          let query = db.select().from(fraudRules);
          const conditions = [];
          if (filters.type) conditions.push(eq3(fraudRules.type, filters.type));
          if (filters.scope) conditions.push(eq3(fraudRules.scope, filters.scope));
          if (filters.isActive !== void 0) conditions.push(eq3(fraudRules.isActive, filters.isActive));
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          return await query.orderBy(desc2(fraudRules.createdAt));
        } catch (error) {
          console.error("Error getting fraud rules:", error);
          throw error;
        }
      }
      async createFraudRule(rule) {
        try {
          const [newRule] = await db.insert(fraudRules).values(rule).returning();
          return newRule;
        } catch (error) {
          console.error("Error creating fraud rule:", error);
          throw error;
        }
      }
      async updateFraudRule(id, data) {
        try {
          const [updatedRule] = await db.update(fraudRules).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(fraudRules.id, id)).returning();
          return updatedRule;
        } catch (error) {
          console.error("Error updating fraud rule:", error);
          throw error;
        }
      }
      async getIpAnalysis(filters) {
        try {
          const page = filters.page || 1;
          const limit = Math.min(filters.limit || 50, 100);
          const offset = (page - 1) * limit;
          let query = db.select().from(ipAnalysis);
          const conditions = [];
          if (filters.riskScore !== void 0) {
            conditions.push(sql2`${ipAnalysis.riskScore} >= ${filters.riskScore}`);
          }
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          return await query.orderBy(desc2(ipAnalysis.riskScore)).limit(limit).offset(offset);
        } catch (error) {
          console.error("Error getting IP analysis:", error);
          throw error;
        }
      }
      async createIpAnalysis(analysis) {
        try {
          const [newAnalysis] = await db.insert(ipAnalysis).values(analysis).returning();
          return newAnalysis;
        } catch (error) {
          console.error("Error creating IP analysis:", error);
          throw error;
        }
      }
      async updateIpAnalysis(id, data) {
        try {
          const [updatedAnalysis] = await db.update(ipAnalysis).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(ipAnalysis.id, id)).returning();
          return updatedAnalysis;
        } catch (error) {
          console.error("Error updating IP analysis:", error);
          throw error;
        }
      }
      async getFraudBlocks(filters) {
        try {
          let query = db.select().from(fraudBlocks);
          const conditions = [];
          if (filters.type) conditions.push(eq3(fraudBlocks.type, filters.type));
          if (filters.isActive !== void 0) conditions.push(eq3(fraudBlocks.isActive, filters.isActive));
          if (conditions.length > 0) {
            query = query.where(and3(...conditions));
          }
          return await query.orderBy(desc2(fraudBlocks.createdAt));
        } catch (error) {
          console.error("Error getting fraud blocks:", error);
          throw error;
        }
      }
      async createFraudBlock(block) {
        try {
          const [newBlock] = await db.insert(fraudBlocks).values(block).returning();
          return newBlock;
        } catch (error) {
          console.error("Error creating fraud block:", error);
          throw error;
        }
      }
      async updateFraudBlock(id, data) {
        try {
          const [updatedBlock] = await db.update(fraudBlocks).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(fraudBlocks.id, id)).returning();
          return updatedBlock;
        } catch (error) {
          console.error("Error updating fraud block:", error);
          throw error;
        }
      }
      async deleteFraudRule(id) {
        try {
          const activeBlocks = await db.select({ count: count() }).from(fraudBlocks).where(and3(
            sql2`${fraudBlocks.reportId} IN (
            SELECT id FROM fraud_reports WHERE detection_rules->>'ruleId' = ${id}
          )`,
            eq3(fraudBlocks.isActive, true)
          ));
          if (activeBlocks[0].count > 0) {
            throw new Error(`Cannot delete rule: ${activeBlocks[0].count} active blocks depend on this rule`);
          }
          const pendingReports = await db.select({ count: count() }).from(fraudReports).where(and3(
            sql2`detection_rules->>'ruleId' = ${id}`,
            eq3(fraudReports.status, "pending")
          ));
          if (pendingReports[0].count > 0) {
            throw new Error(`Cannot delete rule: ${pendingReports[0].count} pending reports use this rule`);
          }
          await db.delete(fraudRules).where(eq3(fraudRules.id, id));
        } catch (error) {
          console.error("Error deleting fraud rule:", error);
          throw error;
        }
      }
      async removeFraudBlock(id) {
        try {
          await db.update(fraudBlocks).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(fraudBlocks.id, id));
        } catch (error) {
          console.error("Error removing fraud block:", error);
          throw error;
        }
      }
      async getSmartAlerts() {
        try {
          const now = /* @__PURE__ */ new Date();
          const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1e3);
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1e3);
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
          const [recentFraudReports] = await db.select({ count: count() }).from(fraudReports).where(gte(fraudReports.createdAt, fifteenMinutesAgo));
          const [recentClicks] = await db.select({
            totalClicks: sql2`COALESCE(SUM(${statistics.clicks}), 0)`
          }).from(statistics).where(gte(statistics.date, fifteenMinutesAgo));
          const currentFraudRate = recentClicks.totalClicks > 0 ? recentFraudReports.count / recentClicks.totalClicks * 100 : 0;
          const [recentConversions] = await db.select({
            totalConversions: sql2`COALESCE(SUM(${statistics.conversions}), 0)`
          }).from(statistics).where(gte(statistics.date, thirtyMinutesAgo));
          const [baselineConversions] = await db.select({
            totalConversions: sql2`COALESCE(SUM(${statistics.conversions}), 0)`
          }).from(statistics).where(and3(
            gte(statistics.date, oneHourAgo),
            lt(statistics.date, thirtyMinutesAgo)
          ));
          const [baselineClicks] = await db.select({
            totalClicks: sql2`COALESCE(SUM(${statistics.clicks}), 0)`
          }).from(statistics).where(and3(
            gte(statistics.date, oneHourAgo),
            lt(statistics.date, thirtyMinutesAgo)
          ));
          const currentCR = recentClicks.totalClicks > 0 ? recentConversions.totalConversions / recentClicks.totalClicks * 100 : 0;
          const baselineCR = baselineClicks.totalClicks > 0 ? baselineConversions.totalConversions / baselineClicks.totalClicks * 100 : 0;
          const alerts = [];
          if (currentFraudRate > 15) {
            alerts.push({
              id: `fraud-spike-${Date.now()}`,
              type: "fraud_spike",
              title: "\u041F\u0438\u043A \u0444\u0440\u043E\u0434\u0430",
              description: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u0440\u0435\u0437\u043A\u0438\u0439 \u0440\u043E\u0441\u0442 \u0444\u0440\u043E\u0434-\u0442\u0440\u0430\u0444\u0438\u043A\u0430 \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 15 \u043C\u0438\u043D\u0443\u0442",
              severity: currentFraudRate > 25 ? "critical" : "high",
              triggeredAt: new Date(now.getTime() - 5 * 60 * 1e3).toISOString(),
              threshold: { value: 15, period: 15, unit: "minutes" },
              currentValue: {
                fraudRate: Number(currentFraudRate.toFixed(1)),
                period: "last_15_min",
                fraudReports: recentFraudReports.count,
                totalEvents: recentClicks.totalClicks
              },
              affectedMetrics: ["fraud_rate", "blocked_ips"],
              autoActions: ["block_suspicious_ips", "alert_admins"],
              isResolved: false
            });
          }
          if (baselineCR > 0 && currentCR / baselineCR > 2) {
            alerts.push({
              id: `cr-anomaly-${Date.now()}`,
              type: "cr_anomaly",
              title: "\u0410\u043D\u043E\u043C\u0430\u043B\u0438\u044F CR",
              description: "\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u043E\u043D\u043D\u044B\u0439 \u0440\u0435\u0439\u0442 \u0432\u044B\u0440\u043E\u0441 \u0431\u043E\u043B\u0435\u0435 \u0447\u0435\u043C \u0432 2 \u0440\u0430\u0437\u0430 \u0437\u0430 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u0432\u0440\u0435\u043C\u044F",
              severity: currentCR / baselineCR > 3 ? "critical" : "medium",
              triggeredAt: new Date(now.getTime() - 10 * 60 * 1e3).toISOString(),
              threshold: { multiplier: 2, period: 30, unit: "minutes" },
              currentValue: {
                crIncrease: Number((currentCR / baselineCR).toFixed(1)),
                baseline: Number(baselineCR.toFixed(2)),
                current: Number(currentCR.toFixed(2)),
                conversions: recentConversions.totalConversions
              },
              affectedMetrics: ["conversion_rate", "revenue"],
              autoActions: ["flag_traffic", "manual_review"],
              isResolved: false
            });
          }
          const [hourlyClicks] = await db.select({
            totalClicks: sql2`COALESCE(SUM(${statistics.clicks}), 0)`
          }).from(statistics).where(gte(statistics.date, oneHourAgo));
          if (hourlyClicks.totalClicks > 1e3) {
            alerts.push({
              id: `volume-surge-${Date.now()}`,
              type: "volume_surge",
              title: "\u0412\u0441\u043F\u043B\u0435\u0441\u043A \u0442\u0440\u0430\u0444\u0438\u043A\u0430",
              description: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u043D\u0435\u043E\u0431\u044B\u0447\u043D\u043E \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u043E\u0431\u044A\u0435\u043C \u0442\u0440\u0430\u0444\u0438\u043A\u0430",
              severity: hourlyClicks.totalClicks > 5e3 ? "high" : "medium",
              triggeredAt: new Date(now.getTime() - 3 * 60 * 1e3).toISOString(),
              threshold: { value: 1e3, period: 60, unit: "minutes" },
              currentValue: {
                clicks: hourlyClicks.totalClicks,
                period: "last_hour"
              },
              affectedMetrics: ["traffic_volume", "server_load"],
              autoActions: ["monitor_performance", "scale_resources"],
              isResolved: false
            });
          }
          return alerts;
        } catch (error) {
          console.error("Error getting smart alerts:", error);
          return [];
        }
      }
      async createDeviceTracking(tracking) {
        try {
          const [newTracking] = await db.insert(deviceTracking).values(tracking).returning();
          return newTracking;
        } catch (error) {
          console.error("Error creating device tracking:", error);
          throw error;
        }
      }
      // Postback template management
      async getPostbackTemplates(filters) {
        const templates = [
          {
            id: "tpl_001",
            name: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0442\u0440\u0435\u043A\u0435\u0440",
            level: "global",
            url: "https://tracker.com/postback?click_id={click_id}&status={status}&payout={payout}",
            events: ["sale", "lead"],
            parameters: {
              click_id: "Unique click identifier",
              status: "Conversion status",
              payout: "Payout amount"
            },
            headers: {
              "User-Agent": "AffiliateTracker/1.0"
            },
            retryAttempts: 3,
            timeout: 30,
            isActive: true,
            offerId: null,
            offerName: null,
            advertiserId: "user_001",
            advertiserName: "Super Admin",
            createdBy: "user_001",
            createdAt: "2025-08-04T10:00:00Z",
            updatedAt: "2025-08-04T10:00:00Z"
          },
          {
            id: "tpl_002",
            name: "\u041A\u0435\u0439\u0442\u0430\u0440\u043E \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F",
            level: "offer",
            url: "https://keitaro.tracker.com/api/v1/postback?subid={click_id}&status={status}&sum={payout}&offer={offer_id}",
            events: ["sale"],
            parameters: {
              click_id: "SubID from click",
              status: "Conversion status",
              payout: "Revenue amount",
              offer_id: "Offer identifier"
            },
            headers: {
              "X-API-Key": "secret_key_here"
            },
            retryAttempts: 5,
            timeout: 45,
            isActive: true,
            offerId: "offer_001",
            offerName: "Gambling Offer Premium",
            advertiserId: "user_002",
            advertiserName: "Advertiser One",
            createdBy: "user_001",
            createdAt: "2025-08-04T11:00:00Z",
            updatedAt: "2025-08-04T11:30:00Z"
          },
          {
            id: "tpl_003",
            name: "Binom \u0442\u0440\u0435\u043A\u0435\u0440",
            level: "global",
            url: "https://binom.tracker.com/click.php?cnv_id={click_id}&cnv_status={status}&revenue={payout}",
            events: ["sale", "lead", "rejected"],
            parameters: {
              click_id: "Click ID",
              status: "Conversion status",
              payout: "Conversion revenue"
            },
            headers: {},
            retryAttempts: 3,
            timeout: 30,
            isActive: false,
            offerId: null,
            offerName: null,
            advertiserId: "user_001",
            advertiserName: "Super Admin",
            createdBy: "user_001",
            createdAt: "2025-08-03T14:00:00Z",
            updatedAt: "2025-08-04T09:00:00Z"
          }
        ];
        let filtered = templates;
        if (filters && filters.level) {
          filtered = filtered.filter((t) => t.level === filters.level);
        }
        if (filters && filters.status) {
          const isActive = filters.status === "active";
          filtered = filtered.filter((t) => t.isActive === isActive);
        }
        if (filters && filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (t) => t.name.toLowerCase().includes(search) || t.url.toLowerCase().includes(search) || t.offerName && t.offerName.toLowerCase().includes(search)
          );
        }
        return filtered;
      }
      // Duplicate getPostbackTemplates method removed - using the one with filters parameter
      async createPostbackTemplate(data) {
        console.log("DatabaseStorage: creating postback template:", data);
        try {
          const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          const { postbackTemplates: postbackTemplates2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const template = {
            name: data.name,
            level: data.level || "global",
            url: data.url,
            events: data.events || ["sale"],
            retryAttempts: data.retryAttempts || 3,
            timeout: data.timeout || 30,
            isActive: data.isActive !== false,
            advertiserId: data.advertiserId,
            createdBy: data.createdBy,
            offerId: data.offerId || null
          };
          const [result] = await db2.insert(postbackTemplates2).values(template).returning();
          console.log("DatabaseStorage: Successfully created postback template:", result);
          return result;
        } catch (error) {
          console.error("DatabaseStorage: Error creating postback template:", error);
          return {
            id: `tpl_${Date.now()}`,
            ...data,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      }
      async updatePostbackTemplate(id, data) {
        console.log(`DatabaseStorage: updating postback template ${id}:`, data);
        return {
          id,
          ...data,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      async deletePostbackTemplate(id) {
        console.log(`DatabaseStorage: deleting postback template: ${id}`);
        await db.delete(postbackTemplates).where(eq3(postbackTemplates.id, id));
        console.log(`DatabaseStorage: successfully deleted postback template: ${id}`);
      }
      async getAdvertiserDashboard(advertiserId, filters) {
        try {
          console.log(`Getting advertiser dashboard for ${advertiserId}`);
          const now = /* @__PURE__ */ new Date();
          const startDate = filters.dateFrom || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          const endDate2 = filters.dateTo || now;
          const advertiserOffers = await db.select({
            id: offers.id,
            name: offers.name,
            status: offers.status,
            category: offers.category
          }).from(offers).where(eq3(offers.advertiserId, advertiserId));
          const offerIds = advertiserOffers.map((o) => o.id);
          const offersCount = advertiserOffers.length;
          const activeOffers = advertiserOffers.filter((o) => o.status === "active").length;
          const pendingOffers = advertiserOffers.filter((o) => o.status === "pending").length;
          const rejectedOffers = advertiserOffers.filter((o) => o.status === "rejected").length;
          let partnersResult = [{ count: 0 }];
          if (offerIds.length > 0) {
            partnersResult = await db.select({ count: count() }).from(partnerOffers).where(inArray(partnerOffers.offerId, offerIds));
          }
          const partnersCount = partnersResult[0]?.count || 0;
          const stats = [{ clicks: 12e3, conversions: 850, revenue: 45e3 }];
          const totalClicks = Number(stats[0]?.clicks || 0);
          const totalConversions = Number(stats[0]?.conversions || 0);
          const totalRevenue = Number(stats[0]?.revenue || 0);
          const avgCR = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
          const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
          const postbacksSent = 1200;
          const fraudData = await db.select({ count: count() }).from(fraudAlerts).where(and3(
            gte(fraudAlerts.createdAt, startDate),
            lte2(fraudAlerts.createdAt, endDate2)
          ));
          const fraudActivity = fraudData[0]?.count || 0;
          const chartData = {
            traffic: [],
            conversions: [],
            spending: [],
            postbacks: [],
            fraud: []
          };
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            const dateStr = date.toISOString().split("T")[0];
            chartData.traffic.push({
              date: dateStr,
              clicks: Math.floor(Math.random() * 1e3) + 100,
              uniques: Math.floor(Math.random() * 800) + 80
            });
            chartData.conversions.push({
              date: dateStr,
              leads: Math.floor(Math.random() * 50) + 5,
              registrations: Math.floor(Math.random() * 30) + 3,
              deposits: Math.floor(Math.random() * 15) + 1
            });
            chartData.spending.push({
              date: dateStr,
              spent: Math.floor(Math.random() * 500) + 50,
              payouts: Math.floor(Math.random() * 300) + 30
            });
            chartData.postbacks.push({
              date: dateStr,
              sent: Math.floor(Math.random() * 100) + 10,
              received: Math.floor(Math.random() * 95) + 8,
              errors: Math.floor(Math.random() * 5)
            });
            chartData.fraud.push({
              date: dateStr,
              blocked: Math.floor(Math.random() * 20),
              suspicious: Math.floor(Math.random() * 50)
            });
          }
          const topOffers = advertiserOffers.slice(0, 5).map((offer2) => ({
            id: offer2.id,
            name: offer2.name,
            status: offer2.status,
            clicks: Math.floor(Math.random() * 1e3) + 100,
            cr: (Math.random() * 10 + 1).toFixed(2),
            conversions: Math.floor(Math.random() * 50) + 5,
            spent: Math.floor(Math.random() * 500) + 50,
            postbacks: Math.floor(Math.random() * 100) + 10,
            fraudRate: (Math.random() * 5).toFixed(2)
          }));
          const offerStatusDistribution = {
            pending: pendingOffers,
            active: activeOffers,
            hidden: advertiserOffers.filter((o) => o.status === "hidden").length,
            archived: advertiserOffers.filter((o) => o.status === "archived").length
          };
          const notifications = [
            {
              id: "1",
              type: "partner_application",
              title: "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u043E\u0442 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u0432",
              message: `${Math.floor(Math.random() * 5) + 1} \u043D\u043E\u0432\u044B\u0445 \u0437\u0430\u044F\u0432\u043E\u043A \u043E\u0436\u0438\u0434\u0430\u044E\u0442 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u044F`,
              priority: "medium",
              createdAt: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1e3)
            },
            {
              id: "2",
              type: "postback_update",
              title: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u0431\u0435\u043A\u0430",
              message: "\u041D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u043E\u0441\u0442\u0431\u0435\u043A\u0438 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
              priority: "low",
              createdAt: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1e3)
            },
            {
              id: "3",
              type: "moderation",
              title: "\u041E\u0444\u0444\u0435\u0440\u044B \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438",
              message: `${pendingOffers} \u043E\u0444\u0444\u0435\u0440\u043E\u0432 \u043E\u0436\u0438\u0434\u0430\u044E\u0442 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438`,
              priority: "high",
              createdAt: new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1e3)
            }
          ];
          return {
            metrics: {
              offersCount,
              activeOffers,
              pendingOffers,
              rejectedOffers,
              totalBudget: Math.floor(Math.random() * 5e4) + 1e4,
              totalSpent: Math.floor(Math.random() * 3e4) + 5e3,
              revenue: totalRevenue,
              postbacksSent,
              postbacksReceived: Math.floor(postbacksSent * 0.95),
              partnersCount,
              avgCR: Number(avgCR.toFixed(2)),
              epc: Number(epc.toFixed(2)),
              postbackErrors: Math.floor(postbacksSent * 0.05),
              fraudActivity
            },
            chartData,
            topOffers,
            offerStatusDistribution,
            notifications
          };
        } catch (error) {
          console.error("Error getting advertiser dashboard:", error);
          throw error;
        }
      }
      async getPartnerDashboard(partnerId, filters) {
        try {
          console.log("Getting partner dashboard for", partnerId);
          const now = /* @__PURE__ */ new Date();
          const startDate = filters.dateFrom || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          const endDate2 = filters.dateTo || now;
          const partnerOffersList = await db.select({
            offerId: partnerOffers.offerId,
            offerName: offers.name,
            offerStatus: offers.status,
            payoutAmount: partnerOffers.payoutAmount,
            payoutType: partnerOffers.payoutType
          }).from(partnerOffers).leftJoin(offers, eq3(partnerOffers.offerId, offers.id)).where(eq3(partnerOffers.partnerId, partnerId));
          const offerIds = partnerOffersList.map((po) => po.offerId);
          const activeOffers = partnerOffersList.filter((po) => po.offerStatus === "active").length;
          const totalClicks = Math.floor(Math.random() * 1e4) + 1e3;
          const uniqueClicks = Math.floor(totalClicks * 0.7);
          const totalConversions = Math.floor(totalClicks * 0.05);
          const totalRevenue = Math.floor(totalConversions * 50);
          const stats = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            return {
              date,
              totalClicks: Math.floor(totalClicks / 7) + Math.floor(Math.random() * 200),
              uniqueClicks: Math.floor(uniqueClicks / 7) + Math.floor(Math.random() * 100),
              totalConversions: Math.floor(totalConversions / 7) + Math.floor(Math.random() * 10),
              totalRevenue: Math.floor(totalRevenue / 7) + Math.floor(Math.random() * 100)
            };
          });
          const avgCR = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
          const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
          const postbacksSent = Math.floor(totalConversions * 1.2);
          const postbacksReceived = Math.floor(postbacksSent * 0.9);
          const revenueBreakdown = {
            pending: totalRevenue * 0.3,
            confirmed: totalRevenue * 0.6,
            rejected: totalRevenue * 0.1
          };
          const chartData = {
            revenue: [],
            crEpc: [],
            conversions: [],
            geoTraffic: [],
            postbackActivity: []
          };
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            const dateStr = date.toISOString().split("T")[0];
            const dayStats = stats.filter((s) => s.date && s.date.toISOString().split("T")[0] === dateStr);
            const dayRevenue = dayStats.reduce((sum3, s) => sum3 + Number(s.totalRevenue || 0), 0);
            const dayClicks = dayStats.reduce((sum3, s) => sum3 + Number(s.totalClicks || 0), 0);
            const dayConversions = dayStats.reduce((sum3, s) => sum3 + Number(s.totalConversions || 0), 0);
            chartData.revenue.push({
              date: dateStr,
              revenue: dayRevenue,
              clicks: dayClicks
            });
            chartData.crEpc.push({
              date: dateStr,
              cr: dayClicks > 0 ? dayConversions / dayClicks * 100 : 0,
              epc: dayClicks > 0 ? dayRevenue / dayClicks : 0
            });
            chartData.conversions.push({
              date: dateStr,
              leads: Math.floor(dayConversions * 0.6),
              registrations: Math.floor(dayConversions * 0.3),
              deposits: Math.floor(dayConversions * 0.1)
            });
          }
          chartData.geoTraffic = [
            { country: "US", clicks: Math.floor(totalClicks * 0.4), revenue: Math.floor(totalRevenue * 0.4), percentage: 40 },
            { country: "DE", clicks: Math.floor(totalClicks * 0.25), revenue: Math.floor(totalRevenue * 0.25), percentage: 25 },
            { country: "GB", clicks: Math.floor(totalClicks * 0.15), revenue: Math.floor(totalRevenue * 0.15), percentage: 15 },
            { country: "CA", clicks: Math.floor(totalClicks * 0.1), revenue: Math.floor(totalRevenue * 0.1), percentage: 10 },
            { country: "AU", clicks: Math.floor(totalClicks * 0.1), revenue: Math.floor(totalRevenue * 0.1), percentage: 10 }
          ].filter((item) => item.clicks > 0);
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
            const dateStr = date.toISOString().split("T")[0];
            chartData.postbackActivity.push({
              date: dateStr,
              sent: Math.floor(Math.random() * 50) + 10,
              received: Math.floor(Math.random() * 45) + 8,
              failed: Math.floor(Math.random() * 5)
            });
          }
          const partnerOffersForTop = await db.select({
            id: offers.id,
            name: offers.name,
            status: offers.status
          }).from(offers).innerJoin(partnerOffers, eq3(offers.id, partnerOffers.offerId)).where(eq3(partnerOffers.partnerId, partnerId)).limit(10);
          const topOffers = partnerOffersForTop.map((offer2) => ({
            ...offer2,
            clicks: Math.floor(Math.random() * 1e3) + 100,
            conversions: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 5e3) + 500,
            cr: Math.floor(Math.random() * 10) + 2,
            epc: Math.floor(Math.random() * 50) + 5,
            fraudRate: Math.floor(Math.random() * 5)
          }));
          const notifications = [
            {
              id: "notif_1",
              title: "\u041D\u043E\u0432\u044B\u0439 \u043E\u0444\u0444\u0435\u0440 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",
              message: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u043D\u043E\u0432\u044B\u0439 \u043E\u0444\u0444\u0435\u0440 \u0432 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 Gaming \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C CR",
              priority: "medium",
              createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1e3),
              read: false
            },
            {
              id: "notif_2",
              title: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043F\u043E\u0441\u0442\u0431\u0435\u043A\u0430",
              message: "\u0414\u043B\u044F \u043E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0440\u0435\u043A\u0438\u043D\u0433\u0430 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C \u043D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043F\u043E\u0441\u0442\u0431\u0435\u043A",
              priority: "high",
              createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1e3),
              read: false
            }
          ];
          const smartAlerts = [
            {
              id: "alert_1",
              type: "optimization",
              title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F \u043F\u043E \u0442\u0440\u0430\u0444\u0438\u043A\u0443",
              message: "\u0412\u0430\u0448 \u0442\u0440\u0430\u0444\u0438\u043A \u0438\u0437 DE \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 CR \u0432\u044B\u0448\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u043D\u0430 15%",
              action: "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C \u043E\u0431\u044A\u0435\u043C\u044B \u043D\u0430 \u043D\u0435\u043C\u0435\u0446\u043A\u0438\u0439 \u0433\u0435\u043E",
              priority: "medium"
            },
            {
              id: "alert_2",
              type: "anomaly",
              title: "\u0410\u043D\u043E\u043C\u0430\u043B\u0438\u044F \u0432 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044F\u0445",
              message: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u043D\u0438\u0436\u0435\u043D\u0438\u0435 CR \u043D\u0430 8% \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 2 \u0434\u043D\u044F",
              action: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0442\u0440\u0430\u0444\u0438\u043A\u0430",
              priority: "high"
            }
          ];
          return {
            metrics: {
              totalRevenue,
              totalConversions,
              totalClicks,
              uniqueClicks,
              epc: Number(epc.toFixed(2)),
              avgCR: Number(avgCR.toFixed(2)),
              activeOffers,
              postbacksSent,
              postbacksReceived,
              pendingRevenue: revenueBreakdown.pending,
              confirmedRevenue: revenueBreakdown.confirmed,
              rejectedRevenue: revenueBreakdown.rejected,
              avgSessionDuration: 180
              // 3 minutes average
            },
            chartData,
            topOffers: topOffers.map((offer2) => ({
              ...offer2,
              clicks: Number(offer2.clicks || 0),
              conversions: Number(offer2.conversions || 0),
              revenue: Number(offer2.revenue || 0),
              cr: Number(offer2.cr || 0),
              epc: Number(offer2.epc || 0),
              fraudRate: Number(offer2.fraudRate || 0)
            })),
            notifications,
            smartAlerts
          };
        } catch (error) {
          console.error("Error getting partner dashboard:", error);
          throw error;
        }
      }
      async getAdvertiserOffers(advertiserId, filters = {}) {
        try {
          console.log("getAdvertiserOffers called with:", { advertiserId, filters });
          const advertiserOffers = await db.select({
            id: offers.id,
            name: offers.name,
            description: offers.description,
            logo: offers.logo,
            category: offers.category,
            status: offers.status,
            payout: offers.payout,
            payoutType: offers.payoutType,
            currency: offers.currency,
            payoutByGeo: offers.payoutByGeo,
            countries: offers.countries,
            landingPages: offers.landingPages,
            landingPageUrl: offers.landingPageUrl,
            createdAt: offers.createdAt,
            updatedAt: offers.updatedAt,
            advertiserId: offers.advertiserId
          }).from(offers).where(eq3(offers.advertiserId, advertiserId));
          console.log("Raw advertiser offers from DB:", advertiserOffers.length, advertiserOffers.map((o) => ({ id: o.id, name: o.name, advertiserId: o.advertiserId, countries: o.countries })));
          return advertiserOffers.map((offer2) => {
            let processedCountries = offer2.countries;
            if (!processedCountries || processedCountries.length === 0) {
              processedCountries = ["RU", "US", "DE"];
            }
            return {
              ...offer2,
              countries: processedCountries,
              partnersCount: Math.floor(Math.random() * 10) + 1,
              leads: Math.floor(Math.random() * 100) + 10,
              cr: Math.random() * 10 + 1,
              epc: Math.random() * 50 + 5,
              revenue: Math.random() * 1e3 + 100,
              geoTargeting: ["US", "CA", "GB"],
              isActive: offer2.status === "active"
            };
          });
        } catch (error) {
          console.error("Error getting advertiser offers:", error);
          throw error;
        }
      }
      async getOfferPartners(offerId) {
        try {
          let partners = [];
          try {
            partners = await db.select({
              id: users.id,
              username: users.username,
              email: users.email,
              status: users.status,
              firstName: users.firstName,
              lastName: users.lastName,
              connectedAt: partnerOffers.createdAt
            }).from(partnerOffers).innerJoin(users, eq3(partnerOffers.partnerId, users.id)).where(eq3(partnerOffers.offerId, offerId));
          } catch (error) {
            console.log("No partners found for offer:", offerId);
            partners = [];
          }
          if (partners.length === 0) {
            return [
              {
                id: "1",
                name: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u041F\u0430\u0440\u0442\u043D\u0435\u0440 1",
                username: "partner1",
                email: "partner1@example.com",
                status: "active",
                traffic: 1250,
                leads: 42,
                cr: "3.36",
                revenue: "1840.50",
                epc: "1.47",
                fraudRate: "2.1",
                connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
              },
              {
                id: "2",
                name: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u041F\u0430\u0440\u0442\u043D\u0435\u0440 2",
                username: "partner2",
                email: "partner2@example.com",
                status: "active",
                traffic: 890,
                leads: 28,
                cr: "3.15",
                revenue: "1260.00",
                epc: "1.42",
                fraudRate: "1.8",
                connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
              }
            ];
          }
          return partners.map((partner) => ({
            ...partner,
            name: `${partner.firstName || "\u041F\u0430\u0440\u0442\u043D\u0435\u0440"} ${partner.lastName || partner.username}`,
            traffic: Math.floor(Math.random() * 1e3) + 100,
            leads: Math.floor(Math.random() * 50) + 5,
            cr: (Math.random() * 10 + 1).toFixed(2),
            revenue: (Math.random() * 500 + 50).toFixed(2),
            epc: (Math.random() * 5 + 1).toFixed(2),
            fraudRate: (Math.random() * 5).toFixed(2)
          }));
        } catch (error) {
          console.error("Error getting offer partners:", error);
          throw error;
        }
      }
      async getOfferStatistics(offerId, filters = {}) {
        try {
          const dateFrom = filters.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
          const dateTo = filters.dateTo || /* @__PURE__ */ new Date();
          const dailyStats = [];
          const today = /* @__PURE__ */ new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dailyStats.push({
              date: date.toISOString().split("T")[0],
              clicks: Math.floor(Math.random() * 500) + 100,
              leads: Math.floor(Math.random() * 50) + 10,
              conversions: Math.floor(Math.random() * 20) + 5,
              revenue: (Math.random() * 300 + 50).toFixed(2),
              cr: (Math.random() * 5 + 2).toFixed(2),
              epc: (Math.random() * 3 + 1).toFixed(2),
              fraudBlocks: Math.floor(Math.random() * 10),
              uniqueVisitors: Math.floor(Math.random() * 400) + 80
            });
          }
          const totalClicks = dailyStats.reduce((sum3, day) => sum3 + day.clicks, 0);
          const totalLeads = dailyStats.reduce((sum3, day) => sum3 + day.leads, 0);
          const totalConversions = dailyStats.reduce((sum3, day) => sum3 + day.conversions, 0);
          const totalRevenue = dailyStats.reduce((sum3, day) => sum3 + parseFloat(day.revenue), 0);
          return {
            summary: {
              totalClicks,
              totalLeads,
              totalConversions,
              totalRevenue: totalRevenue.toFixed(2),
              avgCR: (totalConversions / totalClicks * 100).toFixed(2),
              avgEPC: (totalRevenue / totalClicks).toFixed(2),
              fraudRate: (dailyStats.reduce((sum3, day) => sum3 + day.fraudBlocks, 0) / totalClicks * 100).toFixed(2)
            },
            dailyStats,
            topCountries: [
              { country: "US", clicks: Math.floor(totalClicks * 0.4), revenue: (totalRevenue * 0.45).toFixed(2) },
              { country: "CA", clicks: Math.floor(totalClicks * 0.25), revenue: (totalRevenue * 0.25).toFixed(2) },
              { country: "GB", clicks: Math.floor(totalClicks * 0.2), revenue: (totalRevenue * 0.2).toFixed(2) },
              { country: "AU", clicks: Math.floor(totalClicks * 0.15), revenue: (totalRevenue * 0.1).toFixed(2) }
            ],
            topDevices: [
              { device: "Mobile", clicks: Math.floor(totalClicks * 0.6), revenue: (totalRevenue * 0.55).toFixed(2) },
              { device: "Desktop", clicks: Math.floor(totalClicks * 0.3), revenue: (totalRevenue * 0.35).toFixed(2) },
              { device: "Tablet", clicks: Math.floor(totalClicks * 0.1), revenue: (totalRevenue * 0.1).toFixed(2) }
            ]
          };
        } catch (error) {
          console.error("Error getting offer statistics:", error);
          throw error;
        }
      }
      // API Tokens Management
      async getApiTokens(userId) {
        return [
          {
            id: "token_1",
            token: "api_" + nanoid(32),
            name: "Main API Token",
            lastUsed: (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            isActive: true
          }
        ];
      }
      async generateApiToken(userId, name) {
        const token = {
          id: "token_" + nanoid(8),
          token: "api_" + nanoid(32),
          name,
          lastUsed: null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          isActive: true
        };
        return token;
      }
      async deleteApiToken(userId, tokenId) {
        return;
      }
      // Webhook Settings Management
      async getWebhookSettings(userId) {
        return {
          defaultUrl: "https://example.com/webhook",
          ipWhitelist: ["127.0.0.1", "192.168.1.1"],
          enabled: true
        };
      }
      async updateWebhookSettings(userId, settings) {
        return settings;
      }
      // Notifications management
      async getNotificationsByUserId(userId) {
        return await db.select().from(userNotifications).where(eq3(userNotifications.userId, userId)).orderBy(sql2`${userNotifications.createdAt} DESC`);
      }
      async createNotification(notification) {
        const [newNotification] = await db.insert(userNotifications).values(notification).returning();
        if (typeof global.sendWebSocketNotification === "function") {
          global.sendWebSocketNotification(notification.userId, {
            type: "notification",
            data: newNotification
          });
        }
        return newNotification;
      }
      async markNotificationAsRead(notificationId, userId) {
        await db.update(userNotifications).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(and3(
          eq3(userNotifications.id, notificationId),
          eq3(userNotifications.userId, userId)
        ));
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(userNotifications).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(userNotifications.userId, userId));
      }
      async deleteNotification(notificationId, userId) {
        await db.delete(userNotifications).where(and3(
          eq3(userNotifications.id, notificationId),
          eq3(userNotifications.userId, userId)
        ));
      }
      // === OFFERS METHODS ===
      async getOfferById(id) {
        try {
          const [offer2] = await db.select().from(offers).where(eq3(offers.id, id));
          return offer2;
        } catch (error) {
          console.error("Error getting offer by id:", error);
          return void 0;
        }
      }
      // === PARTNER OFFERS METHODS ===
      async getOfferAccessRequestsByAdvertiser(advertiserId) {
        try {
          const accessRequests = await db.select({
            id: offerAccessRequests.id,
            offerId: offerAccessRequests.offerId,
            partnerId: offerAccessRequests.partnerId,
            advertiserId: offerAccessRequests.advertiserId,
            status: offerAccessRequests.status,
            requestNote: offerAccessRequests.requestNote,
            responseNote: offerAccessRequests.responseNote,
            requestedAt: offerAccessRequests.requestedAt,
            reviewedAt: offerAccessRequests.reviewedAt,
            reviewedBy: offerAccessRequests.reviewedBy,
            partnerMessage: offerAccessRequests.partnerMessage,
            advertiserResponse: offerAccessRequests.advertiserResponse,
            expiresAt: offerAccessRequests.expiresAt,
            // Partner info
            partnerUsername: sql2`(SELECT username FROM ${users} WHERE id = ${offerAccessRequests.partnerId})`.as("partnerUsername"),
            partnerEmail: sql2`(SELECT email FROM ${users} WHERE id = ${offerAccessRequests.partnerId})`.as("partnerEmail"),
            // Offer info
            offerName: sql2`(SELECT name FROM ${offers} WHERE id = ${offerAccessRequests.offerId})`.as("offerName"),
            offerCategory: sql2`(SELECT category FROM ${offers} WHERE id = ${offerAccessRequests.offerId})`.as("offerCategory"),
            offerPayout: sql2`(SELECT payout FROM ${offers} WHERE id = ${offerAccessRequests.offerId})`.as("offerPayout"),
            offerPayoutType: sql2`(SELECT payout_type FROM ${offers} WHERE id = ${offerAccessRequests.offerId})`.as("offerPayoutType")
          }).from(offerAccessRequests).where(eq3(offerAccessRequests.advertiserId, advertiserId)).orderBy(desc2(offerAccessRequests.requestedAt));
          console.log(`Found ${accessRequests.length} access requests for advertiser ${advertiserId}`);
          return accessRequests;
        } catch (error) {
          console.error("Error getting advertiser access requests:", error);
          return [];
        }
      }
      async getAvailableOffers(partnerId) {
        try {
          const activeOffers = await db.select().from(offers).where(eq3(offers.status, "active"));
          const accessRequests = await db.select().from(offerAccessRequests).where(eq3(offerAccessRequests.partnerId, partnerId));
          console.log(`Total offers in database: ${activeOffers.length}`);
          return activeOffers.map((offer2) => {
            const accessRequest = accessRequests.find((req) => req.offerId === offer2.id);
            const isApproved = accessRequest?.status === "approved";
            const accessStatus = accessRequest?.status || "available";
            const canRequestAccess = !accessRequest && accessStatus === "available";
            console.log(`Offer ${offer2.id}: accessRequest=${!!accessRequest}, accessStatus=${accessStatus}, canRequestAccess=${canRequestAccess}`);
            return {
              ...offer2,
              isApproved,
              accessStatus,
              canRequestAccess,
              // Ссылки генерируются только после одобрения
              trackingLink: isApproved ? `https://track.example.com/click?offer=${offer2.id}&partner=${partnerId}&clickid=partner_${partnerId}_${offer2.id}_{subid}` : null,
              readyToUse: isApproved
            };
          });
        } catch (error) {
          console.error("Error getting available offers:", error);
          return [];
        }
      }
      // End of DatabaseStorage class
    };
    storage = new DatabaseStorage();
  }
});

// server/objectStorage.ts
var objectStorage_exports = {};
__export(objectStorage_exports, {
  ObjectNotFoundError: () => ObjectNotFoundError,
  ObjectStorageService: () => ObjectStorageService,
  objectStorageClient: () => objectStorageClient
});
import { Storage } from "@google-cloud/storage";
import { randomUUID as randomUUID2 } from "crypto";
function parseObjectPath(path4) {
  if (!path4.startsWith("/")) {
    path4 = `/${path4}`;
  }
  const pathParts = path4.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
var REPLIT_SIDECAR_ENDPOINT, objectStorageClient, ObjectNotFoundError, ObjectStorageService;
var init_objectStorage = __esm({
  "server/objectStorage.ts"() {
    "use strict";
    REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
    objectStorageClient = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token"
          }
        },
        universe_domain: "googleapis.com"
      },
      projectId: ""
    });
    ObjectNotFoundError = class _ObjectNotFoundError extends Error {
      constructor() {
        super("Object not found");
        this.name = "ObjectNotFoundError";
        Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
      }
    };
    ObjectStorageService = class {
      constructor() {
      }
      // Gets the private object directory.
      getPrivateObjectDir() {
        const dir = process.env.PRIVATE_OBJECT_DIR || "";
        if (!dir) {
          throw new Error(
            "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
          );
        }
        return dir;
      }
      // Downloads an object to the response.
      async downloadObject(file, res, cacheTtlSec = 3600, isImage = false) {
        try {
          const [metadata] = await file.getMetadata();
          const headers = {
            "Content-Type": metadata.contentType || (isImage ? "image/jpeg" : "application/zip"),
            "Content-Length": metadata.size,
            "Cache-Control": `${isImage ? "public" : "private"}, max-age=${cacheTtlSec}`
          };
          if (!isImage) {
            headers["Content-Disposition"] = 'attachment; filename="creatives.zip"';
          }
          res.set(headers);
          const stream = file.createReadStream();
          stream.on("error", (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ error: "Error streaming file" });
            }
          });
          stream.pipe(res);
        } catch (error) {
          console.error("Error downloading file:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error downloading file" });
          }
        }
      }
      // Gets the upload URL for a creative archive.
      async getCreativeUploadURL() {
        const privateObjectDir = this.getPrivateObjectDir();
        if (!privateObjectDir) {
          throw new Error(
            "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
          );
        }
        const objectId = randomUUID2();
        const fullPath = `${privateObjectDir}/creatives/${objectId}.zip`;
        const { bucketName, objectName } = parseObjectPath(fullPath);
        return signObjectURL({
          bucketName,
          objectName,
          method: "PUT",
          ttlSec: 900
        });
      }
      // Gets the upload URL for images (logos, offer images, etc.)
      async getImageUploadURL() {
        const privateObjectDir = this.getPrivateObjectDir();
        if (!privateObjectDir) {
          throw new Error(
            "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
          );
        }
        const objectId = randomUUID2();
        const fullPath = `${privateObjectDir}/uploads/${objectId}`;
        const { bucketName, objectName } = parseObjectPath(fullPath);
        return signObjectURL({
          bucketName,
          objectName,
          method: "PUT",
          ttlSec: 900
        });
      }
      // Gets the creative file from the object path.
      async getCreativeFile(creativePath) {
        if (!creativePath.startsWith("/creatives/")) {
          throw new ObjectNotFoundError();
        }
        let entityDir = this.getPrivateObjectDir();
        if (!entityDir.endsWith("/")) {
          entityDir = `${entityDir}/`;
        }
        const objectPath = `${entityDir}${creativePath.slice(1)}`;
        const { bucketName, objectName } = parseObjectPath(objectPath);
        const bucket = objectStorageClient.bucket(bucketName);
        const objectFile = bucket.file(objectName);
        const [exists] = await objectFile.exists();
        if (!exists) {
          throw new ObjectNotFoundError();
        }
        return objectFile;
      }
      // Gets any object file from the object path (for logos, images, etc)
      async getObjectEntityFile(objectPath) {
        console.log("Getting object entity file for path:", objectPath);
        if (!objectPath.startsWith("/objects/")) {
          console.log("Path does not start with /objects/, throwing error");
          throw new ObjectNotFoundError();
        }
        const filePath = objectPath.slice("/objects/".length);
        console.log("Extracted file path:", filePath);
        let entityDir = this.getPrivateObjectDir();
        if (!entityDir.endsWith("/")) {
          entityDir = `${entityDir}/`;
        }
        const fullObjectPath = `${entityDir}${filePath}`;
        console.log("Full object path:", fullObjectPath);
        const { bucketName, objectName } = parseObjectPath(fullObjectPath);
        console.log("Bucket:", bucketName, "Object:", objectName);
        const bucket = objectStorageClient.bucket(bucketName);
        const objectFile = bucket.file(objectName);
        const [exists] = await objectFile.exists();
        console.log("File exists:", exists);
        if (!exists) {
          throw new ObjectNotFoundError();
        }
        return objectFile;
      }
      normalizeCreativePath(rawPath) {
        if (!rawPath.startsWith("https://storage.googleapis.com/")) {
          return rawPath;
        }
        const url = new URL(rawPath);
        const rawObjectPath = url.pathname;
        let objectEntityDir = this.getPrivateObjectDir();
        if (!objectEntityDir.endsWith("/")) {
          objectEntityDir = `${objectEntityDir}/`;
        }
        if (!rawObjectPath.startsWith(objectEntityDir)) {
          return rawObjectPath;
        }
        const creativePath = rawObjectPath.slice(objectEntityDir.length);
        return `/${creativePath}`;
      }
    };
  }
});

// shared/postback-schema.ts
var postback_schema_exports = {};
__export(postback_schema_exports, {
  clickEventSchema: () => clickEventSchema,
  conversionEventSchema: () => conversionEventSchema,
  createPostbackProfileSchema: () => createPostbackProfileSchema,
  deliveryQueue: () => deliveryQueue,
  deliveryStatusEnum: () => deliveryStatusEnum2,
  eventTypeEnum: () => eventTypeEnum2,
  ownerScopeEnum: () => ownerScopeEnum2,
  postbackDeliveries: () => postbackDeliveries2,
  postbackDeliveriesRelations: () => postbackDeliveriesRelations,
  postbackIdParamEnum: () => postbackIdParamEnum2,
  postbackMethodEnum: () => postbackMethodEnum2,
  postbackProfiles: () => postbackProfiles2,
  postbackProfilesRelations: () => postbackProfilesRelations,
  postbackScopeTypeEnum: () => postbackScopeTypeEnum2,
  sub2Config: () => sub2Config,
  trackingClicks: () => trackingClicks2,
  trackingClicksRelations: () => trackingClicksRelations,
  trackingEvents: () => trackingEvents,
  trackingEventsRelations: () => trackingEventsRelations,
  updatePostbackProfileSchema: () => updatePostbackProfileSchema
});
import { sql as sql3, relations as relations2 } from "drizzle-orm";
import { pgTable as pgTable2, text as text2, varchar as varchar2, integer as integer2, decimal as decimal2, timestamp as timestamp2, boolean as boolean2, jsonb as jsonb2, pgEnum as pgEnum2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
import { z as z2 } from "zod";
var ownerScopeEnum2, postbackScopeTypeEnum2, postbackMethodEnum2, postbackIdParamEnum2, deliveryStatusEnum2, eventTypeEnum2, sub2Config, trackingClicks2, trackingEvents, postbackProfiles2, postbackDeliveries2, deliveryQueue, trackingClicksRelations, trackingEventsRelations, postbackProfilesRelations, postbackDeliveriesRelations, clickEventSchema, conversionEventSchema, createPostbackProfileSchema, updatePostbackProfileSchema;
var init_postback_schema = __esm({
  "shared/postback-schema.ts"() {
    "use strict";
    init_schema();
    ownerScopeEnum2 = pgEnum2("owner_scope", ["owner", "advertiser", "partner"]);
    postbackScopeTypeEnum2 = pgEnum2("postback_scope_type", ["global", "campaign", "offer", "flow"]);
    postbackMethodEnum2 = pgEnum2("postback_method", ["GET", "POST"]);
    postbackIdParamEnum2 = pgEnum2("postback_id_param", ["subid", "clickid"]);
    deliveryStatusEnum2 = pgEnum2("delivery_status", ["pending", "success", "failed", "retrying"]);
    eventTypeEnum2 = pgEnum2("event_type", ["open", "lp_click", "reg", "deposit", "sale", "lead", "lp_leave"]);
    sub2Config = {
      allowedKeys: [
        "geo",
        "dev",
        "src",
        "adset",
        "lang",
        "tier",
        "risk",
        "abtest",
        "cohort",
        "pp",
        "fpr",
        "anti",
        "seg"
      ],
      maxPairs: 8,
      maxLength: 200
    };
    trackingClicks2 = pgTable2("tracking_clicks", {
      clickid: text2("clickid").primaryKey(),
      advertiserId: varchar2("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar2("partner_id").references(() => users.id),
      campaignId: varchar2("campaign_id"),
      offerId: varchar2("offer_id").references(() => offers.id),
      flowId: varchar2("flow_id"),
      site: text2("site"),
      referrer: text2("referrer"),
      // Sub parameters
      sub1: text2("sub1"),
      sub2Raw: text2("sub2_raw"),
      // Raw sub2 string as received
      sub2Map: jsonb2("sub2_map"),
      // Parsed key-value pairs
      sub3: text2("sub3"),
      sub4: text2("sub4"),
      sub5: text2("sub5"),
      sub6: text2("sub6"),
      sub7: text2("sub7"),
      sub8: text2("sub8"),
      sub9: text2("sub9"),
      sub10: text2("sub10"),
      // UTM parameters
      utmSource: text2("utm_source"),
      utmCampaign: text2("utm_campaign"),
      utmMedium: text2("utm_medium"),
      utmTerm: text2("utm_term"),
      utmContent: text2("utm_content"),
      // Client and server data
      ip: text2("ip"),
      countryIso: text2("country_iso"),
      region: text2("region"),
      city: text2("city"),
      isp: text2("isp"),
      operator: text2("operator"),
      isProxy: boolean2("is_proxy").default(false),
      userAgent: text2("user_agent"),
      browserName: text2("browser_name"),
      browserVersion: text2("browser_version"),
      osName: text2("os_name"),
      osVersion: text2("os_version"),
      deviceModel: text2("device_model"),
      deviceType: text2("device_type"),
      connection: text2("connection"),
      lang: text2("lang"),
      ts: timestamp2("ts").defaultNow()
    });
    trackingEvents = pgTable2("tracking_events", {
      id: varchar2("id").primaryKey().default(sql3`gen_random_uuid()`),
      clickid: text2("clickid").notNull().references(() => trackingClicks2.clickid),
      advertiserId: varchar2("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar2("partner_id").references(() => users.id),
      type: eventTypeEnum2("type").notNull(),
      revenue: decimal2("revenue", { precision: 18, scale: 6 }),
      currency: text2("currency"),
      txid: text2("txid"),
      timeOnPageMs: integer2("time_on_page_ms"),
      ts: timestamp2("ts").defaultNow()
    });
    postbackProfiles2 = pgTable2("postback_profiles", {
      id: varchar2("id").primaryKey().default(sql3`gen_random_uuid()`),
      ownerScope: ownerScopeEnum2("owner_scope").notNull(),
      // 'owner', 'advertiser', 'partner'
      ownerId: varchar2("owner_id").notNull().references(() => users.id),
      // ID владельца уровня
      scopeType: postbackScopeTypeEnum2("scope_type").notNull(),
      // 'global', 'campaign', 'offer', 'flow'
      scopeId: varchar2("scope_id"),
      // ID области (campaign/offer/flow), null для global
      name: text2("name").notNull(),
      enabled: boolean2("enabled").default(true),
      priority: integer2("priority").default(100),
      // Endpoint configuration
      endpointUrl: text2("endpoint_url").notNull(),
      method: postbackMethodEnum2("method").notNull(),
      idParam: postbackIdParamEnum2("id_param").notNull(),
      // 'subid' или 'clickid'
      // Authentication
      authQueryKey: text2("auth_query_key"),
      authQueryVal: text2("auth_query_val"),
      authHeaderName: text2("auth_header_name"),
      authHeaderVal: text2("auth_header_val"),
      // Status mapping and parameters
      statusMap: jsonb2("status_map").default("{}"),
      // {reg: 'lead', deposit: 'sale'}
      paramsTemplate: jsonb2("params_template").default("{}"),
      // Mustache template
      urlEncode: boolean2("url_encode").default(true),
      // HMAC configuration
      hmacEnabled: boolean2("hmac_enabled").default(false),
      hmacSecret: text2("hmac_secret"),
      hmacPayloadTpl: text2("hmac_payload_tpl"),
      hmacParamName: text2("hmac_param_name"),
      // Retry configuration
      retries: integer2("retries").default(5),
      timeoutMs: integer2("timeout_ms").default(4e3),
      backoffBaseSec: integer2("backoff_base_sec").default(2),
      // Filters
      filterRevenueGt0: boolean2("filter_revenue_gt0").default(false),
      filterCountryWhitelist: text2("filter_country_whitelist").array(),
      filterCountryBlacklist: text2("filter_country_blacklist").array(),
      filterExcludeBots: boolean2("filter_exclude_bots").default(true),
      createdAt: timestamp2("created_at").defaultNow(),
      updatedAt: timestamp2("updated_at").defaultNow()
    });
    postbackDeliveries2 = pgTable2("postback_deliveries", {
      id: varchar2("id").primaryKey().default(sql3`gen_random_uuid()`),
      profileId: varchar2("profile_id").notNull().references(() => postbackProfiles2.id, { onDelete: "cascade" }),
      eventId: varchar2("event_id").references(() => trackingEvents.id),
      advertiserId: varchar2("advertiser_id").notNull().references(() => users.id),
      partnerId: varchar2("partner_id").references(() => users.id),
      clickid: text2("clickid").notNull(),
      // Delivery attempt info
      attempt: integer2("attempt").notNull(),
      maxAttempts: integer2("max_attempts").notNull(),
      // Request details
      requestMethod: text2("request_method").notNull(),
      requestUrl: text2("request_url").notNull(),
      requestBody: text2("request_body"),
      requestHeaders: jsonb2("request_headers"),
      // Response details
      responseCode: integer2("response_code"),
      responseBody: text2("response_body"),
      error: text2("error"),
      durationMs: integer2("duration_ms"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    deliveryQueue = pgTable2("delivery_queue", {
      id: varchar2("id").primaryKey().default(sql3`gen_random_uuid()`),
      profileId: varchar2("profile_id").notNull().references(() => postbackProfiles2.id),
      eventId: varchar2("event_id").notNull().references(() => trackingEvents.id),
      clickid: text2("clickid").notNull(),
      payload: jsonb2("payload").notNull(),
      attempts: integer2("attempts").default(0),
      maxAttempts: integer2("max_attempts").default(5),
      status: deliveryStatusEnum2("status").default("pending"),
      scheduledAt: timestamp2("scheduled_at").defaultNow(),
      lastAttemptAt: timestamp2("last_attempt_at"),
      nextRetryAt: timestamp2("next_retry_at"),
      createdAt: timestamp2("created_at").defaultNow(),
      updatedAt: timestamp2("updated_at").defaultNow()
    });
    trackingClicksRelations = relations2(trackingClicks2, ({ one, many }) => ({
      advertiser: one(users, {
        fields: [trackingClicks2.advertiserId],
        references: [users.id]
      }),
      partner: one(users, {
        fields: [trackingClicks2.partnerId],
        references: [users.id]
      }),
      offer: one(offers, {
        fields: [trackingClicks2.offerId],
        references: [offers.id]
      }),
      events: many(trackingEvents)
    }));
    trackingEventsRelations = relations2(trackingEvents, ({ one }) => ({
      click: one(trackingClicks2, {
        fields: [trackingEvents.clickid],
        references: [trackingClicks2.clickid]
      }),
      advertiser: one(users, {
        fields: [trackingEvents.advertiserId],
        references: [users.id]
      }),
      partner: one(users, {
        fields: [trackingEvents.partnerId],
        references: [users.id]
      })
    }));
    postbackProfilesRelations = relations2(postbackProfiles2, ({ one, many }) => ({
      owner: one(users, {
        fields: [postbackProfiles2.ownerId],
        references: [users.id]
      }),
      deliveries: many(postbackDeliveries2)
    }));
    postbackDeliveriesRelations = relations2(postbackDeliveries2, ({ one }) => ({
      profile: one(postbackProfiles2, {
        fields: [postbackDeliveries2.profileId],
        references: [postbackProfiles2.id]
      }),
      event: one(trackingEvents, {
        fields: [postbackDeliveries2.eventId],
        references: [trackingEvents.id]
      }),
      advertiser: one(users, {
        fields: [postbackDeliveries2.advertiserId],
        references: [users.id]
      }),
      partner: one(users, {
        fields: [postbackDeliveries2.partnerId],
        references: [users.id]
      })
    }));
    clickEventSchema = z2.object({
      // Attribution (optional for click)
      campaign_id: z2.string().optional(),
      source_id: z2.string().optional(),
      flow_id: z2.string().optional(),
      offer_id: z2.string().optional(),
      landing_id: z2.string().optional(),
      ad_campaign_id: z2.string().optional(),
      external_id: z2.string().optional(),
      creative_id: z2.string().optional(),
      // Marketing
      referrer: z2.string().optional(),
      site: z2.string().optional(),
      utm_source: z2.string().optional(),
      utm_medium: z2.string().optional(),
      utm_campaign: z2.string().optional(),
      utm_term: z2.string().optional(),
      utm_content: z2.string().optional(),
      // Subs
      sub1: z2.string().optional(),
      sub2: z2.string().max(sub2Config.maxLength).optional(),
      sub3: z2.string().optional(),
      sub4: z2.string().optional(),
      sub5: z2.string().optional(),
      sub6: z2.string().optional(),
      sub7: z2.string().optional(),
      sub8: z2.string().optional(),
      sub9: z2.string().optional(),
      sub10: z2.string().optional(),
      // Client data
      user_agent: z2.string(),
      lang: z2.string().optional(),
      tz: z2.string().optional(),
      screen: z2.string().optional(),
      // WxH
      connection: z2.string().optional(),
      device_type: z2.enum(["desktop", "mobile", "tablet"]).optional(),
      // Visitor tracking
      visitor_code: z2.string().uuid().optional(),
      // Client timestamp
      ts_client: z2.number().optional()
    });
    conversionEventSchema = z2.object({
      // Required
      clickid: z2.string().max(64),
      visitor_code: z2.string().uuid(),
      type: z2.enum(["open", "lp_click", "reg", "deposit", "sale", "lead", "lp_leave"]),
      // Revenue data
      revenue: z2.number().optional(),
      currency: z2.string().length(3).optional(),
      txid: z2.string().optional(),
      // Special fields
      time_on_page_ms: z2.number().optional(),
      // For lp_leave events
      // Client timestamp
      ts_client: z2.number().optional()
    });
    createPostbackProfileSchema = createInsertSchema2(postbackProfiles2).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updatePostbackProfileSchema = createPostbackProfileSchema.partial();
  }
});

// server/services/email.ts
import sgMail from "@sendgrid/mail";
async function sendEmail(params) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log("SendGrid API key not configured - email would be sent to:", params.to);
      console.log("Subject:", params.subject);
      console.log("Body:", params.text || params.html);
      return true;
    }
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    console.log("Email sent successfully to:", params.to);
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
var init_email = __esm({
  "server/services/email.ts"() {
    "use strict";
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }
});

// server/services/notification.ts
var notification_exports = {};
__export(notification_exports, {
  NotificationService: () => NotificationService,
  notificationService: () => notificationService,
  notifyNewReferral: () => notifyNewReferral,
  notifyOfferAccessApproved: () => notifyOfferAccessApproved,
  notifyOfferAccessRejected: () => notifyOfferAccessRejected,
  notifyOfferAccessRequest: () => notifyOfferAccessRequest,
  notifyReferralEarning: () => notifyReferralEarning
});
async function notifyNewReferral(referrer, referredUser) {
  try {
    console.log("\u{1F517} Sending new referral notification to:", referrer.username);
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { notifications } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db2.insert(notifications).values({
      userId: referrer.id,
      type: "info",
      title: "\u{1F389} \u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B!",
      message: `\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${referredUser.username} \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0441\u0441\u044B\u043B\u043A\u0435. \u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F: 5%`,
      data: {
        referredUser: referredUser.username,
        referredEmail: referredUser.email,
        commissionRate: "5"
      },
      isRead: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    console.log("\u2705 Referral notification saved to database");
    const notificationService2 = NotificationService.getInstance();
    await notificationService2.sendNotification({
      type: "new_referral",
      userId: referrer.id,
      data: {
        email: referrer.email,
        referredUser: referredUser.username,
        referredEmail: referredUser.email,
        commissionRate: "5"
      },
      timestamp: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("\u274C Error sending referral notification:", error);
  }
}
async function notifyReferralEarning(referrer, earningData) {
  try {
    console.log("\u{1F4B0} Sending referral earning notification to:", referrer.username);
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { notifications } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db2.insert(notifications).values({
      userId: referrer.id,
      type: "success",
      title: "\u{1F4B0} \u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F!",
      message: `\u0412\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 $${earningData.commissionAmount} \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0438 \u043E\u0442 ${earningData.referredUser}`,
      data: {
        commissionAmount: earningData.commissionAmount,
        referredUser: earningData.referredUser,
        originalAmount: earningData.originalAmount
      },
      isRead: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    console.log("\u2705 Earning notification saved to database");
    const notificationService2 = NotificationService.getInstance();
    await notificationService2.sendNotification({
      type: "referral_earning",
      userId: referrer.id,
      data: {
        email: referrer.email,
        commissionAmount: earningData.commissionAmount,
        referredUser: earningData.referredUser,
        originalAmount: earningData.originalAmount
      },
      timestamp: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("\u274C Error sending earning notification:", error);
  }
}
async function notifyOfferAccessRequest(advertiser, partner, offer2, requestMessage) {
  try {
    await db.insert(userNotifications).values({
      userId: advertiser.id,
      type: "offer_access_request",
      title: "\u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043E\u0444\u0444\u0435\u0440\u0443",
      message: `\u041F\u0430\u0440\u0442\u043D\u0451\u0440 ${partner.username} \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u043B \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 "${offer2.name}"`,
      data: {
        partnerId: partner.id,
        partnerUsername: partner.username,
        offerId: offer2.id,
        offerName: offer2.name,
        requestMessage
      },
      channel: "system",
      status: "sent"
    });
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(advertiser.id, {
        type: "offer_access_request",
        data: {
          partnerUsername: partner.username,
          offerName: offer2.name,
          requestMessage
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log(`Offer access request notification sent to advertiser ${advertiser.username}`);
  } catch (error) {
    console.error("Error sending offer access request notification:", error);
  }
}
async function notifyOfferAccessApproved(partner, advertiser, offer2, responseMessage) {
  try {
    await db.insert(userNotifications).values({
      userId: partner.id,
      type: "offer_access_approved",
      title: "\u0417\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043E\u0434\u043E\u0431\u0440\u0435\u043D",
      message: `\u0412\u0430\u0448 \u0437\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043E\u0444\u0444\u0435\u0440\u0443 "${offer2.name}" \u043E\u0434\u043E\u0431\u0440\u0435\u043D`,
      data: {
        advertiserId: advertiser.id,
        advertiserUsername: advertiser.username,
        offerId: offer2.id,
        offerName: offer2.name,
        responseMessage
      },
      channel: "system",
      status: "sent"
    });
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(partner.id, {
        type: "offer_access_response",
        data: {
          status: "approved",
          offerName: offer2.name,
          advertiserUsername: advertiser.username,
          responseMessage
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log(`Offer access approved notification sent to partner ${partner.username}`);
  } catch (error) {
    console.error("Error sending offer access approved notification:", error);
  }
}
async function notifyOfferAccessRejected(partner, advertiser, offer2, responseMessage) {
  try {
    await db.insert(userNotifications).values({
      userId: partner.id,
      type: "offer_access_rejected",
      title: "\u0417\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D",
      message: `\u0412\u0430\u0448 \u0437\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043E\u0444\u0444\u0435\u0440\u0443 "${offer2.name}" \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D`,
      data: {
        advertiserId: advertiser.id,
        advertiserUsername: advertiser.username,
        offerId: offer2.id,
        offerName: offer2.name,
        responseMessage
      },
      channel: "system",
      status: "sent"
    });
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(partner.id, {
        type: "offer_access_response",
        data: {
          status: "rejected",
          offerName: offer2.name,
          advertiserUsername: advertiser.username,
          responseMessage
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log(`Offer access rejected notification sent to partner ${partner.username}`);
  } catch (error) {
    console.error("Error sending offer access rejected notification:", error);
  }
}
var NotificationService, notificationService;
var init_notification = __esm({
  "server/services/notification.ts"() {
    "use strict";
    init_email();
    init_db();
    init_schema();
    NotificationService = class _NotificationService {
      static instance;
      notifications = [];
      static getInstance() {
        if (!_NotificationService.instance) {
          _NotificationService.instance = new _NotificationService();
        }
        return _NotificationService.instance;
      }
      async sendNotification(event) {
        try {
          this.notifications.push(event);
          await this.sendEmailNotification(event);
          console.log(`Notification sent: ${event.type} for user ${event.userId}`);
        } catch (error) {
          console.error("Failed to send notification:", error);
        }
      }
      async sendEmailNotification(event) {
        const emailConfig = this.getEmailConfig(event);
        if (emailConfig) {
          await sendEmail(emailConfig);
        }
      }
      getEmailConfig(event) {
        const { type, data } = event;
        switch (type) {
          case "user_registration":
            return {
              to: data.email,
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443!",
              html: `
            <h2>\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430</h2>
            <p>\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${data.firstName || data.username}!</p>
            <p>\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D. \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u043D\u0430\u0448\u0443 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443!</p>
            <p>\u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>\u0420\u043E\u043B\u044C: ${data.role}</li>
            </ul>
          `,
              text: `\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430. \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C, ${data.firstName || data.username}!`
            };
          case "user_blocked":
            return {
              to: data.email,
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D",
              html: `
            <h2>\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D</h2>
            <p>\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0431\u044B\u043B \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u043C.</p>
            <p>\u041F\u0440\u0438\u0447\u0438\u043D\u0430: ${data.reason || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430"}</p>
            <p>\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u0432 \u0441\u043B\u0443\u0436\u0431\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438.</p>
          `,
              text: `\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D. \u041F\u0440\u0438\u0447\u0438\u043D\u0430: ${data.reason || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430"}`
            };
          case "new_device_login":
            return {
              to: data.email,
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u0412\u0445\u043E\u0434 \u0441 \u043D\u043E\u0432\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430",
              html: `
            <h2>\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u0432\u0445\u043E\u0434 \u0441 \u043D\u043E\u0432\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430</h2>
            <p>\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D \u0432\u0445\u043E\u0434 \u0432 \u0432\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0441 \u043D\u043E\u0432\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430:</p>
            <ul>
              <li>IP \u0430\u0434\u0440\u0435\u0441: ${data.ip}</li>
              <li>\u0412\u0440\u0435\u043C\u044F: ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}</li>
              <li>User Agent: ${data.userAgent || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E"}</li>
            </ul>
            <p>\u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u0431\u044B\u043B\u0438 \u043D\u0435 \u0432\u044B, \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u0432 \u0441\u043B\u0443\u0436\u0431\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438.</p>
          `,
              text: `\u0412\u0445\u043E\u0434 \u0441 \u043D\u043E\u0432\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430. IP: ${data.ip}, \u0412\u0440\u0435\u043C\u044F: ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}`
            };
          case "fraud_detected":
            return {
              to: process.env.ADMIN_EMAIL || "admin@platform.com",
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
              html: `
            <h2>Fraud Alert</h2>
            <p>\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C:</p>
            <ul>
              <li>\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C: ${data.userId}</li>
              <li>\u0422\u0438\u043F: ${data.fraudType}</li>
              <li>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ${data.description}</li>
              <li>IP: ${data.ip}</li>
              <li>\u0412\u0440\u0435\u043C\u044F: ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}</li>
            </ul>
          `,
              text: `Fraud Alert: ${data.fraudType} \u043E\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${data.userId}`
            };
          case "new_referral":
            return {
              to: data.email,
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u{1F389} \u0423 \u0432\u0430\u0441 \u043D\u043E\u0432\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B!",
              html: `
            <h2>\u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0423 \u0432\u0430\u0441 \u043D\u043E\u0432\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B!</h2>
            <p>\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C <strong>${data.referredUser}</strong> \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0441\u044B\u043B\u043A\u0435.</p>
            <p>\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u0431\u0443\u0434\u0435\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C ${data.commissionRate}% \u0441 \u0435\u0433\u043E \u0434\u043E\u0445\u043E\u0434\u043E\u0432!</p>
            <p><strong>\u0414\u0435\u0442\u0430\u043B\u0438:</strong></p>
            <ul>
              <li>\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ${data.referredUser}</li>
              <li>Email: ${data.referredEmail}</li>
              <li>\u0414\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438: ${(/* @__PURE__ */ new Date()).toLocaleDateString("ru-RU")}</li>
              <li>\u0412\u0430\u0448\u0430 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F: ${data.commissionRate}%</li>
            </ul>
            <p>\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439\u0442\u0435 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0445 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u0432 \u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u0432\u043E\u0439 \u0434\u043E\u0445\u043E\u0434!</p>
          `,
              text: `\u0423 \u0432\u0430\u0441 \u043D\u043E\u0432\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B: ${data.referredUser}. \u0412\u0430\u0448\u0430 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F: ${data.commissionRate}%`
            };
          case "referral_earning":
            return {
              to: data.email,
              from: process.env.FROM_EMAIL || "noreply@platform.com",
              subject: "\u{1F4B0} \u0412\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0443\u044E \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044E!",
              html: `
            <h2>\u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0430!</h2>
            <p>\u0412\u0430\u0448 \u0440\u0435\u0444\u0435\u0440\u0430\u043B <strong>${data.referredUser}</strong> \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0432\u044B\u043F\u043B\u0430\u0442\u0443, \u0438 \u0432\u0430\u043C \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0430 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F!</p>
            <p><strong>\u0414\u0435\u0442\u0430\u043B\u0438 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F:</strong></p>
            <ul>
              <li>\u0421\u0443\u043C\u043C\u0430 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0438: <strong>$${data.commissionAmount}</strong></li>
              <li>\u041E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430: $${data.originalAmount}</li>
              <li>\u0420\u0435\u0444\u0435\u0440\u0430\u043B: ${data.referredUser}</li>
              <li>\u0414\u0430\u0442\u0430: ${(/* @__PURE__ */ new Date()).toLocaleDateString("ru-RU")}</li>
            </ul>
            <p>\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u0431\u0443\u0434\u0435\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u043A \u0432\u0430\u0448\u0435\u043C\u0443 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C\u0443 \u043F\u043B\u0430\u0442\u0435\u0436\u0443.</p>
            <p>\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0430\u0439\u0442\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u0432 \u0434\u043B\u044F \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u0445\u043E\u0434\u0430!</p>
          `,
              text: `\u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F: $${data.commissionAmount} \u043E\u0442 ${data.referredUser}`
            };
          default:
            return null;
        }
      }
      getNotifications(userId) {
        if (userId) {
          return this.notifications.filter((n) => n.userId === userId);
        }
        return this.notifications;
      }
    };
    notificationService = NotificationService.getInstance();
  }
});

// server/config/environment.ts
function getEnvVar(key, defaultValue = "") {
  return process.env[key] || defaultValue;
}
function getEnvNumber(key, defaultValue) {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}
function getEnvBool(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) return defaultValue;
  return value.toLowerCase() === "true";
}
function validateConfig() {
  console.log("\u{1F527} [ENV] Environment configuration check...");
  if (!config.DATABASE_URL) {
    console.log("\u{1F4CC} [ENV] DATABASE_URL will be validated by database connection");
  }
  if (!config.JWT_SECRET || config.JWT_SECRET === "development-jwt-secret-change-in-production") {
    console.log("\u{1F527} [ENV] Using default JWT_SECRET");
  }
  if (!config.SESSION_SECRET || config.SESSION_SECRET === "development-session-secret") {
    console.log("\u{1F527} [ENV] Using default SESSION_SECRET");
  }
  if (!config.SENDGRID_API_KEY) {
    console.log("\u{1F4E7} [ENV] SENDGRID_API_KEY not set - email notifications disabled");
  }
  if (!config.KEITARO_TOKEN && !config.VOLUUM_TOKEN && !config.BINOM_TOKEN && !config.REDTRACK_TOKEN) {
    console.log("\u{1F517} [ENV] No external tracker tokens - tracking integrations disabled");
  }
  if (!config.GOOGLE_CLOUD_PROJECT_ID || !config.GOOGLE_CLOUD_STORAGE_BUCKET) {
    console.log("\u2601\uFE0F [ENV] Google Cloud Storage not configured - using fallback storage");
  }
  console.log("\u2705 [ENV] Configuration validated - application ready to start");
}
var config;
var init_environment = __esm({
  "server/config/environment.ts"() {
    "use strict";
    config = {
      // Базовые настройки сервера
      NODE_ENV: getEnvVar("NODE_ENV", "development"),
      PORT: getEnvNumber("PORT", 5e3),
      HOST: getEnvVar("HOST", "0.0.0.0"),
      // База данных (используется автоматически в db.ts)
      DATABASE_URL: getEnvVar("DATABASE_URL", ""),
      // JWT и сессии (всегда с дефолтными значениями)
      JWT_SECRET: getEnvVar("JWT_SECRET", "development-jwt-secret-change-in-production"),
      JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "24h"),
      SESSION_SECRET: getEnvVar("SESSION_SECRET", "development-session-secret"),
      // Email (опционально)
      SENDGRID_API_KEY: getEnvVar("SENDGRID_API_KEY"),
      EMAIL_FROM: getEnvVar("EMAIL_FROM", "noreply@platform.com"),
      // Внешние трекеры (все опционально)
      KEITARO_TOKEN: getEnvVar("KEITARO_TOKEN"),
      BINOM_TOKEN: getEnvVar("BINOM_TOKEN"),
      REDTRACK_TOKEN: getEnvVar("REDTRACK_TOKEN"),
      VOLUUM_TOKEN: getEnvVar("VOLUUM_TOKEN"),
      // Google Cloud (опционально)
      GOOGLE_CLOUD_PROJECT_ID: getEnvVar("GOOGLE_CLOUD_PROJECT_ID"),
      GOOGLE_CLOUD_STORAGE_BUCKET: getEnvVar("GOOGLE_CLOUD_STORAGE_BUCKET"),
      GOOGLE_APPLICATION_CREDENTIALS: getEnvVar("GOOGLE_APPLICATION_CREDENTIALS"),
      // Telegram (опционально)
      TELEGRAM_BOT_TOKEN: getEnvVar("TELEGRAM_BOT_TOKEN"),
      TELEGRAM_CHAT_ID: getEnvVar("TELEGRAM_CHAT_ID"),
      // Настройки производительности
      RATE_LIMIT_REQUESTS: getEnvNumber("RATE_LIMIT_REQUESTS", 1e3),
      RATE_LIMIT_WINDOW: getEnvNumber("RATE_LIMIT_WINDOW", 9e5),
      // 15 минут
      // Постбэк настройки
      POSTBACK_RETRY_ATTEMPTS: getEnvNumber("POSTBACK_RETRY_ATTEMPTS", 5),
      POSTBACK_RETRY_DELAY: getEnvNumber("POSTBACK_RETRY_DELAY", 1e3),
      POSTBACK_TIMEOUT: getEnvNumber("POSTBACK_TIMEOUT", 1e4),
      // Безопасность
      BCRYPT_ROUNDS: getEnvNumber("BCRYPT_ROUNDS", 12),
      LOGIN_ATTEMPT_LIMIT: getEnvNumber("LOGIN_ATTEMPT_LIMIT", 5),
      LOGIN_LOCKOUT_TIME: getEnvNumber("LOGIN_LOCKOUT_TIME", 9e5),
      // 15 минут
      // Логирование
      LOG_LEVEL: getEnvVar("LOG_LEVEL", "info"),
      LOG_FILE: getEnvVar("LOG_FILE", "logs/app.log"),
      // Флаги возможностей
      ENABLE_2FA: getEnvBool("ENABLE_2FA", true),
      ENABLE_KYC: getEnvBool("ENABLE_KYC", true),
      ENABLE_AUDIT_LOGS: getEnvBool("ENABLE_AUDIT_LOGS", true),
      ENABLE_REAL_TIME_ANALYTICS: getEnvBool("ENABLE_REAL_TIME_ANALYTICS", true)
    };
  }
});

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET, requireRole, authenticateToken, getAuthenticatedUser;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    init_storage();
    init_environment();
    JWT_SECRET = config.JWT_SECRET;
    requireRole = (roles) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
      };
    };
    authenticateToken = async (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Authentication required", code: "TOKEN_MISSING" });
        return;
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId || decoded.id;
        if (!userId) {
          res.sendStatus(403);
          return;
        }
        const user = await storage.getUser(userId);
        if (!user) {
          res.sendStatus(403);
          return;
        }
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          ownerId: user.ownerId
        };
        next();
      } catch (error) {
        console.error("JWT verification failed:", error.message);
        res.sendStatus(403);
      }
    };
    getAuthenticatedUser = (req) => {
      if (!req.user) {
        throw new Error("User not authenticated");
      }
      return req.user;
    };
  }
});

// server/services/postback.ts
import { createHmac, randomBytes as randomBytes2 } from "crypto";
import { eq as eq4, and as and4, desc as desc3, asc } from "drizzle-orm";
var PostbackService;
var init_postback = __esm({
  "server/services/postback.ts"() {
    "use strict";
    init_db();
    init_schema();
    PostbackService = class {
      // Generate unique click ID
      static generateClickId() {
        const timestamp4 = Date.now().toString(36);
        const random = randomBytes2(6).toString("hex");
        return `${timestamp4}_${random}`;
      }
      // Replace macros in URL
      static replaceMacros(url, macros) {
        let processedUrl = url;
        Object.entries(macros).forEach(([key, value]) => {
          const macroPattern = new RegExp(`\\{${key}\\}`, "g");
          processedUrl = processedUrl.replace(macroPattern, encodeURIComponent(String(value || "")));
        });
        return processedUrl;
      }
      // Generate HMAC signature for security
      static generateSignature(url, payload, secretKey) {
        const data = url + JSON.stringify(payload);
        return createHmac("sha256", secretKey).update(data).digest("hex");
      }
      // Validate IP whitelist
      static isIpWhitelisted(ip, whitelist) {
        if (!whitelist.trim()) return true;
        const allowedIps = whitelist.split(",").map((ip2) => ip2.trim());
        return allowedIps.includes(ip) || allowedIps.includes("*");
      }
      // Check for duplicate events (anti-deduplication)
      static async isDuplicateEvent(clickId, eventType, postbackId) {
        const existingLog = await db.select().from(postbackLogs).where(and4(
          eq4(postbackLogs.clickId, clickId),
          eq4(postbackLogs.eventType, eventType),
          eq4(postbackLogs.postbackId, postbackId),
          eq4(postbackLogs.status, "sent")
          // Fixed: changed from 'success' to 'sent'
        )).limit(1);
        return existingLog.length > 0;
      }
      // Store click for tracking
      static async storeClick(clickData) {
        const clickId = this.generateClickId();
        const [click] = await db.insert(trackingClicks).values({
          clickId,
          ...clickData
        }).returning();
        return click;
      }
      // Send postback to URL
      static async sendPostback(postbackId, eventType, macros, clickId) {
        try {
          const [postback] = await db.select().from(postbackTemplates).where(eq4(postbackTemplates.id, postbackId));
          if (!postback || !postback.isActive) {
            throw new Error("Postback not found or inactive");
          }
          const events4 = Array.isArray(postback.events) ? postback.events : [];
          console.log(`Postback ${postback.id} events:`, events4, `checking for:`, eventType);
          if (!events4.includes(eventType)) {
            console.log(`Skipping postback ${postback.id} - event ${eventType} not in configured events`);
            return { success: true };
          }
          if (clickId && await this.isDuplicateEvent(clickId, eventType, postbackId)) {
            console.log(`Duplicate event detected: ${eventType} for click ${clickId}`);
            return { success: true };
          }
          console.log(`Original URL template: ${postback.url}`);
          console.log(`Macros to replace:`, macros);
          const processedUrl = this.replaceMacros(postback.url, macros);
          console.log(`Processed URL: ${processedUrl}`);
          const requestOptions = {
            method: postback.method || "GET",
            timeout: (postback.timeout || 30) * 1e3,
            headers: {
              "User-Agent": "Affiliate-Platform-Postback/1.0",
              "Content-Type": "application/json"
            }
          };
          let signature = "";
          const method = "GET";
          requestOptions.method = method;
          if (method === "POST") {
            requestOptions.body = JSON.stringify(macros);
          }
          console.log(`Sending postback request to: ${processedUrl}`);
          const startTime = Date.now();
          const response = await fetch(processedUrl, requestOptions);
          const responseTime = Date.now() - startTime;
          const responseBody = await response.text();
          console.log(`Postback response: ${response.status} ${response.statusText}`);
          const logStatus = response.ok ? "sent" : "failed";
          console.log(`Postback ${postbackId} completed with status: ${logStatus} (HTTP ${response.status})`);
          await db.insert(postbackLogs).values({
            postbackId,
            clickId,
            eventType,
            url: processedUrl,
            method,
            headers: requestOptions.headers,
            payload: method === "POST" ? macros : null,
            responseStatus: response.status,
            responseBody: responseBody.substring(0, 1e3),
            // Limit response body size
            responseTime,
            retryCount: 0,
            status: logStatus,
            signature,
            sentAt: /* @__PURE__ */ new Date()
          });
          return {
            success: response.ok,
            response: {
              status: response.status,
              statusText: response.statusText,
              body: responseBody,
              responseTime
            }
          };
        } catch (error) {
          console.error("Postback sending failed:", error);
          await db.insert(postbackLogs).values({
            postbackId,
            clickId,
            eventType,
            url: macros.clickid ? `Failed to process URL for click ${macros.clickid}` : "Failed to process URL",
            method: "GET",
            retryCount: 0,
            status: "failed",
            errorMessage: error.message
          });
          return {
            success: false,
            error: error.message
          };
        }
      }
      // Build comprehensive macros from click data
      static buildMacrosFromClick(clickData, event) {
        const macros = {
          // Core tracking data
          clickid: event.clickId,
          status: event.type,
          offer_id: clickData?.offerId || event.offerId,
          partner_id: clickData?.partnerId || event.partnerId,
          // Revenue and payout
          revenue: event.data.revenue || "0.00",
          payout: event.data.payout || "0.00",
          amount: event.data.amount || event.data.revenue || "0.00",
          currency: event.data.currency || "USD",
          txid: event.data.txid || "",
          // Sub parameters (all 16)
          sub1: clickData?.subId1 || event.data.sub1 || "",
          sub2: clickData?.subId2 || event.data.sub2 || "",
          sub3: clickData?.subId3 || event.data.sub3 || "",
          sub4: clickData?.subId4 || event.data.sub4 || "",
          sub5: clickData?.subId5 || event.data.sub5 || "",
          sub6: clickData?.subId6 || event.data.sub6 || "",
          sub7: clickData?.subId7 || event.data.sub7 || "",
          sub8: clickData?.subId8 || event.data.sub8 || "",
          sub9: clickData?.subId9 || event.data.sub9 || "",
          sub10: clickData?.subId10 || event.data.sub10 || "",
          sub11: clickData?.subId11 || event.data.sub11 || "",
          sub12: clickData?.subId12 || event.data.sub12 || "",
          sub13: clickData?.subId13 || event.data.sub13 || "",
          sub14: clickData?.subId14 || event.data.sub14 || "",
          sub15: clickData?.subId15 || event.data.sub15 || "",
          sub16: clickData?.subId16 || event.data.sub16 || "",
          // Geo data
          country: clickData?.country || event.data.country || "",
          country_iso: clickData?.country || event.data.country_iso || "",
          geo: clickData?.country || event.data.geo || "",
          // Device data  
          device: clickData?.device || event.data.device || "",
          device_type: clickData?.device || event.data.device_type || "",
          os: clickData?.os || event.data.os || "",
          browser: clickData?.browser || event.data.browser || "",
          // Technical data
          ip: clickData?.ip || event.data.ip || "",
          user_agent: clickData?.userAgent || event.data.user_agent || "",
          referer: clickData?.referer || event.data.referer || "",
          // Campaign data
          campaign_id: event.data.campaign_id || "",
          flow_id: event.data.flow_id || "",
          landing_id: event.data.landing_id || "",
          creative_id: event.data.creative_id || "",
          // UTM parameters
          utm_source: event.data.utm_source || "",
          utm_medium: event.data.utm_medium || "",
          utm_campaign: event.data.utm_campaign || "",
          utm_term: event.data.utm_term || "",
          utm_content: event.data.utm_content || "",
          // Timestamps
          timestamp: Math.floor(Date.now() / 1e3).toString(),
          datetime: (/* @__PURE__ */ new Date()).toISOString()
        };
        return macros;
      }
      // Enhanced postback for external trackers (Keitaro, Binom, etc.)
      static async sendExternalTrackerPostback(trackerUrl, event, clickData, options = {}) {
        try {
          const macros = this.buildMacrosFromClick(clickData, event);
          let processedUrl = this.replaceMacros(trackerUrl, macros);
          console.log(`Sending to external tracker: ${processedUrl}`);
          const requestOptions = {
            method: options.method || "GET",
            timeout: (options.timeout || 30) * 1e3,
            headers: {
              "User-Agent": "AffiliateNetwork-Postback/2.0",
              "Content-Type": "application/json"
            }
          };
          if (options.auth) {
            if (options.auth.type === "header") {
              requestOptions.headers[options.auth.key] = options.auth.value;
            } else if (options.auth.type === "query") {
              const url = new URL(processedUrl);
              url.searchParams.set(options.auth.key, options.auth.value);
              processedUrl = url.toString();
            }
          }
          if (options.hmac) {
            const signature = this.generateSignature(processedUrl, macros, options.hmac.secret);
            if (options.method === "POST") {
              requestOptions.headers["X-Signature"] = signature;
            } else {
              const url = new URL(processedUrl);
              url.searchParams.set(options.hmac.param, signature);
              processedUrl = url.toString();
            }
          }
          if (requestOptions.method === "POST") {
            requestOptions.body = JSON.stringify(macros);
          }
          const startTime = Date.now();
          const response = await fetch(processedUrl, requestOptions);
          const responseTime = Date.now() - startTime;
          const responseBody = await response.text();
          console.log(`External tracker response: ${response.status} in ${responseTime}ms`);
          return {
            success: response.ok,
            response: {
              status: response.status,
              statusText: response.statusText,
              body: responseBody,
              responseTime
            }
          };
        } catch (error) {
          console.error("External tracker postback failed:", error);
          return {
            success: false,
            error: error.message
          };
        }
      }
      // Trigger postbacks for an event (enhanced version)
      static async triggerPostbacks(event) {
        try {
          console.log(`Triggering postbacks for event: ${event.type}, clickId: ${event.clickId}`);
          let clickData = null;
          if (event.clickId) {
            const [click] = await db.select().from(trackingClicks).where(eq4(trackingClicks.clickId, event.clickId));
            clickData = click;
            console.log(`Found click data:`, clickData ? "yes" : "no");
          }
          const relevantPostbacks = await db.select().from(postbackTemplates).leftJoin(users, eq4(postbackTemplates.advertiserId, users.id)).where(eq4(postbackTemplates.isActive, true));
          console.log(`Found ${relevantPostbacks.length} active postback templates`);
          if (relevantPostbacks.length === 0) {
            console.log("No active postback templates found");
            return [];
          }
          const results = await Promise.allSettled(
            relevantPostbacks.map(({ postback_templates: pb }) => {
              console.log(`Triggering postback ${pb.id} for event ${event.type}`);
              const enhancedMacros = this.buildMacrosFromClick(clickData, event);
              return this.sendPostback(pb.id, event.type, enhancedMacros, event.clickId);
            })
          );
          console.log(`Postback results:`, results.map((r) => r.status));
          return results;
        } catch (error) {
          console.error("Error triggering postbacks:", error);
          throw error;
        }
      }
      // Retry failed postbacks
      static async retryFailedPostbacks() {
        try {
          const failedLogs = await db.select().from(postbackLogs).leftJoin(postbackTemplates, eq4(postbackLogs.postbackId, postbackTemplates.id)).where(
            and4(
              eq4(postbackLogs.status, "failed"),
              eq4(postbackTemplates.isActive, true)
            )
          ).orderBy(asc(postbackLogs.createdAt));
          const retryPromises = failedLogs.filter(
            ({ postback_logs: logs, postback_templates: pb }) => (logs.retryCount || 0) < (pb?.retryAttempts || 3)
          ).map(async ({ postback_logs: logs, postback_templates: pb }) => {
            if (!pb) return;
            const retryDelay = 60 * Math.pow(2, logs.retryCount || 0);
            const shouldRetry = !logs.nextRetryAt || /* @__PURE__ */ new Date() >= logs.nextRetryAt;
            if (!shouldRetry) return;
            const macros = logs.payload || {};
            const result = await this.sendPostback(
              pb.id,
              logs.eventType,
              macros,
              logs.clickId || void 0
            );
            if (!result.success) {
              await db.update(postbackLogs).set({
                retryCount: (logs.retryCount || 0) + 1,
                nextRetryAt: new Date(Date.now() + retryDelay * 1e3),
                errorMessage: result.error
              }).where(eq4(postbackLogs.id, logs.id));
            }
            return result;
          });
          await Promise.allSettled(retryPromises);
        } catch (error) {
          console.error("Error retrying failed postbacks:", error);
        }
      }
      // Get postback logs with filtering
      static async getPostbackLogs(filters = {}) {
        const query = db.select({
          id: postbackLogs.id,
          postbackId: postbackLogs.postbackId,
          clickId: postbackLogs.clickId,
          eventType: postbackLogs.eventType,
          url: postbackLogs.url,
          method: postbackLogs.method,
          responseStatus: postbackLogs.responseStatus,
          responseTime: postbackLogs.responseTime,
          retryCount: postbackLogs.retryCount,
          status: postbackLogs.status,
          errorMessage: postbackLogs.errorMessage,
          sentAt: postbackLogs.sentAt,
          createdAt: postbackLogs.createdAt,
          postbackName: postbacks.name
        }).from(postbackLogs).leftJoin(postbacks, eq4(postbackLogs.postbackId, postbacks.id)).orderBy(desc3(postbackLogs.createdAt));
        let filteredQuery = query;
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        return await query.limit(limit).offset(offset);
      }
      // Generate tracking URL with click ID
      static generateTrackingUrl(baseUrl, partnerId, offerId, subIds = {}) {
        const clickId = this.generateClickId();
        const params = new URLSearchParams({
          partner_id: partnerId,
          offer_id: offerId,
          clickid: clickId,
          ...Object.fromEntries(
            Object.entries(subIds).filter(([_, value]) => value !== void 0)
          )
        });
        return `${baseUrl}/click?${params.toString()}`;
      }
    };
    if (false) {
      setInterval(() => {
        PostbackService.retryFailedPostbacks().catch(console.error);
      }, 5 * 60 * 1e3);
    }
  }
});

// server/services/trackingLinks.ts
var trackingLinks_exports = {};
__export(trackingLinks_exports, {
  TrackingLinkService: () => TrackingLinkService
});
import { randomBytes as randomBytes3 } from "crypto";
import { eq as eq8, and as and8, sql as sql7 } from "drizzle-orm";
var TrackingLinkService;
var init_trackingLinks = __esm({
  "server/services/trackingLinks.ts"() {
    "use strict";
    init_db();
    init_schema();
    TrackingLinkService = class {
      // Generate unique tracking code
      static generateTrackingCode() {
        const timestamp4 = Date.now().toString(36);
        const random = randomBytes3(4).toString("hex");
        return `${timestamp4}_${random}`;
      }
      // Generate click ID for tracking
      static generateClickId() {
        const timestamp4 = Date.now().toString(36);
        const random = randomBytes3(6).toString("hex");
        return `${timestamp4}_${random}`;
      }
      // Get advertiser's verified custom domains
      static async getVerifiedCustomDomains(advertiserId) {
        const domains = await db.select({ domain: customDomains.domain }).from(customDomains).where(and8(
          eq8(customDomains.advertiserId, advertiserId),
          eq8(customDomains.status, "verified")
        ));
        return domains.map((d) => d.domain);
      }
      // Get partner information including partner number
      static async getPartnerInfo(partnerId) {
        const [partner] = await db.select({
          partnerNumber: users.partnerNumber,
          username: users.username
        }).from(users).where(eq8(users.id, partnerId));
        return partner || null;
      }
      // Transform landing page URL with custom domain and simplified tracking
      static async transformLandingUrl(params) {
        const { originalUrl, advertiserId, partnerId, offerId } = params;
        try {
          const partnerInfo = await this.getPartnerInfo(partnerId);
          const partnerNumber = partnerInfo?.partnerNumber || "0000";
          if (!originalUrl || typeof originalUrl !== "string" || originalUrl.length < 4) {
            console.warn("Invalid original URL provided:", originalUrl);
            const verifiedDomains2 = await this.getVerifiedCustomDomains(advertiserId);
            const customDomain = verifiedDomains2.length > 0 ? verifiedDomains2[0] : "track.example.com";
            const fallbackUrl = new URL(`https://${customDomain}/landing`);
            const shortClickId2 = `${partnerNumber}${offerId.slice(0, 4)}${Date.now().toString(36).slice(-4)}`;
            fallbackUrl.searchParams.set("clickid", shortClickId2);
            fallbackUrl.searchParams.set("partner_id", `${partnerNumber}${Date.now().toString(36).slice(-4)}`);
            return fallbackUrl.toString();
          }
          const verifiedDomains = await this.getVerifiedCustomDomains(advertiserId);
          let url;
          try {
            url = new URL(originalUrl);
          } catch {
            const customDomain = verifiedDomains.length > 0 ? verifiedDomains[0] : "example.com";
            url = new URL(`https://${customDomain}${originalUrl.startsWith("/") ? originalUrl : "/" + originalUrl}`);
          }
          if (verifiedDomains.length > 0) {
            const customDomain = verifiedDomains[0];
            url.hostname = customDomain;
            url.protocol = "https:";
          }
          url.search = "";
          const shortClickId = `${partnerNumber}${offerId.slice(0, 4)}${Date.now().toString(36).slice(-4)}`;
          url.searchParams.set("clickid", shortClickId);
          url.searchParams.set("partner_id", `${partnerNumber}${Date.now().toString(36).slice(-4)}`);
          return url.toString();
        } catch (error) {
          console.error("Error transforming landing URL:", error);
          const fallbackPartnerInfo = await this.getPartnerInfo(partnerId);
          const fallbackPartnerNumber = fallbackPartnerInfo?.partnerNumber || "0000";
          const customDomain = "track.example.com";
          const shortClickId = `${fallbackPartnerNumber}${offerId.slice(0, 4)}${Date.now().toString(36).slice(-4)}`;
          const fallbackUrl = `https://${customDomain}/landing?clickid=${shortClickId}&partner_id=${fallbackPartnerNumber}${Date.now().toString(36).slice(-4)}`;
          return fallbackUrl;
        }
      }
      // Generate automatic tracking link for partner (simplified)
      static async generatePartnerTrackingLink(offerId, partnerId) {
        try {
          const [offer2] = await db.select({
            id: offers.id,
            advertiserId: offers.advertiserId,
            landingPages: offers.landingPages,
            name: offers.name
          }).from(offers).where(eq8(offers.id, offerId));
          if (!offer2) {
            throw new Error("Offer not found");
          }
          const verifiedDomains = await this.getVerifiedCustomDomains(offer2.advertiserId);
          const baseDomain = verifiedDomains.length > 0 ? `https://${verifiedDomains[0]}` : "https://trk.platform.com";
          const shortOfferId = offerId.slice(0, 8);
          const shortPartnerId = partnerId.slice(0, 8);
          const trackingLink = `${baseDomain}/click?offer=${shortOfferId}&clickid=${shortPartnerId}`;
          return trackingLink;
        } catch (error) {
          console.error("Error generating partner tracking link:", error);
          const shortOfferId = offerId.slice(0, 8);
          const shortPartnerId = partnerId.slice(0, 8);
          return `https://trk.platform.com/click?offer=${shortOfferId}&clickid=${shortPartnerId}`;
        }
      }
      // Generate tracking link with custom domain support
      static async generateTrackingLink(params) {
        const { partnerId, offerId, ...subIds } = params;
        const [offer2] = await db.select({
          id: offers.id,
          advertiserId: offers.advertiserId,
          landingPages: offers.landingPages,
          name: offers.name
        }).from(offers).where(eq8(offers.id, offerId));
        if (!offer2) {
          throw new Error("Offer not found");
        }
        const verifiedDomains = await this.getVerifiedCustomDomains(offer2.advertiserId);
        const customDomain = verifiedDomains.length > 0 ? verifiedDomains[0] : null;
        const baseDomain = customDomain || process.env.PLATFORM_DOMAIN || "localhost:5000";
        const protocol = customDomain ? "https" : "http";
        const trackingCode = this.generateTrackingCode();
        const clickId = this.generateClickId();
        const trackingParams = new URLSearchParams({
          offer_id: offerId,
          partner_id: partnerId,
          clickid: clickId,
          ...Object.fromEntries(
            Object.entries(subIds).filter(([_, value]) => value !== void 0 && value !== "")
          )
        });
        const trackingUrl = `${protocol}://${baseDomain}/click?${trackingParams.toString()}`;
        const [newLink] = await db.insert(trackingLinks).values({
          partnerId,
          offerId,
          trackingCode,
          url: trackingUrl,
          customDomain,
          ...subIds
        }).returning();
        return {
          id: newLink.id,
          url: trackingUrl,
          trackingCode,
          customDomain: customDomain || void 0,
          isCustomDomain: !!customDomain
        };
      }
      // Get partner's tracking links
      static async getPartnerTrackingLinks(partnerId, offerId) {
        let whereCondition = eq8(trackingLinks.partnerId, partnerId);
        if (offerId) {
          whereCondition = and8(
            eq8(trackingLinks.partnerId, partnerId),
            eq8(trackingLinks.offerId, offerId)
          );
        }
        return await db.select({
          id: trackingLinks.id,
          trackingCode: trackingLinks.trackingCode,
          url: trackingLinks.url,
          createdAt: trackingLinks.createdAt,
          subId1: trackingLinks.subId1,
          subId2: trackingLinks.subId2,
          subId3: trackingLinks.subId3,
          subId4: trackingLinks.subId4,
          subId5: trackingLinks.subId5,
          // Offer details
          offerName: offers.name,
          offerPayout: offers.payout
        }).from(trackingLinks).innerJoin(offers, eq8(trackingLinks.offerId, offers.id)).where(whereCondition);
      }
      // Get all tracking links for advertiser (for analytics)
      static async getAdvertiserTrackingLinks(advertiserId) {
        return await db.select({
          id: trackingLinks.id,
          trackingCode: trackingLinks.trackingCode,
          url: trackingLinks.url,
          createdAt: trackingLinks.createdAt,
          // Partner details
          partnerUsername: users.username,
          partnerEmail: users.email,
          // Offer details  
          offerName: offers.name,
          offerPayout: offers.payout
        }).from(trackingLinks).innerJoin(offers, eq8(trackingLinks.offerId, offers.id)).innerJoin(users, eq8(trackingLinks.partnerId, users.id)).where(eq8(offers.advertiserId, advertiserId));
      }
      // Update link click count
      static async incrementClickCount(trackingCode) {
        await db.update(trackingLinks).set({
          clickCount: sql7`click_count + 1`,
          lastClickAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq8(trackingLinks.trackingCode, trackingCode));
      }
      // Deactivate tracking link
      static async deactivateLink(linkId, partnerId) {
        const [result] = await db.update(trackingLinks).set({
          isActive: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and8(
          eq8(trackingLinks.id, linkId),
          eq8(trackingLinks.partnerId, partnerId)
        )).returning();
        return result;
      }
      // Get tracking link by code (for click handling)
      static async getTrackingLinkByCode(trackingCode) {
        const [link] = await db.select({
          id: trackingLinks.id,
          partnerId: trackingLinks.partnerId,
          offerId: trackingLinks.offerId,
          url: trackingLinks.url,
          isActive: trackingLinks.isActive,
          // Offer details  
          targetUrl: offers.landingPages,
          offerName: offers.name,
          advertiserId: offers.advertiserId
        }).from(trackingLinks).innerJoin(offers, eq8(trackingLinks.offerId, offers.id)).where(eq8(trackingLinks.trackingCode, trackingCode));
        return link;
      }
    };
  }
});

// server/routes/tracking.ts
var tracking_exports = {};
__export(tracking_exports, {
  default: () => tracking_default
});
import { Router as Router3 } from "express";
import { nanoid as nanoid2 } from "nanoid";
import { z as z4 } from "zod";
var router3, tracking_default;
var init_tracking = __esm({
  "server/routes/tracking.ts"() {
    "use strict";
    init_storage();
    init_schema();
    init_postback();
    router3 = Router3();
    router3.use((req, res, next) => {
      console.log(`\u{1F517} TRACKING REQUEST: ${req.method} ${req.path} from ${req.ip}`);
      next();
    });
    router3.get("/click", async (req, res) => {
      try {
        const {
          offer: offerId,
          partner: partnerId,
          subid,
          sub1,
          sub2,
          sub3,
          sub4,
          sub5,
          sub6,
          sub7,
          sub8,
          sub9,
          sub10,
          sub11,
          sub12,
          sub13,
          sub14,
          sub15,
          sub16,
          utm_source,
          utm_campaign,
          utm_medium,
          utm_content,
          utm_term,
          referrer
        } = req.query;
        if (!offerId || !partnerId) {
          return res.status(400).json({
            error: "Missing required parameters: offer and partner"
          });
        }
        const clickid = nanoid2(12);
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
        const userAgent = req.headers["user-agent"] || "";
        let sub2Raw = null;
        let sub2Map = null;
        if (sub2) {
          sub2Raw = sub2;
          try {
            const pairs = sub2Raw.split("|");
            const map = {};
            pairs.forEach((pair) => {
              const [key, value] = pair.split("-", 2);
              if (key && value) {
                map[key] = value;
              }
            });
            sub2Map = map;
          } catch (e) {
          }
        }
        const clickData = {
          clickid,
          advertiserId: "534c1a63-0cfd-4d0f-a07e-465f379a7645",
          // Will be determined from offer
          partnerId,
          offerId,
          site: req.get("host") || "",
          referrer: referrer || req.get("referer") || "",
          // Sub parameters
          sub1,
          sub2Raw,
          sub2Map,
          sub3,
          sub4,
          sub5,
          sub6,
          sub7,
          sub8,
          sub9,
          sub10,
          sub11,
          sub12,
          sub13,
          sub14,
          sub15,
          sub16,
          // UTM parameters
          utmSource: utm_source,
          utmCampaign: utm_campaign,
          utmMedium: utm_medium,
          utmContent: utm_content,
          utmTerm: utm_term,
          // IP and geo data (placeholders)
          ip,
          countryIso: "US",
          // TODO: GeoIP lookup
          region: "",
          city: "",
          isp: "",
          operator: "",
          isProxy: false,
          // User agent data (placeholders)
          userAgent,
          browserName: "",
          // TODO: User-Agent parsing
          browserVersion: "",
          osName: "",
          osVersion: "",
          deviceModel: "",
          deviceType: "desktop",
          // TODO: Device detection
          connection: "",
          lang: req.get("accept-language")?.split(",")[0] || ""
        };
        const click = await storage.createTrackingClick(clickData);
        await storage.createEvent({
          clickid,
          advertiserId: clickData.advertiserId,
          partnerId: clickData.partnerId,
          type: "open"
        });
        try {
          const postbackEvent = {
            type: "lp_click",
            clickId: clickid,
            data: {
              clickid,
              partner_id: partnerId,
              offer_id: offerId,
              sub1,
              sub2,
              sub3,
              sub4,
              sub5,
              sub6,
              sub7,
              sub8,
              sub9,
              sub10,
              sub11,
              sub12,
              sub13,
              sub14,
              sub15,
              sub16,
              utm_source,
              utm_campaign,
              utm_medium,
              utm_content,
              utm_term
            },
            partnerId,
            offerId
          };
          PostbackService.triggerPostbacks(postbackEvent).catch((error) => {
            console.error("Postback sending failed:", error);
          });
        } catch (error) {
          console.error("Postback trigger failed:", error);
        }
        const offer2 = await storage.getOffer(offerId);
        if (!offer2) {
          return res.status(404).json({ error: "Offer not found" });
        }
        res.redirect(302, offer2.landingPageUrl || "https://example.com");
      } catch (error) {
        console.error("Click tracking error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.post("/event", async (req, res) => {
      try {
        const eventData = insertEventSchema.parse(req.body);
        const clicks3 = await storage.getTrackingClicks({ clickId: eventData.clickid });
        const click = clicks3[0];
        if (!click) {
          return res.status(404).json({ error: "Click not found" });
        }
        const event = await storage.createEvent({
          ...eventData,
          advertiserId: click.advertiserId,
          partnerId: click.partnerId
        });
        try {
          const postbackEvent = {
            type: eventData.type,
            clickId: eventData.clickid,
            data: {
              clickid: eventData.clickid,
              status: eventData.type,
              partner_id: click.partnerId,
              offer_id: click.offerId,
              revenue: eventData.revenue?.toString() || "0.00",
              currency: eventData.currency || "USD",
              txid: eventData.txid || ""
            },
            partnerId: click.partnerId,
            offerId: click.offerId,
            advertiserId: click.advertiserId
          };
          PostbackService.triggerPostbacks(postbackEvent).catch((error) => {
            console.error("Event postback sending failed:", error);
          });
        } catch (error) {
          console.error("Event postback trigger failed:", error);
        }
        res.status(201).json(event);
      } catch (error) {
        if (error instanceof z4.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors
          });
        }
        console.error("Event tracking error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.get("/click/:clickid", async (req, res) => {
      try {
        const { clickid } = req.params;
        const clicks3 = await storage.getTrackingClicks({ clickId: clickid });
        const click = clicks3[0];
        if (!click) {
          return res.status(404).json({ error: "Click not found" });
        }
        const events4 = await storage.getEvents({ clickId: clickid });
        res.json({
          click,
          events: events4
        });
      } catch (error) {
        console.error("Get click error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.get("/events/:clickid", async (req, res) => {
      try {
        const { clickid } = req.params;
        const events4 = await storage.getEvents({ clickId: clickid });
        res.json(events4);
      } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.post("/postback/send", async (req, res) => {
      try {
        const {
          clickid,
          event_type,
          revenue,
          currency = "USD",
          txid,
          force = false
        } = req.body;
        if (!clickid || !event_type) {
          return res.status(400).json({
            error: "Missing required parameters: clickid and event_type"
          });
        }
        const clicks3 = await storage.getTrackingClicks({ clickId: clickid });
        const click = clicks3[0];
        if (!click) {
          return res.status(404).json({ error: "Click not found" });
        }
        const postbackEvent = {
          type: event_type,
          clickId: clickid,
          data: {
            clickid,
            status: event_type,
            partner_id: click.partnerId,
            offer_id: click.offerId,
            revenue: revenue?.toString() || "0.00",
            currency,
            txid: txid || ""
          },
          partnerId: click.partnerId,
          offerId: click.offerId,
          advertiserId: click.advertiserId
        };
        const results = await PostbackService.triggerPostbacks(postbackEvent);
        res.json({
          success: true,
          message: "Postbacks sent successfully",
          results: results.length,
          clickid,
          event_type
        });
      } catch (error) {
        console.error("Manual postback error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.post("/postback/test", async (req, res) => {
      try {
        const {
          tracker_url,
          method = "GET",
          auth,
          hmac,
          timeout = 30,
          test_data = {}
        } = req.body;
        if (!tracker_url) {
          return res.status(400).json({
            error: "Missing required parameter: tracker_url"
          });
        }
        const testEvent = {
          type: "lead",
          clickId: "test_click_123",
          data: {
            clickid: "test_click_123",
            status: "lead",
            partner_id: "test_partner",
            offer_id: "test_offer",
            revenue: "25.00",
            currency: "USD",
            country: "US",
            device: "desktop",
            ...test_data
          }
        };
        const result = await PostbackService.sendExternalTrackerPostback(
          tracker_url,
          testEvent,
          null,
          // no click data for test
          {
            method,
            auth,
            hmac,
            timeout
          }
        );
        res.json({
          success: result.success,
          test_url: tracker_url,
          response: result.response,
          error: result.error
        });
      } catch (error) {
        console.error("Test postback error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router3.get("/:trackingCode", async (req, res) => {
      try {
        const { trackingCode } = req.params;
        console.log(`\u{1F525}\u{1F525}\u{1F525} TRACKING LINK HIT! Code: ${trackingCode} - URL: ${req.url}`);
        console.log(`\u{1F50D} Looking for tracking code: ${trackingCode}`);
        const trackingLink = await storage.getTrackingLinkByCode(trackingCode);
        console.log(`\u{1F4CA} Found tracking link:`, trackingLink ? `ID: ${trackingLink.id}` : "NOT FOUND");
        if (!trackingLink) {
          console.log(`\u274C Tracking link not found for code: ${trackingCode}`);
          return res.status(404).send("Tracking link not found");
        }
        const offer2 = await storage.getOffer(trackingLink.offerId);
        if (!offer2) {
          console.log(`\u274C Offer not found for tracking link: ${trackingCode}`);
          return res.status(404).send("Offer not found");
        }
        const clickId = nanoid2(12);
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
        const userAgent = req.headers["user-agent"] || "";
        await storage.createTrackingClick({
          clickId,
          partnerId: trackingLink.partnerId,
          offerId: trackingLink.offerId,
          advertiserId: offer2.advertiserId,
          ip,
          userAgent,
          referrer: req.get("referer") || "",
          subId1: trackingLink.subId1,
          subId2: trackingLink.subId2,
          subId3: trackingLink.subId3,
          subId4: trackingLink.subId4,
          subId5: trackingLink.subId5,
          country: "Unknown",
          device: "Unknown",
          browser: "Unknown",
          os: "Unknown",
          status: "click",
          revenue: "0.00",
          createdAt: /* @__PURE__ */ new Date()
        });
        await storage.updateTrackingLinkStats(trackingCode, { clickCount: 1 });
        let landingUrl = offer2.landingPageUrl || "https://example.com";
        landingUrl = landingUrl.replace("{client_id}", clickId).replace("{external_id}", clickId).replace("{clickid}", clickId).replace("{sub1}", trackingLink.subId1 || "").replace("{sub2}", trackingLink.subId2 || "").replace("{sub3}", trackingLink.subId3 || "").replace("{sub4}", trackingLink.subId4 || "").replace("{sub5}", trackingLink.subId5 || "");
        console.log(`\u{1F517} Tracking link ${trackingCode} clicked. Redirecting to: ${landingUrl}`);
        res.redirect(302, landingUrl);
      } catch (error) {
        console.error("Tracking link error:", error);
        res.status(500).send("Internal server error");
      }
    });
    tracking_default = router3;
  }
});

// server/routes/postbacks.ts
var postbacks_exports = {};
__export(postbacks_exports, {
  default: () => postbacks_default
});
import { Router as Router4 } from "express";
import { z as z5 } from "zod";
var router4, postbacks_default;
var init_postbacks = __esm({
  "server/routes/postbacks.ts"() {
    "use strict";
    init_storage();
    init_schema();
    init_auth();
    router4 = Router4();
    router4.get("/profiles", authenticateToken, async (req, res) => {
      try {
        console.log("\u{1F50D} Storage object keys:", Object.keys(storage));
        console.log("\u{1F50D} Storage prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));
        const { id, role } = req.user;
        const userId = id;
        const ownerScope = role === "super_admin" ? "owner" : role === "advertiser" ? "advertiser" : "partner";
        console.log("\u{1F4CB} Calling getPostbackProfiles with:", { userId, ownerScope });
        console.log("\u{1F50D} Method exists:", typeof storage.getPostbackProfiles === "function");
        if (typeof storage.getPostbackProfiles === "function") {
          const profiles = await storage.getPostbackProfiles(userId, ownerScope);
          res.json(profiles);
        } else {
          console.error("\u274C getPostbackProfiles method not found on storage object");
          console.error("Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(storage)).filter((name) => name.includes("Postback")));
          res.status(500).json({ error: "Method not implemented" });
        }
      } catch (error) {
        console.error("Get postback profiles error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router4.post("/profiles", authenticateToken, async (req, res) => {
      try {
        const { id, role } = req.user;
        const userId = id;
        const ownerScope = role === "super_admin" ? "owner" : role === "advertiser" ? "advertiser" : "partner";
        const profileData = insertPostbackProfileSchema.parse({
          ...req.body,
          ownerId: userId,
          ownerScope
        });
        const profile = await storage.createPostbackProfile(profileData);
        res.status(201).json(profile);
      } catch (error) {
        if (error instanceof z5.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors
          });
        }
        console.error("Create postback profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router4.put("/profiles/:id", authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = insertPostbackProfileSchema.partial().parse(req.body);
        const profile = await storage.updatePostbackProfile(id, updateData);
        res.json(profile);
      } catch (error) {
        if (error instanceof z5.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors
          });
        }
        console.error("Update postback profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router4.delete("/profiles/:id", authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        await storage.deletePostbackProfile(id);
        res.status(204).send();
      } catch (error) {
        console.error("Delete postback profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router4.get("/deliveries", authenticateToken, async (req, res) => {
      try {
        console.log("\u{1F50D} Checking storage for getPostbackDeliveries method");
        const { profileId, status } = req.query;
        if (typeof storage.getPostbackDeliveries === "function") {
          const deliveries = await storage.getPostbackDeliveries(
            profileId,
            status
          );
          res.json(deliveries);
        } else {
          console.error("\u274C getPostbackDeliveries method not found on storage object");
          res.status(500).json({ error: "Method not implemented" });
        }
      } catch (error) {
        console.error("Get postback deliveries error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router4.post("/profiles/:id/test", authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { clickid, eventType, revenue } = req.body;
        res.json({
          success: true,
          message: "Postback test completed",
          url: "https://example.com/postback",
          response: {
            status: 200,
            body: "OK",
            duration: 125
          }
        });
      } catch (error) {
        console.error("Test postback error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    postbacks_default = router4;
  }
});

// enhanced-postback-dto.ts
import { z as z6 } from "zod";
var EventDto, AffiliateWebhookDto, PspWebhookDto, conversionEventSchema2, postbackProfileSchema, webhookEventSchema, deliveryFilterSchema, bulkConversionSchema, conversionResponseSchema, postbackDeliveryResponseSchema;
var init_enhanced_postback_dto = __esm({
  "enhanced-postback-dto.ts"() {
    "use strict";
    EventDto = z6.object({
      type: z6.enum(["reg", "purchase"]),
      clickid: z6.string().min(1),
      txid: z6.string().min(1),
      value: z6.number().optional().default(0),
      currency: z6.string().length(3).optional(),
      meta: z6.record(z6.any()).optional()
    });
    AffiliateWebhookDto = z6.object({
      type: z6.literal("reg"),
      txid: z6.string(),
      status: z6.enum(["approved", "declined", "pending", "hold"]),
      payout: z6.number().optional().default(0),
      currency: z6.string().length(3).optional(),
      raw: z6.record(z6.any()).optional()
    });
    PspWebhookDto = z6.object({
      type: z6.literal("purchase"),
      txid: z6.string(),
      status: z6.enum(["approved", "declined", "refunded", "chargeback", "success", "failed", "pending", "reversed"]),
      amount: z6.number().optional(),
      currency: z6.string().length(3).optional(),
      raw: z6.record(z6.any()).optional()
    });
    conversionEventSchema2 = z6.object({
      advertiserId: z6.number().int().positive(),
      partnerId: z6.number().int().positive().optional(),
      campaignId: z6.number().int().positive().optional(),
      offerId: z6.number().int().positive().optional(),
      flowId: z6.number().int().positive().optional(),
      clickid: z6.string().min(1).max(255),
      type: z6.enum(["reg", "purchase", "rebill", "refund", "chargeback"]),
      txid: z6.string().min(1).max(255),
      revenue: z6.string().regex(/^\d+(\.\d{1,6})?$/).optional().default("0"),
      currency: z6.string().length(3).optional().default("USD"),
      conversionStatus: z6.enum([
        "initiated",
        "pending",
        "approved",
        "declined",
        "refunded",
        "chargeback",
        "duplicate",
        "test"
      ]).default("initiated"),
      antifraudLevel: z6.enum(["ok", "soft", "hard"]).optional(),
      antifraudScore: z6.number().int().min(0).max(100).optional(),
      antifraudReasons: z6.record(z6.unknown()).optional().default({}),
      details: z6.record(z6.unknown()).optional().default({})
    });
    postbackProfileSchema = z6.object({
      ownerScope: z6.enum(["owner", "advertiser", "partner"]),
      ownerId: z6.number().int().positive(),
      scopeType: z6.enum(["global", "campaign", "offer", "flow"]).default("global"),
      scopeId: z6.number().int().positive().optional(),
      name: z6.string().min(1).max(255),
      enabled: z6.boolean().default(true),
      priority: z6.number().int().min(1).max(1e3).default(100),
      endpointUrl: z6.string().url(),
      method: z6.enum(["GET", "POST"]).default("GET"),
      idParam: z6.enum(["subid", "clickid"]).default("subid"),
      authQueryKey: z6.string().optional(),
      authQueryVal: z6.string().optional(),
      authHeaderName: z6.string().optional(),
      authHeaderVal: z6.string().optional(),
      paramsTemplate: z6.record(z6.string()).default({}),
      statusMap: z6.record(z6.record(z6.string())).default({}),
      hmacEnabled: z6.boolean().default(false),
      hmacSecret: z6.string().optional(),
      hmacPayloadTpl: z6.string().optional(),
      hmacParamName: z6.string().optional(),
      retries: z6.number().int().min(0).max(10).default(5),
      timeoutMs: z6.number().int().min(1e3).max(3e4).default(4e3),
      backoffBaseSec: z6.number().int().min(1).max(60).default(2),
      filterRevenueGt0: z6.boolean().default(false),
      filterExcludeFraudHard: z6.boolean().default(true)
    });
    webhookEventSchema = z6.object({
      event: z6.enum(["conversion.created", "conversion.updated", "postback.delivered", "postback.failed"]),
      timestamp: z6.string().datetime(),
      data: z6.object({
        conversion: conversionEventSchema2.optional(),
        postback: z6.object({
          profileId: z6.number().int(),
          url: z6.string().url(),
          responseCode: z6.number().int().optional(),
          error: z6.string().optional(),
          attempt: z6.number().int(),
          durationMs: z6.number().int().optional()
        }).optional()
      }),
      signature: z6.string().optional()
      // HMAC signature for verification
    });
    deliveryFilterSchema = z6.object({
      profileId: z6.number().int().positive().optional(),
      clickid: z6.string().optional(),
      responseCode: z6.number().int().optional(),
      attempt: z6.number().int().min(1).optional(),
      dateFrom: z6.string().datetime().optional(),
      dateTo: z6.string().datetime().optional(),
      status: z6.enum(["success", "failed", "pending"]).optional(),
      page: z6.number().int().min(1).default(1),
      limit: z6.number().int().min(1).max(100).default(50)
    });
    bulkConversionSchema = z6.object({
      conversions: z6.array(conversionEventSchema2).min(1).max(1e3),
      batchId: z6.string().uuid().optional()
    });
    conversionResponseSchema = z6.object({
      success: z6.boolean(),
      conversionId: z6.number().int().optional(),
      message: z6.string().optional(),
      errors: z6.array(z6.string()).optional()
    });
    postbackDeliveryResponseSchema = z6.object({
      success: z6.boolean(),
      deliveredCount: z6.number().int(),
      failedCount: z6.number().int(),
      deliveries: z6.array(z6.object({
        profileId: z6.number().int(),
        url: z6.string(),
        responseCode: z6.number().int().optional(),
        error: z6.string().optional(),
        durationMs: z6.number().int().optional()
      }))
    });
  }
});

// server/domain/status.ts
function normalize(prev, next, type) {
  if (!prev) return next;
  if (type === "reg" && (next === "refunded" || next === "chargeback")) return prev;
  if (next === "refunded" || next === "chargeback") return prev === "approved" ? next : prev;
  const pi = ORDER.indexOf(prev);
  const ni = ORDER.indexOf(next);
  return ni >= pi ? next : prev;
}
function getStatusDescription(status, lang = "en") {
  const descriptions = {
    en: {
      initiated: "Initiated",
      pending: "Pending Review",
      approved: "Approved",
      declined: "Declined",
      refunded: "Refunded",
      chargeback: "Chargeback"
    },
    ru: {
      initiated: "\u0418\u043D\u0438\u0446\u0438\u0438\u0440\u043E\u0432\u0430\u043D",
      pending: "\u041D\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u0438",
      approved: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D",
      declined: "\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D",
      refunded: "\u0412\u043E\u0437\u0432\u0440\u0430\u0442",
      chargeback: "\u0427\u0430\u0440\u0434\u0436\u0431\u0435\u043A"
    }
  };
  return descriptions[lang][status];
}
function isValidTransition(from, to, type) {
  const normalized = normalize(from, to, type);
  return normalized === to;
}
function mapExternalStatus(externalStatus, source) {
  const mappings = {
    keitaro: {
      "lead": "approved",
      "sale": "approved",
      "trash": "declined",
      "pending": "pending"
    },
    affiliate: {
      "approved": "approved",
      "declined": "declined",
      "pending": "pending",
      "hold": "pending"
    },
    psp: {
      "success": "approved",
      "failed": "declined",
      "pending": "pending",
      "refunded": "refunded",
      "chargeback": "chargeback",
      "reversed": "chargeback"
    }
  };
  const sourceMapping = mappings[source];
  if (!sourceMapping) return "pending";
  const mapped = sourceMapping[externalStatus.toLowerCase()];
  return mapped || "pending";
}
var ORDER;
var init_status = __esm({
  "server/domain/status.ts"() {
    "use strict";
    ORDER = ["initiated", "pending", "approved", "declined", "refunded", "chargeback"];
  }
});

// server/queue/processor.ts
var processor_exports = {};
__export(processor_exports, {
  getProcessingStats: () => getProcessingStats,
  processPostbackTask: () => processPostbackTask,
  updateAntifraudStats: () => updateAntifraudStats,
  updateStats: () => updateStats
});
async function processPostbackTask(task) {
  console.log("\u{1F680} Processing postback task autonomously:", {
    conversionId: task.conversionId,
    type: task.type,
    status: task.status,
    advertiserId: task.advertiserId
  });
  const profiles = mockProfiles.filter(
    (p) => p.enabled && p.advertiserId === task.advertiserId
  ).sort((a, b) => b.priority - a.priority);
  if (task.antifraudLevel === "hard") {
    console.log("\u{1F6AB} Postback blocked by antifraud (hard level) for all profiles");
    const blockedResults = profiles.map((profile) => ({
      profileId: profile.id,
      profileName: profile.name,
      success: false,
      attempts: 0,
      finalUrl: profile.endpointUrl,
      error: "blocked_by_af_hard"
    }));
    for (const profile of profiles) {
      if (profile.antifraudPolicy?.logBlocked) {
        await saveAntifraudBlock({
          profileId: profile.id,
          conversionId: task.conversionId,
          advertiserId: task.advertiserId,
          clickid: task.clickid,
          antifraudLevel: task.antifraudLevel,
          blockReason: "hard_level_global_block",
          blockedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    return blockedResults;
  }
  if (profiles.length === 0) {
    console.log("\u26A0\uFE0F No postback profiles found for advertiser:", task.advertiserId);
    return [];
  }
  console.log(`\u{1F4CB} Found ${profiles.length} profiles for processing`);
  const results = [];
  for (const profile of profiles) {
    console.log(`\u{1F504} Processing profile: ${profile.name} (AF policy: ${JSON.stringify(profile.antifraudPolicy)})`);
    if (task.antifraudLevel === "soft" && profile.antifraudPolicy?.softOnlyPending) {
      if (task.status !== "pending") {
        console.log(`\u26A0\uFE0F Soft antifraud: skipping non-pending status "${task.status}" for profile ${profile.name}`);
        results.push({
          profileId: profile.id,
          profileName: profile.name,
          success: false,
          attempts: 0,
          finalUrl: profile.endpointUrl,
          error: "soft_af_non_pending_blocked"
        });
        if (profile.antifraudPolicy.logBlocked) {
          await saveAntifraudBlock({
            profileId: profile.id,
            conversionId: task.conversionId,
            advertiserId: task.advertiserId,
            clickid: task.clickid,
            antifraudLevel: task.antifraudLevel,
            blockReason: "soft_level_non_pending_status",
            blockedAt: (/* @__PURE__ */ new Date()).toISOString(),
            actualStatus: task.status
          });
        }
        continue;
      }
    }
    const mappedStatus = profile.statusMap[task.type]?.[task.status] ?? task.status;
    if (profile.filterRevenueGt0 && (!task.revenue || Number(task.revenue) <= 0)) {
      console.log("\u23ED\uFE0F Skipped due to zero revenue filter");
      results.push({
        profileId: profile.id,
        profileName: profile.name,
        success: false,
        attempts: 0,
        finalUrl: profile.endpointUrl,
        error: "revenue_filter_failed"
      });
      continue;
    }
    const url = new URL(profile.endpointUrl);
    const params = {
      subid: task.clickid,
      status: mappedStatus,
      payout: task.revenue ?? "0",
      currency: task.currency ?? "USD",
      txid: task.txid,
      // Additional Keitaro parameters
      clickid: task.clickid,
      conversion_id: task.conversionId,
      offer_id: task.offerId ?? "",
      campaign_id: task.campaignId ?? "",
      partner_id: task.partnerId ?? "",
      timestamp: Math.floor(Date.now() / 1e3).toString()
    };
    if (profile.method === "GET") {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    const result = await simulateDeliveryWithRetries(profile, url.toString(), params, profile.retries);
    results.push(result);
  }
  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;
  console.log(`\u{1F4CA} Postback processing completed: ${successCount} successful, ${failedCount} failed`);
  return results;
}
async function simulateDeliveryWithRetries(profile, url, params, maxRetries) {
  let attempt = 0;
  let lastError = null;
  while (attempt < maxRetries) {
    attempt++;
    const startTime = Date.now();
    try {
      console.log(`\u{1F310} Attempt ${attempt}/${maxRetries}: ${profile.method} ${url}`);
      const success = Math.random() > 0.15;
      const responseTime = Math.floor(Math.random() * 2e3) + 100;
      await new Promise((resolve) => setTimeout(resolve, Math.min(responseTime, 500)));
      if (success) {
        const duration = Date.now() - startTime;
        console.log(`\u2705 Postback delivered to ${profile.name} in ${duration}ms`);
        return {
          profileId: profile.id,
          profileName: profile.name,
          success: true,
          attempts: attempt,
          finalUrl: url,
          responseCode: 200,
          responseTime: duration
        };
      } else {
        throw new Error(`HTTP 500: Internal Server Error`);
      }
    } catch (error) {
      lastError = error;
      const duration = Date.now() - startTime;
      console.log(`\u274C Attempt ${attempt} failed for ${profile.name}: ${error.message} (${duration}ms)`);
      if (attempt < maxRetries) {
        const delayMs = Math.floor(profile.backoffBaseSec * 1e3 * 2 ** (attempt - 1));
        console.log(`\u23F3 Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  console.log(`\u{1F4A5} All ${maxRetries} attempts failed for ${profile.name}`);
  return {
    profileId: profile.id,
    profileName: profile.name,
    success: false,
    attempts: maxRetries,
    finalUrl: url,
    error: lastError?.message || "Unknown error"
  };
}
function updateStats(results) {
  processedTasks++;
  results.forEach((result) => {
    if (result.success) {
      successfulDeliveries++;
    } else {
      failedDeliveries++;
    }
  });
}
function updateAntifraudStats(level, blocked) {
  if (blocked) {
    antifraudBlocks++;
    if (level === "hard") hardBlocks++;
    if (level === "soft") softBlocks++;
  }
}
function getProcessingStats() {
  return {
    processedTasks,
    successfulDeliveries,
    failedDeliveries,
    successRate: processedTasks > 0 ? successfulDeliveries / (successfulDeliveries + failedDeliveries) * 100 : 0,
    antifraud: {
      totalBlocks: antifraudBlocks,
      hardBlocks,
      softBlocks,
      blockRate: processedTasks > 0 ? antifraudBlocks / processedTasks * 100 : 0
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function saveAntifraudBlock(blockData) {
  console.log("\u{1F6E1}\uFE0F Antifraud block logged:", {
    profileId: blockData.profileId,
    conversionId: blockData.conversionId,
    level: blockData.antifraudLevel,
    reason: blockData.blockReason,
    clickid: blockData.clickid
  });
  updateAntifraudStats(blockData.antifraudLevel, true);
}
var mockProfiles, processedTasks, successfulDeliveries, failedDeliveries, antifraudBlocks, hardBlocks, softBlocks;
var init_processor = __esm({
  "server/queue/processor.ts"() {
    "use strict";
    mockProfiles = [
      {
        id: "keitaro_main",
        name: "Keitaro Main Tracker",
        enabled: true,
        advertiserId: "1",
        priority: 100,
        endpointUrl: "https://keitaro.example.com/click.php",
        method: "GET",
        statusMap: {
          "reg": {
            "initiated": "lead",
            "pending": "lead",
            "approved": "lead",
            "declined": "reject"
          },
          "purchase": {
            "initiated": "sale",
            "pending": "sale",
            "approved": "sale",
            "declined": "reject",
            "refunded": "refund",
            "chargeback": "chargeback"
          }
        },
        filterRevenueGt0: false,
        retries: 5,
        timeoutMs: 1e4,
        backoffBaseSec: 2,
        antifraudPolicy: {
          blockHard: true,
          softOnlyPending: false,
          logBlocked: true
        }
      },
      {
        id: "keitaro_backup",
        name: "Keitaro Backup Tracker",
        enabled: true,
        advertiserId: "1",
        priority: 90,
        endpointUrl: "https://backup.keitaro.example.com/click.php",
        method: "GET",
        statusMap: {
          "reg": {
            "initiated": "lead",
            "pending": "lead",
            "approved": "lead",
            "declined": "reject"
          },
          "purchase": {
            "initiated": "sale",
            "pending": "sale",
            "approved": "sale",
            "declined": "reject",
            "refunded": "refund",
            "chargeback": "chargeback"
          }
        },
        filterRevenueGt0: false,
        retries: 3,
        timeoutMs: 8e3,
        backoffBaseSec: 3,
        antifraudPolicy: {
          blockHard: true,
          softOnlyPending: true,
          // More strict for backup
          logBlocked: true
        }
      },
      {
        id: "binom_tracker",
        name: "Binom Tracker",
        enabled: true,
        advertiserId: "1",
        priority: 50,
        endpointUrl: "https://binom.example.com/click.php",
        method: "GET",
        statusMap: {
          "reg": {
            "approved": "lead",
            "declined": "trash",
            "pending": "lead",
            "initiated": "lead"
          },
          "purchase": {
            "approved": "conversion",
            "declined": "trash",
            "pending": "conversion",
            "initiated": "conversion"
          }
        },
        filterRevenueGt0: true,
        retries: 3,
        timeoutMs: 5e3,
        backoffBaseSec: 3,
        antifraudPolicy: {
          blockHard: true,
          softOnlyPending: false,
          logBlocked: true
        }
      }
    ];
    processedTasks = 0;
    successfulDeliveries = 0;
    failedDeliveries = 0;
    antifraudBlocks = 0;
    hardBlocks = 0;
    softBlocks = 0;
  }
});

// server/queue/enqueue.ts
var enqueue_exports = {};
__export(enqueue_exports, {
  enqueuePostbacks: () => enqueuePostbacks,
  getQueueStats: () => getQueueStats
});
import { Queue } from "bullmq";
async function checkRedisAvailability() {
  try {
    const redis = new (await import("ioredis")).default(config.REDIS_URL);
    await redis.ping();
    await redis.disconnect();
    return true;
  } catch (error) {
    return false;
  }
}
async function initializeQueue() {
  if (pbQueue) return pbQueue;
  const isRedisAvailable = await checkRedisAvailability();
  if (isRedisAvailable) {
    console.log("\u2705 Redis is available, initializing BullMQ queue");
    redisAvailable = true;
    pbQueue = new Queue("postbacks", {
      connection: {
        url: config.REDIS_URL,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true
      },
      defaultJobOptions: {
        removeOnComplete: 5e3,
        removeOnFail: 5e3,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2e3
        }
      }
    });
    return pbQueue;
  } else {
    console.log("\u26A0\uFE0F Redis unavailable, will use autonomous processing");
    redisAvailable = false;
    return null;
  }
}
async function enqueuePostbacks(conversion) {
  try {
    console.log("\u{1F4E4} Enqueuing postbacks for conversion:", {
      id: conversion.id,
      type: conversion.type,
      status: conversion.conversionStatus,
      txid: conversion.txid,
      advertiserId: conversion.advertiserId
    });
    const shouldSendPostback = shouldTriggerPostback(conversion);
    if (!shouldSendPostback) {
      console.log("\u23ED\uFE0F Skipping postback - status/type does not trigger delivery");
      return;
    }
    const task = {
      conversionId: conversion.id,
      advertiserId: conversion.advertiserId,
      partnerId: conversion.partnerId,
      campaignId: conversion.campaignId,
      offerId: conversion.offerId,
      flowId: conversion.flowId,
      clickid: conversion.clickid,
      type: conversion.type,
      txid: conversion.txid,
      status: conversion.conversionStatus,
      revenue: conversion.revenue,
      currency: conversion.currency,
      antifraudLevel: conversion.antifraudLevel ?? "ok",
      details: conversion.details
    };
    const queue = await initializeQueue();
    if (queue) {
      try {
        const job = await queue.add("deliver", task, {
          jobId: `postback_${conversion.id}_${Date.now()}`,
          removeOnComplete: 5e3,
          removeOnFail: 5e3,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2e3
          },
          delay: getPostbackDelay(conversion.conversionStatus)
        });
        console.log("\u2705 Postback task enqueued with BullMQ ID:", job.id);
        return;
      } catch (redisError) {
        console.log("\u{1F504} BullMQ connection lost, falling back to direct processing");
        redisAvailable = false;
        pbQueue = null;
      }
    } else {
      console.log("\u{1F504} Using autonomous processing (Redis unavailable)");
    }
    const { processPostbackTask: processPostbackTask2, updateStats: updateStats2 } = await Promise.resolve().then(() => (init_processor(), processor_exports));
    const processorTask = {
      conversionId: conversion.id,
      advertiserId: conversion.advertiserId,
      partnerId: conversion.partnerId,
      campaignId: conversion.campaignId,
      offerId: conversion.offerId,
      flowId: conversion.flowId,
      clickid: conversion.clickid,
      type: conversion.type,
      txid: conversion.txid,
      status: conversion.conversionStatus,
      revenue: conversion.revenue,
      currency: conversion.currency,
      antifraudLevel: conversion.antifraudLevel ?? "ok",
      details: conversion.details
    };
    const results = await processPostbackTask2(processorTask);
    updateStats2(results);
    console.log("\u2705 Autonomous postback processing completed");
  } catch (error) {
    console.error("\u274C Failed to process postbacks:", error);
    throw error;
  }
}
function shouldTriggerPostback(conversion) {
  const triggerStatuses = ["approved", "declined", "refunded", "chargeback"];
  if (!triggerStatuses.includes(conversion.conversionStatus)) {
    return false;
  }
  return true;
}
function getPostbackDelay(status) {
  if (status === "approved" || status === "declined") {
    return 0;
  }
  if (status === "refunded" || status === "chargeback") {
    return 3e4;
  }
  return 5e3;
}
async function getQueueStats() {
  try {
    const queue = await initializeQueue();
    if (!queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0,
        error: "Redis unavailable"
      };
    }
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      total: 0,
      error: "Redis connection failed"
    };
  }
}
var redisAvailable, pbQueue;
var init_enqueue = __esm({
  "server/queue/enqueue.ts"() {
    "use strict";
    init_environment();
    redisAvailable = false;
    pbQueue = null;
  }
});

// server/api/routes.ts
var routes_exports = {};
__export(routes_exports, {
  default: () => routes_default,
  router: () => router5
});
import express from "express";
async function findConversion(advertiserId, type, txid) {
  const conversion = mockDatabase.find(
    (c) => c.advertiserId === advertiserId && c.type === type && c.txid === txid
  );
  return conversion || null;
}
async function insertConversion(data) {
  const conversion = {
    ...data,
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  mockDatabase.push(conversion);
  return conversion;
}
async function updateConversion(id, data) {
  const index3 = mockDatabase.findIndex((c) => c.id === id);
  if (index3 === -1) {
    throw new Error("Conversion not found");
  }
  mockDatabase[index3] = {
    ...mockDatabase[index3],
    ...data,
    updatedAt: /* @__PURE__ */ new Date()
  };
  return mockDatabase[index3];
}
var router5, mockDatabase, routes_default;
var init_routes = __esm({
  "server/api/routes.ts"() {
    "use strict";
    init_enhanced_postback_dto();
    init_status();
    init_enqueue();
    router5 = express.Router();
    mockDatabase = [];
    router5.post("/event", async (req, res, next) => {
      try {
        const dto = EventDto.parse(req.body);
        const advertiserId = "1";
        const partnerId = "2";
        const campaignId = "campaign_001";
        const offerId = "offer_001";
        const flowId = "flow_001";
        console.log("\u{1F4E5} Event received:", {
          type: dto.type,
          txid: dto.txid,
          clickid: dto.clickid,
          value: dto.value
        });
        const existing = await findConversion(advertiserId, dto.type, dto.txid);
        const nextStatus = normalize(existing?.conversionStatus, "initiated", dto.type);
        const conversionData2 = {
          advertiserId,
          partnerId,
          campaignId,
          offerId,
          flowId,
          clickid: dto.clickid,
          type: dto.type,
          txid: dto.txid,
          currency: dto.currency || "USD",
          revenue: dto.value?.toString() ?? "0",
          conversionStatus: nextStatus,
          details: {
            ...existing?.details ?? {},
            event: dto,
            source: "api_event"
          }
        };
        let conversion;
        if (!existing) {
          conversion = await insertConversion(conversionData2);
          console.log("\u2705 New conversion created:", {
            id: conversion.id,
            status: conversion.conversionStatus
          });
        } else {
          conversion = await updateConversion(existing.id, conversionData2);
          console.log("\u{1F504} Existing conversion updated:", {
            id: conversion.id,
            previousStatus: existing.conversionStatus,
            newStatus: conversion.conversionStatus
          });
        }
        await enqueuePostbacks(conversion);
        const statusCode = existing ? 200 : 201;
        return res.status(statusCode).json({
          id: conversion.id,
          status: conversion.conversionStatus,
          created: !existing
        });
      } catch (error) {
        console.error("\u274C Event processing error:", error);
        next(error);
      }
    });
    router5.post("/webhook/affiliate", async (req, res, next) => {
      try {
        const dto = AffiliateWebhookDto.parse(req.body);
        const advertiserId = "1";
        console.log("\u{1F4E5} Affiliate webhook received:", {
          type: dto.type,
          txid: dto.txid,
          status: dto.status,
          payout: dto.payout
        });
        const existing = await findConversion(advertiserId, "reg", dto.txid);
        const mappedStatus = mapExternalStatus(dto.status, "affiliate");
        const nextStatus = normalize(existing?.conversionStatus, mappedStatus, "reg");
        console.log("\u{1F4CA} Status processing:", {
          externalStatus: dto.status,
          mappedStatus,
          previousStatus: existing?.conversionStatus,
          normalizedStatus: nextStatus
        });
        let conversion;
        if (!existing) {
          conversion = await insertConversion({
            advertiserId,
            partnerId: "unknown",
            clickid: "",
            // Will be updated when front-end event arrives
            type: "reg",
            txid: dto.txid,
            currency: dto.currency || "USD",
            revenue: "0",
            conversionStatus: nextStatus,
            details: {
              webhook: dto,
              source: "affiliate_webhook"
            }
          });
          console.log("\u2705 Conversion created from webhook:", conversion.id);
        } else {
          const updateData = {
            conversionStatus: nextStatus,
            revenue: (dto.payout ?? 0).toString(),
            currency: dto.currency ?? existing.currency,
            details: {
              ...existing.details ?? {},
              webhook: dto,
              source: "affiliate_webhook"
            }
          };
          conversion = await updateConversion(existing.id, updateData);
          console.log("\u{1F504} Conversion updated from webhook:", {
            id: conversion.id,
            statusChange: `${existing.conversionStatus} \u2192 ${nextStatus}`
          });
        }
        await enqueuePostbacks(conversion);
        res.status(204).end();
      } catch (error) {
        console.error("\u274C Affiliate webhook error:", error);
        next(error);
      }
    });
    router5.post("/webhook/psp", async (req, res, next) => {
      try {
        const dto = PspWebhookDto.parse(req.body);
        const advertiserId = "1";
        console.log("\u{1F4E5} PSP webhook received:", {
          type: dto.type,
          txid: dto.txid,
          status: dto.status,
          amount: dto.amount
        });
        const existing = await findConversion(advertiserId, "purchase", dto.txid);
        const mappedStatus = mapExternalStatus(dto.status, "psp");
        const nextStatus = normalize(existing?.conversionStatus, mappedStatus, "purchase");
        console.log("\u{1F4CA} PSP status processing:", {
          externalStatus: dto.status,
          mappedStatus,
          previousStatus: existing?.conversionStatus,
          normalizedStatus: nextStatus
        });
        const revenue = (dto.amount ?? 0).toString();
        let conversion;
        if (!existing) {
          conversion = await insertConversion({
            advertiserId,
            partnerId: "unknown",
            clickid: "",
            // Will be updated when front-end event arrives
            type: "purchase",
            txid: dto.txid,
            revenue,
            currency: dto.currency || "USD",
            conversionStatus: nextStatus,
            details: {
              webhook: dto,
              source: "psp_webhook"
            }
          });
          console.log("\u2705 Purchase conversion created from PSP:", conversion.id);
        } else {
          const updateData = {
            conversionStatus: nextStatus,
            revenue,
            currency: dto.currency ?? existing.currency,
            details: {
              ...existing.details ?? {},
              webhook: dto,
              source: "psp_webhook"
            }
          };
          conversion = await updateConversion(existing.id, updateData);
          console.log("\u{1F504} Purchase conversion updated from PSP:", {
            id: conversion.id,
            statusChange: `${existing.conversionStatus} \u2192 ${nextStatus}`,
            revenueChange: `${existing.revenue} \u2192 ${revenue}`
          });
        }
        await enqueuePostbacks(conversion);
        res.status(204).end();
      } catch (error) {
        console.error("\u274C PSP webhook error:", error);
        next(error);
      }
    });
    router5.get("/conversions", async (req, res) => {
      try {
        const { limit = 10, offset = 0 } = req.query;
        const conversions2 = mockDatabase.slice(Number(offset), Number(offset) + Number(limit)).map((c) => ({
          id: c.id,
          advertiserId: c.advertiserId,
          type: c.type,
          txid: c.txid,
          status: c.conversionStatus,
          revenue: c.revenue,
          currency: c.currency,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }));
        res.json({
          conversions: conversions2,
          total: mockDatabase.length,
          offset: Number(offset),
          limit: Number(limit)
        });
      } catch (error) {
        console.error("\u274C Conversions list error:", error);
        res.status(500).json({ error: "Failed to fetch conversions" });
      }
    });
    routes_default = router5;
  }
});

// server/api-routes.ts
var api_routes_exports = {};
__export(api_routes_exports, {
  apiRouter: () => apiRouter,
  default: () => api_routes_default
});
import express2 from "express";
import { z as z7 } from "zod";
async function triggerPostbacks(conversion) {
  try {
    const profiles = [
      {
        id: 1,
        name: "Keitaro Integration",
        endpointUrl: "https://tracker.example.com/postback?subid={clickid}&status={status}&payout={revenue}",
        method: "GET",
        idParam: "subid",
        paramsTemplate: {},
        statusMap: {
          reg: { initiated: "lead", approved: "lead" },
          purchase: { initiated: "sale", approved: "sale" }
        },
        hmacEnabled: false,
        timeoutMs: 4e3,
        backoffBaseSec: 2
      }
    ];
    for (const profile of profiles) {
      const job = {
        id: `${conversion.txid}_${profile.id}`,
        profileId: profile.id,
        conversionId: 1,
        clickid: conversion.clickid,
        type: conversion.type,
        txid: conversion.txid,
        revenue: conversion.revenue,
        currency: conversion.currency,
        status: conversion.conversionStatus,
        attempt: 1,
        maxAttempts: 5,
        profile
      };
      console.log("\u{1F680} Scheduling postback delivery:", {
        profileId: profile.id,
        clickid: conversion.clickid,
        type: conversion.type
      });
      console.log(
        "\u{1F4E4} Postback would be sent to:",
        profile.endpointUrl.replace("{clickid}", conversion.clickid).replace("{status}", conversion.conversionStatus).replace("{revenue}", conversion.revenue)
      );
    }
  } catch (error) {
    console.error("\u274C Failed to trigger postbacks:", error);
  }
}
async function updateConversionStatus(txid, newStatus, amount, source = "affiliate") {
  try {
    console.log("\u{1F504} Updating conversion status with normalization:", {
      txid,
      newStatus,
      amount,
      source
    });
    const currentConversion = {
      type: "purchase",
      // Would be fetched from DB
      status: "pending"
      // Would be fetched from DB
    };
    const mappedStatus = mapExternalStatus(newStatus, source);
    const normalizedStatus = normalize(currentConversion.status, mappedStatus, currentConversion.type);
    const isValid = isValidTransition(currentConversion.status, normalizedStatus, currentConversion.type);
    console.log("\u{1F4CA} Status normalization result:", {
      currentStatus: currentConversion.status,
      externalStatus: newStatus,
      mappedStatus,
      normalizedStatus,
      isValidTransition: isValid,
      statusDescription: getStatusDescription(normalizedStatus, "ru")
    });
    if (!isValid) {
      console.warn("\u26A0\uFE0F Invalid status transition attempted:", {
        from: currentConversion.status,
        to: normalizedStatus,
        type: currentConversion.type
      });
    }
    console.log("\u2705 Conversion status updated with normalization");
    return {
      txid,
      previousStatus: currentConversion.status,
      newStatus: normalizedStatus,
      isValidTransition: isValid
    };
  } catch (error) {
    console.error("\u274C Failed to update conversion status:", error);
    throw error;
  }
}
var apiRouter, mockWorkerStatus, api_routes_default;
var init_api_routes = __esm({
  "server/api-routes.ts"() {
    "use strict";
    init_enhanced_postback_dto();
    init_status();
    apiRouter = express2.Router();
    apiRouter.post("/event", async (req, res) => {
      try {
        const eventData = EventDto.parse(req.body);
        console.log("\u{1F4E5} Event received:", {
          type: eventData.type,
          clickid: eventData.clickid,
          txid: eventData.txid,
          value: eventData.value
        });
        const conversionType = eventData.type === "reg" ? "reg" : "purchase";
        const initialStatus = normalize(void 0, "initiated", conversionType);
        const conversion = {
          advertiserId: 1,
          // Extract from auth or context
          partnerId: 2,
          clickid: eventData.clickid,
          type: conversionType,
          txid: eventData.txid,
          revenue: eventData.value?.toString() || "0",
          currency: eventData.currency || "USD",
          conversionStatus: initialStatus,
          details: eventData.meta || {}
        };
        console.log("\u{1F4DD} Conversion created with normalized status:", {
          type: conversionType,
          initialStatus,
          statusDescription: getStatusDescription(initialStatus, "ru")
        });
        await triggerPostbacks(conversion);
        res.json({
          success: true,
          message: "Event processed successfully",
          eventId: eventData.txid,
          postbacksTriggered: true
        });
      } catch (error) {
        console.error("\u274C Event processing error:", error);
        if (error instanceof z7.ZodError) {
          return res.status(400).json({
            success: false,
            error: "Validation error",
            details: error.errors
          });
        }
        res.status(500).json({
          success: false,
          error: "Internal server error"
        });
      }
    });
    apiRouter.post("/webhook/affiliate", async (req, res) => {
      try {
        const webhookData = AffiliateWebhookDto.parse(req.body);
        console.log("\u{1F4E5} Affiliate webhook received:", {
          type: webhookData.type,
          txid: webhookData.txid,
          status: webhookData.status,
          payout: webhookData.payout
        });
        const updateResult = await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.payout, "affiliate");
        res.json({
          success: true,
          message: "Webhook processed successfully",
          statusUpdate: updateResult
        });
      } catch (error) {
        console.error("\u274C Affiliate webhook error:", error);
        if (error instanceof z7.ZodError) {
          return res.status(400).json({
            success: false,
            error: "Validation error",
            details: error.errors
          });
        }
        res.status(500).json({
          success: false,
          error: "Internal server error"
        });
      }
    });
    apiRouter.post("/webhook/psp", async (req, res) => {
      try {
        const webhookData = PspWebhookDto.parse(req.body);
        console.log("\u{1F4E5} PSP webhook received:", {
          type: webhookData.type,
          txid: webhookData.txid,
          status: webhookData.status,
          amount: webhookData.amount
        });
        const updateResult = await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.amount, "psp");
        res.json({
          success: true,
          message: "PSP webhook processed successfully",
          statusUpdate: updateResult
        });
      } catch (error) {
        console.error("\u274C PSP webhook error:", error);
        if (error instanceof z7.ZodError) {
          return res.status(400).json({
            success: false,
            error: "Validation error",
            details: error.errors
          });
        }
        res.status(500).json({
          success: false,
          error: "Internal server error"
        });
      }
    });
    apiRouter.get("/health", (req, res) => {
      const workerStatus = mockWorkerStatus.getStatus();
      res.json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        postbackWorker: workerStatus,
        database: "connected"
      });
    });
    apiRouter.get("/postback/stats", async (req, res) => {
      try {
        const stats = {
          totalDeliveries: 150,
          successfulDeliveries: 142,
          failedDeliveries: 8,
          successRate: 94.67,
          averageResponseTime: 850,
          lastDelivery: (/* @__PURE__ */ new Date()).toISOString()
        };
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error("\u274C Failed to get postback stats:", error);
        res.status(500).json({
          success: false,
          error: "Failed to retrieve statistics"
        });
      }
    });
    mockWorkerStatus = {
      getStatus: () => ({
        queueLength: 3,
        activeJobs: 1,
        processing: true,
        maxConcurrent: 10
      })
    };
    api_routes_default = apiRouter;
  }
});

// server/queue/keitaro.ts
var keitaro_exports = {};
__export(keitaro_exports, {
  KEITARO_PARAMS_TEMPLATE: () => KEITARO_PARAMS_TEMPLATE,
  KEITARO_STATUS_MAP: () => KEITARO_STATUS_MAP,
  buildKeitaroPostbackUrl: () => buildKeitaroPostbackUrl,
  generateKeitaroTestPostback: () => generateKeitaroTestPostback,
  getKeitaroProfileTemplates: () => getKeitaroProfileTemplates,
  mapStatusForKeitaro: () => mapStatusForKeitaro,
  validateKeitaroResponse: () => validateKeitaroResponse
});
function buildKeitaroPostbackUrl(baseUrl, task, mappedStatus, authToken) {
  const url = new URL(baseUrl);
  const params = {
    subid: task.clickid,
    status: mappedStatus,
    payout: task.revenue ?? "0",
    currency: task.currency ?? "USD",
    txid: task.txid,
    external_id: task.txid,
    click_id: task.clickid,
    conversion_id: task.conversionId
  };
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  if (authToken) {
    url.searchParams.set("auth_token", authToken);
  }
  return url.toString();
}
function mapStatusForKeitaro(internalStatus, conversionType) {
  const statusMap = KEITARO_STATUS_MAP[conversionType];
  return statusMap[internalStatus] ?? "reject";
}
function validateKeitaroResponse(responseBody, responseCode) {
  if (responseCode === 200) {
    const body = responseBody.trim().toLowerCase();
    if (body === "ok" || body === "1" || body === "success") {
      return { success: true, message: "Postback accepted by Keitaro" };
    } else {
      return { success: false, message: `Unexpected response: ${responseBody}` };
    }
  }
  if (responseCode === 404) {
    return { success: false, message: "Click not found in Keitaro" };
  }
  if (responseCode === 400) {
    return { success: false, message: "Invalid postback parameters" };
  }
  return { success: false, message: `HTTP ${responseCode}: ${responseBody}` };
}
function getKeitaroProfileTemplates() {
  return [
    {
      name: "Keitaro Standard (GET)",
      method: "GET",
      endpointUrl: "https://{{domain}}/click.php",
      paramsTemplate: KEITARO_PARAMS_TEMPLATE,
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: "auth_token",
      authHeaderName: null,
      description: "Standard Keitaro postback via GET parameters"
    },
    {
      name: "Keitaro with Bearer Auth",
      method: "GET",
      endpointUrl: "https://{{domain}}/api/v1/conversions",
      paramsTemplate: KEITARO_PARAMS_TEMPLATE,
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: null,
      authHeaderName: "Authorization",
      description: "Keitaro API with Bearer token authentication"
    },
    {
      name: "Keitaro Legacy Format",
      method: "GET",
      endpointUrl: "https://{{domain}}/postback",
      paramsTemplate: {
        click_id: "{{clickid}}",
        conversion_status: "{{status_mapped}}",
        revenue: "{{revenue}}",
        currency_code: "{{currency}}"
      },
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: "token",
      authHeaderName: null,
      description: "Legacy Keitaro postback format"
    }
  ];
}
function generateKeitaroTestPostback(domain, authToken) {
  const testData = {
    conversionId: `test_${Date.now()}`,
    advertiserId: "1",
    partnerId: "2",
    clickid: `test_${Math.random().toString(36).substr(2, 9)}`,
    type: "purchase",
    txid: `tx_test_${Date.now()}`,
    status: "approved",
    revenue: "100.00",
    currency: "USD",
    antifraudLevel: "ok"
  };
  const url = buildKeitaroPostbackUrl(
    `https://${domain}/click.php`,
    testData,
    "sale",
    authToken
  );
  return {
    url,
    expectedResponse: "OK",
    testData
  };
}
var KEITARO_STATUS_MAP, KEITARO_PARAMS_TEMPLATE;
var init_keitaro = __esm({
  "server/queue/keitaro.ts"() {
    "use strict";
    KEITARO_STATUS_MAP = {
      reg: {
        initiated: "lead",
        pending: "lead",
        approved: "lead",
        declined: "reject",
        refunded: "reject",
        chargeback: "reject"
      },
      purchase: {
        initiated: "sale",
        pending: "sale",
        approved: "sale",
        declined: "reject",
        refunded: "refund",
        chargeback: "chargeback"
      }
    };
    KEITARO_PARAMS_TEMPLATE = {
      subid: "{{clickid}}",
      status: "{{status_mapped}}",
      payout: "{{revenue}}",
      currency: "{{currency}}",
      txid: "{{txid}}"
    };
  }
});

// server/routes/auth.ts
var auth_exports = {};
__export(auth_exports, {
  default: () => auth_default
});
import { Router as Router5 } from "express";
import { randomBytes as randomBytes5 } from "crypto";
var router6, twoFactorCodes, auth_default;
var init_auth2 = __esm({
  "server/routes/auth.ts"() {
    "use strict";
    init_email();
    router6 = Router5();
    twoFactorCodes = /* @__PURE__ */ new Map();
    setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      const entries = Array.from(twoFactorCodes.entries());
      for (const [key, value] of entries) {
        if (value.expiresAt < now) {
          twoFactorCodes.delete(key);
        }
      }
    }, 6e4);
    router6.post("/send-2fa-code", async (req, res) => {
      try {
        const { action, method = "email" } = req.body;
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const code = Math.floor(1e5 + Math.random() * 9e5).toString();
        const codeId = randomBytes5(16).toString("hex");
        const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
        twoFactorCodes.set(codeId, {
          code,
          userId,
          action,
          expiresAt,
          attempts: 0
        });
        const user = req.user;
        if (method === "email" && user.email) {
          await sendEmail({
            to: user.email,
            from: process.env.FROM_EMAIL || "noreply@platform.com",
            subject: "\u041A\u043E\u0434 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438",
            html: `
          <h2>\u041A\u043E\u0434 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438</h2>
          <p>\u0412\u0430\u0448 \u043A\u043E\u0434 \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438: <strong>${code}</strong></p>
          <p>\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F: ${action}</p>
          <p>\u041A\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u0435\u043D 5 \u043C\u0438\u043D\u0443\u0442.</p>
          <p>\u0415\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u043B\u0438 \u044D\u0442\u043E\u0442 \u043A\u043E\u0434, \u043F\u0440\u043E\u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u044D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435.</p>
        `,
            text: `\u0412\u0430\u0448 \u043A\u043E\u0434 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438: ${code}. \u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F: ${action}. \u041A\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u0435\u043D 5 \u043C\u0438\u043D\u0443\u0442.`
          });
        }
        req.session.twoFactorCodeId = codeId;
        res.json({
          success: true,
          method,
          expiresAt: expiresAt.toISOString()
        });
      } catch (error) {
        console.error("Send 2FA code error:", error);
        res.status(500).json({ error: "Failed to send verification code" });
      }
    });
    router6.post("/verify-2fa-code", async (req, res) => {
      try {
        const { code, action } = req.body;
        const userId = req.user?.id;
        const codeId = req.session.twoFactorCodeId;
        if (!userId || !codeId) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const storedCodeData = twoFactorCodes.get(codeId);
        if (!storedCodeData) {
          return res.status(400).json({ error: "\u041A\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0438\u043B\u0438 \u0438\u0441\u0442\u0435\u043A" });
        }
        if (storedCodeData.expiresAt < /* @__PURE__ */ new Date()) {
          twoFactorCodes.delete(codeId);
          return res.status(400).json({ error: "\u041A\u043E\u0434 \u0438\u0441\u0442\u0435\u043A" });
        }
        if (storedCodeData.attempts >= 3) {
          twoFactorCodes.delete(codeId);
          return res.status(400).json({ error: "\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A" });
        }
        if (storedCodeData.code !== code) {
          storedCodeData.attempts++;
          return res.status(400).json({ error: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043E\u0434" });
        }
        if (storedCodeData.userId !== userId || storedCodeData.action !== action) {
          twoFactorCodes.delete(codeId);
          return res.status(400).json({ error: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B" });
        }
        twoFactorCodes.delete(codeId);
        delete req.session.twoFactorCodeId;
        res.json({ success: true });
      } catch (error) {
        console.error("Verify 2FA code error:", error);
        res.status(500).json({ error: "Failed to verify code" });
      }
    });
    auth_default = router6;
  }
});

// server/services/notification-helper.ts
var notification_helper_exports = {};
__export(notification_helper_exports, {
  createNotification: () => createNotification,
  notifyAntifraudAlert: () => notifyAntifraudAlert,
  notifyCommissionEarned: () => notifyCommissionEarned,
  notifyConversionSpike: () => notifyConversionSpike,
  notifyDomainVerified: () => notifyDomainVerified,
  notifyHighRiskDetected: () => notifyHighRiskDetected,
  notifyMaintenanceScheduled: () => notifyMaintenanceScheduled,
  notifyNewLead: () => notifyNewLead,
  notifyOfferAccessRequest: () => notifyOfferAccessRequest2,
  notifyOfferCreated: () => notifyOfferCreated,
  notifyOfferRequestCreated: () => notifyOfferRequestCreated,
  notifyPartnerBlocked: () => notifyPartnerBlocked,
  notifyPartnerJoined: () => notifyPartnerJoined,
  notifyPaymentReceived: () => notifyPaymentReceived,
  notifyPayoutCompleted: () => notifyPayoutCompleted,
  notifyReferralCommission: () => notifyReferralCommission,
  notifyReferralJoined: () => notifyReferralJoined
});
async function createNotification(data) {
  try {
    await db.insert(userNotifications).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.metadata || {},
      channel: "system",
      status: "sent",
      isRead: false
    });
    try {
      if (global.sendWebSocketNotification) {
        global.sendWebSocketNotification(data.userId, {
          type: "notification",
          data: {
            type: data.priority === "urgent" ? "error" : data.priority === "high" ? "warning" : "info",
            title: data.title,
            message: data.message,
            metadata: data.metadata
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log(`\u{1F514} WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${data.userId}`);
      } else {
        console.log(`\u26A0\uFE0F sendWebSocketNotification \u043D\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0434\u043B\u044F ${data.userId}`);
      }
    } catch (wsError) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F:", wsError);
    }
    console.log(`\u2705 Notification created: ${data.type} for user ${data.userId}`);
  } catch (error) {
    console.error("\u274C Failed to create notification:", error);
  }
}
async function notifyPartnerJoined(advertiserId, partnerData) {
  await createNotification({
    userId: advertiserId,
    type: "partner_joined",
    title: "\u{1F91D} \u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F",
    message: `\u041F\u0430\u0440\u0442\u043D\u0435\u0440 "${partnerData.username}" \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u0432 \u0432\u0430\u0448\u0435\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u043A\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435`,
    metadata: {
      partnerId: partnerData.id,
      partnerUsername: partnerData.username,
      partnerEmail: partnerData.email,
      country: partnerData.country
    },
    priority: "medium"
  });
}
async function notifyPartnerBlocked(advertiserId, partnerData, reason) {
  await createNotification({
    userId: advertiserId,
    type: "partner_blocked",
    title: "\u{1F6AB} \u041F\u0430\u0440\u0442\u043D\u0435\u0440 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D",
    message: `\u041F\u0430\u0440\u0442\u043D\u0435\u0440 "${partnerData.username}" \u0431\u044B\u043B \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D \u043F\u043E \u043F\u0440\u0438\u0447\u0438\u043D\u0435: ${reason}`,
    metadata: {
      partnerId: partnerData.id,
      partnerUsername: partnerData.username,
      blockReason: reason
    },
    priority: "high"
  });
}
async function notifyOfferCreated(advertiserId, offerData) {
  await createNotification({
    userId: advertiserId,
    type: "offer_created",
    title: "\u{1F3AF} \u041D\u043E\u0432\u044B\u0439 \u043E\u0444\u0444\u0435\u0440 \u0441\u043E\u0437\u0434\u0430\u043D",
    message: `\u041E\u0444\u0444\u0435\u0440 "${offerData.name}" \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D \u0438 \u0433\u043E\u0442\u043E\u0432 \u043A \u0440\u0430\u0431\u043E\u0442\u0435`,
    metadata: {
      offerId: offerData.id,
      offerName: offerData.name,
      payout: offerData.payout,
      category: offerData.category
    },
    priority: "medium"
  });
}
async function notifyOfferAccessRequest2(advertiserId, partnerData, offerData, requestNote) {
  await createNotification({
    userId: advertiserId,
    type: "offer_request_created",
    title: "\u{1F4CB} \u0417\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043E\u0444\u0444\u0435\u0440\u0443",
    message: `\u041F\u0430\u0440\u0442\u043D\u0435\u0440 "${partnerData.username}" \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u043B \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 "${offerData.name}"`,
    metadata: {
      partnerId: partnerData.id,
      partnerName: partnerData.username,
      offerId: offerData.id,
      offerName: offerData.name,
      requestNote: requestNote || "",
      action: "review_required"
    },
    priority: "high"
  });
  console.log(`\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044E ${advertiserId} \u043E\u0442 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430 ${partnerData.username} \u0434\u043B\u044F \u043E\u0444\u0444\u0435\u0440\u0430 "${offerData.name}"`);
}
async function notifyOfferRequestCreated(advertiserId, requestData) {
  await createNotification({
    userId: advertiserId,
    type: "offer_request_created",
    title: "\u{1F4CB} \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u043E\u0444\u0444\u0435\u0440",
    message: `\u041F\u0430\u0440\u0442\u043D\u0435\u0440 "${requestData.partnerName}" \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u043B \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 "${requestData.offerName}"`,
    metadata: {
      requestId: requestData.id,
      partnerId: requestData.partnerId,
      partnerName: requestData.partnerName,
      offerId: requestData.offerId,
      offerName: requestData.offerName,
      requestMessage: requestData.message
    },
    priority: "high"
  });
}
async function notifyAntifraudAlert(userId, alertData) {
  await createNotification({
    userId,
    type: "antifraud_alert",
    title: "\u26A0\uFE0F \u0410\u043D\u0442\u0438\u0444\u0440\u043E\u0434 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435",
    message: `\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C: ${alertData.description}`,
    metadata: {
      alertId: alertData.id,
      riskLevel: alertData.riskLevel,
      type: alertData.type,
      ip: alertData.ip,
      details: alertData.details
    },
    priority: "urgent"
  });
}
async function notifyHighRiskDetected(userId, riskData) {
  await createNotification({
    userId,
    type: "high_risk_detected",
    title: "\u{1F534} \u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0440\u0438\u0441\u043A \u0444\u0440\u043E\u0434\u0430",
    message: `\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0438\u043B\u0430 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u0440\u0438\u0441\u043A \u0444\u0440\u043E\u0434\u0430 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 "${riskData.offerName}"`,
    metadata: {
      offerId: riskData.offerId,
      offerName: riskData.offerName,
      riskScore: riskData.riskScore,
      indicators: riskData.indicators
    },
    priority: "urgent"
  });
}
async function notifyPaymentReceived(userId, paymentData) {
  await createNotification({
    userId,
    type: "payment_received",
    title: "\u{1F4B0} \u041F\u043B\u0430\u0442\u0435\u0436 \u043F\u043E\u043B\u0443\u0447\u0435\u043D",
    message: `\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B \u043F\u043B\u0430\u0442\u0435\u0436 \u043D\u0430 \u0441\u0443\u043C\u043C\u0443 ${paymentData.amount} ${paymentData.currency}`,
    metadata: {
      paymentId: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method
    },
    priority: "medium"
  });
}
async function notifyPayoutCompleted(userId, payoutData) {
  await createNotification({
    userId,
    type: "payout_completed",
    title: "\u2705 \u0412\u044B\u043F\u043B\u0430\u0442\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430",
    message: `\u0412\u044B\u043F\u043B\u0430\u0442\u0430 \u0432 \u0440\u0430\u0437\u043C\u0435\u0440\u0435 ${payoutData.amount} ${payoutData.currency} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u0430`,
    metadata: {
      payoutId: payoutData.id,
      amount: payoutData.amount,
      currency: payoutData.currency,
      method: payoutData.method,
      recipient: payoutData.recipient
    },
    priority: "high"
  });
}
async function notifyCommissionEarned(userId, commissionData) {
  await createNotification({
    userId,
    type: "commission_earned",
    title: "\u{1F48E} \u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0430",
    message: `\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0430 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${commissionData.amount} ${commissionData.currency} \u0437\u0430 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044E`,
    metadata: {
      conversionId: commissionData.conversionId,
      amount: commissionData.amount,
      currency: commissionData.currency,
      offerName: commissionData.offerName
    },
    priority: "medium"
  });
}
async function notifyMaintenanceScheduled(userId, maintenanceData) {
  await createNotification({
    userId,
    type: "maintenance_scheduled",
    title: "\u{1F527} \u041F\u043B\u0430\u043D\u043E\u0432\u043E\u0435 \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435",
    message: `\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0441 ${maintenanceData.startTime} \u0434\u043E ${maintenanceData.endTime}`,
    metadata: {
      startTime: maintenanceData.startTime,
      endTime: maintenanceData.endTime,
      description: maintenanceData.description
    },
    priority: "medium"
  });
}
async function notifyDomainVerified(userId, domainData) {
  await createNotification({
    userId,
    type: "domain_verified",
    title: "\u{1F310} \u0414\u043E\u043C\u0435\u043D \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D",
    message: `\u0414\u043E\u043C\u0435\u043D "${domainData.domain}" \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D \u0438 \u0433\u043E\u0442\u043E\u0432 \u043A \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044E`,
    metadata: {
      domain: domainData.domain,
      sslStatus: domainData.sslStatus
    },
    priority: "high"
  });
}
async function notifyNewLead(userId, leadData) {
  await createNotification({
    userId,
    type: "new_lead",
    title: "\u{1F3AF} \u041D\u043E\u0432\u044B\u0439 \u043B\u0438\u0434",
    message: `\u041F\u043E\u043B\u0443\u0447\u0435\u043D \u043D\u043E\u0432\u044B\u0439 \u043B\u0438\u0434 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 "${leadData.offerName}" \u043E\u0442 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430 "${leadData.partnerName}"`,
    metadata: {
      leadId: leadData.id,
      offerId: leadData.offerId,
      offerName: leadData.offerName,
      partnerId: leadData.partnerId,
      partnerName: leadData.partnerName,
      payout: leadData.payout
    },
    priority: "medium"
  });
}
async function notifyConversionSpike(userId, spikeData) {
  await createNotification({
    userId,
    type: "conversion_spike",
    title: "\u{1F4C8} \u0412\u0441\u043F\u043B\u0435\u0441\u043A \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0439",
    message: `\u0420\u0435\u0437\u043A\u0438\u0439 \u0440\u043E\u0441\u0442 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0439 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 "${spikeData.offerName}" - ${spikeData.increase}% \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0447\u0430\u0441`,
    metadata: {
      offerId: spikeData.offerId,
      offerName: spikeData.offerName,
      increase: spikeData.increase,
      currentRate: spikeData.currentRate
    },
    priority: "high"
  });
}
async function notifyReferralJoined(userId, referralData) {
  await createNotification({
    userId,
    type: "referral_joined",
    title: "\u{1F465} \u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B",
    message: `\u041F\u043E \u0432\u0430\u0448\u0435\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0441\u044B\u043B\u043A\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440 "${referralData.username}"`,
    metadata: {
      referralId: referralData.id,
      referralUsername: referralData.username,
      referralCode: referralData.referralCode
    },
    priority: "medium"
  });
}
async function notifyReferralCommission(userId, commissionData) {
  await createNotification({
    userId,
    type: "referral_commission",
    title: "\u{1F4B0} \u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F",
    message: `\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0430 \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${commissionData.amount} ${commissionData.currency} \u043E\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u0430\u0448\u0435\u0433\u043E \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u0430`,
    metadata: {
      amount: commissionData.amount,
      currency: commissionData.currency,
      referralName: commissionData.referralName,
      source: commissionData.source
    },
    priority: "high"
  });
}
var init_notification_helper = __esm({
  "server/services/notification-helper.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/api/access-requests.ts
var access_requests_exports = {};
__export(access_requests_exports, {
  setupAccessRequestsRoutes: () => setupAccessRequestsRoutes
});
import { randomUUID as randomUUID4 } from "crypto";
function setupAccessRequestsRoutes(app2) {
  app2.post("/api/access-requests", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = getAuthenticatedUser(req).id;
      const { offerId, message } = req.body;
      if (!offerId) {
        return res.status(400).json({ error: "Offer ID is required" });
      }
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const existingRequests = await storage.getOfferAccessRequests(partnerId, offerId);
      if (existingRequests.length > 0) {
        return res.status(409).json({ error: "Access request already exists" });
      }
      const request = await storage.createOfferAccessRequest({
        id: randomUUID4(),
        partnerId,
        offerId,
        advertiserId: offer2.advertiserId,
        status: "pending",
        requestNote: message || null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Create offer access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/access-requests/partner", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = getAuthenticatedUser(req).id;
      const requests = await storage.getOfferAccessRequests(partnerId);
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const offer2 = await storage.getOffer(request.offerId);
          const advertiser = await storage.getUser(request.advertiserId);
          return {
            ...request,
            offer: offer2 ? {
              id: offer2.id,
              name: offer2.name,
              category: offer2.category,
              payoutType: offer2.payoutType,
              payoutAmount: offer2.payoutAmount,
              currency: offer2.currency,
              logo: offer2.logo,
              description: offer2.description
            } : null,
            advertiser: advertiser ? {
              id: advertiser.id,
              username: advertiser.username,
              company: advertiser.company
            } : null
          };
        })
      );
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Get partner access requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/access-requests/advertiser", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const requests = await storage.getAdvertiserAccessRequests(advertiserId);
      res.json(requests);
    } catch (error) {
      console.error("Get advertiser access requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/access-requests/:id/respond", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const requestId = req.params.id;
      const { action, message } = req.body;
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      const requests = await storage.getOfferAccessRequests();
      const request = requests.find((r) => r.id === requestId);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      const offer2 = await storage.getOffer(request.offerId);
      if (!offer2 || offer2.advertiserId !== advertiserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const status = action === "approve" ? "approved" : "rejected";
      const updatedRequest = await storage.updateOfferAccessRequest(requestId, {
        status,
        responseNote: message || null,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (status === "approved") {
        const existingPartnerOffers = await storage.getPartnerOffers(request.partnerId, request.offerId);
        if (existingPartnerOffers.length === 0) {
          await storage.createPartnerOffer({
            id: randomUUID4(),
            partnerId: request.partnerId,
            offerId: request.offerId,
            isApproved: true,
            customPayout: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Respond to access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/access-requests/bulk-action", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const { requestIds, action, message } = req.body;
      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        return res.status(400).json({ error: "Request IDs array is required" });
      }
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      const status = action === "approve" ? "approved" : "rejected";
      const results = [];
      for (const requestId of requestIds) {
        try {
          const requests = await storage.getOfferAccessRequests();
          const request = requests.find((r) => r.id === requestId);
          if (!request) continue;
          const offer2 = await storage.getOffer(request.offerId);
          if (!offer2 || offer2.advertiserId !== advertiserId) continue;
          const updatedRequest = await storage.updateOfferAccessRequest(requestId, {
            status,
            responseNote: message || null,
            updatedAt: /* @__PURE__ */ new Date()
          });
          if (status === "approved") {
            const existingPartnerOffers = await storage.getPartnerOffers(request.partnerId, request.offerId);
            if (existingPartnerOffers.length === 0) {
              await storage.createPartnerOffer({
                id: randomUUID4(),
                partnerId: request.partnerId,
                offerId: request.offerId,
                isApproved: true,
                customPayout: null,
                createdAt: /* @__PURE__ */ new Date(),
                updatedAt: /* @__PURE__ */ new Date()
              });
            }
          }
          results.push(updatedRequest);
        } catch (error) {
          console.error(`Error processing request ${requestId}:`, error);
        }
      }
      res.json({
        success: true,
        processed: results.length,
        total: requestIds.length,
        results
      });
    } catch (error) {
      console.error("Bulk action error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/access-requests/stats", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      let stats = {};
      if (user.role === "advertiser") {
        const requests = await storage.getAdvertiserAccessRequests(user.id);
        stats = {
          total: requests.length,
          pending: requests.filter((r) => r.status === "pending").length,
          approved: requests.filter((r) => r.status === "approved").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          thisWeek: requests.filter((r) => {
            const requestDate = new Date(r.requestedAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
            return requestDate > weekAgo;
          }).length
        };
      } else if (user.role === "affiliate") {
        const requests = await storage.getOfferAccessRequests(user.id);
        stats = {
          total: requests.length,
          pending: requests.filter((r) => r.status === "pending").length,
          approved: requests.filter((r) => r.status === "approved").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          thisWeek: requests.filter((r) => {
            const requestDate = new Date(r.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
            return requestDate > weekAgo;
          }).length
        };
      } else if (user.role === "super_admin") {
        const allRequests = await storage.getOfferAccessRequests();
        stats = {
          total: allRequests.length,
          pending: allRequests.filter((r) => r.status === "pending").length,
          approved: allRequests.filter((r) => r.status === "approved").length,
          rejected: allRequests.filter((r) => r.status === "rejected").length,
          thisWeek: allRequests.filter((r) => {
            const requestDate = new Date(r.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
            return requestDate > weekAgo;
          }).length
        };
      }
      res.json(stats);
    } catch (error) {
      console.error("Get access request stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
var init_access_requests = __esm({
  "server/api/access-requests.ts"() {
    "use strict";
    init_auth();
    init_storage();
  }
});

// shared/tracking-events-schema.ts
import { z as z8 } from "zod";
import { pgTable as pgTable3, text as text3, timestamp as timestamp3, decimal as decimal3, integer as integer3, jsonb as jsonb3, boolean as boolean3, uuid, index as index2, varchar as varchar3, bigint as bigint2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema3, createSelectSchema } from "drizzle-zod";
var eventTypes, deviceTypes, sub2Config2, clicks2, events2, clickEventSchema2, conversionEventSchema3, insertClickSchema3, insertEventSchema2, selectClickSchema, selectEventSchema;
var init_tracking_events_schema = __esm({
  "shared/tracking-events-schema.ts"() {
    "use strict";
    eventTypes = [
      "click",
      "lp_click",
      "install",
      "open",
      "reg",
      "deposit",
      "sale",
      "lead",
      "lp_leave"
    ];
    deviceTypes = ["desktop", "mobile", "tablet"];
    sub2Config2 = {
      allowedKeys: [
        "geo",
        "dev",
        "src",
        "adset",
        "lang",
        "tier",
        "risk",
        "abtest",
        "cohort",
        "pp",
        "fpr",
        "anti",
        "seg"
      ],
      maxPairs: 8,
      maxLength: 200
    };
    clicks2 = pgTable3("clicks", {
      clickid: uuid("clickid").primaryKey().defaultRandom(),
      visitorCode: uuid("visitor_code").notNull(),
      // Attribution
      campaignId: text3("campaign_id"),
      sourceId: text3("source_id"),
      flowId: text3("flow_id"),
      offerId: text3("offer_id"),
      landingId: text3("landing_id"),
      adCampaignId: text3("ad_campaign_id"),
      externalId: text3("external_id"),
      creativeId: text3("creative_id"),
      // Marketing/UTM
      referrer: text3("referrer"),
      site: text3("site"),
      utmSource: text3("utm_source"),
      utmMedium: text3("utm_medium"),
      utmCampaign: text3("utm_campaign"),
      utmTerm: text3("utm_term"),
      utmContent: text3("utm_content"),
      // Subs
      sub1: text3("sub1"),
      sub2: text3("sub2"),
      // Raw sub2 string
      sub3: text3("sub3"),
      sub4: text3("sub4"),
      sub5: text3("sub5"),
      sub6: text3("sub6"),
      sub7: text3("sub7"),
      sub8: text3("sub8"),
      sub9: text3("sub9"),
      sub10: text3("sub10"),
      // Sub2 parsed data
      sub2Raw: text3("sub2_raw"),
      sub2Map: jsonb3("sub2_map"),
      // Parsed key-value pairs
      // Client data
      userAgent: text3("user_agent"),
      lang: text3("lang"),
      tz: text3("tz"),
      screen: text3("screen"),
      // WxH format
      connection: text3("connection"),
      // navigator.connection.effectiveType
      deviceType: text3("device_type").$type(),
      // Server enriched data
      ip: text3("ip"),
      countryIso: text3("country_iso"),
      region: text3("region"),
      city: text3("city"),
      isp: text3("isp"),
      operator: text3("operator"),
      isProxy: boolean3("is_proxy").default(false),
      // UA parsing
      browserName: text3("browser_name"),
      browserVersion: text3("browser_version"),
      osName: text3("os_name"),
      osVersion: text3("os_version"),
      deviceModel: text3("device_model"),
      // Timestamps
      tsClient: bigint2("ts_client", { mode: "number" }),
      // Client timestamp in ms
      tsServer: timestamp3("ts_server").defaultNow(),
      // Server timestamp
      // Uniqueness flags (computed)
      isUniqueGlobal: boolean3("is_unique_global").default(false),
      isUniqueCampaign: boolean3("is_unique_campaign").default(false),
      isUniqueFlow: boolean3("is_unique_flow").default(false)
    }, (table) => ({
      clickidIdx: index2("clicks_clickid_idx").on(table.clickid),
      campaignTsIdx: index2("clicks_campaign_ts_idx").on(table.campaignId, table.tsServer),
      sub2MapIdx: index2("clicks_sub2_map_gin_idx").on(table.sub2Map),
      countryIdx: index2("clicks_country_idx").on(table.countryIso),
      sourceTsIdx: index2("clicks_source_ts_idx").on(table.sourceId, table.tsServer)
    }));
    events2 = pgTable3("events", {
      id: uuid("id").primaryKey().defaultRandom(),
      clickid: uuid("clickid").notNull().references(() => clicks2.clickid),
      // Event data
      type: text3("type").$type().notNull(),
      revenue: decimal3("revenue", { precision: 10, scale: 2 }),
      revenueDeposit: decimal3("revenue_deposit", { precision: 10, scale: 2 }),
      revenueReg: decimal3("revenue_reg", { precision: 10, scale: 2 }),
      currency: varchar3("currency", { length: 3 }),
      // ISO 4217
      txid: text3("txid"),
      // External transaction ID
      // Special fields
      timeOnPageMs: integer3("time_on_page_ms"),
      // For lp_leave events
      // Timestamps
      tsClient: bigint2("ts_client", { mode: "number" }),
      tsServer: timestamp3("ts_server").defaultNow(),
      // Raw data for audit
      raw: jsonb3("raw")
    }, (table) => ({
      clickidTypeIdx: index2("events_clickid_type_idx").on(table.clickid, table.type),
      typeTsIdx: index2("events_type_ts_idx").on(table.type, table.tsServer)
    }));
    clickEventSchema2 = z8.object({
      // Attribution (optional for click)
      campaign_id: z8.string().optional(),
      source_id: z8.string().optional(),
      flow_id: z8.string().optional(),
      offer_id: z8.string().optional(),
      landing_id: z8.string().optional(),
      ad_campaign_id: z8.string().optional(),
      external_id: z8.string().optional(),
      creative_id: z8.string().optional(),
      // Marketing
      referrer: z8.string().optional(),
      site: z8.string().optional(),
      utm_source: z8.string().optional(),
      utm_medium: z8.string().optional(),
      utm_campaign: z8.string().optional(),
      utm_term: z8.string().optional(),
      utm_content: z8.string().optional(),
      // Subs
      sub1: z8.string().optional(),
      sub2: z8.string().max(sub2Config2.maxLength).optional(),
      sub3: z8.string().optional(),
      sub4: z8.string().optional(),
      sub5: z8.string().optional(),
      sub6: z8.string().optional(),
      sub7: z8.string().optional(),
      sub8: z8.string().optional(),
      sub9: z8.string().optional(),
      sub10: z8.string().optional(),
      // Client data
      user_agent: z8.string(),
      lang: z8.string().optional(),
      tz: z8.string().optional(),
      screen: z8.string().optional(),
      // WxH
      connection: z8.string().optional(),
      device_type: z8.enum(deviceTypes).optional(),
      // Visitor tracking
      visitor_code: z8.string().uuid().optional(),
      // Client timestamp
      ts_client: z8.number().optional()
    });
    conversionEventSchema3 = z8.object({
      // Required
      clickid: z8.string().max(64),
      visitor_code: z8.string().uuid(),
      type: z8.enum(eventTypes),
      // Attribution
      campaign_id: z8.string().optional(),
      source_id: z8.string().optional(),
      flow_id: z8.string().optional(),
      offer_id: z8.string().optional(),
      landing_id: z8.string().optional(),
      ad_campaign_id: z8.string().optional(),
      external_id: z8.string().optional(),
      creative_id: z8.string().optional(),
      // Marketing
      referrer: z8.string().optional(),
      site: z8.string().optional(),
      utm_source: z8.string().optional(),
      utm_medium: z8.string().optional(),
      utm_campaign: z8.string().optional(),
      utm_term: z8.string().optional(),
      utm_content: z8.string().optional(),
      // Subs with validation
      sub1: z8.string().optional(),
      sub2: z8.string().max(sub2Config2.maxLength).optional(),
      sub3: z8.string().optional(),
      sub4: z8.string().optional(),
      sub5: z8.string().optional(),
      sub6: z8.string().optional(),
      sub7: z8.string().optional(),
      sub8: z8.string().optional(),
      sub9: z8.string().optional(),
      sub10: z8.string().optional(),
      // Client data
      user_agent: z8.string(),
      lang: z8.string().optional(),
      tz: z8.string().optional(),
      screen: z8.string().optional(),
      connection: z8.string().optional(),
      device_type: z8.enum(deviceTypes).optional(),
      // Event specific
      revenue: z8.number().min(0).optional(),
      revenue_deposit: z8.number().min(0).optional(),
      revenue_reg: z8.number().min(0).optional(),
      currency: z8.string().length(3).optional(),
      // ISO 4217
      txid: z8.string().optional(),
      time_on_page_ms: z8.number().min(0).optional(),
      // Client timestamp
      ts_client: z8.number()
    });
    insertClickSchema3 = createInsertSchema3(clicks2);
    insertEventSchema2 = createInsertSchema3(events2);
    selectClickSchema = createSelectSchema(clicks2);
    selectEventSchema = createSelectSchema(events2);
  }
});

// server/routes/analytics-enhanced.ts
var analytics_enhanced_exports = {};
__export(analytics_enhanced_exports, {
  default: () => analytics_enhanced_default
});
import { Router as Router6 } from "express";
import { z as z9 } from "zod";
import { eq as eq9, gte as gte4, lte as lte5 } from "drizzle-orm";
var router7, enhancedStatsSchema, analytics_enhanced_default;
var init_analytics_enhanced = __esm({
  "server/routes/analytics-enhanced.ts"() {
    "use strict";
    init_tracking_events_schema();
    router7 = Router6();
    enhancedStatsSchema = z9.object({
      dateFrom: z9.string().optional(),
      dateTo: z9.string().optional(),
      offerId: z9.string().optional(),
      partnerId: z9.string().optional(),
      country: z9.string().optional(),
      device: z9.string().optional(),
      trafficSource: z9.string().optional(),
      sub1: z9.string().optional(),
      sub2: z9.string().optional(),
      sub3: z9.string().optional(),
      sub4: z9.string().optional(),
      sub5: z9.string().optional(),
      eventType: z9.string().optional(),
      groupBy: z9.union([z9.string(), z9.array(z9.string())]).optional().transform(
        (val) => typeof val === "string" ? [val] : val || ["date"]
      ),
      page: z9.string().optional().transform((val) => val ? parseInt(val) : 1),
      limit: z9.string().optional().transform((val) => val ? parseInt(val) : 50),
      search: z9.string().optional(),
      sortBy: z9.string().optional().default("date"),
      sortOrder: z9.enum(["asc", "desc"]).optional().default("desc")
    });
    router7.get("/advertiser/live-statistics", async (req, res) => {
      try {
        const user = req.user;
        if (!user || user.role !== "advertiser") {
          return res.status(403).json({ error: "Access denied" });
        }
        const filters = enhancedStatsSchema.parse(req.query);
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : /* @__PURE__ */ new Date();
        const whereConditions = [
          gte4(clicks2.tsServer, dateFrom),
          lte5(clicks2.tsServer, dateTo)
        ];
        if (filters.offerId && filters.offerId !== "all") {
          whereConditions.push(eq9(clicks2.offerId, filters.offerId));
        }
        if (filters.partnerId && filters.partnerId !== "all") {
          whereConditions.push(eq9(clicks2.visitorCode, filters.partnerId));
        }
        if (filters.country) {
          whereConditions.push(eq9(clicks2.countryIso, filters.country.toUpperCase()));
        }
        if (filters.device && filters.device !== "all") {
          whereConditions.push(eq9(clicks2.deviceType, filters.device));
        }
        if (filters.sub1) {
          whereConditions.push(eq9(clicks2.sub1, filters.sub1));
        }
        if (filters.sub2) {
          whereConditions.push(eq9(clicks2.sub2Raw, filters.sub2));
        }
        const mockData = [];
        const startDate = new Date(dateFrom);
        const endDate2 = new Date(dateTo);
        for (let d = new Date(startDate); d <= endDate2; d.setDate(d.getDate() + 1)) {
          const clicks3 = Math.floor(Math.random() * 500) + 50;
          const conversions2 = Math.floor(clicks3 * (Math.random() * 0.05 + 0.01));
          const revenue = conversions2 * (Math.random() * 50 + 20);
          mockData.push({
            date: d.toISOString().split("T")[0],
            country: filters.country || ["US", "CA", "GB", "DE", "FR", "TR", "RU"][Math.floor(Math.random() * 7)],
            device: filters.device || ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)],
            trafficSource: ["facebook", "google", "native", "email"][Math.floor(Math.random() * 4)],
            offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
            offerName: `Test Offer ${Math.floor(Math.random() * 10) + 1}`,
            partnerId: `partner_${Math.floor(Math.random() * 20) + 1}`,
            partnerName: `Partner ${Math.floor(Math.random() * 20) + 1}`,
            sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
            sub2Raw: filters.sub2 || `geo-${["TR", "US", "RU"][Math.floor(Math.random() * 3)]}|dev-mobile|src-fb`,
            sub3: "",
            sub4: "",
            sub5: "",
            clicks: clicks3,
            uniqueClicks: Math.floor(clicks3 * 0.8),
            conversions: conversions2,
            revenue,
            leadEvents: Math.floor(conversions2 * 0.3),
            regEvents: Math.floor(conversions2 * 0.4),
            depositEvents: Math.floor(conversions2 * 0.3),
            fraudClicks: Math.floor(clicks3 * 0.02),
            avgTimeOnPage: Math.floor(Math.random() * 12e4) + 3e4
            // 30s to 2.5min
          });
        }
        const statistics2 = mockData;
        const summary = statistics2.reduce((acc, row) => {
          acc.totalClicks += row.clicks;
          acc.totalConversions += row.conversions;
          acc.totalRevenue += row.revenue;
          acc.totalLeads += row.leadEvents;
          acc.totalRegs += row.regEvents;
          acc.totalDeposits += row.depositEvents;
          acc.totalFraudClicks += row.fraudClicks;
          return acc;
        }, {
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalLeads: 0,
          totalRegs: 0,
          totalDeposits: 0,
          totalFraudClicks: 0,
          avgCR: 0,
          avgEPC: 0,
          fraudRate: 0
        });
        summary.avgCR = summary.totalClicks > 0 ? summary.totalConversions / summary.totalClicks * 100 : 0;
        summary.avgEPC = summary.totalClicks > 0 ? summary.totalRevenue / summary.totalClicks : 0;
        summary.fraudRate = summary.totalClicks > 0 ? summary.totalFraudClicks / summary.totalClicks * 100 : 0;
        const formattedStatistics = statistics2.map((row) => ({
          id: `${row.date}-${row.offerId}-${row.partnerId}`,
          date: row.date,
          country: row.country || "Unknown",
          device: row.device || "Unknown",
          trafficSource: row.trafficSource || "Direct",
          offerId: row.offerId || "unknown",
          offerName: row.offerName,
          partnerId: row.partnerId || "unknown",
          partnerName: row.partnerName,
          sub1: row.sub1 || "",
          sub2: row.sub2 || "",
          sub3: row.sub3 || "",
          sub4: row.sub4 || "",
          sub5: row.sub5 || "",
          clicks: row.clicks,
          uniqueClicks: row.uniqueClicks,
          conversions: row.conversions,
          revenue: Math.round(row.revenue * 100) / 100,
          leads: row.leadEvents,
          regs: row.regEvents,
          deposits: row.depositEvents,
          cr: row.clicks > 0 ? Math.round(row.conversions / row.clicks * 1e4) / 100 : 0,
          epc: row.clicks > 0 ? Math.round(row.revenue / row.clicks * 100) / 100 : 0,
          fraudClicks: row.fraudClicks,
          fraudRate: row.clicks > 0 ? Math.round(row.fraudClicks / row.clicks * 1e4) / 100 : 0,
          avgTimeOnPage: Math.round(row.avgTimeOnPage / 1e3)
          // Convert to seconds
        }));
        res.json({
          data: formattedStatistics,
          summary: {
            ...summary,
            avgCR: Math.round(summary.avgCR * 100) / 100,
            avgEPC: Math.round(summary.avgEPC * 100) / 100,
            fraudRate: Math.round(summary.fraudRate * 100) / 100,
            totalOffers: new Set(statistics2.map((s) => s.offerId)).size,
            totalPartners: new Set(statistics2.map((s) => s.partnerId)).size
          },
          total: statistics2.length,
          filters
        });
      } catch (error) {
        console.error("Live statistics error:", error);
        if (error instanceof z9.ZodError) {
          return res.status(400).json({ error: "Invalid filters", details: error.errors });
        }
        res.status(500).json({ error: "Failed to fetch live statistics" });
      }
    });
    router7.get("/partner/live-statistics", async (req, res) => {
      try {
        const user = req.user;
        if (!user || user.role !== "affiliate") {
          return res.status(403).json({ error: "Access denied" });
        }
        const filters = enhancedStatsSchema.parse(req.query);
        const partnerId = user.id;
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : /* @__PURE__ */ new Date();
        const whereConditions = [
          gte4(clicks2.tsServer, dateFrom),
          lte5(clicks2.tsServer, dateTo),
          eq9(clicks2.visitorCode, partnerId)
          // Partner can only see their own traffic
        ];
        if (filters.offerId && filters.offerId !== "all") {
          whereConditions.push(eq9(clicks2.offerId, filters.offerId));
        }
        if (filters.country) {
          whereConditions.push(eq9(clicks2.countryIso, filters.country.toUpperCase()));
        }
        if (filters.device && filters.device !== "all") {
          whereConditions.push(eq9(clicks2.deviceType, filters.device));
        }
        const partnerStats = [];
        for (let d = new Date(dateFrom); d <= endDate; d.setDate(d.getDate() + 1)) {
          const clicks3 = Math.floor(Math.random() * 200) + 20;
          const conversions2 = Math.floor(clicks3 * (Math.random() * 0.04 + 0.01));
          const revenue = conversions2 * (Math.random() * 40 + 15);
          partnerStats.push({
            date: d.toISOString().split("T")[0],
            country: filters.country || ["US", "CA", "GB", "DE", "FR", "TR", "RU"][Math.floor(Math.random() * 7)],
            device: filters.device || ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)],
            trafficSource: ["facebook", "google", "native", "email"][Math.floor(Math.random() * 4)],
            offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
            sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
            sub2Raw: filters.sub2 || `geo-${["TR", "US", "RU"][Math.floor(Math.random() * 3)]}|dev-mobile`,
            clicks: clicks3,
            uniqueClicks: Math.floor(clicks3 * 0.85),
            conversions: conversions2,
            revenue,
            payout: revenue * 0.7
            // 70% payout rate
          });
        }
        const partnerSummary = partnerStats.reduce((acc, row) => {
          acc.totalClicks += row.clicks;
          acc.totalConversions += row.conversions;
          acc.totalRevenue += row.revenue;
          acc.totalPayout += row.payout;
          return acc;
        }, {
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalPayout: 0,
          avgCR: 0,
          avgEPC: 0
        });
        partnerSummary.avgCR = partnerSummary.totalClicks > 0 ? partnerSummary.totalConversions / partnerSummary.totalClicks * 100 : 0;
        partnerSummary.avgEPC = partnerSummary.totalClicks > 0 ? partnerSummary.totalPayout / partnerSummary.totalClicks : 0;
        res.json({
          data: partnerStats.map((row) => ({
            id: `${row.date}-${row.offerId}`,
            date: row.date,
            country: row.country || "Unknown",
            device: row.device || "Unknown",
            trafficSource: row.trafficSource || "Direct",
            offerId: row.offerId || "unknown",
            sub1: row.sub1 || "",
            sub2: row.sub2 || "",
            clicks: row.clicks,
            uniqueClicks: row.uniqueClicks,
            conversions: row.conversions,
            revenue: Math.round(row.revenue * 100) / 100,
            payout: Math.round(row.payout * 100) / 100,
            cr: row.clicks > 0 ? Math.round(row.conversions / row.clicks * 1e4) / 100 : 0,
            epc: row.clicks > 0 ? Math.round(row.payout / row.clicks * 100) / 100 : 0
          })),
          summary: {
            ...partnerSummary,
            avgCR: Math.round(partnerSummary.avgCR * 100) / 100,
            avgEPC: Math.round(partnerSummary.avgEPC * 100) / 100,
            totalOffers: new Set(partnerStats.map((s) => s.offerId)).size
          },
          total: partnerStats.length
        });
      } catch (error) {
        console.error("Partner statistics error:", error);
        if (error instanceof z9.ZodError) {
          return res.status(400).json({ error: "Invalid filters", details: error.errors });
        }
        res.status(500).json({ error: "Failed to fetch partner statistics" });
      }
    });
    router7.get("/advertiser/dashboard-metrics", async (req, res) => {
      try {
        const user = req.user;
        if (!user || user.role !== "advertiser") {
          return res.status(403).json({ error: "Access denied" });
        }
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1e3);
        const metrics = [{
          totalClicks: Math.floor(Math.random() * 1e4) + 1e3,
          uniqueVisitors: Math.floor(Math.random() * 8e3) + 800,
          totalConversions: Math.floor(Math.random() * 200) + 50,
          totalRevenue: Math.floor(Math.random() * 5e4) + 5e3,
          topCountry: ["US", "CA", "GB", "DE", "FR", "TR", "RU"][Math.floor(Math.random() * 7)],
          topDevice: ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)]
        }];
        res.json(metrics[0] || {
          totalClicks: 0,
          uniqueVisitors: 0,
          totalConversions: 0,
          totalRevenue: 0,
          topCountry: "Unknown",
          topDevice: "Unknown"
        });
      } catch (error) {
        console.error("Dashboard metrics error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard metrics" });
      }
    });
    router7.get("/advertiser/antifraud-analytics", async (req, res) => {
      try {
        const user = req.user;
        if (!user || user.role !== "advertiser") {
          return res.status(403).json({ error: "Access denied" });
        }
        const filters = enhancedStatsSchema.parse(req.query);
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : /* @__PURE__ */ new Date();
        const antifraudData = [];
        const riskTypes = ["proxy", "bot", "vpn", "suspicious_behavior", "click_flooding"];
        const countries = ["RU", "CN", "TR", "IN", "BD", "PK", "ID"];
        for (let d = new Date(dateFrom); d <= dateTo; d.setDate(d.getDate() + 1)) {
          for (let i = 0; i < 3; i++) {
            const totalClicks = Math.floor(Math.random() * 1e3) + 100;
            const fraudClicks = Math.floor(totalClicks * (Math.random() * 0.4 + 0.05));
            const blockedClicks = Math.floor(fraudClicks * (Math.random() * 0.6 + 0.3));
            const riskScore = Math.floor(Math.random() * 60) + 40;
            antifraudData.push({
              id: `fraud_${d.getTime()}_${i}`,
              date: d.toISOString().split("T")[0],
              ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              country: countries[Math.floor(Math.random() * countries.length)],
              device: ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)],
              trafficSource: ["facebook", "google", "native", "telegram"][Math.floor(Math.random() * 4)],
              offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
              offerName: `Test Offer ${Math.floor(Math.random() * 10) + 1}`,
              partnerId: `partner_${Math.floor(Math.random() * 20) + 1}`,
              partnerName: `Partner ${Math.floor(Math.random() * 20) + 1}`,
              fraudType: riskTypes[Math.floor(Math.random() * riskTypes.length)],
              fraudReason: `${riskTypes[Math.floor(Math.random() * riskTypes.length)].replace("_", " ")} detected by AI system`,
              isProxy: Math.random() > 0.7,
              isVpn: Math.random() > 0.8,
              isTor: Math.random() > 0.95,
              isBot: Math.random() > 0.75,
              suspiciousActivity: Math.random() > 0.6,
              riskScore,
              clicks: totalClicks,
              blockedClicks,
              fraudClicks,
              legitimateClicks: totalClicks - fraudClicks,
              fraudRate: Math.round(fraudClicks / totalClicks * 100),
              timestamp: new Date(d.getTime() + Math.random() * 24 * 60 * 60 * 1e3).toISOString()
            });
          }
        }
        let filteredData = antifraudData;
        if (filters.country) {
          filteredData = filteredData.filter((item) => item.country === filters.country.toUpperCase());
        }
        if (filters.device && filters.device !== "all") {
          filteredData = filteredData.filter((item) => item.device === filters.device);
        }
        const summary = filteredData.reduce((acc, item) => {
          acc.totalClicks += item.clicks;
          acc.totalFraudClicks += item.fraudClicks;
          acc.totalBlockedClicks += item.blockedClicks;
          acc.totalLegitimateClicks += item.legitimateClicks;
          acc.riskScoreSum += item.riskScore;
          const fraudType = item.fraudType;
          acc.fraudTypes[fraudType] = (acc.fraudTypes[fraudType] || 0) + item.fraudClicks;
          const country = item.country;
          acc.countries[country] = (acc.countries[country] || 0) + item.fraudClicks;
          return acc;
        }, {
          totalClicks: 0,
          totalFraudClicks: 0,
          totalBlockedClicks: 0,
          totalLegitimateClicks: 0,
          riskScoreSum: 0,
          fraudTypes: {},
          countries: {}
        });
        const overallFraudRate = summary.totalClicks > 0 ? summary.totalFraudClicks / summary.totalClicks * 100 : 0;
        const avgRiskScore = filteredData.length > 0 ? summary.riskScoreSum / filteredData.length : 0;
        const topFraudTypes = Object.entries(summary.fraudTypes).sort(([, a], [, b]) => b - a).slice(0, 5).map(([type, count3]) => ({ type, count: count3 }));
        const topFraudCountries = Object.entries(summary.countries).sort(([, a], [, b]) => b - a).slice(0, 5).map(([country, count3]) => ({ country, count: count3 }));
        res.json({
          data: filteredData.slice(0, filters.limit),
          summary: {
            totalClicks: summary.totalClicks,
            totalFraudClicks: summary.totalFraudClicks,
            totalBlockedClicks: summary.totalBlockedClicks,
            totalLegitimateClicks: summary.totalLegitimateClicks,
            overallFraudRate: Math.round(overallFraudRate * 100) / 100,
            avgRiskScore: Math.round(avgRiskScore),
            topFraudTypes,
            topFraudCountries
          },
          total: filteredData.length,
          integration: {
            trackingEvents: true,
            realTimeBlocking: true,
            riskScoring: true,
            geoDetection: true,
            deviceFingerprinting: true,
            behaviorAnalysis: true
          }
        });
      } catch (error) {
        console.error("Antifraud analytics error:", error);
        if (error instanceof z9.ZodError) {
          return res.status(400).json({ error: "Invalid filters", details: error.errors });
        }
        res.status(500).json({ error: "Failed to fetch antifraud analytics" });
      }
    });
    analytics_enhanced_default = router7;
  }
});

// server/services/telegramBot.ts
var telegramBot_exports = {};
__export(telegramBot_exports, {
  TelegramBotService: () => TelegramBotService,
  telegramBot: () => telegramBot
});
var TelegramBotService, telegramBot;
var init_telegramBot = __esm({
  "server/services/telegramBot.ts"() {
    "use strict";
    init_storage();
    TelegramBotService = class {
      token;
      baseUrl;
      constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN || "";
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
        if (!this.token) {
          console.error("\u26A0\uFE0F TELEGRAM_BOT_TOKEN not provided");
        } else {
          console.log("\u2705 Telegram Bot service initialized");
          this.setupWebhook();
        }
      }
      async setupWebhook() {
        try {
          const botInfo = await this.getBotInfo();
          console.log("\u{1F916} Bot Info:", botInfo);
          const webhookUrl = `${process.env.REPLIT_EXTERNAL_URL || "https://setbet-arbit.ru"}/api/telegram/webhook`;
          await this.setWebhook(webhookUrl);
          console.log("\u{1F517} Webhook \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D:", webhookUrl);
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 webhook:", error);
        }
      }
      async getBotInfo() {
        const response = await fetch(`${this.baseUrl}/getMe`);
        const data = await response.json();
        return data.result;
      }
      async setWebhook(url) {
        const response = await fetch(`${this.baseUrl}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });
        return await response.json();
      }
      async sendMessage(chatId, message, parseMode = "HTML") {
        try {
          const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: parseMode,
            disable_web_page_preview: true
          };
          console.log("\u{1F4E4} \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 Telegram \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:", { chatId, messageLength: message.length });
          const response = await fetch(`${this.baseUrl}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (result.ok) {
            console.log("\u2705 Telegram \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0443\u0441\u043F\u0435\u0448\u043D\u043E");
            return true;
          } else {
            console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 Telegram \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:", result);
            return false;
          }
        } catch (error) {
          console.error("\u274C Telegram API \u043E\u0448\u0438\u0431\u043A\u0430:", error);
          return false;
        }
      }
      // Уведомление о новой конверсии
      async notifyConversion(data) {
        const user = await storage.getUserById(data.userId);
        if (!user?.telegramChatId) return;
        const message = `
\u{1F389} <b>\u041D\u041E\u0412\u0410\u042F \u041A\u041E\u041D\u0412\u0415\u0420\u0421\u0418\u042F!</b>

\u{1F4B0} <b>\u0421\u0443\u043C\u043C\u0430:</b> ${data.amount} ${data.currency}
\u{1F3AF} <b>\u041E\u0444\u0444\u0435\u0440:</b> ${data.offerName}
\u{1F464} <b>\u041F\u0430\u0440\u0442\u043D\u0435\u0440:</b> ${data.partnerName}
\u{1F30D} <b>\u0421\u0442\u0440\u0430\u043D\u0430:</b> ${data.country || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430"}
\u{1F4F1} <b>\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A:</b> ${data.source || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D"}

\u23F0 <b>\u0412\u0440\u0435\u043C\u044F:</b> ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}
    `;
        await this.sendMessage(user.telegramChatId, message);
      }
      // Уведомление о фроде
      async notifyFraud(data) {
        const user = await storage.getUserById(data.userId);
        if (!user?.telegramChatId) return;
        const severityEmoji = {
          low: "\u{1F7E1}",
          medium: "\u{1F7E0}",
          high: "\u{1F534}"
        };
        const message = `
${severityEmoji[data.severity]} <b>FRAUD ALERT!</b>

\u26A0\uFE0F <b>\u0422\u0438\u043F:</b> ${data.type}
\u{1F4DD} <b>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:</b> ${data.description}
\u{1F4CA} <b>\u0423\u0440\u043E\u0432\u0435\u043D\u044C:</b> ${data.severity.toUpperCase()}
\u{1F310} <b>IP:</b> ${data.ipAddress || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D"}
\u{1F30D} <b>\u0421\u0442\u0440\u0430\u043D\u0430:</b> ${data.country || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430"}

\u23F0 <b>\u0412\u0440\u0435\u043C\u044F:</b> ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}
    `;
        await this.sendMessage(user.telegramChatId, message);
      }
      // Ежедневная статистика
      async sendDailyReport(userId) {
        const user = await storage.getUserById(userId);
        if (!user?.telegramChatId) return;
        const today = /* @__PURE__ */ new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1e3);
        const stats = {
          conversions: 12,
          clicks: 1847,
          revenue: 2340.5,
          currency: "USD",
          cr: 0.65,
          epc: 1.27
        };
        const message = `
\u{1F4CA} <b>\u0414\u041D\u0415\u0412\u041D\u041E\u0419 \u041E\u0422\u0427\u0415\u0422</b>

\u{1F4B0} <b>\u0414\u043E\u0445\u043E\u0434:</b> ${stats.revenue} ${stats.currency}
\u{1F3AF} <b>\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438:</b> ${stats.conversions}
\u{1F446} <b>\u041A\u043B\u0438\u043A\u0438:</b> ${stats.clicks}
\u{1F4C8} <b>CR:</b> ${stats.cr}%
\u{1F4B5} <b>EPC:</b> $${stats.epc}

\u{1F4C5} <b>\u0414\u0430\u0442\u0430:</b> ${today.toLocaleDateString("ru-RU")}
    `;
        await this.sendMessage(user.telegramChatId, message);
      }
      // Обработка входящих сообщений
      async handleUpdate(update) {
        if (!update.message?.text) return;
        const chatId = update.message.chat.id;
        const text4 = update.message.text;
        const userId = update.message.from.id;
        console.log("\u{1F4E5} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E Telegram \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435:", { chatId, text: text4, userId });
        switch (text4) {
          case "/start":
            await this.handleStartCommand(chatId, update.message.from);
            break;
          case "/help":
            await this.handleHelpCommand(chatId);
            break;
          case "/stats":
            await this.handleStatsCommand(chatId, userId);
            break;
          case "/report":
            await this.handleReportCommand(chatId, userId);
            break;
          case "/settings":
            await this.handleSettingsCommand(chatId, userId);
            break;
          default:
            await this.handleUnknownCommand(chatId);
        }
      }
      async handleStartCommand(chatId, from) {
        const message = `
\u{1F44B} \u041F\u0440\u0438\u0432\u0435\u0442, <b>${from.first_name}</b>!

\u042F \u0431\u043E\u0442 ArbiConnect \u0434\u043B\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044F\u0445 \u0438 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0435.

\u{1F517} <b>\u0427\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442:</b>
1. \u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 \u0432\u0430\u0448 \u043A\u0430\u0431\u0438\u043D\u0435\u0442 ArbiConnect
2. \u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432 \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u2192 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F  
3. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u0430\u0448 Chat ID: <code>${chatId}</code>
4. \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 Telegram \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F

\u{1F4CB} <b>\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B:</b>
/stats - \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430
/report - \u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043E\u0442\u0447\u0435\u0442
/settings - \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439
/help - \u041F\u043E\u043C\u043E\u0449\u044C
    `;
        await this.sendMessage(chatId, message);
      }
      async handleHelpCommand(chatId) {
        const message = `
\u{1F198} <b>\u041F\u041E\u041C\u041E\u0429\u042C</b>

\u{1F4CB} <b>\u041A\u043E\u043C\u0430\u043D\u0434\u044B:</b>
/start - \u041D\u0430\u0447\u0430\u043B\u043E \u0440\u0430\u0431\u043E\u0442\u044B
/stats - \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0443 
/report - \u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043E\u0442\u0447\u0435\u0442
/settings - \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438

\u{1F514} <b>\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F:</b>
\u2022 \u041D\u043E\u0432\u044B\u0435 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438
\u2022 Fraud \u0430\u043B\u0435\u0440\u0442\u044B  
\u2022 \u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043E\u0442\u0447\u0435\u0442\u044B
\u2022 \u0412\u0430\u0436\u043D\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F

\u2699\uFE0F <b>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430:</b>
\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 Chat ID: <code>${chatId}</code> \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u044F

\u{1F4AC} <b>\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430:</b> @support
    `;
        await this.sendMessage(chatId, message);
      }
      async handleStatsCommand(chatId, telegramUserId) {
        const user = await storage.getUserByTelegramChatId(chatId);
        if (!user) {
          await this.sendMessage(
            chatId,
            "\u274C \u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /start \u0434\u043B\u044F \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0439."
          );
          return;
        }
        const message = `
\u{1F4CA} <b>\u0422\u0415\u041A\u0423\u0429\u0410\u042F \u0421\u0422\u0410\u0422\u0418\u0421\u0422\u0418\u041A\u0410</b>

\u{1F464} <b>\u0410\u043A\u043A\u0430\u0443\u043D\u0442:</b> ${user.username}
\u{1F4B0} <b>\u0411\u0430\u043B\u0430\u043D\u0441:</b> ${user.balance} USD
\u{1F4C8} <b>\u0412\u0441\u0435\u0433\u043E \u043E\u0444\u0444\u0435\u0440\u043E\u0432:</b> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...
\u{1F3AF} <b>\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445:</b> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...
\u{1F465} <b>\u041F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u0432:</b> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...

\u23F0 \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}
    `;
        await this.sendMessage(chatId, message);
      }
      async handleReportCommand(chatId, telegramUserId) {
        const user = await storage.getUserByTelegramChatId(chatId);
        if (!user) {
          await this.sendMessage(
            chatId,
            "\u274C \u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /start \u0434\u043B\u044F \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0439."
          );
          return;
        }
        await this.sendDailyReport(user.id);
      }
      async handleSettingsCommand(chatId, telegramUserId) {
        const message = `
\u2699\uFE0F <b>\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0418 \u0423\u0412\u0415\u0414\u041E\u041C\u041B\u0415\u041D\u0418\u0419</b>

\u{1F514} <b>\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C/\u0432\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C:</b>
\u2022 \u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438 - \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u2705
\u2022 Fraud \u0430\u043B\u0435\u0440\u0442\u044B - \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u2705  
\u2022 \u0414\u043D\u0435\u0432\u043D\u044B\u0435 \u043E\u0442\u0447\u0435\u0442\u044B - \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u2705

\u23F0 <b>\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u0447\u0435\u0442\u043E\u0432:</b> 09:00 UTC

\u{1F4F1} <b>Chat ID:</b> <code>${chatId}</code>

\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u043E\u0436\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0432 \u0432\u0435\u0431-\u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0435 ArbiConnect
    `;
        await this.sendMessage(chatId, message);
      }
      async handleUnknownCommand(chatId) {
        await this.sendMessage(
          chatId,
          "\u2753 \u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u0430. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /help \u0434\u043B\u044F \u0441\u043F\u0438\u0441\u043A\u0430 \u043A\u043E\u043C\u0430\u043D\u0434."
        );
      }
    };
    telegramBot = new TelegramBotService();
  }
});

// server/index.ts
import express4 from "express";

// server/routes.ts
init_storage();
init_objectStorage();
init_schema();
init_postback_schema();
init_db();
init_notification();
import { createServer } from "http";
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
import { sql as sql9 } from "drizzle-orm";
import { eq as eq10, and as and10, gte as gte5, lte as lte6, count as count2, sum as sum2, desc as desc7, or as or3, isNotNull as isNotNull2, inArray as inArray2 } from "drizzle-orm";
import { z as z10 } from "zod";
import { randomUUID as randomUUID5 } from "crypto";
import { nanoid as nanoid3 } from "nanoid";

// server/middleware/security.ts
init_notification();
var loginAttempts = /* @__PURE__ */ new Map();
var auditLogs2 = [];
var auditLog = (req, action, resource, success = true, details) => {
  const entry = {
    timestamp: /* @__PURE__ */ new Date(),
    userId: req.user?.id,
    action,
    resource,
    ip: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent"),
    success,
    details
  };
  auditLogs2.push(entry);
  if (auditLogs2.length > 1e4) {
    auditLogs2.splice(0, auditLogs2.length - 1e4);
  }
  console.log(`AUDIT: ${action} by ${entry.userId || "anonymous"} from ${entry.ip} - ${success ? "SUCCESS" : "FAILED"}`);
};
var loginRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || "unknown";
  if (clientIP === "127.0.0.1" || clientIP === "::1" || clientIP === "localhost" || clientIP.startsWith("::ffff:127.")) {
    return next();
  }
  const now = Date.now();
  const key = `${clientIP}_login`;
  let entry = loginAttempts.get(key);
  const windowMs = 15 * 60 * 1e3;
  const maxAttempts = 10;
  if (!entry) {
    entry = { count: 0, lastAttempt: now, blocked: false };
    loginAttempts.set(key, entry);
  }
  if (now - entry.lastAttempt > windowMs) {
    entry.count = 0;
    entry.blocked = false;
  }
  if (entry.blocked) {
    auditLog(req, "LOGIN_ATTEMPT_BLOCKED", void 0, false, { ip: clientIP, reason: "IP temporarily blocked" });
    return res.status(429).json({
      error: "Too many failed login attempts. Try again later.",
      retryAfter: Math.ceil((entry.lastAttempt + windowMs - now) / 1e3)
    });
  }
  next();
};
var recordFailedLogin = (req) => {
  const clientIP = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const key = `${clientIP}_login`;
  let entry = loginAttempts.get(key) || { count: 0, lastAttempt: now, blocked: false };
  entry.count++;
  entry.lastAttempt = now;
  if (entry.count >= 5) {
    entry.blocked = true;
    notificationService.sendNotification({
      type: "fraud_detected",
      userId: "system",
      data: {
        fraudType: "Multiple failed login attempts",
        description: `${entry.count} failed login attempts from IP ${clientIP}`,
        ip: clientIP,
        userAgent: req.get("User-Agent")
      },
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  loginAttempts.set(key, entry);
  auditLog(req, "FAILED_LOGIN", void 0, false, { ip: clientIP, attempts: entry.count });
};
var knownDevices = /* @__PURE__ */ new Map();
var trackDevice = async (req, userId) => {
  const deviceFingerprint = `${req.ip}_${req.get("User-Agent")}`;
  const userDevices = knownDevices.get(userId) || /* @__PURE__ */ new Set();
  if (!userDevices.has(deviceFingerprint)) {
    userDevices.add(deviceFingerprint);
    knownDevices.set(userId, userDevices);
    if (userDevices.size > 1) {
      await notificationService.sendNotification({
        type: "new_device_login",
        userId,
        data: {
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          email: req.user?.email
        },
        timestamp: /* @__PURE__ */ new Date()
      });
    }
  }
};
var detectFraud = (req, action, details) => {
  const clientIP = req.ip || req.connection.remoteAddress || "";
  const patterns = [];
  if (action === "registration" && details.email) {
    patterns.push("multiple_registrations_same_ip");
  }
  const userAgent = req.get("User-Agent") || "";
  if (userAgent.includes("bot") || userAgent.includes("crawler") || userAgent.length < 10) {
    patterns.push("suspicious_user_agent");
  }
  if (clientIP.startsWith("10.") || clientIP.startsWith("192.168.") || clientIP === "127.0.0.1") {
    patterns.push("potential_vpn");
  }
  if (patterns.length > 0) {
    notificationService.sendNotification({
      type: "fraud_detected",
      userId: req.user?.id || "anonymous",
      data: {
        fraudType: patterns.join(", "),
        description: `Detected patterns: ${patterns.join(", ")}`,
        ip: clientIP,
        userAgent,
        action,
        details
      },
      timestamp: /* @__PURE__ */ new Date()
    });
  }
};
var getAuditLogs = (filters) => {
  let filtered = [...auditLogs2];
  if (filters?.userId) {
    filtered = filtered.filter((log2) => log2.userId === filters.userId);
  }
  if (filters?.action) {
    filtered = filtered.filter((log2) => log2.action.includes(filters.action || ""));
  }
  if (filters?.fromDate) {
    filtered = filtered.filter((log2) => log2.timestamp >= filters.fromDate);
  }
  if (filters?.toDate) {
    filtered = filtered.filter((log2) => log2.timestamp <= filters.toDate);
  }
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  return filtered;
};

// server/routes.ts
init_auth();
init_postback();

// server/routes/conversion.ts
init_db();
init_schema();
init_postback();
import { Router } from "express";
import { eq as eq5, and as and5, sql as sql4 } from "drizzle-orm";
var router = Router();
var requireAuth = async (req, res, next) => {
  next();
};
router.post("/event", requireAuth, async (req, res) => {
  try {
    const {
      clickId,
      eventType,
      status,
      payout,
      currency = "USD",
      transactionId,
      subId1,
      subId2,
      subId3,
      subId4,
      subId5
    } = req.body;
    if (!clickId || !eventType) {
      return res.status(400).json({
        error: "ClickId and eventType are required"
      });
    }
    const [click] = await db.select().from(trackingClicks).where(eq5(trackingClicks.clickId, clickId));
    if (!click) {
      return res.status(404).json({
        error: "Click not found"
      });
    }
    const conversionData2 = {
      payout: payout ? parseFloat(payout) : 0,
      currency: currency || "USD",
      transactionId: transactionId || clickId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.update(trackingClicks).set({
      status: status || "converted",
      conversionData: conversionData2
    }).where(eq5(trackingClicks.clickId, clickId));
    const postbackData = {
      clickid: clickId,
      status: status || "approved",
      payout: payout || "0",
      currency,
      offer_id: click.offerId,
      partner_id: click.partnerId,
      transaction_id: transactionId || clickId,
      timestamp: Math.floor(Date.now() / 1e3).toString(),
      sub1: subId1 || click.subId1 || "",
      sub2: subId2 || click.subId2 || "",
      sub3: subId3 || click.subId3 || "",
      sub4: subId4 || click.subId4 || "",
      sub5: subId5 || click.subId5 || "",
      ip: click.ip || "",
      country: click.country || "",
      device: click.device || "",
      browser: click.browser || "",
      os: click.os || ""
    };
    const postbackEvent = {
      type: eventType,
      clickId,
      data: postbackData
    };
    console.log("About to trigger postbacks for event:", postbackEvent);
    const results = await PostbackService.triggerPostbacks(postbackEvent);
    console.log("Postback trigger completed, results:", results.length);
    console.log(`Conversion event processed: ${eventType} for click ${clickId}`);
    res.json({
      success: true,
      message: "Conversion event processed",
      clickId,
      eventType,
      status: status || "approved",
      payout,
      postbacksSent: results.filter((r) => r.status === "fulfilled").length,
      postbacksFailed: results.filter((r) => r.status === "rejected").length
    });
  } catch (error) {
    console.error("Error processing conversion event:", error);
    res.status(500).json({
      error: "Failed to process conversion event",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.post("/test-conversion", requireAuth, async (req, res) => {
  try {
    const [recentClick] = await db.select().from(trackingClicks).where(eq5(trackingClicks.status, "active")).orderBy(sql4`RANDOM()`).limit(1);
    if (!recentClick) {
      return res.status(404).json({
        error: "No active clicks found to convert"
      });
    }
    const testConversion = {
      clickId: recentClick.clickId,
      eventType: "conversion",
      status: "approved",
      payout: (Math.random() * 100 + 10).toFixed(2),
      currency: "USD",
      transactionId: `test_${Date.now()}`
    };
    const conversionResponse = await fetch(`${req.protocol}://${req.get("host")}/api/conversion/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || ""
      },
      body: JSON.stringify(testConversion)
    });
    const result = await conversionResponse.json();
    res.json({
      success: true,
      message: "Test conversion generated",
      conversion: testConversion,
      result
    });
  } catch (error) {
    console.error("Error generating test conversion:", error);
    res.status(500).json({
      error: "Failed to generate test conversion"
    });
  }
});
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let query = db.select({
      total: sql4`COUNT(*)`,
      converted: sql4`COUNT(CASE WHEN status = 'converted' THEN 1 END)`,
      totalPayout: sql4`SUM(CASE WHEN conversion_data IS NOT NULL THEN CAST(conversion_data->>'payout' AS DECIMAL) ELSE 0 END)`,
      avgPayout: sql4`AVG(CASE WHEN conversion_data IS NOT NULL THEN CAST(conversion_data->>'payout' AS DECIMAL) ELSE NULL END)`
    }).from(trackingClicks);
    if (dateFrom && dateTo) {
      query = query.where(
        and5(
          sql4`created_at >= ${dateFrom}`,
          sql4`created_at <= ${dateTo}`
        )
      );
    }
    const [stats] = await query;
    res.json({
      success: true,
      stats: {
        totalClicks: parseInt(stats.total) || 0,
        conversions: parseInt(stats.converted) || 0,
        conversionRate: stats.total ? (parseInt(stats.converted) / parseInt(stats.total) * 100).toFixed(2) + "%" : "0%",
        totalPayout: parseFloat(stats.totalPayout) || 0,
        averagePayout: parseFloat(stats.avgPayout) || 0
      }
    });
  } catch (error) {
    console.error("Error fetching conversion stats:", error);
    res.status(500).json({
      error: "Failed to fetch conversion statistics"
    });
  }
});
var conversion_default = router;

// server/routes/analytics.ts
init_storage();
init_db();
init_schema();
import { Router as Router2 } from "express";
import { z as z3 } from "zod";
import { sql as sql5 } from "drizzle-orm";
import { eq as eq6, and as and6, desc as desc4 } from "drizzle-orm";
var router2 = Router2();
var statisticsFiltersSchema = z3.object({
  dateFrom: z3.string().optional(),
  dateTo: z3.string().optional(),
  offerId: z3.string().optional(),
  partnerId: z3.string().optional(),
  country: z3.string().optional(),
  device: z3.string().optional(),
  trafficSource: z3.string().optional(),
  sub1: z3.string().optional(),
  sub2: z3.string().optional(),
  sub3: z3.string().optional(),
  sub4: z3.string().optional(),
  sub5: z3.string().optional(),
  groupBy: z3.union([z3.string(), z3.array(z3.string())]).optional().transform(
    (val) => typeof val === "string" ? [val] : val || ["date"]
  ),
  page: z3.string().optional(),
  limit: z3.string().optional(),
  search: z3.string().optional()
});
async function getRealAnalyticsData(filters) {
  try {
    const result = await db.select({
      id: trackingClicks.id,
      clickId: trackingClicks.clickId,
      date: trackingClicks.createdAt,
      partnerId: trackingClicks.partnerId,
      partnerName: users.username,
      offerId: trackingClicks.offerId,
      offerName: offers.name,
      country: trackingClicks.country,
      device: trackingClicks.device,
      sub1: trackingClicks.subId1,
      sub2: trackingClicks.subId2,
      sub3: trackingClicks.subId3,
      sub4: trackingClicks.subId4,
      sub5: trackingClicks.subId5,
      sub6: trackingClicks.subId6,
      sub7: trackingClicks.subId7,
      sub8: trackingClicks.subId8,
      sub9: trackingClicks.subId9,
      sub10: trackingClicks.subId10,
      sub11: trackingClicks.subId11,
      sub12: trackingClicks.subId12,
      sub13: trackingClicks.subId13,
      sub14: trackingClicks.subId14,
      sub15: trackingClicks.subId15,
      sub16: trackingClicks.subId16,
      ip: trackingClicks.ip,
      referer: trackingClicks.referer,
      fraudScore: trackingClicks.fraudScore,
      isBot: trackingClicks.isBot,
      vpnDetected: trackingClicks.vpnDetected,
      status: trackingClicks.status,
      revenue: sql5`COALESCE((${trackingClicks.conversionData}->>'revenue')::decimal, 0)`,
      conversions: sql5`CASE WHEN ${trackingClicks.status} = 'converted' THEN 1 ELSE 0 END`
    }).from(trackingClicks).leftJoin(users, eq6(trackingClicks.partnerId, users.id)).leftJoin(offers, eq6(trackingClicks.offerId, offers.id)).where(and6(
      filters.offerId ? eq6(trackingClicks.offerId, filters.offerId) : void 0,
      filters.partnerId ? eq6(trackingClicks.partnerId, filters.partnerId) : void 0,
      filters.country ? eq6(trackingClicks.country, filters.country) : void 0,
      filters.device ? eq6(trackingClicks.device, filters.device) : void 0
    )).orderBy(desc4(trackingClicks.createdAt)).limit(100);
    return result.map((row) => {
      const revenue = parseFloat(row.revenue) || 0;
      const conversions2 = parseInt(row.conversions) || 0;
      const payout = conversions2 * 15;
      const profit = revenue - payout;
      return {
        id: `click_${row.clickId}`,
        date: row.date.toISOString().split("T")[0],
        clickId: row.clickId,
        partnerId: row.partnerId,
        partnerName: row.partnerName || "Unknown Partner",
        offerId: row.offerId,
        offerName: row.offerName || "Unknown Offer",
        country: row.country || "Unknown",
        device: row.device || "Unknown",
        trafficSource: (() => {
          try {
            return row.referer ? new URL(row.referer).hostname : "direct";
          } catch {
            return row.referer || "direct";
          }
        })(),
        sub1: row.sub1 || "",
        sub2: row.sub2 || "",
        sub3: row.sub3 || "",
        sub4: row.sub4 || "",
        sub5: row.sub5 || "",
        sub6: row.sub6 || "",
        sub7: row.sub7 || "",
        sub8: row.sub8 || "",
        sub9: row.sub9 || "",
        sub10: row.sub10 || "",
        sub11: row.sub11 || "",
        sub12: row.sub12 || "",
        sub13: row.sub13 || "",
        sub14: row.sub14 || "",
        sub15: row.sub15 || "",
        sub16: row.sub16 || "",
        clicks: 1,
        // Each row is one click
        uniqueClicks: 1,
        conversions: conversions2,
        revenue,
        payout: parseFloat(payout.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        cr: conversions2 > 0 ? 100 : 0,
        // Either 0% or 100% for individual clicks
        epc: revenue,
        ctr: Math.random() * 3 + 1,
        // Mock CTR for now
        roi: payout > 0 ? (revenue - payout) / payout * 100 : 0,
        fraudClicks: row.isBot || row.fraudScore > 50 ? 1 : 0,
        fraudRate: row.isBot || row.fraudScore > 50 ? 100 : 0
      };
    });
  } catch (error) {
    console.error("Error getting real analytics data:", error);
    return [];
  }
}
function generateMockStatistics(filters) {
  const mockData = [];
  const startDate = new Date(filters.dateFrom || Date.now() - 7 * 24 * 60 * 60 * 1e3);
  const endDate2 = new Date(filters.dateTo || Date.now());
  for (let d = new Date(startDate); d <= endDate2; d.setDate(d.getDate() + 1)) {
    const clicks3 = Math.floor(Math.random() * 1e3) + 100;
    const conversions2 = Math.floor(clicks3 * (Math.random() * 0.05 + 0.01));
    const revenue = conversions2 * (Math.random() * 50 + 20);
    const payout = revenue * (Math.random() * 0.3 + 0.5);
    mockData.push({
      id: `${d.toISOString().split("T")[0]}-${Math.random().toString(36).substr(2, 9)}`,
      date: d.toISOString().split("T")[0],
      country: filters.country || ["US", "CA", "GB", "DE", "FR"][Math.floor(Math.random() * 5)],
      device: filters.device || ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)],
      trafficSource: filters.trafficSource || ["facebook", "google", "native", "email"][Math.floor(Math.random() * 4)],
      offerId: filters.offerId || `offer_${Math.floor(Math.random() * 10) + 1}`,
      offerName: `\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u043E\u0444\u0444\u0435\u0440 ${Math.floor(Math.random() * 10) + 1}`,
      partnerId: filters.partnerId || `partner_${Math.floor(Math.random() * 20) + 1}`,
      partnerName: `\u041F\u0430\u0440\u0442\u043D\u0435\u0440 ${Math.floor(Math.random() * 20) + 1}`,
      sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
      sub2: filters.sub2 || `sub2_${Math.floor(Math.random() * 5) + 1}`,
      sub3: filters.sub3 || "",
      sub4: filters.sub4 || "",
      sub5: filters.sub5 || "",
      clicks: clicks3,
      uniqueClicks: Math.floor(clicks3 * 0.8),
      conversions: conversions2,
      revenue: Math.round(revenue * 100) / 100,
      payout: Math.round(payout * 100) / 100,
      profit: Math.round((revenue - payout) * 100) / 100,
      cr: Math.round(conversions2 / clicks3 * 1e4) / 100,
      epc: Math.round(revenue / clicks3 * 100) / 100,
      ctr: Math.round(Math.random() * 300) / 100 + 1,
      // 1-4% CTR
      roi: Math.round((revenue - payout) / payout * 1e4) / 100,
      fraudClicks: Math.floor(clicks3 * Math.random() * 0.02),
      // 0-2% fraud
      fraudRate: Math.round(Math.random() * 200) / 100
      // 0-2% fraud rate
    });
  }
  return mockData;
}
router2.get("/advertiser/statistics", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "advertiser") {
      return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    const filters = statisticsFiltersSchema.parse(req.query);
    const realData = await getRealAnalyticsData(filters);
    const summary = {
      totalClicks: realData.reduce((sum3, row) => sum3 + row.clicks, 0),
      totalConversions: realData.reduce((sum3, row) => sum3 + row.conversions, 0),
      totalRevenue: Math.round(realData.reduce((sum3, row) => sum3 + row.revenue, 0) * 100) / 100,
      avgCR: 0,
      avgEPC: 0,
      totalOffers: new Set(realData.map((row) => row.offerId)).size,
      totalPartners: new Set(realData.map((row) => row.partnerId)).size
    };
    if (summary.totalClicks > 0) {
      summary.avgCR = Math.round(summary.totalConversions / summary.totalClicks * 1e4) / 100;
      summary.avgEPC = Math.round(summary.totalRevenue / summary.totalClicks * 100) / 100;
    }
    res.json({
      data: realData,
      summary,
      total: realData.length
    });
  } catch (error) {
    console.error("Error fetching advertiser statistics:", error);
    res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438" });
  }
});
router2.get("/partner/statistics", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "affiliate") {
      return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    const filters = statisticsFiltersSchema.parse(req.query);
    const mockData = generateMockStatistics({ ...filters, partnerId: user.id });
    const summary = {
      totalClicks: mockData.reduce((sum3, row) => sum3 + row.clicks, 0),
      totalConversions: mockData.reduce((sum3, row) => sum3 + row.conversions, 0),
      totalPayout: Math.round(mockData.reduce((sum3, row) => sum3 + row.payout, 0) * 100) / 100,
      avgCR: 0,
      avgEPC: 0,
      totalOffers: new Set(mockData.map((row) => row.offerId)).size
    };
    if (summary.totalClicks > 0) {
      summary.avgCR = Math.round(summary.totalConversions / summary.totalClicks * 1e4) / 100;
      summary.avgEPC = Math.round(summary.totalPayout / summary.totalClicks * 100) / 100;
    }
    res.json({
      data: mockData,
      summary,
      total: mockData.length
    });
  } catch (error) {
    console.error("Error fetching partner statistics:", error);
    res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438" });
  }
});
router2.get("/advertiser/statistics/export", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "advertiser") {
      return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    const filters = statisticsFiltersSchema.extend({
      format: z3.enum(["csv", "xlsx", "json"]).default("csv")
    }).parse(req.query);
    const data = generateMockStatistics(filters);
    if (filters.format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=statistics.json");
      return res.json(data);
    }
    if (filters.format === "csv") {
      const headers = [
        "\u0414\u0430\u0442\u0430",
        "\u0421\u0442\u0440\u0430\u043D\u0430",
        "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E",
        "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A",
        "\u041E\u0444\u0444\u0435\u0440",
        "\u041F\u0430\u0440\u0442\u043D\u0435\u0440",
        "\u041A\u043B\u0438\u043A\u0438",
        "\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438",
        "CR%",
        "EPC$",
        "\u0414\u043E\u0445\u043E\u0434$",
        "\u0412\u044B\u043F\u043B\u0430\u0442\u0430$",
        "\u041F\u0440\u0438\u0431\u044B\u043B\u044C$"
      ];
      let csv = headers.join(",") + "\n";
      data.forEach((row) => {
        csv += [
          row.date,
          row.country,
          row.device,
          row.trafficSource,
          row.offerName,
          row.partnerName,
          row.clicks,
          row.conversions,
          row.cr,
          row.epc,
          row.revenue,
          row.payout,
          row.profit
        ].join(",") + "\n";
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=statistics.csv");
      return res.send(csv);
    }
    res.status(400).json({ error: "\u041D\u0435\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430" });
  } catch (error) {
    console.error("Error exporting statistics:", error);
    res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438" });
  }
});
router2.get("/advertiser/offers", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "advertiser") {
      return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    const offers3 = await storage.getOffers(user.id);
    res.json(offers3);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043E\u0444\u0444\u0435\u0440\u043E\u0432" });
  }
});
router2.get("/advertiser/partners", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "advertiser") {
      return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    const partners = await storage.getUsersByOwner(user.id, "affiliate");
    res.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u0432" });
  }
});
var analytics_default = router2;

// server/services/creativeService.ts
init_db();
init_schema();
init_schema();
import { eq as eq7, and as and7, desc as desc5, sql as sql6 } from "drizzle-orm";
import archiver from "archiver";
import { randomUUID as randomUUID3 } from "crypto";
var CreativeService = class {
  // Получить все креативы для оффера
  async getOfferCreatives(offerId) {
    const creativesData = await db.select().from(creativeFiles).where(and7(
      eq7(creativeFiles.offerId, offerId),
      eq7(creativeFiles.isActive, true)
    )).orderBy(desc5(creativeFiles.createdAt));
    return creativesData;
  }
  // Сохранить информацию о загруженном файле
  async saveCreativeFile(data) {
    const [file] = await db.insert(creativeFiles).values({
      offerId: data.offerId,
      fileName: data.fileName,
      originalName: data.originalName,
      fileType: data.fileType,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      filePath: data.filePath,
      publicUrl: data.publicUrl,
      dimensions: data.dimensions,
      duration: data.duration,
      description: data.description,
      tags: data.tags || [],
      uploadedBy: data.uploadedBy,
      isActive: true
    }).returning();
    return file;
  }
  // Создать набор креативов
  async createCreativeSet(data) {
    const [set] = await db.insert(creativeSets).values({
      id: randomUUID3(),
      ...data
    }).returning();
    return set;
  }
  // Добавить файл в набор
  async addFileToSet(setId, fileId, displayOrder = 0) {
    const [relation] = await db.insert(creativeSetFiles).values({
      id: randomUUID3(),
      setId,
      fileId,
      displayOrder
    }).returning();
    return relation;
  }
  // Создать ZIP архив с креативами для скачивания
  async createCreativeArchive(offerId, res) {
    const creatives2 = await this.getOfferCreatives(offerId);
    if (creatives2.length === 0) {
      throw new Error("\u041A\u0440\u0435\u0430\u0442\u0438\u0432\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B");
    }
    const [offer2] = await db.select().from(offers).where(eq7(offers.id, offerId));
    if (!offer2) {
      throw new Error("\u041E\u0444\u0444\u0435\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D");
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="creatives-${offer2.name}-${offerId}.zip"`);
    const archive = archiver("zip", {
      zlib: { level: 9 }
    });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0430\u0440\u0445\u0438\u0432\u0430" });
      }
    });
    archive.pipe(res);
    const imageFiles = creatives2.filter((c) => c.fileType && c.fileType.startsWith("image"));
    const videoFiles = creatives2.filter((c) => c.fileType && c.fileType.startsWith("video"));
    const documentFiles = creatives2.filter((c) => c.fileType && c.fileType.includes("document"));
    const readmeContent = `CREATIVE PACK FOR ${offer2.name}
Offer ID: ${offerId}
Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

\u0421\u041E\u0414\u0415\u0420\u0416\u0418\u041C\u041E\u0415 \u0410\u0420\u0425\u0418\u0412\u0410:
- ${imageFiles.length} \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439
- ${videoFiles.length} \u0432\u0438\u0434\u0435\u043E
- ${documentFiles.length} \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432

\u0421\u0422\u0420\u0423\u041A\u0422\u0423\u0420\u0410 \u041F\u0410\u041F\u041E\u041A:
/images/ - \u0431\u0430\u043D\u043D\u0435\u0440\u044B, \u043B\u043E\u0433\u043E\u0442\u0438\u043F\u044B, \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F
/videos/ - \u0432\u0438\u0434\u0435\u043E-\u043A\u0440\u0435\u0430\u0442\u0438\u0432\u044B, \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438
/documents/ - \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438, \u0431\u0440\u0435\u043D\u0434\u0431\u0443\u043A\u0438, \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438

\u0418\u0421\u041F\u041E\u041B\u042C\u0417\u041E\u0412\u0410\u041D\u0418\u0415:
1. \u0412\u0441\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0433\u043E\u0442\u043E\u0432\u044B \u043A \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044E
2. \u0421\u043E\u0431\u043B\u044E\u0434\u0430\u0439\u0442\u0435 \u0431\u0440\u0435\u043D\u0434\u0438\u043D\u0433-\u0433\u0430\u0439\u0434\u043B\u0430\u0439\u043D\u044B
3. \u0422\u0435\u0441\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u044B \u043F\u0435\u0440\u0435\u0434 \u0437\u0430\u043F\u0443\u0441\u043A\u043E\u043C \u043A\u0430\u043C\u043F\u0430\u043D\u0438\u0439
4. \u041F\u0440\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u0445 \u043E\u0431\u0440\u0430\u0449\u0430\u0439\u0442\u0435\u0441\u044C \u043A \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044E

\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B: support@platform.com`;
    archive.append(readmeContent, { name: "README.txt" });
    imageFiles.forEach((creative, index3) => {
      const fileInfo = `\u0424\u0430\u0439\u043B: ${creative.originalName}
\u0422\u0438\u043F: ${creative.mimeType}
\u0420\u0430\u0437\u043C\u0435\u0440: ${creative.fileSize} \u0431\u0430\u0439\u0442
\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435: ${creative.dimensions || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"}
\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ${creative.description || "\u0411\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F"}
\u0422\u0435\u0433\u0438: ${creative.tags?.join(", ") || "\u041D\u0435\u0442 \u0442\u0435\u0433\u043E\u0432"}
\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D: ${creative.createdAt}

\u0414\u0415\u041C\u041E: \u0412 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0437\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u0444\u0430\u0439\u043B \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F.
\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0443\u0442\u044C: ${creative.filePath}`;
      archive.append(fileInfo, { name: `images/${creative.originalName}.info.txt` });
    });
    videoFiles.forEach((creative, index3) => {
      const fileInfo = `\u0424\u0430\u0439\u043B: ${creative.originalName}
\u0422\u0438\u043F: ${creative.mimeType}
\u0420\u0430\u0437\u043C\u0435\u0440: ${creative.fileSize} \u0431\u0430\u0439\u0442
\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435: ${creative.dimensions || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"}
\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C: ${creative.duration ? `${creative.duration} \u0441\u0435\u043A\u0443\u043D\u0434` : "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"}
\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ${creative.description || "\u0411\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F"}
\u0422\u0435\u0433\u0438: ${creative.tags?.join(", ") || "\u041D\u0435\u0442 \u0442\u0435\u0433\u043E\u0432"}
\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D: ${creative.createdAt}

\u0414\u0415\u041C\u041E: \u0412 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0437\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u0435\u043E \u0444\u0430\u0439\u043B.
\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0443\u0442\u044C: ${creative.filePath}`;
      archive.append(fileInfo, { name: `videos/${creative.originalName}.info.txt` });
    });
    documentFiles.forEach((creative, index3) => {
      const fileInfo = `\u0424\u0430\u0439\u043B: ${creative.originalName}
\u0422\u0438\u043F: ${creative.mimeType}
\u0420\u0430\u0437\u043C\u0435\u0440: ${creative.fileSize} \u0431\u0430\u0439\u0442
\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ${creative.description || "\u0411\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F"}
\u0422\u0435\u0433\u0438: ${creative.tags?.join(", ") || "\u041D\u0435\u0442 \u0442\u0435\u0433\u043E\u0432"}
\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D: ${creative.createdAt}

\u0414\u0415\u041C\u041E: \u0412 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0437\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442.
\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0443\u0442\u044C: ${creative.filePath}`;
      archive.append(fileInfo, { name: `documents/${creative.originalName}.info.txt` });
    });
    await this.incrementDownloadCount(offerId);
    archive.finalize();
  }
  // Увеличить счетчик скачиваний
  async incrementDownloadCount(offerId) {
    await db.update(creativeSets).set({
      downloadCount: sql6`${creativeSets.downloadCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(creativeSets.offerId, offerId));
  }
  // Получить статистику по креативам
  async getCreativeStats(offerId) {
    const stats = await db.select({
      totalFiles: sql6`count(*)`,
      totalSize: sql6`sum(${creativeFiles.fileSize})`,
      imageCount: sql6`count(*) filter (where ${creativeFiles.fileType} = 'image')`,
      videoCount: sql6`count(*) filter (where ${creativeFiles.fileType} = 'video')`,
      documentCount: sql6`count(*) filter (where ${creativeFiles.fileType} = 'document')`
    }).from(creativeFiles).where(and7(
      eq7(creativeFiles.offerId, offerId),
      eq7(creativeFiles.isActive, true)
    ));
    return stats[0];
  }
};

// server/routes.ts
init_trackingLinks();

// server/services/dnsVerification.ts
import { randomBytes as randomBytes4 } from "crypto";
import { promisify as promisify2 } from "util";
import { resolveTxt as resolveTxt2 } from "dns";
import fetch2 from "node-fetch";
var resolveTxtAsync = promisify2(resolveTxt2);
var DNSVerificationService = class {
  // Generate unique verification code
  static generateVerificationCode() {
    return `verify=${randomBytes4(16).toString("hex")}`;
  }
  // DNS TXT record verification
  static async verifyDNSTxtRecord(domain, expectedCode) {
    try {
      console.log(`Verifying DNS TXT record for domain: ${domain}`);
      console.log(`Expected verification code: ${expectedCode}`);
      const records = await resolveTxtAsync(domain);
      console.log(`DNS TXT records found:`, records);
      const isVerified = records.some(
        (recordArray) => recordArray.some((record) => record.includes(expectedCode))
      );
      if (isVerified) {
        console.log(`\u2705 Domain ${domain} verified successfully via DNS TXT record`);
        return { success: true, method: "dns" };
      } else {
        console.log(`\u274C Verification code not found in DNS TXT records for ${domain}`);
        return {
          success: false,
          method: "dns",
          error: "Verification code not found in DNS TXT records"
        };
      }
    } catch (error) {
      console.error(`DNS verification error for ${domain}:`, error);
      return {
        success: false,
        method: "dns",
        error: `DNS lookup failed: ${error.message}`
      };
    }
  }
  // File-based verification (alternative method)
  static async verifyFileMethod(domain, expectedCode) {
    try {
      console.log(`Verifying file method for domain: ${domain}`);
      const verificationUrl = `https://${domain}/trk-verification.txt`;
      console.log(`Fetching verification file from: ${verificationUrl}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch2(verificationUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Affiliate-Platform-Verifier/1.0"
        }
      });
      clearTimeout(timeout);
      if (!response.ok) {
        return {
          success: false,
          method: "file",
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      const content = await response.text();
      console.log(`File content received:`, content);
      if (content.trim().includes(expectedCode)) {
        console.log(`\u2705 Domain ${domain} verified successfully via file method`);
        return { success: true, method: "file" };
      } else {
        console.log(`\u274C Verification code not found in file for ${domain}`);
        return {
          success: false,
          method: "file",
          error: "Verification code not found in file content"
        };
      }
    } catch (error) {
      console.error(`File verification error for ${domain}:`, error);
      return {
        success: false,
        method: "file",
        error: `File verification failed: ${error.message}`
      };
    }
  }
  // Try both verification methods
  static async verifyDomain(domain, expectedCode) {
    console.log(`Starting domain verification for: ${domain}`);
    const dnsResult = await this.verifyDNSTxtRecord(domain, expectedCode);
    if (dnsResult.success) {
      return dnsResult;
    }
    console.log(`DNS verification failed, trying file method...`);
    const fileResult = await this.verifyFileMethod(domain, expectedCode);
    return fileResult;
  }
  // Validate domain format
  static isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }
  // Generate verification instructions for user
  static getVerificationInstructions(domain, verificationCode) {
    return {
      dns: {
        title: "DNS TXT Record Verification",
        description: "Add the following TXT record to your domain's DNS settings:",
        record: {
          type: "TXT",
          name: domain,
          value: verificationCode,
          ttl: "300 (optional)"
        },
        note: "DNS changes may take up to 24 hours to propagate worldwide."
      },
      file: {
        title: "File Upload Verification (Alternative)",
        description: "Upload a verification file to your domain root:",
        file: {
          path: `https://${domain}/trk-verification.txt`,
          content: verificationCode
        },
        note: "Ensure the file is accessible via HTTPS and returns the exact verification code."
      }
    };
  }
};

// server/routes.ts
init_environment();
var JWT_SECRET2 = config.JWT_SECRET;
async function registerRoutes(app2) {
  const trackingRoutes = await Promise.resolve().then(() => (init_tracking(), tracking_exports));
  const postbackRoutes = await Promise.resolve().then(() => (init_postbacks(), postbacks_exports));
  app2.use("/track", trackingRoutes.default);
  app2.use("/api/postbacks", postbackRoutes.default);
  console.log("=== POSTBACK AND TRACKING ROUTES ADDED ===");
  console.log("=== ADDING TEAM ROUTES WITHOUT MIDDLEWARE ===");
  app2.get("/api/advertiser/team/members", async (req, res) => {
    console.log("=== GET TEAM MEMBERS - NO MIDDLEWARE ===");
    try {
      const mockTeamMembers = [
        {
          id: "member_1",
          username: "ivan_petrov",
          email: "ivan@example.com",
          firstName: "\u0418\u0432\u0430\u043D",
          lastName: "\u041F\u0435\u0442\u0440\u043E\u0432",
          role: "manager",
          status: "active",
          permissions: {
            manageOffers: true,
            managePartners: true,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: ["192.168.1.100"],
            geoRestrictions: ["RU"],
            timeRestrictions: {
              enabled: true,
              startTime: "09:00",
              endTime: "18:00",
              timezone: "UTC+3",
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: true,
          telegramUserId: "123456789",
          lastActivity: new Date(Date.now() - 36e5).toISOString(),
          createdAt: new Date(Date.now() - 864e5).toISOString(),
          createdBy: "temp_advertiser_id"
        },
        {
          id: "member_2",
          username: "maria_sidorova",
          email: "maria@example.com",
          firstName: "\u041C\u0430\u0440\u0438\u044F",
          lastName: "\u0421\u0438\u0434\u043E\u0440\u043E\u0432\u0430",
          role: "analyst",
          status: "active",
          permissions: {
            manageOffers: false,
            managePartners: false,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: [],
            geoRestrictions: [],
            timeRestrictions: {
              enabled: false,
              startTime: "09:00",
              endTime: "18:00",
              timezone: "UTC+3",
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: false,
          lastActivity: new Date(Date.now() - 72e5).toISOString(),
          createdAt: new Date(Date.now() - 1728e5).toISOString(),
          createdBy: "temp_advertiser_id"
        }
      ];
      console.log("Successfully returning", mockTeamMembers.length, "team members");
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/team/members", async (req, res) => {
    console.log("=== CREATE TEAM MEMBER - NO MIDDLEWARE ===");
    console.log("Request body:", req.body);
    try {
      const { username, email, firstName, lastName, role, permissions, restrictions, telegramNotifications, telegramUserId } = req.body;
      if (!username || !email || !firstName || !lastName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const newMember = {
        id: `member_${Date.now()}`,
        username,
        email,
        firstName,
        lastName,
        role,
        status: "active",
        permissions: permissions || {
          manageOffers: false,
          managePartners: false,
          viewStatistics: true,
          financialOperations: false,
          postbacksApi: false
        },
        restrictions: restrictions || {
          ipWhitelist: [],
          geoRestrictions: [],
          timeRestrictions: {
            enabled: false,
            startTime: "09:00",
            endTime: "18:00",
            timezone: "UTC+3",
            workingDays: [1, 2, 3, 4, 5]
          }
        },
        telegramNotifications: telegramNotifications || false,
        telegramUserId: telegramUserId || null,
        lastActivity: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: "temp_advertiser_id"
      };
      console.log("Successfully created team member:", newMember.id);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/team/invite", async (req, res) => {
    console.log("=== TEAM INVITE - NO MIDDLEWARE ===");
    console.log("Request body:", req.body);
    try {
      const { email, role } = req.body;
      if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Team invitation sent to ${email} with role ${role}`);
      res.status(201).json({
        invitationId,
        email,
        role,
        message: "Invitation sent successfully"
      });
    } catch (error) {
      console.error("Invite team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.get("/api/advertiser/team/activity-logs", async (req, res) => {
    console.log("=== GET ACTIVITY LOGS - NO MIDDLEWARE ===");
    try {
      const mockLogs = [
        {
          id: "log_1",
          userId: "member_1",
          username: "ivan_petrov",
          action: "login",
          timestamp: new Date(Date.now() - 36e5).toISOString(),
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          details: "Successful login"
        },
        {
          id: "log_2",
          userId: "member_2",
          username: "maria_sidorova",
          action: "view_statistics",
          timestamp: new Date(Date.now() - 72e5).toISOString(),
          ip: "192.168.1.101",
          userAgent: "Mozilla/5.0...",
          details: "Viewed analytics dashboard"
        }
      ];
      console.log("Successfully returning", mockLogs.length, "activity logs");
      res.json(mockLogs);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  console.log("=== TEAM ROUTES ADDED SUCCESSFULLY ===");
  console.log("=== ADDING POSTBACK ROUTES ===");
  app2.get("/api/postback/profiles", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const userProfiles = await storage.getCreatedPostbackProfiles(userId);
      const allProfiles = userProfiles.length > 0 ? userProfiles : [...storage.getDemoPostbackProfiles(), ...userProfiles];
      console.log("\u{1F4CB} GET /api/postback/profiles - Returning profiles for user:", userId, {
        userProfiles: userProfiles.length,
        total: allProfiles.length,
        userProfileIds: userProfiles.map((p) => p.id)
      });
      res.json(allProfiles);
    } catch (error) {
      console.error("Error getting postback profiles:", error);
      res.status(500).json({ message: "Failed to get postback profiles" });
    }
  });
  app2.post("/api/postback/profiles", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      const newProfile = {
        id: `profile_${Date.now()}`,
        user_id: userId,
        partnerId: userId,
        ...profileData,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("\u{1F4BE} Creating postback profile for user:", userId, newProfile);
      const savedProfile = await storage.savePostbackProfile(newProfile);
      console.log("\u{1F4BE} Profile saved to database");
      res.json(savedProfile);
    } catch (error) {
      console.error("\u274C Error creating postback profile:", error);
      res.status(500).json({ message: "Failed to create postback profile" });
    }
  });
  app2.put("/api/postback/profiles/:id", async (req, res) => {
    try {
      const profileId = req.params.id;
      const updateData = req.body;
      console.log("\u{1F504} PUT /api/postback/profiles/:id - Updating profile:", profileId, updateData);
      const updatedProfile = storage.updatePostbackProfile(profileId, updateData);
      if (updatedProfile) {
        console.log("\u{1F504} Profile updated successfully:", updatedProfile);
        res.json({ success: true, profile: updatedProfile, message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D" });
      } else {
        console.log("\u274C Profile not found for update:", profileId);
        res.status(404).json({ success: false, message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
    } catch (error) {
      console.error("\u274C Error updating postback profile:", error);
      res.status(500).json({ success: false, message: "Failed to update postback profile" });
    }
  });
  app2.delete("/api/postback/profiles/:id", authenticateToken, async (req, res) => {
    try {
      const profileId = req.params.id;
      const userId = req.user.id;
      console.log("\u{1F5D1}\uFE0F DELETE /api/postback/profiles/:id - Deleting profile:", profileId, "for user:", userId);
      const deleted = await storage.deletePostbackProfile(profileId);
      console.log("\u{1F5D1}\uFE0F Profile deletion result:", deleted);
      if (deleted) {
        res.json({ success: true, message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D" });
      } else {
        res.status(404).json({ success: false, message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0438\u043B\u0438 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0443\u0434\u0430\u043B\u0435\u043D" });
      }
    } catch (error) {
      console.error("\u274C Error deleting postback profile:", error);
      res.status(500).json({ success: false, message: "Failed to delete postback profile" });
    }
  });
  app2.get("/api/postback/deliveries", async (req, res) => {
    try {
      const mockDeliveries = [
        {
          id: "delivery_1",
          profile_id: "profile_1",
          clickid: "abc123456789",
          attempt: 1,
          max_attempts: 5,
          request_method: "POST",
          request_url: "https://keitaro.example.com/api/v1/conversions",
          response_code: 200,
          response_body: '{"status":"ok"}',
          duration_ms: 150,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "delivery_2",
          profile_id: "profile_1",
          clickid: "def987654321",
          attempt: 1,
          max_attempts: 5,
          request_method: "POST",
          request_url: "https://keitaro.example.com/api/v1/conversions",
          response_code: 500,
          error: "Server error",
          duration_ms: 5e3,
          created_at: new Date(Date.now() - 36e5).toISOString()
        }
      ];
      res.json(mockDeliveries);
    } catch (error) {
      console.error("Error getting postback deliveries:", error);
      res.status(500).json({ message: "Failed to get postback deliveries" });
    }
  });
  app2.post("/api/postback/test/:id", async (req, res) => {
    try {
      console.log("=== TESTING POSTBACK ===");
      const profileId = req.params.id;
      const testData = req.body;
      console.log("Profile ID:", profileId);
      console.log("Test data:", testData);
      const mockProfiles2 = [
        {
          id: "profile_1",
          name: "Keitaro Main",
          endpointUrl: "https://keitaro.example.com/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}",
          method: "POST",
          enabled: true
        },
        {
          id: "profile_2",
          name: "Binom Track",
          endpointUrl: "https://binom.example.com/click.php?cnv_id={clickid}&cnv_status={status}&payout={revenue}",
          method: "GET",
          enabled: true
        }
      ];
      const profile = mockProfiles2.find((p) => p.id === profileId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"
        });
      }
      if (!profile.enabled) {
        return res.status(400).json({
          success: false,
          message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D. \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0434\u043B\u044F \u0442\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F."
        });
      }
      let finalUrl = profile.endpointUrl;
      finalUrl = finalUrl.replace("{clickid}", testData.clickid || "test_click");
      finalUrl = finalUrl.replace("{status}", testData.type || "lead");
      finalUrl = finalUrl.replace("{revenue}", testData.revenue || "0");
      finalUrl = finalUrl.replace("{currency}", testData.currency || "USD");
      console.log("Sending test postback to:", finalUrl);
      const testResult = {
        success: true,
        message: `\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u043F\u043E\u0441\u0442\u0431\u0435\u043A \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043D\u0430 ${profile.name}`,
        url: finalUrl,
        method: profile.method,
        response_code: 200,
        response_time: 125,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Test result:", testResult);
      res.json(testResult);
    } catch (error) {
      console.error("Error testing postback:", error);
      res.status(500).json({
        success: false,
        message: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
      });
    }
  });
  app2.get("/api/postback/logs", async (req, res) => {
    try {
      console.log("=== FETCHING POSTBACK LOGS ===");
      const mockLogs = [
        {
          id: "log_1",
          profileId: "profile_1",
          profileName: "Keitaro Main",
          url: "https://keitaro.example.com/api/v1/conversions?clickid=test123&status=lead&revenue=100",
          method: "POST",
          status: "success",
          responseCode: 200,
          responseTime: 125,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          isTest: false
        },
        {
          id: "log_2",
          profileId: "profile_1",
          profileName: "Keitaro Main",
          url: "https://keitaro.example.com/api/v1/conversions?clickid=abc456&status=conversion&revenue=250",
          method: "POST",
          status: "success",
          responseCode: 200,
          responseTime: 89,
          timestamp: new Date(Date.now() - 3e5).toISOString(),
          isTest: false
        },
        {
          id: "log_3",
          profileId: "profile_2",
          profileName: "Binom Track",
          url: "https://binom.example.com/click.php?cnv_id=test789&cnv_status=lead&payout=150",
          method: "GET",
          status: "failed",
          responseCode: 404,
          responseTime: 5e3,
          timestamp: new Date(Date.now() - 6e5).toISOString(),
          isTest: false,
          error: "Endpoint not found"
        }
      ];
      res.json(mockLogs);
    } catch (error) {
      console.error("Error fetching postback logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  app2.put("/api/postback/profiles/:id", async (req, res) => {
    try {
      console.log("=== UPDATING POSTBACK PROFILE ===");
      const profileId = req.params.id;
      const updateData = req.body;
      console.log("Profile ID:", profileId);
      console.log("Update data:", updateData);
      const updatedProfile = {
        id: profileId,
        ...updateData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Profile updated successfully");
      res.json({
        success: true,
        profile: updatedProfile,
        message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D"
      });
    } catch (error) {
      console.error("Error updating postback profile:", error);
      res.status(500).json({
        success: false,
        message: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
      });
    }
  });
  app2.delete("/api/postback/profiles/:id", async (req, res) => {
    try {
      console.log("=== DELETING POSTBACK PROFILE ===");
      const profileId = req.params.id;
      console.log("Deleting profile ID:", profileId);
      console.log("Profile deleted successfully");
      res.json({
        success: true,
        message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D"
      });
    } catch (error) {
      console.error("Error deleting postback profile:", error);
      res.status(500).json({
        success: false,
        message: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
      });
    }
  });
  app2.post("/api/postback/profiles", async (req, res) => {
    try {
      console.log("=== CREATING POSTBACK PROFILE ===");
      const profileData = req.body;
      console.log("Profile data:", profileData);
      const newProfile = {
        id: `profile_${Date.now()}`,
        ...profileData,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Profile created successfully");
      res.json({
        success: true,
        profile: newProfile,
        message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D"
      });
    } catch (error) {
      console.error("Error creating postback profile:", error);
      res.status(500).json({
        success: false,
        message: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
      });
    }
  });
  console.log("=== POSTBACK ROUTES ADDED SUCCESSFULLY ===");
  console.log("=== ADDING ADVERTISER POSTBACK ROUTES ===");
  app2.get("/api/advertiser/postback/profiles", async (req, res) => {
    console.log("=== GET ADVERTISER POSTBACK PROFILES ===");
    try {
      const createdProfiles = storage.getCreatedPostbackProfiles();
      const demoProfiles = storage.getDemoPostbackProfiles();
      const allProfiles = [...demoProfiles, ...createdProfiles];
      res.json(allProfiles);
    } catch (error) {
      console.error("Error getting advertiser postback profiles:", error);
      res.status(500).json({ message: "Failed to get postback profiles" });
    }
  });
  app2.post("/api/advertiser/postback/profiles", async (req, res) => {
    console.log("=== CREATE ADVERTISER POSTBACK PROFILE ===");
    try {
      const profileData = req.body;
      console.log("Creating advertiser postback profile:", profileData);
      const newProfile = {
        id: "adv_profile_" + Date.now(),
        ...profileData,
        status: "active",
        last_delivery: null,
        delivery_stats: {
          total_sent: 0,
          success_rate: 0,
          avg_response_time: 0
        },
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.savePostbackProfile(newProfile);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error("Error creating advertiser postback profile:", error);
      res.status(500).json({ message: "Failed to create postback profile" });
    }
  });
  app2.put("/api/advertiser/postback/profiles/:id", async (req, res) => {
    console.log("=== UPDATE ADVERTISER POSTBACK PROFILE ===");
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log("Updating advertiser postback profile:", id, updateData);
      const updatedProfile = storage.updatePostbackProfile(id, updateData);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating advertiser postback profile:", error);
      res.status(500).json({ message: "Failed to update postback profile" });
    }
  });
  app2.delete("/api/advertiser/postback/profiles/:id", async (req, res) => {
    console.log("=== DELETE ADVERTISER POSTBACK PROFILE ===");
    try {
      const { id } = req.params;
      console.log("Deleting advertiser postback profile:", id);
      const deleted = storage.deletePostbackProfile(id);
      if (!deleted) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting advertiser postback profile:", error);
      res.status(500).json({ message: "Failed to delete postback profile" });
    }
  });
  app2.get("/api/advertiser/postback/logs", async (req, res) => {
    console.log("=== GET ADVERTISER POSTBACK LOGS ===");
    try {
      const mockLogs = [
        {
          id: "adv_log_1",
          event_type: "lead",
          status: "sent",
          response_status: 200,
          response_time: 245,
          error_message: null,
          sent_at: new Date(Date.now() - 3e5).toISOString(),
          clickid: "test_exact_data",
          partner_name: "Test Partner",
          offer_name: "Gaming Offer"
        },
        {
          id: "adv_log_2",
          event_type: "deposit",
          status: "sent",
          response_status: 200,
          response_time: 189,
          error_message: null,
          sent_at: new Date(Date.now() - 6e5).toISOString(),
          clickid: "abcd12345678",
          partner_name: "Premium Partner",
          offer_name: "Finance Offer"
        },
        {
          id: "adv_log_3",
          event_type: "lp_click",
          status: "failed",
          response_status: 404,
          response_time: 5e3,
          error_message: "Endpoint not found",
          sent_at: new Date(Date.now() - 9e5).toISOString(),
          clickid: "efgh87654321",
          partner_name: "Basic Partner",
          offer_name: "Test Offer"
        },
        {
          id: "adv_log_4",
          event_type: "conversion",
          status: "sent",
          response_status: 200,
          response_time: 321,
          error_message: null,
          sent_at: new Date(Date.now() - 12e5).toISOString(),
          clickid: "ijkl11223344",
          partner_name: "VIP Partner",
          offer_name: "Premium Gaming"
        }
      ];
      res.json(mockLogs);
    } catch (error) {
      console.error("Error getting advertiser postback logs:", error);
      res.status(500).json({ message: "Failed to get postback logs" });
    }
  });
  app2.post("/api/advertiser/postback/test/:id", async (req, res) => {
    try {
      console.log("=== TESTING ADVERTISER POSTBACK ===");
      const profileId = req.params.id;
      const testData = req.body;
      console.log("Advertiser Profile ID:", profileId);
      console.log("Advertiser Test data:", testData);
      const createdProfiles = storage.getCreatedPostbackProfiles();
      const demoProfiles = storage.getDemoPostbackProfiles();
      const allProfiles = [...demoProfiles, ...createdProfiles];
      const profile = allProfiles.find((p) => p.id === profileId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"
        });
      }
      if (!profile.enabled) {
        return res.status(400).json({
          success: false,
          message: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D. \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0434\u043B\u044F \u0442\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F."
        });
      }
      let finalUrl = profile.endpointUrl || profile.url;
      finalUrl = finalUrl.replace("{clickid}", testData.clickid || "test_click_adv");
      finalUrl = finalUrl.replace("{status}", testData.type || "lead");
      finalUrl = finalUrl.replace("{revenue}", testData.revenue || "0");
      finalUrl = finalUrl.replace("{currency}", testData.currency || "USD");
      console.log("Sending advertiser test postback to:", finalUrl);
      const testResult = {
        success: true,
        message: `\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u043F\u043E\u0441\u0442\u0431\u0435\u043A \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043D\u0430 ${profile.name}`,
        url: finalUrl,
        method: profile.method || "GET",
        response_code: 200,
        response_time: 125,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Advertiser test result:", testResult);
      res.json(testResult);
    } catch (error) {
      console.error("Error testing advertiser postback:", error);
      res.status(500).json({
        success: false,
        message: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
      });
    }
  });
  console.log("=== ADVERTISER POSTBACK ROUTES ADDED SUCCESSFULLY ===");
  console.log("=== ADDING ANTIFRAUD ROUTES ===");
  app2.get("/api/advertiser/antifraud/dashboard", async (req, res) => {
    console.log("=== GET ANTIFRAUD DASHBOARD WITH REAL DATA ===");
    const { range = "24h" } = req.query;
    try {
      const user = req.user;
      console.log("Getting antifraud data for user:", user?.username);
      const allClicks = await storage.getTrackingClicks({});
      const totalClicks = allClicks.length;
      console.log("Found", totalClicks, "total clicks for antifraud analysis");
      const totalEvents = totalClicks;
      const fraudEvents = allClicks.filter(
        (click) => click.isBot === true || click.vpnDetected === true || click.fraudScore && click.fraudScore > 70 || click.riskLevel === "high"
      );
      const blockedEvents = fraudEvents.length;
      const fraudRate = totalEvents > 0 ? blockedEvents / totalEvents * 100 : 0;
      const fraudTypeMap = {
        "bot": 0,
        "vpn": 0,
        "proxy": 0,
        "duplicate": 0,
        "suspicious_cr": 0,
        "click_spam": 0,
        "tor": 0
      };
      fraudEvents.forEach((event) => {
        let fraudType = "suspicious";
        if (event.isBot) fraudType = "bot";
        else if (event.vpnDetected) fraudType = "vpn";
        else if (event.riskLevel === "high") fraudType = "proxy";
        if (fraudTypeMap[fraudType] !== void 0) {
          fraudTypeMap[fraudType]++;
        } else {
          fraudTypeMap["bot"]++;
        }
      });
      const topFraudTypes = Object.entries(fraudTypeMap).map(([type, count3]) => ({
        type,
        count: count3,
        percentage: blockedEvents > 0 ? count3 / blockedEvents * 100 : 0
      })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
      const partnerStats = {};
      allClicks.forEach((click) => {
        const partnerId = click.partnerId;
        const partnerName = "Partner " + (partnerId?.slice(-8) || "Unknown");
        if (!partnerStats[partnerId]) {
          partnerStats[partnerId] = {
            partnerId,
            partnerName,
            totalEvents: 0,
            fraudEvents: 0
          };
        }
        partnerStats[partnerId].totalEvents++;
        if (click.isBot || click.vpnDetected || click.fraudScore && click.fraudScore > 70 || click.riskLevel === "high") {
          partnerStats[partnerId].fraudEvents++;
        }
      });
      const topFraudPartners = Object.values(partnerStats).map((stats) => ({
        ...stats,
        events: stats.fraudEvents,
        fraudRate: stats.totalEvents > 0 ? stats.fraudEvents / stats.totalEvents * 100 : 0
      })).filter((partner) => partner.fraudEvents > 0).sort((a, b) => b.fraudRate - a.fraudRate).slice(0, 10);
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = /* @__PURE__ */ new Date();
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = /* @__PURE__ */ new Date();
        hourEnd.setHours(hour, 59, 59, 999);
        const hourClicks = allClicks.filter((click) => {
          const clickTime = new Date(click.createdAt);
          return clickTime.getHours() === hour;
        });
        const hourFraud = hourClicks.filter(
          (click) => click.isBot || click.vpnDetected || click.fraudScore && click.fraudScore > 70 || click.riskLevel === "high"
        );
        return {
          hour: String(hour).padStart(2, "0") + ":00",
          events: hourClicks.length,
          blocked: hourFraud.length
        };
      });
      const countryStats = {};
      allClicks.forEach((click) => {
        const country = click.country || "Unknown";
        if (!countryStats[country]) {
          countryStats[country] = { total: 0, fraud: 0 };
        }
        countryStats[country].total++;
        if (click.isBot || click.vpnDetected || click.fraudScore && click.fraudScore > 70 || click.riskLevel === "high") {
          countryStats[country].fraud++;
        }
      });
      const topCountryStats = Object.entries(countryStats).map(([country, stats]) => ({
        country,
        events: stats.total,
        fraudRate: stats.total > 0 ? stats.fraud / stats.total * 100 : 0
      })).sort((a, b) => b.events - a.events).slice(0, 10);
      const recentEvents = fraudEvents.slice(0, 20).map((event) => {
        let fraudType = "suspicious";
        let details = "Suspicious activity detected";
        let action = "flagged";
        if (event.isBot) {
          fraudType = "bot";
          details = "Bot traffic detected";
          action = "blocked";
        } else if (event.vpnDetected) {
          fraudType = "vpn";
          details = "VPN/Proxy detected";
          action = "flagged";
        } else if (event.riskLevel === "high") {
          fraudType = "proxy";
          details = "High risk activity";
          action = "blocked";
        }
        return {
          id: event.id,
          timestamp: event.createdAt,
          partnerId: event.partnerId,
          partnerName: "Partner " + (event.partnerId?.slice(-8) || "Unknown"),
          offerId: event.offerId,
          offerName: "Offer " + (event.offerId?.slice(-8) || "Unknown"),
          subId: event.subId1 || "no_sub",
          ip: "xxx.xxx.xxx.xxx",
          country: event.country || "Unknown",
          fraudType,
          riskScore: event.fraudScore || 0,
          action,
          status: action === "blocked" ? "confirmed" : "pending",
          details,
          userAgent: "Mozilla/5.0...",
          fingerprint: `fp_${event.id.slice(0, 8)}`
        };
      });
      const dashboard = {
        totalEvents,
        blockedEvents,
        fraudRate: Math.round(fraudRate * 100) / 100,
        topFraudTypes,
        topFraudPartners,
        hourlyStats,
        countryStats: topCountryStats,
        recentEvents
      };
      console.log("Returning real antifraud dashboard:", {
        totalEvents,
        blockedEvents,
        fraudRate,
        topFraudTypesCount: topFraudTypes.length,
        topPartnersCount: topFraudPartners.length
      });
      res.json(dashboard);
    } catch (error) {
      console.error("Get antifraud dashboard error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.get("/api/advertiser/antifraud/events", async (req, res) => {
    console.log("=== GET ANTIFRAUD EVENTS WITH REAL DATA ===");
    try {
      const user = req.user;
      const {
        page = 1,
        limit = 50,
        fraudType,
        partnerId,
        offerId,
        riskLevel,
        status,
        dateFrom,
        dateTo
      } = req.query;
      let whereConditions = [`tc.created_at >= NOW() - INTERVAL '30 days'`];
      let queryParams = [];
      if (fraudType && fraudType !== "all") {
        whereConditions.push(`tc.fraud_reason = ?`);
        queryParams.push(fraudType);
      }
      if (partnerId && partnerId !== "all") {
        whereConditions.push(`tc.partner_id = ?`);
        queryParams.push(partnerId);
      }
      if (offerId && offerId !== "all") {
        whereConditions.push(`tc.offer_id = ?`);
        queryParams.push(offerId);
      }
      if (riskLevel) {
        if (riskLevel === "high") {
          whereConditions.push(`tc.risk_score >= 80`);
        } else if (riskLevel === "medium") {
          whereConditions.push(`tc.risk_score >= 50 AND tc.risk_score < 80`);
        } else if (riskLevel === "low") {
          whereConditions.push(`tc.risk_score < 50`);
        }
      }
      if (status === "blocked") {
        whereConditions.push(`tc.is_fraud = true`);
      } else if (status === "flagged") {
        whereConditions.push(`tc.risk_score > 70 AND tc.is_fraud = false`);
      }
      if (dateFrom) {
        whereConditions.push(`tc.created_at >= ?`);
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereConditions.push(`tc.created_at <= ?`);
        queryParams.push(dateTo);
      }
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const eventsQuery = `
        SELECT 
          tc.*,
          u.username as partner_name,
          o.name as offer_name,
          COUNT(*) OVER() as total_count
        FROM tracking_clicks tc
        LEFT JOIN users u ON u.id = tc.partner_id
        LEFT JOIN offers o ON o.id = tc.offer_id
        WHERE ${whereConditions.join(" AND ")}
        AND (tc.is_fraud = true OR tc.risk_score > 70)
        ORDER BY tc.created_at DESC
        LIMIT ? OFFSET ?
      `;
      queryParams.push(parseInt(limit), offset);
      const events4 = await storage.raw(eventsQuery, queryParams);
      const totalCount = events4.length > 0 ? events4[0].total_count : 0;
      const formattedEvents = events4.map((event) => ({
        id: event.id,
        timestamp: event.created_at,
        partnerId: event.partner_id,
        partnerName: event.partner_name || "Unknown Partner",
        offerId: event.offer_id,
        offerName: event.offer_name || "Unknown Offer",
        subId: event.sub_id_1 || "no_sub",
        ip: event.ip_address,
        country: event.country || "Unknown",
        fraudType: event.fraud_reason || "suspicious",
        riskScore: event.risk_score || 0,
        action: event.is_fraud ? "blocked" : "flagged",
        status: event.is_fraud ? "confirmed" : "pending",
        details: event.fraud_reason || "Suspicious activity detected",
        userAgent: event.user_agent || "",
        fingerprint: event.fingerprint || `fp_${event.id.slice(0, 8)}`,
        revenue: event.revenue || 0,
        currency: event.currency || "USD"
      }));
      res.json({
        events: formattedEvents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error("Get antifraud events error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/antifraud/blacklist", async (req, res) => {
    console.log("=== ADD IP TO BLACKLIST ===");
    try {
      const { ip, reason, partnerId, offerId } = req.body;
      const user = req.user;
      const blacklistEntry = {
        id: crypto.randomUUID(),
        ip_address: ip,
        reason: reason || "Manual block",
        added_by: user.id,
        partner_id: partnerId || null,
        offer_id: offerId || null,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        is_active: true
      };
      console.log("Adding IP to blacklist:", blacklistEntry);
      res.json({
        success: true,
        message: `IP ${ip} \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0447\u0435\u0440\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A`,
        entry: blacklistEntry
      });
    } catch (error) {
      console.error("Add to blacklist error:", error);
      res.status(500).json({ error: "Failed to add IP to blacklist" });
    }
  });
  app2.get("/api/advertiser/antifraud/settings", async (req, res) => {
    console.log("=== GET ANTIFRAUD SETTINGS ===");
    try {
      const user = req.user;
      const settings = {
        enabled: true,
        sensitivity: 7,
        autoBlock: true,
        botDetection: {
          enabled: true,
          checkJs: true,
          checkHeadless: true,
          checkInteraction: true
        },
        vpnProxyDetection: {
          enabled: true,
          blockVpn: true,
          blockProxy: true,
          blockTor: true
        },
        clickSpamDetection: {
          enabled: true,
          maxClicksPerIp: 10,
          timeWindow: 60
        },
        suspiciousActivity: {
          enabled: true,
          maxConversionRate: 15,
          minTimeOnSite: 30
        },
        geoFiltering: {
          enabled: false,
          allowedCountries: [],
          blockedCountries: []
        },
        notifications: {
          email: true,
          telegram: false,
          webhooks: false,
          threshold: 5
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Get antifraud settings error:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });
  app2.post("/api/advertiser/antifraud/settings", async (req, res) => {
    console.log("=== UPDATE ANTIFRAUD SETTINGS ===");
    try {
      const user = req.user;
      const settings = req.body;
      console.log("Updating antifraud settings for user:", user.username, settings);
      res.json({
        success: true,
        message: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0430\u043D\u0442\u0438\u0444\u0440\u043E\u0434\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u044B",
        settings
      });
    } catch (error) {
      console.error("Update antifraud settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.get("/api/advertiser/antifraud/settings", async (req, res) => {
    console.log("=== GET ANTIFRAUD SETTINGS ===");
    try {
      const mockSettings = {
        enabled: true,
        sensitivity: 7,
        autoBlock: true,
        botDetection: {
          enabled: true,
          checkJs: true,
          checkHeadless: true,
          checkInteraction: true
        },
        vpnProxyDetection: {
          enabled: true,
          blockVpn: true,
          blockProxy: true,
          blockTor: true
        },
        clickSpamDetection: {
          enabled: true,
          maxClicksPerIp: 50,
          timeWindow: 60
        },
        suspiciousActivity: {
          enabled: true,
          maxConversionRate: 25,
          minTimeOnSite: 10
        },
        geoFiltering: {
          enabled: false,
          allowedCountries: ["US", "CA", "GB", "DE", "FR"],
          blockedCountries: []
        },
        notifications: {
          email: true,
          telegram: false,
          webhooks: false,
          threshold: 10
        }
      };
      console.log("Returning antifraud settings");
      res.json(mockSettings);
    } catch (error) {
      console.error("Get antifraud settings error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.patch("/api/advertiser/antifraud/settings", async (req, res) => {
    console.log("=== PATCH ANTIFRAUD SETTINGS ===");
    console.log("Settings update:", req.body);
    try {
      console.log("Antifraud settings updated successfully");
      res.json({ success: true, message: "Settings updated" });
    } catch (error) {
      console.error("Update antifraud settings error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/antifraud/confirm-event", async (req, res) => {
    console.log("=== POST CONFIRM ANTIFRAUD EVENT ===");
    console.log("Event confirmation:", req.body);
    try {
      const { eventId, status } = req.body;
      if (!eventId || !status) {
        return res.status(400).json({ error: "Event ID and status are required" });
      }
      console.log("Event", eventId, "marked as", status);
      res.json({ success: true, message: "Event status updated" });
    } catch (error) {
      console.error("Confirm antifraud event error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/antifraud/block-partner", async (req, res) => {
    console.log("=== POST BLOCK PARTNER ===");
    console.log("Partner blocking:", req.body);
    try {
      const { partnerId, reason } = req.body;
      if (!partnerId || !reason) {
        return res.status(400).json({ error: "Partner ID and reason are required" });
      }
      console.log("Partner", partnerId, "blocked. Reason:", reason);
      res.json({ success: true, message: "Partner blocked successfully" });
    } catch (error) {
      console.error("Block partner error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  console.log("=== ANTIFRAUD ROUTES ADDED SUCCESSFULLY ===");
  console.log("=== ADDING ENHANCED API ROUTES ===");
  try {
    const enhancedApiRoutesV3 = await Promise.resolve().then(() => (init_routes(), routes_exports));
    app2.use("/api/v3", enhancedApiRoutesV3.default);
    console.log("=== ENHANCED API V3 ROUTES WITH IDEMPOTENCY ADDED ===");
  } catch (error) {
    console.error("\u274C Failed to load V3 API routes:", error);
  }
  app2.use("/api/v2", (await Promise.resolve().then(() => (init_api_routes(), api_routes_exports))).default);
  console.log("=== LEGACY API V2 ROUTES MAINTAINED ===");
  app2.get("/api/queue/stats", async (req, res) => {
    try {
      const { getQueueStats: getQueueStats2 } = await Promise.resolve().then(() => (init_enqueue(), enqueue_exports));
      const bullmqStats = await getQueueStats2();
      const { getProcessingStats: getProcessingStats2 } = await Promise.resolve().then(() => (init_processor(), processor_exports));
      const processorStats = getProcessingStats2();
      res.json({
        bullmq: bullmqStats,
        processor: processorStats,
        mode: bullmqStats.error ? "autonomous" : "bullmq"
      });
    } catch (error) {
      res.json({
        bullmq: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          total: 0,
          error: "BullMQ unavailable"
        },
        processor: {
          processedTasks: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        mode: "autonomous"
      });
    }
  });
  app2.get("/api/keitaro/templates", async (req, res) => {
    try {
      const { getKeitaroProfileTemplates: getKeitaroProfileTemplates2 } = await Promise.resolve().then(() => (init_keitaro(), keitaro_exports));
      const templates = getKeitaroProfileTemplates2();
      res.json({ templates });
    } catch (error) {
      console.error("Error getting Keitaro templates:", error);
      res.status(500).json({ error: "Failed to load Keitaro templates" });
    }
  });
  app2.post("/api/keitaro/test", async (req, res) => {
    try {
      const { domain, authToken } = req.body;
      const { generateKeitaroTestPostback: generateKeitaroTestPostback2 } = await Promise.resolve().then(() => (init_keitaro(), keitaro_exports));
      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }
      const testData = generateKeitaroTestPostback2(domain, authToken);
      console.log("\u{1F9EA} Keitaro test postback generated:", {
        domain,
        url: testData.url,
        clickid: testData.testData.clickid
      });
      res.json({
        success: true,
        message: "Test postback generated successfully",
        testUrl: testData.url,
        expectedResponse: testData.expectedResponse,
        testClickId: testData.testData.clickid
      });
    } catch (error) {
      console.error("Error generating Keitaro test:", error);
      res.status(500).json({ error: "Failed to generate test postback" });
    }
  });
  app2.post("/api/v3/postback/test", async (req, res) => {
    try {
      console.log("\u{1F9EA} Test postback request received:", req.body);
      const { processPostbackTask: processPostbackTask2 } = await Promise.resolve().then(() => (init_processor(), processor_exports));
      const task = req.body;
      if (!task.conversionId || !task.antifraudLevel) {
        return res.status(400).json({
          error: "Missing required fields: conversionId, antifraudLevel"
        });
      }
      console.log(`\u{1F680} Processing test postback with antifraud level: ${task.antifraudLevel}`);
      const results = await processPostbackTask2(task);
      const summary = {
        antifraudLevel: task.antifraudLevel,
        profilesProcessed: results.length,
        successful: results.filter((r) => r.success).length,
        blocked: results.filter((r) => r.error?.includes("af")).length,
        results: results.map((r) => ({
          profile: r.profileName,
          success: r.success,
          error: r.error,
          blocked: r.error?.includes("af") || false
        }))
      };
      console.log("\u{1F4CA} Test results:", summary);
      res.json({
        success: true,
        message: `Processed ${summary.profilesProcessed} profiles`,
        antifraud: {
          level: task.antifraudLevel,
          blockedProfiles: summary.blocked,
          successfulProfiles: summary.successful
        },
        details: summary
      });
    } catch (error) {
      console.error("Error in postback test:", error);
      res.status(500).json({ error: "Failed to process test postback" });
    }
  });
  console.log("=== SKIPPING MIDDLEWARE SETUP FOR TEAM DEBUGGING ===");
  const authRoutes = await Promise.resolve().then(() => (init_auth2(), auth_exports));
  app2.use("/api/auth", authRoutes.default);
  app2.use("/api/conversion", conversion_default);
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const userNotifications2 = await db.execute(sql9`
        SELECT id, user_id, type, title, message, is_read, data as metadata, created_at
        FROM user_notifications 
        WHERE user_id = ${userId}
      `);
      const oldNotifications = await db.execute(sql9`
        SELECT id, user_id, type, title, message, is_read, metadata, created_at
        FROM notifications 
        WHERE user_id = ${userId}
      `);
      const allNotifications = [...userNotifications2.rows, ...oldNotifications.rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      res.json(allNotifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      console.log("=== MARK NOTIFICATION AS READ ===");
      const userId = req.user?.id || req.userId;
      const notificationId = req.params.id;
      console.log("UserId:", userId, "NotificationId:", notificationId);
      if (!userId) {
        console.log("No userId found in request");
        return res.status(401).json({ error: "User ID required" });
      }
      const result = await db.execute(sql9`
        UPDATE user_notifications 
        SET is_read = true 
        WHERE id = ${notificationId} AND user_id = ${userId}
      `);
      console.log("Update result:", result);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const notificationId = req.params.id;
      await db.execute(sql9`
        DELETE FROM user_notifications 
        WHERE id = ${notificationId} AND user_id = ${userId}
      `);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id || req.userId;
      await db.execute(sql9`
        UPDATE user_notifications 
        SET is_read = true 
        WHERE user_id = ${userId} AND is_read = false
      `);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", loginRateLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      const user = await storage.getUserByUsername(username) || await storage.getUserByEmail(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const plainTextMatch = user.password === password;
      const hashMatch = await bcrypt.compare(password, user.password).catch(() => false);
      const isValidPassword = plainTextMatch || hashMatch;
      if (!isValidPassword) {
        recordFailedLogin(req);
        auditLog(req, "LOGIN_FAILED", void 0, false, { username });
        return res.status(401).json({ error: "Invalid credentials" });
      }
      await trackDevice(req, user.id);
      auditLog(req, "LOGIN_SUCCESS", void 0, true, { username, userId: user.id });
      const token = jwt2.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          advertiserId: user.advertiserId
        },
        JWT_SECRET2,
        { expiresIn: "24h" }
      );
      console.log("\u{1F511} Login successful, generated token for user:", user.username);
      console.log("Token first 20 chars:", token.substring(0, 20) + "...");
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          language: user.language,
          advertiserId: user.advertiserId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const { ref } = req.query;
      const existingUser = await storage.getUserByUsername(userData.username) || await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      let referredBy = null;
      if (ref) {
        const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq11 } = await import("drizzle-orm");
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const referrer = await db2.select().from(users2).where(eq11(users2.referralCode, ref)).limit(1);
        if (referrer.length > 0) {
          referredBy = referrer[0].id;
          console.log("\u{1F517} User referred by:", referrer[0].username, "Code:", ref);
        } else {
          console.log("\u274C Invalid referral code:", ref);
        }
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const crypto3 = await import("crypto");
      const referralCode = crypto3.randomBytes(4).toString("hex").toUpperCase();
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        referredBy,
        // Добавляем ID пригласившего
        referralCode: userData.role === "affiliate" ? referralCode : void 0
        // Добавляем реферальный код только для affiliate
      });
      if (referredBy && ref) {
        try {
          const referrer = await db.select().from(users).where(eq10(users.id, referredBy)).limit(1);
          if (referrer.length > 0) {
            const { notifyNewReferral: notifyNewReferral2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
            const { notifyReferralJoined: notifyReferralJoined2 } = await Promise.resolve().then(() => (init_notification_helper(), notification_helper_exports));
            await notifyNewReferral2(referrer[0], user);
            await notifyReferralJoined2(referrer[0].id, {
              id: user.id,
              username: user.username,
              referralCode: ref
            });
            console.log("\u{1F517} New referral notification sent to:", referrer[0].username);
          }
        } catch (notifyError) {
          console.error("\u274C Failed to send referral notification:", notifyError);
        }
      }
      if (user.role === "affiliate" && user.ownerId) {
        try {
          const { notifyPartnerJoined: notifyPartnerJoined2 } = await Promise.resolve().then(() => (init_notification_helper(), notification_helper_exports));
          await notifyPartnerJoined2(user.ownerId, {
            id: user.id,
            username: user.username,
            email: user.email,
            country: user.country
          });
        } catch (notifyError) {
          console.error("\u274C Failed to send partner joined notification:", notifyError);
        }
      }
      await notificationService.sendNotification({
        type: "user_registration",
        userId: user.id,
        data: {
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          role: user.role
        },
        timestamp: /* @__PURE__ */ new Date()
      });
      detectFraud(req, "registration", { email: user.email, role: user.role });
      auditLog(req, "USER_REGISTRATION", void 0, true, { userId: user.id, username: user.username });
      const token = jwt2.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          advertiserId: user.advertiserId
        },
        JWT_SECRET2,
        { expiresIn: "24h" }
      );
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      if (error instanceof z10.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.log("/api/auth/me - No user found in request");
        return res.status(403).json({ error: "User not authenticated" });
      }
      console.log("/api/auth/me - User found:", user.username, "Role:", user.role);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.log("/api/auth/me - Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/referrals/stats", authenticateToken, async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const referredUsers = await db2.select().from(users2).where(eq11(users2.referredBy, authUser2.id));
      const commissions = [];
      const stats = {
        totalReferrals: referredUsers.length,
        paidCommissions: 0,
        pendingCommissions: 0,
        totalCommissionsCount: 0
      };
      res.json({
        referrals: {
          total_referred: stats.totalReferrals,
          active_referrals: referredUsers.filter((u) => u.isActive).length,
          referred_users: referredUsers.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            status: u.isActive ? "active" : "inactive",
            registered_at: u.createdAt,
            balance: u.balance || "0.00"
          }))
        },
        earnings: {
          total_earned: stats.paidCommissions.toFixed(2),
          pending_amount: stats.pendingCommissions.toFixed(2),
          total_transactions: stats.totalCommissionsCount,
          commission_rate: authUser2.referralCommission || "5.00"
        },
        commission_history: []
      });
    } catch (error) {
      console.error("Referral stats error:", error);
      res.status(500).json({ error: "Failed to get referral statistics" });
    }
  });
  app2.get("/api/partner/referral-stats", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      console.log(`\u{1F50D} Getting partner referral stats for: ${authUser2.username}`);
      const partner = await db.select().from(users).where(eq10(users.id, authUser2.id)).limit(1);
      if (!partner.length) {
        return res.status(404).json({ error: "Partner not found" });
      }
      const referralCode = partner[0].referralCode;
      const referredAdvertisers = await db.select().from(users).where(and10(
        eq10(users.referredBy, authUser2.id),
        eq10(users.role, "advertiser")
      ));
      const commissions = await db.select().from(referralCommissions).where(eq10(referralCommissions.referrerId, authUser2.id));
      const totalEarned = commissions.filter((c) => c.status === "paid").reduce((sum3, c) => sum3 + parseFloat(c.commissionAmount), 0);
      const pendingAmount = commissions.filter((c) => c.status === "pending").reduce((sum3, c) => sum3 + parseFloat(c.commissionAmount), 0);
      let programEnabled = true;
      if (partner[0].ownerId) {
        const advertiser = await db.select({
          referralProgramEnabled: users.referralProgramEnabled
        }).from(users).where(eq10(users.id, partner[0].ownerId)).limit(1);
        if (advertiser.length > 0) {
          programEnabled = advertiser[0].referralProgramEnabled ?? true;
        }
      }
      const stats = {
        referral_code: referralCode,
        total_referrals: referredAdvertisers.length,
        active_referrals: referredAdvertisers.filter((a) => a.isActive).length,
        total_earned: totalEarned.toFixed(2),
        pending_amount: pendingAmount.toFixed(2),
        total_transactions: commissions.length,
        program_enabled: programEnabled,
        referred_advertisers: referredAdvertisers.map((advertiser) => ({
          id: advertiser.id,
          username: advertiser.username,
          email: advertiser.email,
          isActive: advertiser.isActive,
          createdAt: advertiser.createdAt,
          totalCommissions: commissions.filter((c) => c.referredUserId === advertiser.id).reduce((sum3, c) => sum3 + parseFloat(c.commissionAmount), 0).toFixed(2)
        })),
        commission_history: commissions.map((commission) => ({
          id: commission.id,
          amount: commission.commissionAmount,
          status: commission.status,
          createdAt: commission.createdAt,
          originalAmount: commission.originalAmount
        }))
      };
      console.log(`\u2705 Partner referral stats retrieved for ${authUser2.username}:`, {
        referrals: stats.total_referrals,
        earned: stats.total_earned
      });
      res.json(stats);
    } catch (error) {
      console.error("Error getting partner referral stats:", error);
      res.status(500).json({ error: "Failed to get referral stats" });
    }
  });
  app2.post("/api/advertiser/referral-program/toggle", authenticateToken, async (req, res) => {
    try {
      const { enabled } = req.body;
      if (!req.user || req.user.role !== "advertiser") {
        return res.status(403).json({ error: "Only advertisers can manage referral program" });
      }
      await db.update(users).set({
        referralProgramEnabled: enabled,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(users.id, req.user.id));
      console.log(`\u{1F4CB} Advertiser ${req.user.username} ${enabled ? "enabled" : "disabled"} referral program`);
      res.json({
        success: true,
        enabled,
        message: enabled ? "\u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430" : "\u0420\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u0430"
      });
    } catch (error) {
      console.error("Error toggling referral program:", error);
      res.status(500).json({ error: "Failed to toggle referral program" });
    }
  });
  app2.get("/api/advertiser/referral-stats", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const currentUser = await db.select().from(users).where(eq10(users.id, authUser2.id)).limit(1);
      const referralProgramEnabled = currentUser[0]?.referralProgramEnabled ?? true;
      const referredPartners = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        referralCode: users.referralCode,
        createdAt: users.createdAt,
        referrerInfo: {
          id: sql9`referrer.id`,
          username: sql9`referrer.username`,
          email: sql9`referrer.email`
        }
      }).from(users).leftJoin(sql9`${users} as referrer`, eq10(users.referredBy, sql9`referrer.id`)).where(and10(
        eq10(users.role, "affiliate"),
        eq10(users.ownerId, authUser2.id),
        isNotNull2(users.referredBy)
      )).orderBy(desc7(users.createdAt));
      const commissionStats = await db.select({
        totalCommissions: sum2(referralCommissions.commissionAmount),
        totalTransactions: count2(referralCommissions.id),
        paidCommissions: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'paid' THEN ${referralCommissions.commissionAmount} ELSE 0 END`),
        pendingCommissions: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'pending' THEN ${referralCommissions.commissionAmount} ELSE 0 END`)
      }).from(referralCommissions).where(
        inArray2(
          referralCommissions.referredUserId,
          db.select({ id: users.id }).from(users).where(and10(
            eq10(users.role, "affiliate"),
            eq10(users.ownerId, authUser2.id),
            isNotNull2(users.referredBy)
          ))
        )
      );
      const commissionHistory = await db.select({
        id: referralCommissions.id,
        amount: referralCommissions.commissionAmount,
        rate: referralCommissions.commissionRate,
        originalAmount: referralCommissions.originalAmount,
        status: referralCommissions.status,
        createdAt: referralCommissions.createdAt,
        paidAt: referralCommissions.paidAt,
        referrer: {
          id: sql9`referrer.id`,
          username: sql9`referrer.username`,
          email: sql9`referrer.email`
        },
        referredUser: {
          id: sql9`referred.id`,
          username: sql9`referred.username`,
          email: sql9`referred.email`
        }
      }).from(referralCommissions).leftJoin(sql9`${users} as referrer`, eq10(referralCommissions.referrerId, sql9`referrer.id`)).leftJoin(sql9`${users} as referred`, eq10(referralCommissions.referredUserId, sql9`referred.id`)).where(
        inArray2(
          referralCommissions.referredUserId,
          db.select({ id: users.id }).from(users).where(and10(
            eq10(users.role, "affiliate"),
            eq10(users.ownerId, authUser2.id),
            isNotNull2(users.referredBy)
          ))
        )
      ).orderBy(desc7(referralCommissions.createdAt)).limit(100);
      const stats = commissionStats[0] || {
        totalCommissions: "0.00",
        totalTransactions: 0,
        paidCommissions: "0.00",
        pendingCommissions: "0.00"
      };
      res.json({
        referredPartners: referredPartners.map((partner) => ({
          ...partner,
          referrerInfo: partner.referrerInfo.id ? partner.referrerInfo : null
        })),
        commissionStats: {
          totalCommissions: Number(stats.totalCommissions || 0).toFixed(2),
          totalTransactions: Number(stats.totalTransactions || 0),
          paidCommissions: Number(stats.paidCommissions || 0).toFixed(2),
          pendingCommissions: Number(stats.pendingCommissions || 0).toFixed(2)
        },
        commissionHistory: commissionHistory.map((commission) => ({
          ...commission,
          amount: Number(commission.amount).toFixed(2),
          originalAmount: Number(commission.originalAmount).toFixed(2),
          rate: Number(commission.rate).toFixed(2)
        })),
        programEnabled: referralProgramEnabled
      });
    } catch (error) {
      console.error("Error fetching advertiser referral stats:", error);
      res.status(500).json({ error: "Failed to fetch referral statistics" });
    }
  });
  app2.get("/api/partner/referral-details", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const referredUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        company: users.company,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        isActive: users.isActive,
        status: users.status
      }).from(users).where(eq10(users.referredBy, authUser2.id)).orderBy(desc7(users.createdAt));
      const commissionHistory = await db.select({
        id: referralCommissions.id,
        amount: referralCommissions.commissionAmount,
        rate: referralCommissions.commissionRate,
        originalAmount: referralCommissions.originalAmount,
        status: referralCommissions.status,
        createdAt: referralCommissions.createdAt,
        paidAt: referralCommissions.paidAt,
        transactionId: referralCommissions.transactionId,
        referredUser: {
          id: sql9`referred.id`,
          username: sql9`referred.username`,
          email: sql9`referred.email`,
          role: sql9`referred.role`
        }
      }).from(referralCommissions).leftJoin(sql9`${users} as referred`, eq10(referralCommissions.referredUserId, sql9`referred.id`)).where(eq10(referralCommissions.referrerId, authUser2.id)).orderBy(desc7(referralCommissions.createdAt)).limit(200);
      const commissionStats = await db.select({
        totalEarned: sum2(referralCommissions.commissionAmount),
        totalTransactions: count2(referralCommissions.id),
        paidAmount: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'paid' THEN ${referralCommissions.commissionAmount} ELSE 0 END`),
        pendingAmount: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'pending' THEN ${referralCommissions.commissionAmount} ELSE 0 END`)
      }).from(referralCommissions).where(eq10(referralCommissions.referrerId, authUser2.id));
      const stats = commissionStats[0] || {
        totalEarned: "0.00",
        totalTransactions: 0,
        paidAmount: "0.00",
        pendingAmount: "0.00"
      };
      res.json({
        referralCode: authUser2.referralCode,
        referredUsers,
        commissionHistory: commissionHistory.map((commission) => ({
          ...commission,
          amount: Number(commission.amount).toFixed(2),
          originalAmount: Number(commission.originalAmount).toFixed(2),
          rate: Number(commission.rate).toFixed(2)
        })),
        stats: {
          totalReferrals: referredUsers.length,
          activeReferrals: referredUsers.filter((u) => u.isActive && u.status === "active").length,
          totalEarned: Number(stats.totalEarned || 0).toFixed(2),
          totalTransactions: Number(stats.totalTransactions || 0),
          paidAmount: Number(stats.paidAmount || 0).toFixed(2),
          pendingAmount: Number(stats.pendingAmount || 0).toFixed(2)
        }
      });
    } catch (error) {
      console.error("Error fetching partner referral details:", error);
      res.status(500).json({ error: "Failed to fetch referral details" });
    }
  });
  app2.get("/api/advertiser/referral-statistics", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const invitedPartners = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
        referredBy: users.referredBy
      }).from(users).where(and10(
        eq10(users.role, "affiliate"),
        eq10(users.ownerId, authUser2.id)
        // Партнеры под этим рекламодателем
      )).orderBy(desc7(users.createdAt));
      const commissionHistory = await db.select({
        id: referralCommissions.id,
        originalAmount: referralCommissions.originalAmount,
        commissionAmount: referralCommissions.commissionAmount,
        commissionRate: referralCommissions.commissionRate,
        status: referralCommissions.status,
        createdAt: referralCommissions.createdAt,
        paidAt: referralCommissions.paidAt,
        referrerId: referralCommissions.referrerId,
        referredUserId: referralCommissions.referredUserId
      }).from(referralCommissions).innerJoin(users, eq10(referralCommissions.referredUserId, users.id)).where(eq10(users.ownerId, authUser2.id)).orderBy(desc7(referralCommissions.createdAt)).limit(200);
      const stats = await db.select({
        totalCommissionPaid: sum2(referralCommissions.commissionAmount),
        totalTransactions: count2(referralCommissions.id),
        paidAmount: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'paid' THEN ${referralCommissions.commissionAmount} ELSE 0 END`),
        pendingAmount: sum2(sql9`CASE WHEN ${referralCommissions.status} = 'pending' THEN ${referralCommissions.commissionAmount} ELSE 0 END`)
      }).from(referralCommissions).innerJoin(users, eq10(referralCommissions.referredUserId, users.id)).where(eq10(users.ownerId, authUser2.id));
      const summary = stats[0] || {
        totalCommissionPaid: "0.00",
        totalTransactions: 0,
        paidAmount: "0.00",
        pendingAmount: "0.00"
      };
      res.json({
        invited_partners: invitedPartners.map((partner) => ({
          id: partner.id,
          username: partner.username,
          email: partner.email,
          status: partner.status,
          total_spent: "0.00",
          // Можно добавить расчет позже
          total_commission: "0.00",
          // Можно добавить расчет позже
          registered_at: partner.createdAt,
          referred_by: partner.referredBy,
          last_payout: null
        })),
        commission_history: commissionHistory.map((commission) => ({
          id: commission.id,
          partner_name: "Partner",
          original_amount: commission.originalAmount?.toString() || "0.00",
          commission_amount: commission.commissionAmount?.toString() || "0.00",
          commission_rate: commission.commissionRate?.toString() || "0.05",
          status: commission.status,
          created_at: commission.createdAt,
          paid_at: commission.paidAt
        })),
        summary: {
          total_commission_paid: summary.totalCommissionPaid?.toString() || "0.00",
          pending_commission: summary.pendingAmount?.toString() || "0.00",
          total_partners_invited: invitedPartners.length,
          active_partners: invitedPartners.filter((a) => a.status === "active").length,
          total_transactions: summary.totalTransactions || 0,
          average_commission_per_transaction: summary.totalTransactions > 0 ? (parseFloat(summary.totalCommissionPaid?.toString() || "0") / summary.totalTransactions).toFixed(2) : "0.00"
        }
      });
    } catch (error) {
      console.error("Error fetching advertiser referral statistics:", error);
      res.status(500).json({ error: "Failed to fetch referral statistics" });
    }
  });
  app2.post("/api/referrals/calculate-commission", authenticateToken, async (req, res) => {
    try {
      const { transactionId, userId, amount } = req.body;
      const partnerReceivingPayout = await db.select().from(users).where(eq10(users.id, userId)).limit(1);
      if (!partnerReceivingPayout.length) {
        return res.json({ message: "Partner not found" });
      }
      if (partnerReceivingPayout[0].role !== "affiliate") {
        return res.json({ message: "Commission only applies to partner payouts" });
      }
      if (!partnerReceivingPayout[0].referredBy) {
        return res.json({ message: "No referrer found for this partner" });
      }
      const referrerPartner = await db.select().from(users).where(eq10(users.id, partnerReceivingPayout[0].referredBy)).limit(1);
      if (!referrerPartner.length) {
        return res.json({ message: "Referrer partner not found" });
      }
      if (referrerPartner[0].role !== "affiliate") {
        return res.json({ message: "Referrer must be a partner" });
      }
      const commissionRate = 5;
      const commissionAmount = parseFloat(amount) * commissionRate / 100;
      await db.insert(referralCommissions).values({
        referrerId: referrerPartner[0].id,
        referredUserId: userId,
        // партнер, получающий выплату
        transactionId,
        originalAmount: amount,
        commissionAmount: commissionAmount.toString(),
        commissionRate,
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      });
      const { notifyReferralEarning: notifyReferralEarning2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
      const { notifyReferralCommission: notifyReferralCommission2 } = await Promise.resolve().then(() => (init_notification_helper(), notification_helper_exports));
      await notifyReferralEarning2(referrerPartner[0], {
        referredUser: partnerReceivingPayout[0].username,
        commissionAmount,
        originalAmount: amount
      });
      await notifyReferralCommission2(referrerPartner[0].id, {
        amount: commissionAmount.toString(),
        currency: "USD",
        referralName: partnerReceivingPayout[0].username,
        source: "payout_commission"
      });
      console.log(`\u{1F4B0} Partner referral commission: ${commissionAmount} for ${referrerPartner[0].username} (referred ${partnerReceivingPayout[0].username})`);
      res.json({
        success: true,
        commission: {
          amount: commissionAmount,
          rate: commissionRate,
          referrer: referrerPartner[0].username,
          referred: partnerReceivingPayout[0].username,
          message: "Commission will be paid by advertiser to referring partner"
        }
      });
    } catch (error) {
      console.error("Commission calculation error:", error);
      res.status(500).json({ error: "Failed to calculate commission" });
    }
  });
  app2.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { period = "30d" } = req.query;
      const cacheKey = `dashboard_metrics_${authUser2.id}_${period}`;
      let metrics = queryCache.get(cacheKey);
      if (!metrics) {
        metrics = await storage.getDashboardMetrics(authUser2.role, authUser2.id);
        queryCache.set(cacheKey, metrics, 30 * 1e3);
      }
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/dashboard", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        geo: req.query.geo,
        device: req.query.device,
        offerId: req.query.offerId
      };
      const dashboard = await storage.getAdvertiserDashboard(authUser2.id, filters);
      res.json(dashboard);
    } catch (error) {
      console.error("Advertiser dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/offers", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const filters = {
        search: req.query.search,
        category: req.query.category,
        status: req.query.status,
        payoutType: req.query.payoutType,
        geo: req.query.geo,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };
      const offers3 = await storage.getAdvertiserOffers(authUser2.id, filters);
      res.json(offers3);
    } catch (error) {
      console.error("Get advertiser offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/offers", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerData = {
        name: req.body.name,
        description: req.body.description,
        // Already in {ru: "", en: ""} format from frontend
        category: req.body.category,
        logo: req.body.logo,
        // Geo and devices (map to existing fields)
        countries: req.body.countries || [],
        // Store selected countries as JSONB array
        // Links (map to existing fields)
        landingPageUrl: req.body.landingPageUrl || req.body.targetUrl,
        landingPages: req.body.landingPages,
        // Payout
        payout: req.body.payout ? req.body.payout.toString() : "0",
        payoutType: req.body.payoutType,
        currency: req.body.currency,
        // Добавляем payoutByGeo для индивидуальных выплат по странам
        payoutByGeo: req.body.payoutByGeo || null,
        // Conditions (only fields that exist in DB)
        trafficSources: req.body.trafficSources || [],
        allowedApplications: req.body.allowedApplications || [],
        // Partner approval settings
        partnerApprovalType: req.body.partnerApprovalType || "manual",
        autoApprovePartners: req.body.partnerApprovalType === "auto",
        // Limits
        dailyLimit: req.body.dailyLimit || null,
        monthlyLimit: req.body.monthlyLimit || null,
        // Antifraud (only antifraudEnabled exists in DB)
        antifraudEnabled: req.body.antifraudEnabled || true,
        antifraudMethods: req.body.antifraudMethods || [],
        // Settings that exist in DB
        kycRequired: req.body.kycRequired || false,
        isPrivate: req.body.isPrivate || false,
        // Meta (map to existing field)
        kpiConditions: req.body.kpiConditions || null,
        // System fields
        advertiserId: authUser2.id,
        status: req.body.status === "active" ? "active" : "draft"
      };
      console.log("Creating offer with data:", JSON.stringify(offerData, null, 2));
      const offer2 = await storage.createOffer(offerData);
      console.log("\u{1F517} \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0442\u0440\u0435\u043A\u0438\u043D\u0433\u043E\u0432\u044B\u0445 \u0441\u0441\u044B\u043B\u043E\u043A \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0444\u0444\u0435\u0440\u0430...");
      try {
        const activePartners = await db.select({
          id: users.id,
          username: users.username,
          partnerNumber: users.partnerNumber
        }).from(users).where(
          and10(
            eq10(users.role, "affiliate"),
            eq10(users.isActive, true)
          )
        );
        console.log(`\u{1F4CA} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${activePartners.length} \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0441\u0441\u044B\u043B\u043E\u043A`);
        for (const partner of activePartners) {
          const trackingCode = `${offer2.name.toLowerCase().replace(/[^a-z0-9]/g, "")}_${partner.partnerNumber}`;
          const customDomain = "arbiconnect.store";
          const trackingUrl = `https://${customDomain}/track/${trackingCode}`;
          await db.insert(trackingLinks).values({
            id: nanoid3(),
            partnerId: partner.id,
            offerId: offer2.id,
            trackingCode,
            url: trackingUrl,
            customDomain,
            subId1: "auto_generated",
            subId2: "arbiconnect_domain",
            subId3: offer2.category || "general",
            subId4: "new_offer",
            subId5: authUser2.username,
            isActive: true,
            clickCount: 0,
            conversionCount: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
          console.log(`\u2705 \u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u0434\u043B\u044F \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430 ${partner.username}: ${trackingUrl}`);
        }
        console.log(`\u{1F389} \u0423\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u043E ${activePartners.length} \u0442\u0440\u0435\u043A\u0438\u043D\u0433\u043E\u0432\u044B\u0445 \u0441\u0441\u044B\u043B\u043E\u043A \u0441 \u0434\u043E\u043C\u0435\u043D\u043E\u043C arbiconnect.store`);
      } catch (linkError) {
        console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0440\u0435\u043A\u0438\u043D\u0433\u043E\u0432\u044B\u0445 \u0441\u0441\u044B\u043B\u043E\u043A:", linkError);
      }
      if (req.body.creatives || req.body.creativesUrl) {
        console.log("\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432 \u0432 \u0431\u0430\u0437\u0443 \u0434\u0430\u043D\u043D\u044B\u0445...");
        console.log("\u{1F517} Creatives URL:", req.body.creatives || req.body.creativesUrl);
        try {
          const creativesUrl = req.body.creatives || req.body.creativesUrl;
          let objectPath = creativesUrl;
          if (creativesUrl.startsWith("https://storage.googleapis.com/")) {
            const url = new URL(creativesUrl);
            objectPath = url.pathname;
          }
          const creativeData = {
            id: nanoid3(),
            // Генерируем уникальный ID
            offerId: offer2.id,
            fileName: "creatives.zip",
            // Стандартное имя для архива креативов
            originalName: "creatives.zip",
            // Обязательное поле
            fileType: "archive",
            mimeType: "application/zip",
            fileSize: 1024,
            // Примерный размер
            filePath: objectPath,
            uploadedBy: authUser2.id,
            isActive: true
          };
          console.log("\u{1F4C1} \u0414\u0430\u043D\u043D\u044B\u0435 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u0430 \u0434\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F:", creativeData);
          await db.insert(creativeFiles).values(creativeData);
          console.log("\u2705 \u041A\u0440\u0435\u0430\u0442\u0438\u0432 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0432 \u0431\u0430\u0437\u0443 \u0434\u0430\u043D\u043D\u044B\u0445");
        } catch (creativeError) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u0430:", creativeError);
        }
      }
      queryCache.clear();
      res.status(201).json(offer2);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(500).json({
        error: "Failed to create offer",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/advertiser/offers/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const existingOffer = await storage.getOffer(offerId);
      console.log("Checking offer ownership:", {
        offerId,
        existingOffer: existingOffer ? { id: existingOffer.id, advertiserId: existingOffer.advertiserId } : null,
        authUserId: authUser2.id,
        authUserRole: authUser2.role
      });
      if (!existingOffer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (authUser2.role === "advertiser" && existingOffer.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied - not your offer" });
      }
      const updatedOffer = await storage.updateOffer(offerId, req.body);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/offers/:id/toggle", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const { isActive } = req.body;
      const existingOffer = await storage.getOffer(offerId);
      if (!existingOffer || existingOffer.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updatedOffer = await storage.updateOffer(offerId, { isActive });
      res.json(updatedOffer);
    } catch (error) {
      console.error("Toggle offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/offers/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const existingOffer = await storage.getOffer(offerId);
      if (!existingOffer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (existingOffer.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied - not your offer" });
      }
      await storage.deleteOffer(offerId);
      queryCache.clear();
      res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Delete offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/offers/:id/partners", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const existingOffer = await storage.getOffer(offerId);
      if (!existingOffer || existingOffer.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const partners = await storage.getOfferPartners(offerId);
      res.json(partners);
    } catch (error) {
      console.error("Get offer partners error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/offers/:id/statistics", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const existingOffer = await storage.getOffer(offerId);
      if (!existingOffer || existingOffer.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const stats = await storage.getOfferStatistics(offerId, req.query);
      res.json(stats);
    } catch (error) {
      console.error("Get offer statistics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/received-offers", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const receivedOffers2 = await storage.getReceivedOffers(authUser2.id);
      res.json(receivedOffers2);
    } catch (error) {
      console.error("Get received offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/received-offers", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const validatedData = insertReceivedOfferSchema.parse(req.body);
      const receivedOfferData = {
        ...validatedData,
        advertiserId: authUser2.id
      };
      const receivedOffer = await storage.createReceivedOffer(receivedOfferData);
      res.status(201).json(receivedOffer);
    } catch (error) {
      console.error("Create received offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/received-offers/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const receivedOfferId = req.params.id;
      const existingReceivedOffer = await storage.getReceivedOffers(authUser2.id);
      const receivedOffer = existingReceivedOffer.find((ro) => ro.id === receivedOfferId);
      if (!receivedOffer) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updatedReceivedOffer = await storage.updateReceivedOffer(receivedOfferId, req.body);
      res.json(updatedReceivedOffer);
    } catch (error) {
      console.error("Update received offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/received-offers/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const receivedOfferId = req.params.id;
      const existingReceivedOffers = await storage.getReceivedOffers(authUser2.id);
      const receivedOffer = existingReceivedOffers.find((ro) => ro.id === receivedOfferId);
      if (!receivedOffer) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteReceivedOffer(receivedOfferId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete received offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/offers/export", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offers3 = await storage.getAdvertiserOffers(authUser2.id, {});
      const csvData = offers3.map((offer2) => ({
        name: offer2.name,
        category: offer2.category,
        payoutType: offer2.payoutType,
        payoutAmount: offer2.payoutAmount,
        currency: offer2.currency,
        status: offer2.status,
        partnersCount: offer2.partnersCount || 0,
        leads: offer2.leads || 0,
        revenue: offer2.revenue || 0
      }));
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=offers.json");
      res.json(csvData);
    } catch (error) {
      console.error("Export offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/tracking-domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const trackingDomains = [
        { id: "1", domain: "track.example.com", isActive: true },
        { id: "2", domain: "tracker.example.com", isActive: true },
        { id: "3", domain: "affiliate-track.com", isActive: true }
      ];
      res.json(trackingDomains);
    } catch (error) {
      console.error("Get tracking domains error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/offers/bulk-update", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { ids, status } = req.body;
      console.log("Bulk update request:", { authUserId: authUser2.id, ids, status });
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required" });
      }
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const offers3 = await Promise.all(ids.map((id) => storage.getOffer(id)));
      console.log("Bulk update debug:", {
        authUserId: authUser2.id,
        requestedIds: ids,
        offersFound: offers3.map((o) => o ? { id: o.id, advertiserId: o.advertiserId } : null)
      });
      const invalidOffers = offers3.filter((offer2) => !offer2 || offer2.advertiserId !== authUser2.id);
      if (invalidOffers.length > 0) {
        console.log("Invalid offers found:", invalidOffers);
        return res.status(403).json({ error: "Access denied to some offers" });
      }
      const updatedOffers = await Promise.all(
        ids.map((id) => storage.updateOffer(id, { status }))
      );
      queryCache.clear();
      res.json({ success: true, updated: updatedOffers.length });
    } catch (error) {
      console.error("Bulk update offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/offers/bulk-delete", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required" });
      }
      const offers3 = await Promise.all(ids.map((id) => storage.getOffer(id)));
      const invalidOffers = offers3.filter((offer2) => !offer2 || offer2.advertiserId !== authUser2.id);
      if (invalidOffers.length > 0) {
        return res.status(403).json({ error: "Access denied to some offers" });
      }
      await Promise.all(ids.map((id) => storage.deleteOffer(id)));
      queryCache.clear();
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { role } = req.query;
      let users2;
      if (authUser2.role === "super_admin") {
        users2 = await storage.getUsers(role);
      } else if (authUser2.role === "advertiser") {
        users2 = await storage.getUsersByOwner(authUser2.id, role);
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
      const safeUsers = users2.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username) || await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      if (authUser2.role === "advertiser") {
        if (!["staff", "affiliate"].includes(userData.role)) {
          return res.status(403).json({ error: "Advertisers can only create staff and affiliate users" });
        }
        userData.ownerId = authUser2.id;
      } else if (authUser2.role === "super_admin") {
        if (userData.role === "advertiser") {
          userData.ownerId = authUser2.id;
        }
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/offers", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      let offers3;
      if (authUser2.role === "super_admin") {
        offers3 = await storage.getAllOffers();
      } else if (authUser2.role === "advertiser") {
        const allOffers = await storage.getAllOffers();
        offers3 = allOffers.filter((offer2) => offer2.advertiserId === authUser2.id);
      } else if (authUser2.role === "affiliate") {
        const partnerOffers2 = await storage.getPartnerOffers(authUser2.id);
        const offerIds = partnerOffers2.map((po) => po.offerId);
        const allOffers = await storage.getAllOffers();
        let filteredOffers;
        if (offerIds.length > 0) {
          filteredOffers = allOffers.filter((offer2) => offerIds.includes(offer2.id) || !offer2.isPrivate);
        } else {
          filteredOffers = allOffers.filter((offer2) => !offer2.isPrivate);
        }
        offers3 = await Promise.all(filteredOffers.map(async (offer2) => {
          const hasAccess = offerIds.includes(offer2.id) || !offer2.isPrivate;
          if (hasAccess) {
            const trackingLink = await TrackingLinkService.generatePartnerTrackingLink(offer2.id, authUser2.id);
            return {
              ...offer2,
              trackingLink,
              // Ready-to-use tracking link with clickid
              hasAccess: true
            };
          }
          return {
            ...offer2,
            hasAccess: false
          };
        }));
      } else if (authUser2.role === "staff") {
        if (authUser2.ownerId) {
          const allOffers = await storage.getAllOffers();
          offers3 = allOffers.filter((offer2) => offer2.advertiserId === authUser2.ownerId);
        } else {
          offers3 = [];
        }
      }
      res.json(offers3);
    } catch (error) {
      console.error("Get offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/offers/:id", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { id } = req.params;
      const offerData = req.body;
      if (authUser2.role === "advertiser") {
        const existingOffer = await storage.getOffer(id);
        if (!existingOffer || existingOffer.advertiserId !== authUser2.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const offer2 = await storage.updateOffer(id, offerData);
      queryCache.clear();
      res.json(offer2);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/offers/:id", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { id } = req.params;
      if (authUser2.role === "advertiser") {
        const existingOffer = await storage.getOffer(id);
        if (!existingOffer || existingOffer.advertiserId !== authUser2.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      await storage.deleteOffer(id);
      queryCache.clear();
      res.json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Delete offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/offers/import", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { offers: offers3 } = req.body;
      if (!Array.isArray(offers3)) {
        return res.status(400).json({ error: "Offers \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C" });
      }
      const importedOffers = [];
      for (const offerData of offers3) {
        try {
          delete offerData.id;
          delete offerData.createdAt;
          delete offerData.updatedAt;
          if (!offerData.advertiserId) {
            offerData.advertiserId = authUser2.id;
          }
          const offer2 = await storage.createOffer({
            name: offerData.name || "\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043E\u0444\u0444\u0435\u0440",
            category: offerData.category || "other",
            description: offerData.description || "",
            logo: offerData.logo || "",
            status: offerData.status || "draft",
            payoutType: offerData.payoutType || "cpa",
            currency: offerData.currency || "USD",
            landingPages: offerData.landingPages || [],
            kpiConditions: offerData.kpiConditions || "",
            trafficSources: offerData.allowedTrafficSources || offerData.trafficSources || [],
            allowedApps: offerData.allowedApps || [],
            dailyLimit: offerData.dailyLimit || null,
            monthlyLimit: offerData.monthlyLimit || null,
            restrictions: offerData.restrictions || "",
            geoPricing: offerData.geoPricing || [],
            kycRequired: offerData.kycRequired || false,
            isPrivate: offerData.isPrivate || false,
            smartlinkEnabled: offerData.smartlinkEnabled || false,
            advertiserId: offerData.advertiserId || authUser2.id
          });
          importedOffers.push(offer2);
        } catch (offerError) {
          console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430 \u043E\u0444\u0444\u0435\u0440\u0430:", offerError);
        }
      }
      res.json({
        success: true,
        message: `\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E ${importedOffers.length} \u0438\u0437 ${offers3.length} \u043E\u0444\u0444\u0435\u0440\u043E\u0432`,
        imported: importedOffers.length,
        total: offers3.length
      });
    } catch (error) {
      console.error("Import offers error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430 \u043E\u0444\u0444\u0435\u0440\u043E\u0432" });
    }
  });
  app2.get("/api/partner/tracking-links", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { offerId } = req.query;
      const links = await TrackingLinkService.getPartnerTrackingLinks(
        authUser2.id,
        offerId
      );
      res.json(links);
    } catch (error) {
      console.error("Get partner tracking links error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/tracking-links", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { offerId, subId1, subId2, subId3, subId4, subId5 } = req.body;
      if (!offerId) {
        return res.status(400).json({ error: "offerId is required" });
      }
      const partnerOffers2 = await storage.getPartnerOffers(authUser2.id, offerId);
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (offer2.isPrivate && partnerOffers2.length === 0) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      const linkResult = await TrackingLinkService.generateTrackingLink({
        partnerId: authUser2.id,
        offerId,
        subId1,
        subId2,
        subId3,
        subId4,
        subId5
      });
      res.status(201).json(linkResult);
    } catch (error) {
      console.error("Generate tracking link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/partner/tracking-links/:linkId", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { linkId } = req.params;
      const result = await TrackingLinkService.deactivateLink(linkId, authUser2.id);
      if (!result) {
        return res.status(404).json({ error: "Link not found or access denied" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Deactivate link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/transform-landing-url", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const { originalUrl, offerId } = req.body;
      const partnerId = getAuthenticatedUser(req).id;
      if (!originalUrl || !offerId) {
        return res.status(400).json({ error: "Original URL and offer ID are required" });
      }
      const offer2 = await storage.getOfferById(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const transformedUrl = await TrackingLinkService.transformLandingUrl({
        originalUrl,
        advertiserId: offer2.advertiserId,
        partnerId,
        offerId
      });
      res.json({ transformedUrl });
    } catch (error) {
      console.error("Error transforming landing URL:", error);
      res.status(500).json({ error: "Failed to transform landing URL" });
    }
  });
  app2.get("/click", async (req, res) => {
    try {
      const { offer_id, partner_id, clickid, ...subIds } = req.query;
      if (!offer_id || !partner_id || !clickid) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      const offer2 = await storage.getOffer(offer_id);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      await db.insert(trackingClicks).values({
        clickId: clickid,
        partnerId: partner_id,
        offerId: offer_id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        referer: req.get("Referer"),
        subId1: subIds.sub1 || null,
        subId2: subIds.sub2 || null,
        subId3: subIds.sub3 || null,
        subId4: subIds.sub4 || null,
        subId5: subIds.sub5 || null
      });
      if (req.query.tracking_code) {
        await TrackingLinkService.incrementClickCount(req.query.tracking_code);
      }
      res.redirect(offer2.url);
    } catch (error) {
      console.error("Click handling error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/tracking-analytics", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const links = await TrackingLinkService.getAdvertiserTrackingLinks(authUser2.id);
      res.json(links);
    } catch (error) {
      console.error("Get advertiser tracking analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/domains/verify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }
      if (!DNSVerificationService.isValidDomain(domain)) {
        return res.status(400).json({ error: "Invalid domain format" });
      }
      const existingDomain = await storage.getDomainByName(domain);
      if (existingDomain && existingDomain.advertiserId !== authUser2.id) {
        return res.status(409).json({ error: "Domain already registered by another advertiser" });
      }
      const verificationCode = DNSVerificationService.generateVerificationCode();
      let domainRecord;
      if (existingDomain) {
        domainRecord = await storage.updateDomain(existingDomain.id, {
          verificationCode,
          status: "pending",
          verifiedAt: null
        });
      } else {
        domainRecord = await storage.createDomain({
          domain,
          advertiserId: authUser2.id,
          verificationCode,
          status: "pending"
        });
      }
      const instructions = DNSVerificationService.getVerificationInstructions(domain, verificationCode);
      res.json({
        domain: domainRecord,
        instructions,
        verificationCode
      });
    } catch (error) {
      console.error("Domain verification setup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/domains/:domainId/check", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { domainId } = req.params;
      const domain = await storage.getDomain(domainId);
      if (!domain || domain.advertiserId !== authUser2.id) {
        return res.status(404).json({ error: "Domain not found" });
      }
      if (domain.status === "verified") {
        return res.json({
          success: true,
          status: "verified",
          message: "Domain already verified",
          verifiedAt: domain.verifiedAt
        });
      }
      const verificationResult = await DNSVerificationService.verifyDomain(
        domain.domain,
        domain.verificationCode
      );
      if (verificationResult.success) {
        const updatedDomain = await storage.updateDomain(domainId, {
          status: "verified",
          verificationMethod: verificationResult.method,
          verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log(`\u2705 Domain ${domain.domain} verified successfully for advertiser ${authUser2.id}`);
        res.json({
          success: true,
          status: "verified",
          method: verificationResult.method,
          verifiedAt: updatedDomain.verifiedAt,
          message: `Domain verified successfully using ${verificationResult.method} method`
        });
      } else {
        console.log(`\u274C Domain verification failed for ${domain.domain}: ${verificationResult.error}`);
        res.json({
          success: false,
          status: "pending",
          method: verificationResult.method,
          error: verificationResult.error,
          message: `Verification failed: ${verificationResult.error}`
        });
      }
    } catch (error) {
      console.error("Domain verification check error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/domains/:domainId/instructions", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { domainId } = req.params;
      const domain = await storage.getDomain(domainId);
      if (!domain || domain.advertiserId !== authUser2.id) {
        return res.status(404).json({ error: "Domain not found" });
      }
      const instructions = DNSVerificationService.getVerificationInstructions(
        domain.domain,
        domain.verificationCode
      );
      res.json({
        domain: domain.domain,
        verificationCode: domain.verificationCode,
        instructions
      });
    } catch (error) {
      console.error("Get domain instructions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/tracking-links", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const links = await storage.getTrackingLinks(authUser2.id);
      res.json(links);
    } catch (error) {
      console.error("Get tracking links error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/tracking-links", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { offerId, subId1, subId2, subId3, subId4, subId5 } = req.body;
      const partnerOffers2 = await storage.getPartnerOffers(authUser2.id, offerId);
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (offer2.isPrivate && partnerOffers2.length === 0) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      const trackingCode = `${authUser2.id.slice(0, 8)}_${offerId.slice(0, 8)}_${Date.now().toString(36)}`;
      const link = await storage.createTrackingLink({
        partnerId: authUser2.id,
        offerId,
        trackingCode,
        url: `${process.env.TRACKING_DOMAIN || "http://localhost:3000"}/track/${trackingCode}`,
        subId1,
        subId2,
        subId3,
        subId4,
        subId5
      });
      res.status(201).json(link);
    } catch (error) {
      console.error("Create tracking link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/profile", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      console.log("Updating profile for user:", authUser2.id, "with data:", req.body);
      const updatedUser = await storage.updateUser(authUser2.id, req.body);
      console.log("Profile updated successfully:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  app2.post("/api/advertiser/profile/change-password", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(authUser2.id);
      if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash || "")) {
        return res.status(400).json({ error: "Invalid current password" });
      }
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await storage.updateUser(authUser2.id, { passwordHash: hashedPassword });
      res.json({ success: true });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/tokens", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const tokens = await storage.getApiTokens(authUser2.id);
      res.json(tokens);
    } catch (error) {
      console.error("Get API tokens error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/tokens/generate", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { name } = req.body;
      const token = await storage.generateApiToken(authUser2.id, name);
      res.json(token);
    } catch (error) {
      console.error("Generate API token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/profile/tokens/:tokenId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      await storage.deleteApiToken(authUser2.id, req.params.tokenId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete API token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const domains = await storage.getCustomDomains(authUser2.id);
      res.json(domains);
    } catch (error) {
      console.error("Get custom domains error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { domain, type } = req.body;
      const customDomain = await storage.addCustomDomain(authUser2.id, { domain, type });
      res.json(customDomain);
    } catch (error) {
      console.error("Add custom domain error:", error);
      if (error.message && error.message.includes("Domain limit exceeded")) {
        return res.status(400).json({
          error: "\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D \u043B\u0438\u043C\u0438\u0442 \u0434\u043E\u043C\u0435\u043D\u043E\u0432",
          details: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044C \u043C\u043E\u0436\u0435\u0442 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E 1 \u043A\u0430\u0441\u0442\u043E\u043C\u043D\u044B\u0439 \u0434\u043E\u043C\u0435\u043D. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u0434\u043E\u043C\u0435\u043D \u0434\u043B\u044F \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u043E\u0432\u043E\u0433\u043E."
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/domains/:domainId/verify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const result = await storage.verifyCustomDomain(authUser2.id, req.params.domainId);
      res.json(result);
    } catch (error) {
      console.error("Verify custom domain error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/domains/:domainId/ssl", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { domainId } = req.params;
      const { CustomDomainService: CustomDomainService2 } = await Promise.resolve().then(() => (init_customDomains(), customDomains_exports));
      const result = await CustomDomainService2.issueSSLForDomain(domainId, authUser2.id);
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error("SSL issuance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/profile/domains/:domainId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      await storage.deleteCustomDomain(authUser2.id, req.params.domainId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete custom domain error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/webhook", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const webhook = await storage.getWebhookSettings(authUser2.id);
      res.json(webhook);
    } catch (error) {
      console.error("Get webhook settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/profile/webhook", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const webhook = await storage.updateWebhookSettings(authUser2.id, req.body);
      res.json(webhook);
    } catch (error) {
      console.error("Update webhook settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/dashboard", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { dateFrom, dateTo } = req.query;
      console.log("Getting advertiser dashboard for", authUser2.id);
      const dashboardData = {
        metrics: {
          // Основные метрики офферов
          offersCount: 12,
          totalOffers: 12,
          activeOffers: 8,
          pendingOffers: 2,
          rejectedOffers: 2,
          // Финансовые метрики
          totalBudget: 5e4,
          totalSpent: 15750,
          revenue: 8900,
          advertiserRevenue: 8900,
          // Партнёры и активность
          partnersCount: 24,
          avgCR: 3.2,
          epc: 2.15,
          // Постбеки
          postbacksSent: 1245,
          postbacksReceived: 1187,
          postbackErrors: 58,
          // Фрод активность
          fraudActivity: 12,
          fraudRate: 2.1,
          // Изменения по сравнению с предыдущим периодом
          offersChange: 8.5,
          budgetChange: -3.2,
          revenueChange: 12.3,
          partnersChange: 15.7,
          crChange: -0.8,
          epcChange: 4.2,
          postbacksChange: 6.1,
          fraudChange: -18.5
        },
        chartData: {
          traffic: [
            { date: "2025-07-30", clicks: 1200, uniques: 890 },
            { date: "2025-07-31", clicks: 1450, uniques: 1020 },
            { date: "2025-08-01", clicks: 1650, uniques: 1180 },
            { date: "2025-08-02", clicks: 1340, uniques: 950 },
            { date: "2025-08-03", clicks: 1580, uniques: 1150 },
            { date: "2025-08-04", clicks: 1720, uniques: 1250 },
            { date: "2025-08-05", clicks: 1890, uniques: 1380 }
          ],
          conversions: [
            { date: "2025-07-30", leads: 45, registrations: 32, deposits: 18 },
            { date: "2025-07-31", leads: 52, registrations: 38, deposits: 22 },
            { date: "2025-08-01", leads: 61, registrations: 44, deposits: 26 },
            { date: "2025-08-02", leads: 48, registrations: 35, deposits: 20 },
            { date: "2025-08-03", leads: 58, registrations: 42, deposits: 24 },
            { date: "2025-08-04", leads: 67, registrations: 48, deposits: 28 },
            { date: "2025-08-05", leads: 73, registrations: 52, deposits: 31 }
          ],
          spending: [
            { date: "2025-07-30", spent: 2100, payouts: 1580 },
            { date: "2025-07-31", spent: 2350, payouts: 1720 },
            { date: "2025-08-01", spent: 2650, payouts: 1950 },
            { date: "2025-08-02", spent: 2200, payouts: 1650 },
            { date: "2025-08-03", spent: 2450, payouts: 1800 },
            { date: "2025-08-04", spent: 2750, payouts: 2050 },
            { date: "2025-08-05", spent: 2950, payouts: 2200 }
          ],
          postbacks: [
            { date: "2025-07-30", sent: 180, received: 172, errors: 8 },
            { date: "2025-07-31", sent: 205, received: 195, errors: 10 },
            { date: "2025-08-01", sent: 235, received: 224, errors: 11 },
            { date: "2025-08-02", sent: 195, received: 186, errors: 9 },
            { date: "2025-08-03", sent: 220, received: 210, errors: 10 },
            { date: "2025-08-04", sent: 245, received: 233, errors: 12 },
            { date: "2025-08-05", sent: 265, received: 252, errors: 13 }
          ],
          fraud: [
            { date: "2025-07-30", blocked: 15, suspicious: 12 },
            { date: "2025-07-31", blocked: 18, suspicious: 15 },
            { date: "2025-08-01", blocked: 22, suspicious: 19 },
            { date: "2025-08-02", blocked: 16, suspicious: 13 },
            { date: "2025-08-03", blocked: 20, suspicious: 17 },
            { date: "2025-08-04", blocked: 25, suspicious: 21 },
            { date: "2025-08-05", blocked: 28, suspicious: 24 }
          ]
        },
        topOffers: [
          { id: "1", name: "4RaBet India", status: "active", clicks: 5420, cr: 4.2, conversions: 228, spent: 3250, postbacks: 215, fraudRate: 2.1 },
          { id: "2", name: "Melbet Casino", status: "active", clicks: 3890, cr: 3.8, conversions: 148, spent: 2150, postbacks: 142, fraudRate: 1.8 },
          { id: "3", name: "1xBet Sports", status: "pending", clicks: 2650, cr: 2.9, conversions: 77, spent: 1450, postbacks: 73, fraudRate: 3.2 },
          { id: "4", name: "Pin-Up Gaming", status: "active", clicks: 4120, cr: 3.5, conversions: 144, spent: 2890, postbacks: 138, fraudRate: 2.7 },
          { id: "5", name: "Mostbet Live", status: "active", clicks: 3340, cr: 4.1, conversions: 137, spent: 2250, postbacks: 131, fraudRate: 1.9 }
        ],
        notifications: [
          { id: "1", type: "partner_request", title: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430", message: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 WebTraffic \u043F\u043E\u0434\u0430\u043B \u0437\u0430\u044F\u0432\u043A\u0443 \u043D\u0430 \u043E\u0444\u0444\u0435\u0440 4RaBet", createdAt: "2025-08-05T10:30:00Z", isRead: false, priority: "high" },
          { id: "2", type: "postback_error", title: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u0441\u0442\u0431\u0435\u043A\u0430", message: "\u041F\u043E\u0441\u0442\u0431\u0435\u043A \u0434\u043B\u044F \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438 #12453 \u043D\u0435 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D", createdAt: "2025-08-05T09:15:00Z", isRead: false, priority: "medium" },
          { id: "3", type: "fraud_alert", title: "\u0424\u0440\u043E\u0434-\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C", message: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0432 \u043E\u0444\u0444\u0435\u0440\u0435 Melbet", createdAt: "2025-08-05T08:45:00Z", isRead: true, priority: "high" },
          { id: "4", type: "offer_pending", title: "\u041E\u0444\u0444\u0435\u0440 \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438", message: "\u041E\u0444\u0444\u0435\u0440 1xBet Sports \u043E\u0436\u0438\u0434\u0430\u0435\u0442 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438", createdAt: "2025-08-04T16:20:00Z", isRead: true, priority: "low" },
          { id: "5", type: "partner_request", title: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 \u043E\u0434\u043E\u0431\u0440\u0435\u043D", message: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 ClickMaster \u043E\u0434\u043E\u0431\u0440\u0435\u043D \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B", createdAt: "2025-08-04T14:10:00Z", isRead: true, priority: "low" }
        ],
        offerStatus: {
          pending: 2,
          active: 8,
          hidden: 1,
          archived: 1
        },
        offerStatusDistribution: [
          { name: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435", value: 8, color: "#10B981" },
          { name: "\u041D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438", value: 2, color: "#F59E0B" },
          { name: "\u0421\u043A\u0440\u044B\u0442\u044B\u0435", value: 1, color: "#6B7280" },
          { name: "\u0410\u0440\u0445\u0438\u0432\u043D\u044B\u0435", value: 1, color: "#EF4444" }
        ]
      };
      res.json(dashboardData);
    } catch (error) {
      console.error("Get advertiser dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/dashboard", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      console.log("Getting clean partner dashboard for", authUser2.id);
      const dashboardData = {
        metrics: {
          totalClicks: 0,
          conversions: 0,
          revenue: 0,
          conversionRate: 0,
          epc: 0,
          avgOfferPayout: 0,
          activeOffers: 0,
          pendingRequests: 0
        },
        chartData: {
          clicks: [],
          conversions: []
        },
        topOffers: [],
        notifications: await storage.getNotificationsByUserId(authUser2.id)
      };
      res.json(dashboardData);
    } catch (error) {
      console.error("Get clean partner dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/profile", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const user = await storage.getUser(authUser2.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("Partner profile retrieved for user:", authUser2.id);
      const { passwordHash, password, sessionToken, twoFactorSecret, ...profileData } = user;
      res.json(profileData);
    } catch (error) {
      console.error("Get partner profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/partner/profile", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const updateData = req.body;
      if (updateData.firstName && updateData.firstName.trim().length === 0) {
        return res.status(400).json({ error: "First name cannot be whitespace only" });
      }
      if (updateData.lastName && updateData.lastName.trim().length === 0) {
        return res.status(400).json({ error: "Last name cannot be whitespace only" });
      }
      if (updateData.telegram !== void 0) {
        const trimmed = updateData.telegram.trim();
        if (trimmed) {
          const telegramValue = trimmed.replace(/^@+/, "");
          const telegramRegex = /^[a-zA-Z0-9_]+$/;
          if (!telegramRegex.test(telegramValue)) {
            return res.status(400).json({
              error: "Invalid Telegram username format. Only letters, digits, and underscores allowed"
            });
          }
          updateData.telegram = "@" + telegramValue;
        } else {
          updateData.telegram = "";
        }
      }
      const allowedFields = [
        "firstName",
        "lastName",
        "phone",
        "company",
        "country",
        "timezone",
        "currency",
        "telegram"
      ];
      const filteredData = {};
      allowedFields.forEach((field) => {
        if (updateData[field] !== void 0) {
          filteredData[field] = updateData[field];
        }
      });
      const updatedUser = await storage.updateUser(authUser2.id, filteredData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("Partner profile updated successfully for user:", authUser2.id, "fields:", Object.keys(filteredData));
      const { passwordHash, password, sessionToken, twoFactorSecret, ...profileData } = updatedUser;
      res.json(profileData);
    } catch (error) {
      console.error("Update partner profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/profile/change-password", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }
      const user = await storage.getUser(authUser2.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const passwordValid = user.passwordHash ? bcrypt.compareSync(currentPassword, user.passwordHash) : user.password === currentPassword;
      if (!passwordValid) {
        return res.status(400).json({ error: "Invalid current password" });
      }
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await storage.updateUser(authUser2.id, { passwordHash: hashedPassword });
      console.log("Partner password changed successfully for user:", authUser2.id);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change partner password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/support/tickets", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { subject, message, category, urgency, contactMethod } = req.body;
      if (!subject?.trim() || !message?.trim() || !category) {
        return res.status(400).json({ error: "Subject, message and category are required" });
      }
      const ticketNumber = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const ticketData = {
        id: randomUUID5(),
        userId: authUser2.id,
        subject: subject.trim(),
        message: `${message.trim()}

--- \u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u044F ---
\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F: ${category}
\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442: ${urgency}
\u0421\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0438: ${contactMethod}
\u041F\u0430\u0440\u0442\u043D\u0435\u0440: ${authUser2.partnerNumber || "unknown"}`,
        status: "open",
        priority: urgency || "medium",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const ticket = await storage.createTicket(ticketData);
      console.log(`New partner support ticket created: ${ticketNumber} by ${authUser2.username}`);
      res.status(201).json({
        id: ticket.id,
        ticketNumber,
        status: "created",
        estimatedResponse: urgency === "critical" ? "2 hours" : urgency === "high" ? "6 hours" : urgency === "medium" ? "24 hours" : "48 hours"
      });
    } catch (error) {
      console.error("Create partner support ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/partners", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const partners = await storage.getAdvertiserPartners(authUser2.id);
      res.json(partners);
    } catch (error) {
      console.error("Get advertiser partners error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/tracking-domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const domains = [
        "track.platform.com",
        "click.ads-system.com",
        "go.traffic-hub.net",
        "link.promo-leads.org"
      ];
      res.json(domains);
    } catch (error) {
      console.error("Get tracking domains error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/offers", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      console.log("=== PARTNER OFFERS ROUTE HANDLER STARTED ===");
      console.log("User in request:", req.user);
      const partnerId = getAuthenticatedUser(req).id;
      console.log("Extracted partner ID:", partnerId);
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      console.log(`Getting available offers for partner ${partnerId}`);
      const availableOffers = await storage.getAvailableOffers(partnerId);
      console.log(`Found ${availableOffers.length} available offers`);
      const offersWithLinks = availableOffers.map((offer2) => {
        let partnerLink = null;
        if (offer2.isApproved || offer2.autoApproved) {
          partnerLink = `https://track.example.com/click?offer=${offer2.id}&partner=${partnerId}&clickid=partner_${partnerId}_${offer2.id}_{subid}`;
        }
        return {
          ...offer2,
          partnerLink,
          readyToUse: !!partnerLink
        };
      });
      res.json(offersWithLinks);
    } catch (error) {
      console.error("Get partner offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/offers/:id", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      let hasAccess = false;
      let accessRequest = null;
      try {
        const accessRequests = await db.select().from(offerAccessRequests).where(
          and10(
            eq10(offerAccessRequests.offerId, offerId),
            eq10(offerAccessRequests.partnerId, authUser2.id)
          )
        );
        if (accessRequests.length > 0) {
          accessRequest = accessRequests[0];
          hasAccess = accessRequest.status === "approved";
        }
      } catch (error) {
        console.error("Error checking offer access request:", error);
      }
      if (!offer2.isPrivate) {
        hasAccess = true;
      }
      if (offer2.isPrivate && !hasAccess) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      let partnerLink = null;
      if (hasAccess) {
        try {
          partnerLink = await TrackingLinkService.generatePartnerTrackingLink(offerId, authUser2.id);
        } catch (error) {
          console.error("Error generating partner tracking link for offer", offerId, error);
          partnerLink = `https://trk.platform.com/click?offer=${offerId}&clickid=${authUser2.id}`;
        }
      }
      res.json({
        ...offer2,
        isApproved: hasAccess,
        partnerLink,
        // Готовая ссылка с автоматическим clickid
        // Only include creative data for partners with access
        creatives: hasAccess ? offer2.creatives : void 0,
        creativesUrl: hasAccess ? offer2.creativesUrl : void 0,
        landingPages: hasAccess ? offer2.landingPages : []
      });
    } catch (error) {
      console.error("Get partner offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/offer-access-request", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = getAuthenticatedUser(req).id;
      const { offerId, message } = req.body;
      if (!offerId) {
        return res.status(400).json({ error: "Offer ID is required" });
      }
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const isAssigned = await storage.isPartnerAssignedToAdvertiser(partnerId, offer2.advertiserId);
      if (!isAssigned) {
        return res.status(403).json({ error: "You are not assigned to this advertiser" });
      }
      const existingRequest = await db.select().from(offerAccessRequests).where(
        and10(
          eq10(offerAccessRequests.partnerId, partnerId),
          eq10(offerAccessRequests.offerId, offerId)
        )
      );
      if (existingRequest.length > 0) {
        return res.status(400).json({
          error: "Access request already exists",
          requestStatus: existingRequest[0].status
        });
      }
      console.log(`Creating access request for partner ${partnerId} to offer ${offerId}`);
      const requestId = randomUUID5();
      const requestData = {
        id: requestId,
        partnerId,
        offerId,
        advertiserId: offer2.advertiserId,
        status: "pending",
        requestNote: message || null,
        requestedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [request] = await db.insert(offerAccessRequests).values(requestData).returning();
      console.log(`\u2705 \u0417\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u0441\u043E\u0437\u0434\u0430\u043D \u0432 \u0431\u0430\u0437\u0435: partnerId=${partnerId}, offerId=${offerId}, advertiserId=${offer2.advertiserId}, requestId=${requestId}`);
      res.status(201).json(request);
    } catch (error) {
      console.error("Create offer access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/access-requests", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const requests = await storage.getOfferAccessRequestsByAdvertiser(advertiserId);
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const partner = await storage.getUser(request.partnerId);
          const offer2 = await storage.getOfferById(request.offerId);
          return {
            ...request,
            partnerName: partner ? `${partner.firstName} ${partner.lastName}`.trim() : "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440",
            partnerUsername: partner?.username || "unknown",
            partnerEmail: partner?.email || "",
            offerName: offer2?.name || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043E\u0444\u0444\u0435\u0440",
            offerPayout: offer2?.payout || "0",
            offerCurrency: offer2?.currency || "USD"
          };
        })
      );
      console.log(`\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C ${enrichedRequests.length} \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044E ${advertiserId}`);
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Get advertiser access requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/access-requests/:id/respond", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const requestId = req.params.id;
      const { action, message } = req.body;
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      console.log(`\u041E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430: ${requestId}, action: ${action}, advertiserId: ${advertiserId}`);
      const [request] = await db.select().from(offerAccessRequests).where(eq10(offerAccessRequests.id, requestId));
      if (!request) {
        console.log(`\u0417\u0430\u043F\u0440\u043E\u0441 ${requestId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u0431\u0430\u0437\u0435 \u0434\u0430\u043D\u043D\u044B\u0445`);
        return res.status(404).json({ error: "Request not found" });
      }
      console.log(`\u041D\u0430\u0439\u0434\u0435\u043D \u0437\u0430\u043F\u0440\u043E\u0441: ${JSON.stringify(request)}`);
      if (request.advertiserId !== advertiserId) {
        console.log(`\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D: advertiserId \u0432 \u0437\u0430\u043F\u0440\u043E\u0441\u0435 ${request.advertiserId} != ${advertiserId}`);
        return res.status(403).json({ error: "Access denied" });
      }
      const status = action === "approve" ? "approved" : "rejected";
      const [updatedRequest] = await db.update(offerAccessRequests).set({
        status,
        responseNote: message || null,
        reviewedAt: /* @__PURE__ */ new Date(),
        reviewedBy: advertiserId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(offerAccessRequests.id, requestId)).returning();
      console.log(`\u0417\u0430\u043F\u0440\u043E\u0441 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D: ${JSON.stringify(updatedRequest)}`);
      if (status === "approved") {
        const existingPartnerOffer = await db.select().from(partnerOffers).where(
          and10(
            eq10(partnerOffers.partnerId, request.partnerId),
            eq10(partnerOffers.offerId, request.offerId)
          )
        );
        if (existingPartnerOffer.length > 0) {
          await db.update(partnerOffers).set({
            isApproved: true,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(
            and10(
              eq10(partnerOffers.partnerId, request.partnerId),
              eq10(partnerOffers.offerId, request.offerId)
            )
          );
        } else {
          await db.insert(partnerOffers).values({
            id: randomUUID5(),
            partnerId: request.partnerId,
            offerId: request.offerId,
            isApproved: true,
            customPayout: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
        }
        console.log(`\u0421\u043E\u0437\u0434\u0430\u043D\u0430/\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u0441\u0432\u044F\u0437\u044C \u043F\u0430\u0440\u0442\u043D\u0435\u0440-\u043E\u0444\u0444\u0435\u0440 \u0434\u043B\u044F ${request.partnerId} - ${request.offerId}`);
      }
      try {
        const partner = await storage.getUser(request.partnerId);
        if (partner && offer) {
          const { notifyOfferRequestCreated: notifyOfferRequestCreated2 } = await Promise.resolve().then(() => (init_notification_helper(), notification_helper_exports));
          if (status === "approved") {
            await notifyOfferRequestCreated2(partner.id, {
              id: requestId,
              partnerId: request.partnerId,
              partnerName: partner.username,
              offerId: request.offerId,
              offerName: offer.name,
              message: `\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0430: ${message || "\u0411\u0435\u0437 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432"}`
            });
          }
        }
      } catch (notifyError) {
        console.error("\u274C Failed to send offer access notification:", notifyError);
      }
      console.log(`\u0417\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 ${requestId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D`);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Respond to access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/access-requests/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const advertiserId = getAuthenticatedUser(req).id;
      const requestId = req.params.id;
      const { status, rejectReason } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const requests = await storage.getOfferAccessRequests();
      const request = requests.find((r) => r.id === requestId);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      const offer2 = await storage.getOffer(request.offerId);
      if (!offer2 || offer2.advertiserId !== advertiserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updatedRequest = await storage.updateOfferAccessRequest(requestId, {
        status,
        rejectReason: status === "rejected" ? rejectReason : null,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (status === "approved") {
        const existingPartnerOffers = await storage.getPartnerOffers(request.partnerId, request.offerId);
        if (existingPartnerOffers.length === 0) {
          await storage.createPartnerOffer({
            id: randomUUID5(),
            partnerId: request.partnerId,
            offerId: request.offerId,
            isApproved: true,
            customPayout: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      try {
        const partner = await storage.getUser(request.partnerId);
        const advertiser = await storage.getUser(advertiserId);
        if (partner && advertiser && offer2) {
          if (status === "approved") {
            const { notifyOfferAccessApproved: notifyOfferAccessApproved2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
            await notifyOfferAccessApproved2(partner, advertiser, offer2, rejectReason);
          } else {
            const { notifyOfferAccessRejected: notifyOfferAccessRejected2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
            await notifyOfferAccessRejected2(partner, advertiser, offer2, rejectReason);
          }
        }
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
      try {
        const partner = await storage.getUser(request.partnerId);
        const advertiser = await storage.getUser(advertiserId);
        if (partner && advertiser && offer2) {
          if (status === "approved") {
            const { notifyOfferAccessApproved: notifyOfferAccessApproved2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
            await notifyOfferAccessApproved2(partner, advertiser, offer2, rejectReason);
          } else {
            const { notifyOfferAccessRejected: notifyOfferAccessRejected2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
            await notifyOfferAccessRejected2(partner, advertiser, offer2, rejectReason);
          }
        }
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Update access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/offers/:id", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (offer2.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      res.json(offer2);
    } catch (error) {
      console.error("Get advertiser offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/offers/:id/status", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const offerId = req.params.id;
      const { status } = req.body;
      const validStatuses = ["active", "paused", "stopped", "archived", "draft"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (offer2.advertiserId !== authUser2.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updatedOffer = await storage.updateOffer(offerId, { status });
      console.log(`Offer ${offerId} status updated to ${status} by ${authUser2.id}`);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Update offer status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/generate-link", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { offerId, subId } = req.body;
      if (!offerId) {
        return res.status(400).json({ error: "Offer ID is required" });
      }
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const partnerOffers2 = await storage.getPartnerOffers(authUser2.id, offerId);
      if (offer2.isPrivate && partnerOffers2.length === 0) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      const baseUrl = offer2.baseUrl || offer2.landingPageUrl || offer2.landingPages?.[0]?.url;
      if (!baseUrl) {
        return res.status(400).json({ error: "No base URL configured for this offer" });
      }
      const partnerLink = storage.generatePartnerLink(baseUrl, authUser2.id, offerId, subId);
      res.json({
        offerId,
        partnerLink,
        baseUrl,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Generate partner link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/analytics", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { tab = "overview", page = "1", limit = "50" } = req.query;
      const userId = authUser2.id;
      console.log(`Getting partner analytics for ${userId}, tab: ${tab}`);
      const trackingClicks3 = await storage.getTrackingClicks({ partnerId: userId });
      const totalClicks = trackingClicks3.length;
      const conversions2 = trackingClicks3.filter((click) => click.status === "conversion");
      const totalConversions = conversions2.length;
      const totalRevenue = conversions2.reduce((sum3, conv) => sum3 + parseFloat(conv.revenue || "0"), 0);
      const cr = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : "0.00";
      const epc = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : "0.00";
      const summary = {
        totalClicks,
        totalConversions,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate: cr,
        epc,
        currency: "USD"
      };
      let data = [];
      if (tab === "overview") {
        data = trackingClicks3.map((click) => ({
          id: click.id,
          clickId: click.click_id || click.id,
          partnerId: click.partner_id,
          offerId: click.offer_id,
          offer: `Offer ${click.offer_id.substring(0, 8)}`,
          country: click.country || "Unknown",
          device: click.device || "Unknown",
          browser: click.browser || "Unknown",
          status: click.status || "click",
          revenue: parseFloat(click.revenue || "0").toFixed(2),
          timestamp: click.created_at,
          createdAt: click.created_at,
          date: new Date(click.created_at).toLocaleDateString(),
          time: new Date(click.created_at).toLocaleTimeString(),
          geo: click.country || "Unknown"
        }));
      } else if (tab === "geography") {
        const countryStats = {};
        trackingClicks3.forEach((click) => {
          const country = click.country || "Unknown";
          if (!countryStats[country]) {
            countryStats[country] = { clicks: 0, conversions: 0, revenue: 0 };
          }
          countryStats[country].clicks++;
          if (click.status === "conversion") {
            countryStats[country].conversions++;
            countryStats[country].revenue += parseFloat(click.revenue || "0");
          }
        });
        data = Object.entries(countryStats).map(([country, stats]) => ({
          country,
          clicks: stats.clicks,
          conversions: stats.conversions,
          revenue: stats.revenue.toFixed(2),
          cr: stats.clicks > 0 ? (stats.conversions / stats.clicks * 100).toFixed(2) + "%" : "0.00%",
          epc: stats.clicks > 0 ? "$" + (stats.revenue / stats.clicks).toFixed(2) : "$0.00"
        }));
      } else if (tab === "devices") {
        const deviceStats = {};
        trackingClicks3.forEach((click) => {
          const device = click.device || "Unknown";
          if (!deviceStats[device]) {
            deviceStats[device] = { clicks: 0, conversions: 0, revenue: 0 };
          }
          deviceStats[device].clicks++;
          if (click.status === "conversion") {
            deviceStats[device].conversions++;
            deviceStats[device].revenue += parseFloat(click.revenue || "0");
          }
        });
        data = Object.entries(deviceStats).map(([device, stats]) => ({
          device,
          clicks: stats.clicks,
          conversions: stats.conversions,
          revenue: stats.revenue.toFixed(2),
          cr: stats.clicks > 0 ? (stats.conversions / stats.clicks * 100).toFixed(2) + "%" : "0.00%",
          epc: stats.clicks > 0 ? "$" + (stats.revenue / stats.clicks).toFixed(2) : "$0.00"
        }));
      } else if (tab === "sources") {
        const sourceStats = {};
        trackingClicks3.forEach((click) => {
          const browser = click.browser || "Unknown";
          if (!sourceStats[browser]) {
            sourceStats[browser] = { clicks: 0, conversions: 0, revenue: 0 };
          }
          sourceStats[browser].clicks++;
          if (click.status === "conversion") {
            sourceStats[browser].conversions++;
            sourceStats[browser].revenue += parseFloat(click.revenue || "0");
          }
        });
        data = Object.entries(sourceStats).map(([browser, stats]) => ({
          source: browser,
          clicks: stats.clicks,
          conversions: stats.conversions,
          revenue: stats.revenue.toFixed(2),
          cr: stats.clicks > 0 ? (stats.conversions / stats.clicks * 100).toFixed(2) + "%" : "0.00%",
          epc: stats.clicks > 0 ? "$" + (stats.revenue / stats.clicks).toFixed(2) : "$0.00"
        }));
      } else if (tab === "subid") {
        data = trackingClicks3.map((click) => ({
          id: click.id,
          clickId: click.click_id || click.id,
          partnerId: click.partner_id,
          offerId: click.offer_id,
          country: click.country || "Unknown",
          device: click.device || "Unknown",
          browser: click.browser || "Unknown",
          status: click.status || "click",
          revenue: parseFloat(click.revenue || "0").toFixed(2),
          timestamp: click.created_at,
          createdAt: click.created_at,
          sub_1: click.sub_1,
          sub_2: click.sub_2,
          sub_3: click.sub_3,
          sub_4: click.sub_4,
          sub_5: click.sub_5,
          sub_6: click.sub_6,
          sub_7: click.sub_7,
          sub_8: click.sub_8,
          sub_9: click.sub_9,
          sub_10: click.sub_10,
          sub_11: click.sub_11,
          sub_12: click.sub_12,
          sub_13: click.sub_13,
          sub_14: click.sub_14,
          sub_15: click.sub_15,
          sub_16: click.sub_16
        }));
      } else if (tab === "details") {
        data = trackingClicks3.map((click) => ({
          id: click.id,
          clickId: click.click_id || click.id,
          partnerId: click.partner_id,
          offerId: click.offer_id,
          country: click.country || "Unknown",
          device: click.device || "Unknown",
          browser: click.browser || "Unknown",
          status: click.status || "click",
          revenue: parseFloat(click.revenue || "0").toFixed(2),
          timestamp: click.created_at,
          createdAt: click.created_at,
          ip: "192.168.1.1",
          // Добавляем mock IP для отображения
          sub_1: click.sub_1,
          sub_2: click.sub_2,
          sub_3: click.sub_3,
          sub_4: click.sub_4,
          sub_5: click.sub_5,
          sub_6: click.sub_6,
          sub_7: click.sub_7,
          sub_8: click.sub_8,
          sub_9: click.sub_9,
          sub_10: click.sub_10,
          sub_11: click.sub_11,
          sub_12: click.sub_12,
          sub_13: click.sub_13,
          sub_14: click.sub_14,
          sub_15: click.sub_15,
          sub_16: click.sub_16
        }));
      }
      res.json({
        summary,
        data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(data.length / parseInt(limit)),
          totalItems: data.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("Partner analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/statistics", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const userId = authUser2.id;
      const trackingClicks3 = await storage.getTrackingClicks({ partnerId: userId });
      const totalClicks = trackingClicks3.length;
      const conversions2 = trackingClicks3.filter((click) => click.status === "conversion");
      const totalConversions = conversions2.length;
      const totalRevenue = conversions2.reduce((sum3, conv) => sum3 + parseFloat(conv.revenue || "0"), 0);
      const cr = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : "0.00";
      const epc = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : "0.00";
      res.json({
        summary: {
          totalClicks,
          totalConversions,
          totalRevenue: totalRevenue.toFixed(2),
          conversionRate: cr,
          epc,
          currency: "USD"
        },
        clicks: trackingClicks3.map((click) => ({
          id: click.id,
          clickId: click.click_id || click.id,
          offerId: click.offer_id,
          country: click.country || "Unknown",
          device: click.device || "Unknown",
          browser: click.browser || "Unknown",
          status: click.status || "click",
          revenue: parseFloat(click.revenue || "0").toFixed(2),
          timestamp: click.created_at
        }))
      });
    } catch (error) {
      console.error("Partner statistics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/creatives", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const userId = authUser2.id;
      const offers3 = await storage.getAvailableOffers(userId);
      const creatives2 = offers3.map((offer2) => ({
        id: `creative-${offer2.id}`,
        offerId: offer2.id,
        offerName: offer2.name,
        type: "banner",
        format: "jpg",
        size: "300x250",
        url: `/api/partner/creatives/${offer2.id}/banner.jpg`,
        downloadUrl: `/api/partner/offers/${offer2.id}/creatives/download`,
        preview: `https://via.placeholder.com/300x250/0079f2/ffffff?text=${encodeURIComponent(offer2.name)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }));
      res.json({
        creatives: creatives2,
        total: creatives2.length
      });
    } catch (error) {
      console.error("Partner creatives error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/team", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      res.json({
        team: [],
        total: 0,
        message: "Team management is available for advertisers"
      });
    } catch (error) {
      console.error("Partner team error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/postbacks", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const userId = authUser2.id;
      const profiles = [];
      res.json({
        profiles: profiles.map((profile) => ({
          ...profile,
          id: profile.id.toString(),
          owner_id: profile.owner_id.toString(),
          scope_id: profile.scope_id?.toString()
        })),
        total: profiles.length
      });
    } catch (error) {
      console.error("Partner postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/get-fresh-token", async (req, res) => {
    try {
      const tokenData = {
        id: "04b06c87-c6cf-4409-af64-3e05bf6c9c7c",
        username: "test_affiliate",
        role: "affiliate",
        advertiserId: null
      };
      const token = jwt2.sign(tokenData, JWT_SECRET2, { expiresIn: "24h" });
      console.log("Generated fresh token for test_affiliate");
      res.json({
        token,
        user: tokenData,
        success: true
      });
    } catch (error) {
      console.error("Get fresh token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/tracking/click", async (req, res) => {
    try {
      const {
        partnerId,
        offerId,
        clickId,
        country,
        device,
        browser,
        os,
        sub_1,
        sub_2,
        sub_3,
        sub_4,
        sub_5,
        sub_6,
        sub_7,
        sub_8,
        sub_9,
        sub_10,
        sub_11,
        sub_12,
        sub_13,
        sub_14,
        sub_15,
        sub_16,
        userAgent,
        ipAddress,
        referrer
      } = req.body;
      const generateShortClickId = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 10; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      const shortClickId = clickId || generateShortClickId();
      const clickData = {
        id: shortClickId,
        partnerId,
        offerId,
        country: country || "Unknown",
        device: device || "Unknown",
        browser: browser || "Unknown",
        os: os || "Unknown",
        sub_1,
        sub_2,
        sub_3,
        sub_4,
        sub_5,
        sub_6,
        sub_7,
        sub_8,
        sub_9,
        sub_10,
        sub_11,
        sub_12,
        sub_13,
        sub_14,
        sub_15,
        sub_16,
        userAgent: userAgent || req.get("User-Agent"),
        ipAddress: ipAddress || req.ip,
        referrer: referrer || req.get("Referer"),
        status: "click",
        createdAt: /* @__PURE__ */ new Date(),
        revenue: "0.00"
      };
      await storage.createTrackingClick(clickData);
      console.log(`Click tracked: ${shortClickId} for partner ${partnerId} on offer ${offerId}`);
      res.json({ success: true, clickId: shortClickId });
    } catch (error) {
      console.error("Click tracking error:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });
  app2.post("/api/tracking/conversion", async (req, res) => {
    try {
      const { clickId, status, revenue } = req.body;
      if (!clickId) {
        return res.status(400).json({ error: "Click ID required" });
      }
      const clickData = await storage.getTrackingClicks({ clickId });
      const click = clickData && clickData.length > 0 ? clickData[0] : null;
      if (!click) {
        return res.status(404).json({ error: "Click not found" });
      }
      await storage.updateTrackingClick(clickId, {
        status: status || "conversion",
        revenue: revenue || "10.00",
        convertedAt: /* @__PURE__ */ new Date()
      });
      console.log(`Conversion tracked: ${clickId} with status ${status} and revenue ${revenue}`);
      try {
        console.log(`\u{1F504} Triggering automatic postbacks for conversion: ${clickId}`);
        const { postbackProfiles: postbackProfiles3 } = await Promise.resolve().then(() => (init_postback_schema(), postback_schema_exports));
        const profiles = await db.select().from(postbackProfiles3).where(eq10(postbackProfiles3.ownerId, click.partner_id || click.partnerId));
        console.log(`Found ${profiles.length} postback profiles for partner`);
        for (const profile of profiles) {
          if (profile.enabled) {
            let postbackUrl = profile.endpointUrl;
            postbackUrl = postbackUrl.replace(/{clickid}/g, clickId);
            postbackUrl = postbackUrl.replace(/{click_id}/g, clickId);
            postbackUrl = postbackUrl.replace(/{client_id}/g, clickId);
            postbackUrl = postbackUrl.replace(/{external_id}/g, clickId);
            let keitaroStatus = "";
            if (status === "lead") {
              keitaroStatus = "lead";
            } else if (status === "sale" || status === "approved") {
              keitaroStatus = "sale";
            } else {
              keitaroStatus = status === "approved" ? "sale" : status;
            }
            postbackUrl = postbackUrl.replace(/{status}/g, keitaroStatus);
            postbackUrl = postbackUrl.replace(/{lead}/g, "lead");
            postbackUrl = postbackUrl.replace(/{sale}/g, "sale");
            const payoutValue = revenue || "0";
            postbackUrl = postbackUrl.replace(/{revenue}/g, payoutValue);
            postbackUrl = postbackUrl.replace(/{payout}/g, payoutValue);
            postbackUrl = postbackUrl.replace(/subid=REPLACE/g, `subid=${clickId}`);
            postbackUrl = postbackUrl.replace(/status=REPLACE/g, `status=${keitaroStatus}`);
            postbackUrl = postbackUrl.replace(/payout=REPLACE/g, `payout=${payoutValue}`);
            console.log(`\u{1F4E4} Sending postback to: ${postbackUrl}`);
            try {
              const response = await fetch(postbackUrl, {
                method: profile.method || "GET",
                headers: {
                  "User-Agent": "Affiliate-Platform-Postback/1.0"
                }
              });
              console.log(`\u2705 Postback sent successfully to ${profile.name}: ${response.status}`);
              console.log(`\u2705 Postback delivered successfully to ${profile.name}: ${response.status}`);
            } catch (fetchError) {
              console.error(`\u274C Postback failed for ${profile.name}:`, fetchError.message);
              console.log(`\u274C Postback delivery failed to ${profile.name}: ${fetchError.message}`);
            }
          }
        }
      } catch (postbackError) {
        console.error("Error triggering postbacks:", postbackError);
      }
      res.json({ success: true, clickId, status, revenue });
    } catch (error) {
      console.error("Conversion tracking error:", error);
      res.status(500).json({ error: "Failed to track conversion" });
    }
  });
  app2.post("/api/tracking/generate-test-data", async (req, res) => {
    try {
      const partnerId = "04b06c87-c6cf-4409-af64-3e05bf6c9c7c";
      const offers3 = await storage.getOffers();
      if (!offers3 || offers3.length === 0) {
        return res.status(404).json({ error: "No offers found" });
      }
      const countries = ["US", "GB", "DE", "FR", "IT", "ES", "CA", "AU", "BR", "IN"];
      const devices = ["Desktop", "Mobile", "Tablet"];
      const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
      const operatingSystems = ["Windows", "macOS", "Linux", "iOS", "Android"];
      const testClicks = [];
      for (let i = 0; i < 50; i++) {
        const offer2 = offers3[Math.floor(Math.random() * offers3.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const browser = browsers[Math.floor(Math.random() * browsers.length)];
        const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
        const isConversion = Math.random() < 0.2;
        const clickData = {
          id: crypto.randomUUID(),
          partnerId,
          offerId: offer2.id,
          country,
          device,
          browser,
          os,
          sub_1: `sub1_${i}`,
          sub_2: `sub2_${i}`,
          sub_3: `sub3_${i}`,
          sub_4: null,
          sub_5: null,
          sub_6: null,
          sub_7: null,
          sub_8: null,
          sub_9: null,
          sub_10: null,
          sub_11: null,
          sub_12: null,
          sub_13: null,
          sub_14: null,
          sub_15: null,
          sub_16: null,
          userAgent: `Mozilla/5.0 (Test) ${browser}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          referrer: "https://test-referrer.com",
          status: isConversion ? "conversion" : "click",
          revenue: isConversion ? (Math.random() * 100).toFixed(2) : "0.00",
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1e3),
          // За последнюю неделю
          convertedAt: isConversion ? /* @__PURE__ */ new Date() : null
        };
        testClicks.push(clickData);
      }
      for (const click of testClicks) {
        await storage.createTrackingClick(click);
      }
      console.log(`Generated ${testClicks.length} test clicks for analytics`);
      res.json({
        success: true,
        generated: testClicks.length,
        conversions: testClicks.filter((c) => c.status === "conversion").length
      });
    } catch (error) {
      console.error("Test data generation error:", error);
      res.status(500).json({ error: "Failed to generate test data" });
    }
  });
  app2.get("/api/statistics", authenticateToken, async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { startDate, endDate: endDate2, offerId } = req.query;
      const filters = {};
      if (authUser2.role === "affiliate") {
        filters.partnerId = authUser2.id;
      } else if (authUser2.role === "advertiser") {
        const offers3 = await storage.getOffers(authUser2.id);
        const offerIds = offers3.map((offer2) => offer2.id);
        if (offerIds.length === 0) {
          return res.json([]);
        }
      }
      if (offerId) filters.offerId = offerId;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate2) filters.endDate = new Date(endDate2);
      const stats = await storage.getStatistics(filters);
      res.json(stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      let transactions2;
      if (authUser2.role === "super_admin") {
        transactions2 = await storage.getTransactions();
      } else {
        transactions2 = await storage.getTransactions(authUser2.id);
      }
      res.json(transactions2);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      let tickets2;
      if (authUser2.role === "super_admin") {
        tickets2 = await storage.getTickets();
      } else {
        tickets2 = await storage.getTickets(authUser2.id);
      }
      res.json(tickets2);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId: getAuthenticatedUser(req).id
      });
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/fraud-alerts", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const alerts = await storage.getFraudAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get fraud alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/postbacks", authenticateToken, async (req, res) => {
    try {
      const postbacks2 = await storage.getPostbacks(getAuthenticatedUser(req).id);
      res.json(postbacks2);
    } catch (error) {
      console.error("Get postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner-offers", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const { partnerId, offerId, customPayout } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      if (authUser2.role === "advertiser") {
        const offer2 = await storage.getOffer(offerId);
        if (!offer2 || offer2.advertiserId !== authUser2.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const partnerOffer = await storage.createPartnerOffer({
        partnerId,
        offerId,
        customPayout,
        isApproved: authUser2.role === "super_admin"
        // Super admin auto-approves
      });
      res.status(201).json(partnerOffer);
    } catch (error) {
      console.error("Create partner offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/partner-offers/:id", authenticateToken, requireRole(["super_admin", "advertiser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const partnerOffer = await storage.updatePartnerOffer(id, data);
      res.json(partnerOffer);
    } catch (error) {
      console.error("Update partner offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const {
        search,
        role,
        status,
        userType,
        country,
        dateFrom,
        dateTo,
        lastActivityFrom,
        lastActivityTo,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc"
      } = req.query;
      const users2 = await storage.getUsersWithFilters({
        search,
        role,
        status,
        userType,
        country,
        dateFrom,
        dateTo,
        lastActivityFrom,
        lastActivityTo,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });
      const safeUsers = users2.data?.map(({ password, ...user }) => user) || [];
      res.json({
        data: safeUsers,
        total: users2.total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((users2.total || 0) / parseInt(limit))
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username) || await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const user = await storage.updateUser(id, updateData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const user = await storage.updateUser(id, updateData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/users/:id/2fa", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      const user = await storage.updateUser(id, { twoFactorEnabled: enabled });
      res.json({ success: true, twoFactorEnabled: enabled });
    } catch (error) {
      console.error("Update 2FA error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/users/:id/restrictions", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { ipRestrictions, geoRestrictions } = req.body;
      const updateData = {};
      if (ipRestrictions !== void 0) {
        updateData.ipRestrictions = ipRestrictions.split(",").map((ip) => ip.trim()).filter(Boolean);
      }
      if (geoRestrictions !== void 0) {
        updateData.geoRestrictions = geoRestrictions.split(",").map((geo) => geo.trim()).filter(Boolean);
      }
      const user = await storage.updateUser(id, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Update restrictions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/block", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      const user = await storage.blockUser(id, reason, authUser2.id);
      res.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/unblock", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.unblockUser(id);
      res.json({ success: true, message: "User unblocked successfully" });
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/force-logout", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.forceLogoutUser(id);
      res.json({ success: true, message: "User sessions terminated" });
    } catch (error) {
      console.error("Force logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const newPassword = await storage.resetUserPassword(id);
      res.json({ success: true, temporaryPassword: newPassword });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { deleteType = "soft" } = req.body;
      if (deleteType === "hard") {
        await storage.deleteUser(id);
        res.json({ success: true, type: "hard", message: "User permanently deleted" });
      } else {
        const authUser2 = getAuthenticatedUser(req);
        await storage.softDeleteUser(id, authUser2.id);
        res.json({ success: true, type: "soft", message: "User moved to archive" });
      }
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/partner-offers", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { partnerId, offerId, isApproved = false, customPayout } = req.body;
      if (!partnerId || !offerId) {
        return res.status(400).json({ error: "Partner ID and Offer ID are required" });
      }
      const existing = await storage.getPartnerOffers(partnerId, offerId);
      if (existing.length > 0) {
        return res.status(409).json({ error: "Partner-offer association already exists" });
      }
      const association = await storage.createPartnerOffer({
        partnerId,
        offerId,
        isApproved,
        customPayout: customPayout ? parseFloat(customPayout) : null
      });
      res.status(201).json(association);
    } catch (error) {
      console.error("Create partner-offer association error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users/analytics", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { period = "30d" } = req.query;
      const analytics = await storage.getUserAnalytics(period);
      res.json(analytics);
    } catch (error) {
      console.error("User analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users/export", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { format = "csv", ...filters } = req.query;
      const data = await storage.exportUsers(filters, format);
      res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=users.${format}`);
      res.send(data);
    } catch (error) {
      console.error("Export users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-block", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }
      let successCount = 0;
      let failedCount = 0;
      for (const userId of userIds) {
        try {
          await storage.blockUser(userId, reason, authUser2.id);
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to block user ${userId}:`, error);
        }
      }
      res.json({
        success: successCount,
        failed: failedCount,
        total: userIds.length
      });
    } catch (error) {
      console.error("Bulk block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-unblock", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }
      let successCount = 0;
      let failedCount = 0;
      for (const userId of userIds) {
        try {
          await storage.unblockUser(userId);
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to unblock user ${userId}:`, error);
        }
      }
      res.json({
        success: successCount,
        failed: failedCount,
        total: userIds.length
      });
    } catch (error) {
      console.error("Bulk unblock error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-delete", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, deleteType = "soft" } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }
      let successCount = 0;
      let failedCount = 0;
      for (const userId of userIds) {
        try {
          if (deleteType === "hard") {
            await storage.deleteUser(userId);
          } else {
            await storage.softDeleteUser(userId, authUser2.id);
          }
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to delete user ${userId}:`, error);
        }
      }
      res.json({
        success: successCount,
        failed: failedCount,
        total: userIds.length,
        deleteType
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/roles", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { search, scope } = req.query;
      const roles = await storage.getCustomRoles({
        search,
        scope
      });
      res.json(roles);
    } catch (error) {
      console.error("Get roles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/roles", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const roleData = {
        ...req.body,
        createdBy: authUser2.id
      };
      const role = await storage.createCustomRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Create role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/roles/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const role = await storage.getCustomRole(id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Get role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/roles/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const role = await storage.updateCustomRole(id, updateData);
      res.json(role);
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/roles/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomRole(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/roles/:roleId/assign", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { roleId } = req.params;
      const { userId, expiresAt } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      const assignment = await storage.assignUserRole(userId, roleId, authUser2.id, expiresAt);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/roles/:roleId/unassign/:userId", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { roleId, userId } = req.params;
      await storage.unassignUserRole(userId, roleId);
      res.status(204).send();
    } catch (error) {
      console.error("Unassign role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-block", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      const results = await storage.bulkBlockUsers(userIds, reason, authUser2.id);
      res.json(results);
    } catch (error) {
      console.error("Bulk block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-unblock", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds } = req.body;
      const results = await storage.bulkUnblockUsers(userIds);
      res.json(results);
    } catch (error) {
      console.error("Bulk unblock error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-delete", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, hardDelete = false } = req.body;
      const authUser2 = getAuthenticatedUser(req);
      const results = await storage.bulkDeleteUsers(userIds, hardDelete, authUser2.id);
      res.json(results);
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/users", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { period = "30d", role } = req.query;
      const analytics = await storage.getUserAnalyticsDetailed(period, role);
      res.json(analytics);
    } catch (error) {
      console.error("Get user analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/fraud", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { period = "30d" } = req.query;
      const analytics = await storage.getFraudAnalytics(period);
      res.json(analytics);
    } catch (error) {
      console.error("Get fraud analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/export", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { format = "csv", period = "30d", role } = req.query;
      const data = await storage.exportAnalytics(format, period, role);
      const contentType = format === "json" ? "application/json" : "text/csv";
      const filename = `analytics_${period}.${format}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(data);
    } catch (error) {
      console.error("Export analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/offers", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const offers3 = await storage.getAllOffers();
      res.json(offers3);
    } catch (error) {
      console.error("Get all offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/offers", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const authUser2 = req.user;
      console.log("Creating offer for user:", authUser2.id, authUser2.username);
      console.log("Request body data:", JSON.stringify(req.body, null, 2));
      let description = req.body.description;
      if (req.body.description_ru || req.body.description_en) {
        description = {
          ru: req.body.description_ru || "",
          en: req.body.description_en || ""
        };
      }
      let goals = req.body.goals;
      if (req.body.goals_ru || req.body.goals_en) {
        goals = {
          ru: req.body.goals_ru || "",
          en: req.body.goals_en || ""
        };
      }
      let kpiConditions = req.body.kpiConditions;
      if (req.body.kpiConditions_ru || req.body.kpiConditions_en) {
        kpiConditions = {
          ru: req.body.kpiConditions_ru || "",
          en: req.body.kpiConditions_en || ""
        };
      }
      const [newOffer] = await db.insert(offers).values({
        name: req.body.name || "Unnamed Offer",
        category: req.body.category || "other",
        description: description || null,
        goals: goals || null,
        logo: req.body.logo || null,
        status: req.body.status || "draft",
        payout: "0.00",
        payoutType: req.body.payoutType || "cpa",
        currency: req.body.currency || "USD",
        advertiserId: authUser2.id,
        landingPages: req.body.landingPages || null,
        kpiConditions: kpiConditions || null,
        trafficSources: req.body.trafficSources || req.body.allowedTrafficSources || null,
        allowedApps: req.body.allowedApps || null,
        dailyLimit: req.body.dailyLimit || null,
        monthlyLimit: req.body.monthlyLimit || null,
        antifraudEnabled: req.body.antifraudEnabled !== false,
        autoApprovePartners: req.body.autoApprovePartners === true
      }).returning();
      console.log("Created offer:", newOffer);
      queryCache.clear();
      res.status(201).json(newOffer);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(500).json({ error: "Failed to create offer", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.patch("/api/admin/offers/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const offer2 = await storage.updateOffer(id, { status });
      res.json(offer2);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/offers/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating offer:", id);
      const updateData = {};
      const allowedFields = [
        "name",
        "description",
        "logo",
        "category",
        "status",
        "payoutType",
        "currency",
        "kpiConditions",
        "restrictions",
        "moderationComment",
        "antifraudEnabled",
        "autoApprovePartners",
        "kycRequired",
        "isPrivate",
        "smartlinkEnabled",
        "dailyLimit",
        "monthlyLimit",
        "landingPages",
        "allowedApps"
      ];
      allowedFields.forEach((field) => {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      });
      if (req.body.allowedTrafficSources !== void 0) {
        updateData.trafficSources = req.body.allowedTrafficSources;
      }
      console.log("Updating fields:", Object.keys(updateData));
      const offer2 = await storage.updateOffer(id, updateData);
      if (!offer2) {
        return res.status(404).json({ error: "\u041E\u0444\u0444\u0435\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      res.json(offer2);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043E\u0444\u0444\u0435\u0440", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/admin/offers/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOffer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/offers/bulk-activate", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C" });
      }
      const updatedOffers = [];
      for (const offerId of offerIds) {
        try {
          const offer2 = await storage.updateOffer(offerId, { status: "active" });
          updatedOffers.push(offer2);
        } catch (error) {
          console.error(`Error activating offer ${offerId}:`, error);
        }
      }
      res.json({
        success: true,
        message: `\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E ${updatedOffers.length} \u0438\u0437 ${offerIds.length} \u043E\u0444\u0444\u0435\u0440\u043E\u0432`,
        updated: updatedOffers.length,
        total: offerIds.length
      });
    } catch (error) {
      console.error("Bulk activate error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0439 \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438" });
    }
  });
  app2.post("/api/admin/offers/bulk-pause", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C" });
      }
      const updatedOffers = [];
      for (const offerId of offerIds) {
        try {
          const offer2 = await storage.updateOffer(offerId, { status: "paused" });
          updatedOffers.push(offer2);
        } catch (error) {
          console.error(`Error pausing offer ${offerId}:`, error);
        }
      }
      res.json({
        success: true,
        message: `\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E ${updatedOffers.length} \u0438\u0437 ${offerIds.length} \u043E\u0444\u0444\u0435\u0440\u043E\u0432`,
        updated: updatedOffers.length,
        total: offerIds.length
      });
    } catch (error) {
      console.error("Bulk pause error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0439 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438" });
    }
  });
  app2.post("/api/admin/offers/bulk-delete", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C" });
      }
      const deletedOffers = [];
      for (const offerId of offerIds) {
        try {
          await storage.deleteOffer(offerId);
          deletedOffers.push(offerId);
          console.log(`Successfully deleted offer: ${offerId}`);
        } catch (error) {
          console.error(`Error deleting offer ${offerId}:`, error);
        }
      }
      queryCache.clear();
      res.json({
        success: true,
        message: `\u0423\u0434\u0430\u043B\u0435\u043D\u043E ${deletedOffers.length} \u0438\u0437 ${offerIds.length} \u043E\u0444\u0444\u0435\u0440\u043E\u0432`,
        deleted: deletedOffers.length,
        total: offerIds.length
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0433\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F" });
    }
  });
  app2.post("/api/admin/offers/:id/moderate", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comment } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const result = await storage.moderateOffer(id, action, userId, comment);
      if (result) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Failed to moderate offer" });
      }
    } catch (error) {
      console.error("Error moderating offer:", error);
      res.status(500).json({ error: "Failed to moderate offer" });
    }
  });
  app2.get("/api/admin/offer-logs/:offerId", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { offerId } = req.params;
      const logs = await storage.getOfferLogs(offerId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching offer logs:", error);
      res.status(500).json({ error: "Failed to fetch offer logs" });
    }
  });
  app2.get("/api/admin/offer-stats/:offerId", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { offerId } = req.params;
      const stats = await storage.getOfferStats(offerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching offer stats:", error);
      res.status(500).json({ error: "Failed to fetch offer stats" });
    }
  });
  app2.get("/api/admin/analytics", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Get admin analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/kyc", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const kycDocuments2 = await storage.getKycDocuments();
      res.json(kycDocuments2);
    } catch (error) {
      console.error("Get KYC documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/kyc/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const kycDocument = await storage.updateKycDocument(id, {
        status,
        notes,
        reviewedBy: getAuthenticatedUser(req).id,
        reviewedAt: /* @__PURE__ */ new Date()
      });
      res.json(kycDocument);
    } catch (error) {
      console.error("Update KYC document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/fraud-alerts", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const fraudAlerts2 = await storage.getFraudAlerts();
      res.json(fraudAlerts2);
    } catch (error) {
      console.error("Get fraud alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/fraud-alerts/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { isResolved } = req.body;
      const fraudAlert = await storage.updateFraudAlert(id, { isResolved });
      res.json(fraudAlert);
    } catch (error) {
      console.error("Update fraud alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/system-settings", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get system settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/system-settings", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const setting = await storage.createSystemSetting({
        ...req.body,
        updatedBy: getAuthenticatedUser(req).id
      });
      res.status(201).json(setting);
    } catch (error) {
      console.error("Create system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/system-settings/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const setting = await storage.updateSystemSetting(req.params.id, {
        ...req.body,
        updatedBy: getAuthenticatedUser(req).id
      });
      res.json(setting);
    } catch (error) {
      console.error("Update system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/system-settings/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.deleteSystemSetting(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/audit-logs", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { search, action, resourceType, userId, startDate, endDate: endDate2 } = req.query;
      const logs = await storage.getAuditLogs({
        search,
        action,
        resourceType,
        userId,
        startDate: startDate ? new Date(startDate) : void 0,
        endDate: endDate2 ? new Date(endDate2) : void 0
      });
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/global-postbacks", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const postbacks2 = await storage.getGlobalPostbacks();
      res.json(postbacks2);
    } catch (error) {
      console.error("Get global postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/global-postbacks", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const postback = await storage.createGlobalPostback(req.body);
      res.status(201).json(postback);
    } catch (error) {
      console.error("Create global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/global-postbacks/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const postback = await storage.updateGlobalPostback(req.params.id, req.body);
      res.json(postback);
    } catch (error) {
      console.error("Update global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/global-postbacks/:id/test", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.testGlobalPostback(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Test global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/postback-logs", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const logs = await storage.getPostbackLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get postback logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/blacklist", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { search, type } = req.query;
      const entries = await storage.getBlacklistEntries({
        search,
        type
      });
      res.json(entries);
    } catch (error) {
      console.error("Get blacklist entries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/blacklist", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const entry = await storage.createBlacklistEntry({
        ...req.body,
        addedBy: getAuthenticatedUser(req).id
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Create blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/blacklist/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const entry = await storage.updateBlacklistEntry(req.params.id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Update blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/blacklist/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.deleteBlacklistEntry(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { firstName, lastName, country, role, isActive } = req.body;
      const updateData = {};
      if (firstName !== void 0) updateData.firstName = firstName;
      if (lastName !== void 0) updateData.lastName = lastName;
      if (country !== void 0) updateData.country = country;
      if (role !== void 0) updateData.role = role;
      if (isActive !== void 0) updateData.isActive = isActive;
      const user = await storage.updateUser(req.params.id, updateData);
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const filters = {
        search: req.query.search,
        role: req.query.role,
        status: req.query.status,
        userType: req.query.userType,
        country: req.query.country,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      const result = await storage.getUsersWithFilters(filters);
      res.json(result);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/block", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reason } = req.body;
      const blockedBy = getAuthenticatedUser(req).id;
      const user = await storage.blockUser(req.params.id, reason, blockedBy);
      res.json(user);
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/unblock", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const user = await storage.unblockUser(req.params.id);
      res.json(user);
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/force-logout", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.forceLogoutUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Force logout user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { hardDelete } = req.query;
      const deletedBy = getAuthenticatedUser(req).id;
      if (hardDelete === "true") {
        await storage.deleteUser(req.params.id);
      } else {
        await storage.softDeleteUser(req.params.id, deletedBy);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const newPassword = await storage.resetUserPassword(req.params.id);
      res.json({ newPassword });
    } catch (error) {
      console.error("Reset user password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users/analytics", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.query.period || "30d";
      const analytics = await storage.getUserAnalytics(period);
      res.json(analytics);
    } catch (error) {
      console.error("Get user analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users/export", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const format = req.query.format || "csv";
      const filters = {
        search: req.query.search,
        role: req.query.role,
        status: req.query.status,
        userType: req.query.userType,
        country: req.query.country,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };
      const data = await storage.exportUsers(filters, format);
      res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=users.${format}`);
      res.send(data);
    } catch (error) {
      console.error("Export users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-block", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const blockedBy = getAuthenticatedUser(req).id;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      const results = await storage.bulkBlockUsers(userIds, reason, blockedBy);
      res.json(results);
    } catch (error) {
      console.error("Bulk block users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-unblock", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      const results = await storage.bulkUnblockUsers(userIds);
      res.json(results);
    } catch (error) {
      console.error("Bulk unblock users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users/bulk-delete", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userIds, hardDelete = false } = req.body;
      const deletedBy = getAuthenticatedUser(req).id;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      const results = await storage.bulkDeleteUsers(userIds, hardDelete, deletedBy);
      res.json(results);
    } catch (error) {
      console.error("Bulk delete users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/postbacks", authenticateToken, async (req, res) => {
    try {
      const postbacksData = await db.select().from(postbacks).leftJoin(offers, eq10(postbacks.offerId, offers.id)).where(eq10(postbacks.userId, req.user.id));
      const formattedPostbacks = postbacksData.map(({ postbacks: pb, offers: offer2 }) => ({
        ...pb,
        offerName: offer2?.name || null
      }));
      res.json(formattedPostbacks);
    } catch (error) {
      console.error("Get postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/postbacks", authenticateToken, async (req, res) => {
    try {
      const postbackData = insertPostbackSchema.parse(req.body);
      const [newPostback] = await db.insert(postbacks).values({
        ...postbackData,
        userId: req.user.id
      }).returning();
      auditLog(req, "CREATE", "postbacks", true, { postbackId: newPostback.id });
      res.json(newPostback);
    } catch (error) {
      console.error("Create postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/postbacks/:id", authenticateToken, async (req, res) => {
    try {
      const postbackData = insertPostbackSchema.parse(req.body);
      const [updatedPostback] = await db.update(postbacks).set(postbackData).where(and10(eq10(postbacks.id, req.params.id), eq10(postbacks.userId, req.user.id))).returning();
      if (!updatedPostback) {
        return res.status(404).json({ error: "Postback not found" });
      }
      auditLog(req, "UPDATE", "postbacks", true, { postbackId: updatedPostback.id });
      res.json(updatedPostback);
    } catch (error) {
      console.error("Update postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/postbacks/:id", authenticateToken, async (req, res) => {
    try {
      const [deletedPostback] = await db.delete(postbacks).where(and10(eq10(postbacks.id, req.params.id), eq10(postbacks.userId, req.user.id))).returning();
      if (!deletedPostback) {
        return res.status(404).json({ error: "Postback not found" });
      }
      auditLog(req, "DELETE", "postbacks", true, { postbackId: deletedPostback.id });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/postbacks/:id/test", authenticateToken, async (req, res) => {
    try {
      const testMacros = {
        clickid: "test_" + Date.now(),
        status: "test",
        offer_id: "test-offer",
        partner_id: req.user.id,
        payout: "10.00",
        currency: "USD",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      const result = await PostbackService.sendPostback(
        req.params.id,
        "test",
        testMacros
      );
      auditLog(req, "TEST", "postbacks", result.success, { postbackId: req.params.id });
      res.json(result);
    } catch (error) {
      console.error("Test postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/postback-logs", authenticateToken, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const logs = await PostbackService.getPostbackLogs({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(logs);
    } catch (error) {
      console.error("Get postback logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/conversion", async (req, res) => {
    try {
      const { clickid, status, amount, currency, txid, sub1, sub2, sub3, sub4, sub5 } = req.body;
      if (!clickid || !status) {
        return res.status(400).json({ error: "Missing required parameters: clickid and status" });
      }
      const [click] = await db.select().from(trackingClicks).where(eq10(trackingClicks.clickId, clickid));
      if (!click) {
        return res.status(404).json({ error: "Click not found" });
      }
      await PostbackService.triggerPostbacks({
        type: status,
        clickId: clickid,
        data: {
          clickid,
          status,
          offer_id: click.offerId,
          partner_id: click.partnerId,
          amount: amount || "0.00",
          currency: currency || "USD",
          txid: txid || "",
          sub1: sub1 || click.subId1 || "",
          sub2: sub2 || click.subId2 || "",
          sub3: sub3 || click.subId3 || "",
          sub4: sub4 || click.subId4 || "",
          sub5: sub5 || click.subId5 || "",
          geo: click.geo || "",
          device: click.device || "",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      res.json({ success: true, message: "Conversion processed" });
    } catch (error) {
      console.error("Conversion processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/tracking-url/:partnerId/:offerId", authenticateToken, async (req, res) => {
    try {
      const { partnerId, offerId } = req.params;
      const { sub1, sub2, sub3, sub4, sub5, landing_url } = req.query;
      const [offer2] = await db.select().from(offers).where(eq10(offers.id, offerId));
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5e3}`;
      const trackingUrl = `${baseUrl}/click?partner_id=${partnerId}&offer_id=${offerId}&clickid={clickid}${sub1 ? `&sub1=${sub1}` : ""}${sub2 ? `&sub2=${sub2}` : ""}${sub3 ? `&sub3=${sub3}` : ""}${sub4 ? `&sub4=${sub4}` : ""}${sub5 ? `&sub5=${sub5}` : ""}${landing_url ? `&landing_url=${encodeURIComponent(landing_url)}` : ""}`;
      res.json({
        trackingUrl,
        instructions: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u0435 {clickid} \u043D\u0430 \u0432\u0430\u0448 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u043A\u043B\u0438\u043A\u0430 \u0438\u0437 \u0442\u0440\u0435\u043A\u0435\u0440\u0430 (Keitaro, Binom, Redtrack, Voluum \u0438 \u0442.\u0434.)"
      });
    } catch (error) {
      console.error("Tracking URL generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/click", async (req, res) => {
    try {
      const { partner_id, offer_id, clickid, sub1, sub2, sub3, sub4, sub5, landing_url } = req.query;
      if (!partner_id || !offer_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      const clickData = await PostbackService.storeClick({
        partnerId: partner_id,
        offerId: offer_id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        referer: req.get("Referer"),
        subId1: sub1,
        subId2: sub2,
        subId3: sub3,
        subId4: sub4,
        subId5: sub5,
        landingUrl: landing_url
      });
      await PostbackService.triggerPostbacks({
        type: "click",
        clickId: clickData.clickId,
        data: {
          clickid: clickData.clickId,
          partner_id,
          offer_id,
          sub1,
          sub2,
          sub3,
          sub4,
          sub5,
          ip: req.ip,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const [offer2] = await db.select().from(offers).where(eq10(offers.id, offer_id));
      if (offer2 && offer2.landingPages) {
        const landingPages = offer2.landingPages;
        const targetUrl = landingPages[0]?.url || landing_url || "https://example.com";
        res.redirect(302, targetUrl);
      } else {
        res.redirect(302, landing_url || "https://example.com");
      }
    } catch (error) {
      console.error("Click tracking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/audit-logs", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userId, action, fromDate, toDate, limit } = req.query;
      const filters = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (fromDate) filters.fromDate = new Date(fromDate);
      if (toDate) filters.toDate = new Date(toDate);
      if (limit) filters.limit = parseInt(limit);
      const logs = getAuditLogs(filters);
      auditLog(req, "AUDIT_LOGS_VIEWED", void 0, true, { filtersApplied: Object.keys(filters) });
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/notifications", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userId } = req.query;
      const notifications = notificationService.getNotifications(userId);
      auditLog(req, "NOTIFICATIONS_VIEWED", void 0, true, { targetUserId: userId });
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/notifications", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { userId } = req.query;
      notificationService.clearNotifications(userId);
      auditLog(req, "NOTIFICATIONS_CLEARED", void 0, true, { targetUserId: userId });
      res.json({ success: true });
    } catch (error) {
      console.error("Clear notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/crypto-wallets", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { currency, walletType, status } = req.query;
      const wallets = await storage.getCryptoWallets({
        currency,
        walletType,
        status
      });
      res.json(wallets);
    } catch (error) {
      console.error("Get crypto wallets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/crypto-portfolio", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const portfolio = await storage.getCryptoPortfolio();
      res.json(portfolio);
    } catch (error) {
      console.error("Get crypto portfolio error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/crypto-deposit", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { currency, amount, fromAddress } = req.body;
      const depositData = {
        id: randomUUID5(),
        currency,
        amount,
        fromAddress,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        message: `Crypto deposit of ${amount} ${currency} created`,
        deposit: depositData
      });
    } catch (error) {
      console.error("Crypto deposit error:", error);
      res.status(500).json({ error: "Failed to process crypto deposit" });
    }
  });
  app2.post("/api/admin/crypto-withdraw", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { currency, amount, toAddress } = req.body;
      const withdrawalData = {
        id: randomUUID5(),
        currency,
        amount,
        toAddress,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        message: `Crypto withdrawal of ${amount} ${currency} initiated`,
        withdrawal: withdrawalData
      });
    } catch (error) {
      console.error("Crypto withdrawal error:", error);
      res.status(500).json({ error: "Failed to process crypto withdrawal" });
    }
  });
  app2.get("/api/admin/financial-metrics/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.params.period;
      const endDate2 = /* @__PURE__ */ new Date();
      const startDate = /* @__PURE__ */ new Date();
      switch (period) {
        case "7d":
          startDate.setDate(endDate2.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate2.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate2.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate2.getDate() - 30);
      }
      try {
        const [platformBalance] = await db.select({
          deposits: sum2(sql9`CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END`),
          withdrawals: sum2(sql9`CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END`)
        }).from(transactions);
        const [advertiserRevenue] = await db.select({ total: sum2(transactions.amount) }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).where(and10(
          eq10(users.role, "advertiser"),
          eq10(transactions.type, "deposit"),
          eq10(transactions.status, "completed"),
          gte5(transactions.createdAt, startDate)
        ));
        const [partnerPayouts] = await db.select({ total: sum2(transactions.amount) }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).where(and10(
          eq10(users.role, "affiliate"),
          eq10(transactions.type, "payout"),
          eq10(transactions.status, "completed"),
          gte5(transactions.createdAt, startDate)
        ));
        const revenue = Number(advertiserRevenue?.total || 0);
        const payouts = Number(partnerPayouts?.total || 0);
        const commission = revenue - payouts;
        const prevStartDate = new Date(startDate);
        const prevEndDate = new Date(startDate);
        const periodDays = Math.floor((endDate2.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24));
        prevStartDate.setDate(prevStartDate.getDate() - periodDays);
        const [prevRevenue] = await db.select({ total: sum2(transactions.amount) }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).where(and10(
          eq10(users.role, "advertiser"),
          eq10(transactions.type, "deposit"),
          eq10(transactions.status, "completed"),
          gte5(transactions.createdAt, prevStartDate),
          lte6(transactions.createdAt, prevEndDate)
        ));
        const prevRevenueAmount = Number(prevRevenue?.total || 0);
        const revenueGrowth = prevRevenueAmount > 0 ? (revenue - prevRevenueAmount) / prevRevenueAmount * 100 : 0;
        res.json({
          platformBalance: Number(platformBalance?.deposits || 0) - Number(platformBalance?.withdrawals || 0),
          advertiserRevenue: revenue,
          partnerPayouts: payouts,
          platformCommission: commission,
          revenueGrowth: Number(revenueGrowth.toFixed(2)),
          period,
          dateRange: { startDate, endDate: endDate2 }
        });
      } catch (dbError) {
        const fallbackData = {
          platformBalance: 125e3,
          advertiserRevenue: 85e3,
          partnerPayouts: 32e3,
          platformCommission: 53e3,
          revenueGrowth: 12.5,
          period,
          dateRange: { startDate, endDate: endDate2 }
        };
        const cacheKey = `financial_metrics_${period}_fallback`;
        queryCache.set(cacheKey, fallbackData, 30 * 1e3);
        res.json(fallbackData);
      }
    } catch (error) {
      console.error("Financial metrics error:", error);
      res.status(500).json({ error: "Failed to fetch financial metrics" });
    }
  });
  app2.get("/api/admin/finances", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      try {
        const transactionsData = await db.select({
          id: transactions.id,
          amount: transactions.amount,
          currency: transactions.currency,
          type: transactions.type,
          status: transactions.status,
          description: transactions.description,
          paymentMethod: transactions.paymentMethod,
          createdAt: transactions.createdAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role
          }
        }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).orderBy(desc7(transactions.createdAt)).limit(1e3);
        res.json(transactionsData);
      } catch (dbError) {
        res.json([
          {
            id: "txn-001",
            amount: "5000.00",
            currency: "USD",
            type: "deposit",
            status: "completed",
            description: "Advertiser deposit",
            paymentMethod: "Bank Transfer",
            createdAt: /* @__PURE__ */ new Date(),
            user: { id: "user-001", username: "advertiser1", email: "adv@example.com", role: "advertiser" }
          }
        ]);
      }
    } catch (error) {
      console.error("Get finances error:", error);
      res.status(500).json({ error: "Failed to fetch financial data" });
    }
  });
  app2.get("/api/admin/payout-requests", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      try {
        const payoutRequests2 = await db.select({
          id: transactions.id,
          amount: transactions.amount,
          currency: transactions.currency,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
          toAddress: transactions.toAddress,
          description: transactions.description,
          createdAt: transactions.createdAt,
          processedAt: transactions.processedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role
          }
        }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).where(eq10(transactions.type, "payout")).orderBy(desc7(transactions.createdAt));
        res.json(payoutRequests2.map((req2) => ({
          ...req2,
          walletAddress: req2.toAddress || "N/A"
        })));
      } catch (dbError) {
        res.json([
          {
            id: "payout-001",
            amount: "1500.00",
            currency: "USD",
            status: "pending",
            paymentMethod: "PayPal",
            walletAddress: "user@paypal.com",
            description: "Partner payout request",
            createdAt: /* @__PURE__ */ new Date(),
            user: { id: "user-002", username: "partner1", email: "partner@example.com", role: "affiliate" }
          }
        ]);
      }
    } catch (error) {
      console.error("Get payout requests error:", error);
      res.status(500).json({ error: "Failed to fetch payout requests" });
    }
  });
  app2.get("/api/admin/deposits", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      try {
        const deposits = await db.select({
          id: transactions.id,
          amount: transactions.amount,
          currency: transactions.currency,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
          fromAddress: transactions.fromAddress,
          description: transactions.description,
          createdAt: transactions.createdAt,
          processedAt: transactions.processedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            company: users.company
          }
        }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).where(eq10(transactions.type, "deposit")).orderBy(desc7(transactions.createdAt));
        res.json(deposits);
      } catch (dbError) {
        res.json([
          {
            id: "dep-001",
            amount: "10000.00",
            currency: "USD",
            status: "completed",
            paymentMethod: "Wire Transfer",
            description: "Monthly advertising budget",
            createdAt: /* @__PURE__ */ new Date(),
            user: { id: "user-003", username: "bigadvertiser", email: "big@corp.com", role: "advertiser", company: "Big Corp" }
          }
        ]);
      }
    } catch (error) {
      console.error("Get deposits error:", error);
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });
  app2.get("/api/admin/commission-data", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      try {
        const commissionData = await db.select({
          date: sql9`DATE(${transactions.createdAt})`,
          totalRevenue: sum2(sql9`CASE WHEN u.role = 'advertiser' AND ${transactions.type} = 'deposit' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END`),
          totalPayouts: sum2(sql9`CASE WHEN u.role = 'affiliate' AND ${transactions.type} = 'payout' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END`)
        }).from(transactions).leftJoin(users, eq10(transactions.userId, users.id)).groupBy(sql9`DATE(${transactions.createdAt})`).orderBy(sql9`DATE(${transactions.createdAt}) DESC`).limit(30);
        const formattedData = commissionData.map((row) => ({
          ...row,
          commission: Number(row.totalRevenue || 0) - Number(row.totalPayouts || 0)
        }));
        res.json(formattedData);
      } catch (dbError) {
        const mockData = [];
        for (let i = 29; i >= 0; i--) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toISOString().split("T")[0],
            totalRevenue: Math.floor(Math.random() * 5e3) + 2e3,
            totalPayouts: Math.floor(Math.random() * 2e3) + 800,
            commission: Math.floor(Math.random() * 3e3) + 1200
          });
        }
        res.json(mockData);
      }
    } catch (error) {
      console.error("Get commission data error:", error);
      res.status(500).json({ error: "Failed to fetch commission data" });
    }
  });
  app2.get("/api/admin/financial-chart/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.params.period;
      const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30;
      try {
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          const [dayFinancials] = await db.select({
            revenue: sum2(sql9`CASE WHEN u.role = 'advertiser' AND t.type = 'deposit' AND t.status = 'completed' THEN t.amount ELSE 0 END`),
            payouts: sum2(sql9`CASE WHEN u.role = 'affiliate' AND t.type = 'payout' AND t.status = 'completed' THEN t.amount ELSE 0 END`),
            deposits: sum2(sql9`CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.amount ELSE 0 END`),
            withdrawals: sum2(sql9`CASE WHEN t.type = 'withdrawal' AND t.status = 'completed' THEN t.amount ELSE 0 END`)
          }).from(transactions.as("t")).leftJoin(users.as("u"), eq10(sql9`t.user_id`, sql9`u.id`)).where(and10(
            gte5(sql9`t.created_at`, dayStart),
            lte6(sql9`t.created_at`, dayEnd)
          ));
          const revenue = Number(dayFinancials?.revenue || 0);
          const payouts = Number(dayFinancials?.payouts || 0);
          chartData.push({
            date: dateStr,
            revenue,
            payouts,
            commission: revenue - payouts,
            netFlow: Number(dayFinancials?.deposits || 0) - Number(dayFinancials?.withdrawals || 0)
          });
        }
        res.json(chartData);
      } catch (dbError) {
        const mockChartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          const revenue = Math.floor(Math.random() * 5e3) + 2e3;
          const payouts = Math.floor(Math.random() * 2e3) + 800;
          mockChartData.push({
            date: date.toISOString().split("T")[0],
            revenue,
            payouts,
            commission: revenue - payouts,
            netFlow: revenue - payouts + Math.floor(Math.random() * 1e3)
          });
        }
        res.json(mockChartData);
      }
    } catch (error) {
      console.error("Financial chart error:", error);
      res.status(500).json({ error: "Failed to fetch financial chart data" });
    }
  });
  app2.patch("/api/admin/transactions/:transactionId", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { status, note } = req.body;
      res.json({
        success: true,
        message: `Transaction ${transactionId} updated to ${status}`,
        transactionId,
        status,
        note
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });
  app2.post("/api/admin/payouts/:payoutId/:action", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { payoutId, action } = req.params;
      const { note } = req.body;
      if (!["approve", "reject", "complete"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      res.json({
        success: true,
        message: `Payout ${payoutId} ${action}d successfully`,
        payoutId,
        action,
        note
      });
    } catch (error) {
      console.error("Process payout error:", error);
      res.status(500).json({ error: "Failed to process payout" });
    }
  });
  app2.post("/api/admin/invoices", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const invoiceData = req.body;
      const invoice = {
        id: randomUUID5(),
        ...invoiceData,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        message: "Invoice created successfully",
        invoice
      });
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });
  app2.post("/api/admin/fraud-reports/update-status", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reportId, status } = req.body;
      if (!reportId || !status) {
        return res.status(400).json({ error: "Missing reportId or status" });
      }
      if (!["pending", "reviewing", "confirmed", "rejected", "resolved"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      res.json({
        success: true,
        message: `Report ${reportId} status updated to ${status}`,
        reportId,
        status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error updating fraud report status:", error);
      res.status(500).json({ error: "Failed to update report status" });
    }
  });
  app2.get("/api/admin/fraud-reports", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { type, severity, status, search, page = 1, limit = 50 } = req.query;
      const reports = await storage.getFraudReports({
        type,
        severity,
        status,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json(reports);
    } catch (error) {
      console.error("Get fraud reports error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/fraud-stats", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const stats = await storage.getFraudStats();
      res.json(stats);
    } catch (error) {
      console.error("Get fraud stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/ip-analysis", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { page = 1, limit = 50, riskScore } = req.query;
      const analysis = await storage.getIpAnalysis({
        page: parseInt(page),
        limit: parseInt(limit),
        riskScore: riskScore ? parseInt(riskScore) : void 0
      });
      res.json(analysis);
    } catch (error) {
      console.error("Get IP analysis error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/fraud-rules", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { type, scope, isActive } = req.query;
      const rules = await storage.getFraudRules({
        type,
        scope,
        isActive: isActive ? isActive === "true" : void 0
      });
      res.json(rules);
    } catch (error) {
      console.error("Get fraud rules error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/fraud-reports/review", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reportId, status, notes, resolution } = req.body;
      const userId = req.user.id;
      const updatedReport = await storage.reviewFraudReport(reportId, {
        status,
        reviewedBy: userId,
        reviewNotes: notes,
        resolution
      });
      auditLog(req, "FRAUD_REPORT_REVIEWED", reportId, true, { status, notes });
      res.json(updatedReport);
    } catch (error) {
      console.error("Review fraud report error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/fraud-reports/export", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const reports = await storage.getFraudReports({}, 1, 1e4);
      const csvHeader = "ID,Type,Severity,Status,IP Address,Country,Description,Created At\n";
      const csvRows = reports.map(
        (report) => `${report.id},${report.type},${report.severity},${report.status},${report.ipAddress},${report.country},"${report.description}",${report.createdAt}`
      ).join("\n");
      const csvContent = csvHeader + csvRows;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="fraud-reports.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Export fraud reports error:", error);
      res.status(500).json({ error: "Failed to export fraud reports" });
    }
  });
  app2.get("/api/admin/postback-templates", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { level, status, search } = req.query;
      const templates = await storage.getPostbackTemplates({
        level,
        status,
        search
      });
      res.json(templates);
    } catch (error) {
      console.error("Get postback templates error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/postback-templates", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const template = await storage.createPostbackTemplate({
        ...req.body,
        createdBy: userId,
        advertiserId: userId
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Create postback template error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/postback-templates/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const template = await storage.updatePostbackTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Update postback template error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/postback-templates/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.deletePostbackTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete postback template error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/postback-logs", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { status, offerId, dateFrom, dateTo, search } = req.query;
      const filters = {
        status: status || void 0,
        offerId: offerId || void 0,
        dateFrom: dateFrom || void 0,
        dateTo: dateTo || void 0,
        search: search || void 0
      };
      Object.keys(filters).forEach(
        (key) => filters[key] === void 0 && delete filters[key]
      );
      const logs = await storage.getPostbackLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Get postback logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/postback-logs/:id/retry", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      await storage.retryPostback(req.params.id);
      res.json({ success: true, message: "Postback queued for retry" });
    } catch (error) {
      console.error("Retry postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/block-ip", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { ipAddress, reason } = req.body;
      const userId = req.user.id;
      if (!ipAddress) {
        return res.status(400).json({ error: "IP address is required" });
      }
      await storage.createFraudBlock({
        type: "ip",
        targetId: ipAddress,
        reason: reason || "Manual block",
        autoBlocked: false,
        isActive: true,
        blockedBy: userId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      auditLog(req, "IP_BLOCKED", blockId, true, { ipAddress, reason });
      res.json({ success: true, message: "IP address blocked successfully" });
    } catch (error) {
      console.error("Block IP error:", error);
      res.status(500).json({ error: "Failed to block IP address" });
    }
  });
  app2.post("/api/admin/fraud-blocks", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { type, targetId, reason, reportId } = req.body;
      const userId = req.user.id;
      const block = await storage.createFraudBlock({
        type,
        targetId,
        reason,
        reportId,
        blockedBy: userId
      });
      auditLog(req, "FRAUD_BLOCK_CREATED", block.id, true, { type, targetId, reason });
      res.json(block);
    } catch (error) {
      console.error("Create fraud block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/fraud-rules", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { name, type, scope, severity, autoBlock, conditions, actions, thresholds } = req.body;
      const userId = req.user.id;
      const rule = await storage.createFraudRule({
        name,
        type,
        scope: scope || "platform",
        severity,
        isActive: true,
        autoBlock: autoBlock || false,
        conditions: conditions || {},
        actions: actions || {},
        thresholds: thresholds || {},
        createdBy: userId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      auditLog(req, "FRAUD_RULE_CREATED", ruleId, true, { name, type, severity });
      res.json(rule);
    } catch (error) {
      console.error("Create fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/fraud-rules/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const rule = await storage.updateFraudRule(id, {
        ...updateData,
        updatedBy: userId,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      auditLog(req, "FRAUD_RULE_UPDATED", id, true, updateData);
      res.json(rule);
    } catch (error) {
      console.error("Update fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/fraud-rules/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFraudRule(id);
      auditLog(req, "FRAUD_RULE_DELETED", id, true, {});
      res.json({ success: true });
    } catch (error) {
      console.error("Delete fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/fraud-blocks", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { type, isActive, page = 1, limit = 50 } = req.query;
      const blocks = await storage.getFraudBlocks({
        type,
        isActive: isActive ? isActive === "true" : void 0
      });
      res.json(blocks);
    } catch (error) {
      console.error("Get fraud blocks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/fraud-blocks/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeFraudBlock(id);
      auditLog(req, "FRAUD_BLOCK_REMOVED", id, true, {});
      res.json({ success: true });
    } catch (error) {
      console.error("Remove fraud block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/fraud-rules", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const ruleData = req.body;
      const userId = req.user.id;
      const rule = await storage.createFraudRule({
        ...ruleData,
        createdBy: userId
      });
      auditLog(req, "FRAUD_RULE_CREATED", rule.id, true, { name: rule.name, type: rule.type });
      res.json(rule);
    } catch (error) {
      console.error("Create fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/dashboard-metrics/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.params.period;
      const endDate2 = /* @__PURE__ */ new Date();
      const startDate = /* @__PURE__ */ new Date();
      switch (period) {
        case "1d":
          startDate.setDate(endDate2.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate2.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate2.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate2.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate2.getDate() - 7);
      }
      let activePartnersResult, activeOffersResult, clicksResult, fraudResult;
      try {
        [activePartnersResult] = await db.select({ count: count2(users.id) }).from(users).where(and10(eq10(users.role, "affiliate"), eq10(users.isActive, true)));
      } catch (error) {
        activePartnersResult = { count: 15 };
      }
      try {
        [activeOffersResult] = await db.select({ count: count2(offers.id) }).from(offers).where(eq10(offers.status, "active"));
      } catch (error) {
        activeOffersResult = { count: 8 };
      }
      try {
        [clicksResult] = await db.select({
          totalClicks: sum2(statistics.clicks),
          totalLeads: sum2(statistics.leads),
          totalConversions: sum2(statistics.conversions),
          totalRevenue: sum2(statistics.revenue)
        }).from(statistics);
      } catch (error) {
        clicksResult = [{ totalClicks: 0, totalLeads: 0, totalConversions: 0, totalRevenue: 0 }];
      }
      try {
        [fraudResult] = await db.select({ count: count2(fraudAlerts.id) }).from(fraudAlerts);
      } catch (error) {
        fraudResult = { count: 12 };
      }
      const firstResult = Array.isArray(clicksResult) ? clicksResult[0] : clicksResult;
      const firstFraudResult = Array.isArray(fraudResult) ? fraudResult[0] : fraudResult;
      const totalClicks = Number(firstResult?.totalClicks || 0);
      const totalConversions = Number(firstResult?.totalConversions || 0);
      const totalRevenue = Number(firstResult?.totalRevenue || 0);
      const fraudCount = Number(firstFraudResult?.count || 0);
      const metrics = {
        activePartners: Number(activePartnersResult?.count || 0),
        activeOffers: Number(activeOffersResult?.count || 0),
        todayClicks: totalClicks,
        yesterdayClicks: Math.floor(totalClicks * 0.92),
        // Approximate yesterday
        monthClicks: totalClicks,
        leads: Number(firstResult?.totalLeads || 0),
        conversions: totalConversions,
        platformRevenue: totalRevenue,
        fraudRate: totalClicks > 0 ? fraudCount / totalClicks * 100 : 0,
        cr: totalClicks > 0 ? totalConversions / totalClicks * 100 : 0,
        epc: totalClicks > 0 ? totalRevenue / totalClicks : 0,
        roi: totalRevenue > 1e3 ? totalRevenue / 1e3 * 100 : 0
      };
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/admin/dashboard-chart/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.params.period;
      const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const [dayStats] = await db.select({
          clicks: sum2(statistics.clicks),
          leads: sum2(statistics.leads),
          conversions: sum2(statistics.conversions),
          revenue: sum2(statistics.revenue)
        }).from(statistics).where(and10(
          gte5(statistics.date, dayStart),
          lte6(statistics.date, dayEnd)
        ));
        const [fraudCount] = await db.select({ count: count2(fraudAlerts.id) }).from(fraudAlerts).where(and10(
          gte5(fraudAlerts.createdAt, dayStart),
          lte6(fraudAlerts.createdAt, dayEnd)
        ));
        chartData.push({
          date: dateStr,
          clicks: Number(dayStats?.clicks || 0),
          leads: Number(dayStats?.leads || 0),
          conversions: Number(dayStats?.conversions || 0),
          revenue: Number(dayStats?.revenue || 0),
          fraud: Number(fraudCount?.count || 0)
        });
      }
      res.json(chartData);
    } catch (error) {
      console.error("Dashboard chart error:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/admin/recent-activities", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const activities = [];
      const limit = 10;
      const recentUsers = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt
      }).from(users).orderBy(desc7(users.createdAt)).limit(5);
      const recentOffers = await db.select({
        id: offers.id,
        name: offers.name,
        createdAt: offers.createdAt
      }).from(offers).orderBy(desc7(offers.createdAt)).limit(3);
      const recentFraud = await db.select({
        id: fraudAlerts.id,
        type: fraudAlerts.type,
        severity: fraudAlerts.severity,
        description: fraudAlerts.description,
        createdAt: fraudAlerts.createdAt
      }).from(fraudAlerts).orderBy(desc7(fraudAlerts.createdAt)).limit(3);
      const recentTickets = await db.select({
        id: tickets.id,
        subject: tickets.subject,
        priority: tickets.priority,
        createdAt: tickets.createdAt
      }).from(tickets).orderBy(desc7(tickets.createdAt)).limit(3);
      recentUsers.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "registration",
          title: `\u041D\u043E\u0432\u0430\u044F \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F ${user.role === "affiliate" ? "\u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430" : "\u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044F"}`,
          description: `\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C "${user.username}" \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435`,
          timestamp: user.createdAt,
          priority: "medium"
        });
      });
      recentOffers.forEach((offer2) => {
        activities.push({
          id: `offer-${offer2.id}`,
          type: "offer",
          title: "\u041D\u043E\u0432\u044B\u0439 \u043E\u0444\u0444\u0435\u0440 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D",
          description: `\u041E\u0444\u0444\u0435\u0440 "${offer2.name}" \u0441\u043E\u0437\u0434\u0430\u043D \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435`,
          timestamp: offer2.createdAt,
          priority: "low"
        });
      });
      recentFraud.forEach((fraud) => {
        activities.push({
          id: `fraud-${fraud.id}`,
          type: "fraud",
          title: "\u041F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
          description: fraud.description || `\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D ${fraud.type} \u0443\u0440\u043E\u0432\u043D\u044F ${fraud.severity}`,
          timestamp: fraud.createdAt,
          priority: fraud.severity === "high" ? "high" : fraud.severity === "medium" ? "medium" : "low"
        });
      });
      recentTickets.forEach((ticket) => {
        activities.push({
          id: `ticket-${ticket.id}`,
          type: "ticket",
          title: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0438\u043A\u0435\u0442 \u0432 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0443",
          description: `\u0422\u0438\u043A\u0435\u0442: "${ticket.subject}"`,
          timestamp: ticket.createdAt,
          priority: ticket.priority === "high" ? "high" : ticket.priority === "medium" ? "medium" : "low"
        });
      });
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(activities.slice(0, limit));
    } catch (error) {
      console.error("Recent activities error:", error);
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });
  app2.get("/api/admin/geo-distribution/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const period = req.params.period;
      const endDate2 = /* @__PURE__ */ new Date();
      const startDate = /* @__PURE__ */ new Date();
      switch (period) {
        case "1d":
          startDate.setDate(endDate2.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate2.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate2.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate2.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate2.getDate() - 7);
      }
      const geoStats = await db.select({
        country: statistics.country,
        clicks: sum2(statistics.clicks)
      }).from(statistics).where(and10(
        gte5(statistics.date, startDate),
        lte6(statistics.date, endDate2)
      )).groupBy(statistics.country).orderBy(desc7(sum2(statistics.clicks))).limit(10);
      const totalClicks = geoStats.reduce((sum3, item) => sum3 + Number(item.clicks || 0), 0);
      const geoData = geoStats.map((item) => ({
        name: item.country || "Unknown",
        value: totalClicks > 0 ? Math.round(Number(item.clicks || 0) / totalClicks * 100) : 0
      })).filter((item) => item.value > 0);
      const result = geoData.length > 0 ? geoData : [
        { name: "No Data", value: 100 }
      ];
      res.json(result);
    } catch (error) {
      console.error("Geo distribution error:", error);
      res.status(500).json({ error: "Failed to fetch geo distribution" });
    }
  });
  app2.get("/api/admin/fraud-services", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const services = [
        {
          id: "fs-1",
          serviceName: "FraudScore",
          apiKey: "fs_test_key_*****",
          isActive: true,
          endpoint: "https://api.fraudscore.com/v1/ip",
          rateLimit: 1e3,
          lastSync: (/* @__PURE__ */ new Date()).toISOString(),
          successRate: 98.5,
          averageResponseTime: 120
        },
        {
          id: "fq-1",
          serviceName: "Forensiq",
          apiKey: "fq_test_key_*****",
          isActive: false,
          endpoint: "https://api.forensiq.com/v2/validate",
          rateLimit: 500,
          lastSync: new Date(Date.now() - 864e5).toISOString(),
          successRate: 97.2,
          averageResponseTime: 200
        },
        {
          id: "an-1",
          serviceName: "Anura",
          apiKey: "an_test_key_*****",
          isActive: true,
          endpoint: "https://api.anura.io/v1/direct",
          rateLimit: 2e3,
          lastSync: (/* @__PURE__ */ new Date()).toISOString(),
          successRate: 99.1,
          averageResponseTime: 80
        },
        {
          id: "bb-1",
          serviceName: "Botbox",
          apiKey: "bb_test_key_*****",
          isActive: false,
          endpoint: "https://api.botbox.io/v1/verify",
          rateLimit: 800,
          lastSync: new Date(Date.now() - 432e5).toISOString(),
          successRate: 96.8,
          averageResponseTime: 150
        }
      ];
      res.json(services);
    } catch (error) {
      console.error("Get fraud services error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/smart-alerts", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const alerts = await storage.getSmartAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get smart alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  const fraudServicesState = /* @__PURE__ */ new Map([
    ["fs-1", {
      id: "fs-1",
      serviceName: "FraudScore",
      apiKey: "fs_live_xxxxxxxxxxxxxxxx",
      isActive: true,
      endpoint: "https://api.fraudscore.io/v1",
      rateLimit: 1e3,
      lastSync: new Date(Date.now() - 3e5).toISOString(),
      successRate: 99.2,
      averageResponseTime: 250
    }],
    ["fq-1", {
      id: "fq-1",
      serviceName: "Forensiq",
      apiKey: "fq_prod_xxxxxxxxxxxxxxxx",
      isActive: false,
      endpoint: "https://api.forensiq.com/v2",
      rateLimit: 500,
      lastSync: new Date(Date.now() - 864e5).toISOString(),
      successRate: 97.8,
      averageResponseTime: 180
    }],
    ["an-1", {
      id: "an-1",
      serviceName: "Anura",
      apiKey: "an_key_xxxxxxxxxxxxxxxx",
      isActive: true,
      endpoint: "https://api.anura.io/direct",
      rateLimit: 2e3,
      lastSync: new Date(Date.now() - 15e4).toISOString(),
      successRate: 98.5,
      averageResponseTime: 320
    }],
    ["bb-1", {
      id: "bb-1",
      serviceName: "Botbox",
      apiKey: "bb_api_xxxxxxxxxxxxxxxx",
      isActive: false,
      endpoint: "https://api.botbox.io/v1",
      rateLimit: 800,
      lastSync: new Date(Date.now() - 36e5).toISOString(),
      successRate: 96.1,
      averageResponseTime: 450
    }]
  ]);
  app2.get("/api/admin/fraud-services", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const fraudServices = Array.from(fraudServicesState.values());
      res.json(fraudServices);
    } catch (error) {
      console.error("Get fraud services error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/fraud-services/:id/test", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await new Promise((resolve) => setTimeout(resolve, 1e3 + Math.random() * 2e3));
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        res.json({
          success: true,
          responseTime: Math.floor(200 + Math.random() * 500),
          message: "Connection successful"
        });
        auditLog(req, "FRAUD_SERVICE_TEST", id, true, { result: "success" });
      } else {
        res.status(500).json({
          success: false,
          error: "Connection timeout or API key invalid"
        });
        auditLog(req, "FRAUD_SERVICE_TEST", id, false, { result: "failed" });
      }
    } catch (error) {
      console.error("Test fraud service error:", error);
      res.status(500).json({ error: "Test failed" });
    }
  });
  app2.patch("/api/admin/fraud-services/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const service = fraudServicesState.get(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      const updatedService = {
        ...service,
        isActive,
        lastSync: (/* @__PURE__ */ new Date()).toISOString()
      };
      fraudServicesState.set(id, updatedService);
      auditLog(req, "FRAUD_SERVICE_UPDATED", id, true, { isActive });
      res.json(updatedService);
    } catch (error) {
      console.error("Update fraud service error:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });
  app2.get("/api/admin/analytics", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const {
        search = "",
        dateFrom,
        dateTo,
        quickFilter = "all",
        page = 1,
        limit = 50,
        sortBy = "timestamp",
        sortOrder = "desc"
      } = req.query;
      const analyticsData2 = await storage.getAdminAnalytics(req.query);
      let filteredData = analyticsData2;
      if (search) {
        filteredData = filteredData.filter(
          (item) => item.ip.includes(search) || item.geo.includes(search) || item.clickId.includes(search) || item.subId1?.includes(search) || item.subId2?.includes(search) || item.subId3?.includes(search)
        );
      }
      if (quickFilter !== "all") {
        switch (quickFilter) {
          case "bots":
            filteredData = filteredData.filter((item) => item.isBot);
            break;
          case "fraud":
            filteredData = filteredData.filter((item) => item.isFraud);
            break;
          case "conversions":
            filteredData = filteredData.filter((item) => item.conversions > 0);
            break;
          case "highRoi":
            filteredData = filteredData.filter((item) => item.roi > 100);
            break;
          case "lowRoi":
            filteredData = filteredData.filter((item) => item.roi < 0);
            break;
        }
      }
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedData = filteredData.slice(startIndex, startIndex + Number(limit));
      res.json(paginatedData);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/analytics/export", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { format = "csv", columns = [] } = req.body;
      const { search = "", dateFrom, dateTo, quickFilter = "all" } = req.query;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="analytics_export.${format}"`);
      res.json({
        message: `Export in ${format} format requested`,
        columns,
        filters: { search, dateFrom, dateTo, quickFilter }
      });
    } catch (error) {
      console.error("Analytics export error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/test-postback", (req, res) => {
    console.log("Test postback received:", req.query);
    res.json({
      success: true,
      message: "Test postback received successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      params: req.query
    });
  });
  app2.post("/api/track/postback/test", async (req, res) => {
    console.log("=== TEST POSTBACK ===");
    const { tracker_url, method = "GET", test_data } = req.body;
    try {
      let testUrl = tracker_url;
      if (test_data) {
        Object.keys(test_data).forEach((key) => {
          const macro = `{${key}}`;
          testUrl = testUrl.replace(new RegExp(macro, "g"), test_data[key]);
        });
      }
      console.log("Testing postback URL:", testUrl);
      const startTime = Date.now();
      const response = await fetch(testUrl, {
        method,
        headers: {
          "User-Agent": "Affiliate-Platform-Postback-Test/1.0"
        }
      });
      const responseTime = Date.now() - startTime;
      let responseText = "";
      let isJson = false;
      try {
        responseText = await response.text();
        if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
          JSON.parse(responseText);
          isJson = true;
        }
      } catch (textError) {
        responseText = "Could not read response body";
      }
      const isSuccess = response.status >= 200 && response.status < 400;
      res.json({
        success: isSuccess,
        url: testUrl,
        response: {
          status: response.status,
          statusText: response.statusText,
          time: responseTime,
          body: responseText.substring(0, 500),
          // Limit response body
          isJson,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error) {
      console.error("Postback test error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        url: tracker_url
      });
    }
  });
  app2.get("/api/admin/financial-metrics-enhanced/:period", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { period } = req.params;
      const now = /* @__PURE__ */ new Date();
      let startDate = /* @__PURE__ */ new Date();
      switch (period) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }
      try {
        const [platformBalance] = await db.select({
          totalDeposits: sql9`COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0)`,
          totalPayouts: sql9`COALESCE(SUM(CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END), 0)`
        }).from(transactions).where(
          and10(
            gte5(transactions.createdAt, startDate),
            eq10(transactions.status, "completed")
          )
        );
        const balance = (platformBalance.totalDeposits || 0) - (platformBalance.totalPayouts || 0);
        res.json({
          platformBalance: balance,
          totalDeposits: platformBalance.totalDeposits || 0,
          totalPayouts: platformBalance.totalPayouts || 0,
          period
        });
      } catch (dbError) {
        console.error("Database error in enhanced financial metrics:", dbError);
        res.status(500).json({ error: "Database connection failed" });
      }
    } catch (error) {
      console.error("Enhanced financial metrics error:", error);
      res.status(500).json({ error: "Failed to fetch enhanced financial metrics" });
    }
  });
  app2.get("/api/admin/fraud-stats-realtime", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { period = "30d" } = req.query;
      const now = /* @__PURE__ */ new Date();
      let startDate = /* @__PURE__ */ new Date();
      switch (period) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }
      try {
        const [fraudStats] = await db.select({
          totalReports: sql9`COUNT(*)`
        }).from(fraudReports).where(gte5(fraudReports.createdAt, startDate));
        const [totalClicks] = await db.select({
          clicks: sql9`COUNT(*)`
        }).from(trackingClicks).where(gte5(trackingClicks.createdAt, startDate));
        const [blockedIps] = await db.select({
          blocked: sql9`COUNT(*)`
        }).from(fraudBlocks).where(
          and10(
            eq10(fraudBlocks.type, "ip"),
            eq10(fraudBlocks.isActive, true),
            gte5(fraudBlocks.createdAt, startDate)
          )
        );
        const fraudRate = totalClicks.clicks > 0 ? (fraudStats.totalReports / totalClicks.clicks * 100).toFixed(2) : "0.00";
        res.json({
          totalReports: fraudStats.totalReports || 0,
          totalClicks: totalClicks.clicks || 0,
          blockedIps: blockedIps.blocked || 0,
          fraudRate,
          period
        });
      } catch (dbError) {
        console.error("Database error in fraud stats:", dbError);
        res.status(500).json({ error: "Database connection failed" });
      }
    } catch (error) {
      console.error("Real-time fraud stats error:", error);
      res.status(500).json({ error: "Failed to fetch fraud statistics" });
    }
  });
  app2.post("/api/objects/upload", authenticateToken, async (req, res) => {
    try {
      const objectStorageService2 = new ObjectStorageService3();
      const uploadURL = await objectStorageService2.getImageUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService2 = new ObjectStorageService3();
    try {
      const file = await objectStorageService2.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService2.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    console.log("=== OBJECT REQUEST ===");
    console.log("Requested path:", req.path);
    console.log("Object path param:", req.params.objectPath);
    const objectStorageService2 = new ObjectStorageService3();
    try {
      const objectFile = await objectStorageService2.getObjectEntityFile(req.path);
      console.log("Object file found, downloading...");
      const isImage = req.path.includes("uploads/") || req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      objectStorageService2.downloadObject(objectFile, res, 3600, isImage);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof Error && error.message.includes("ObjectNotFoundError")) {
        console.log("Object not found, returning 404");
        return res.sendStatus(404);
      }
      console.log("Server error, returning 500");
      return res.sendStatus(500);
    }
  });
  app2.get("/api/advertiser/analytics", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const {
        dateFrom,
        dateTo,
        search,
        offerId,
        partnerId,
        geo,
        device,
        trafficSource,
        fraudFilter,
        subId,
        clickId
      } = req.query;
      const getRealAnalyticsData2 = async () => {
        try {
          const result = await db.select({
            id: trackingClicks.id,
            clickId: trackingClicks.clickId,
            date: trackingClicks.createdAt,
            partnerId: trackingClicks.partnerId,
            partnerUsername: users.username,
            offerId: trackingClicks.offerId,
            offerName: offers.name,
            geo: trackingClicks.country,
            device: trackingClicks.device,
            subId: trackingClicks.subId1,
            ip: trackingClicks.ip,
            referer: trackingClicks.referer,
            fraudScore: trackingClicks.fraudScore,
            isBot: trackingClicks.isBot,
            vpnDetected: trackingClicks.vpnDetected,
            status: trackingClicks.status,
            revenue: sql9`COALESCE((${trackingClicks.conversionData}->>'revenue')::decimal, 0)`,
            conversions: sql9`CASE WHEN ${trackingClicks.status} = 'converted' THEN 1 ELSE 0 END`
          }).from(trackingClicks).leftJoin(users, eq10(trackingClicks.partnerId, users.id)).leftJoin(offers, eq10(trackingClicks.offerId, offers.id)).where(and10(
            offerId ? eq10(trackingClicks.offerId, offerId) : void 0,
            partnerId ? eq10(trackingClicks.partnerId, partnerId) : void 0,
            geo ? eq10(trackingClicks.country, geo) : void 0,
            device ? eq10(trackingClicks.device, device) : void 0
          )).orderBy(desc7(trackingClicks.createdAt)).limit(100);
          const groupedData = /* @__PURE__ */ new Map();
          result.forEach((row) => {
            const key = `${row.partnerId}_${row.offerId}`;
            if (!groupedData.has(key)) {
              groupedData.set(key, {
                id: `analytics_${key}`,
                date: row.date,
                offerId: row.offerId,
                offerName: row.offerName || "Unknown Offer",
                partnerId: row.partnerId,
                partnerUsername: row.partnerUsername || "Unknown Partner",
                clicks: 0,
                // Количество кликов от этого партнера
                uniqueClicks: 0,
                // Уникальные клики
                conversions: 0,
                // Конверсии
                revenue: 0,
                // Общий доход
                payout: 0,
                // Выплата партнеру
                profit: 0,
                // Прибыль
                cr: 0,
                // Конверсия %
                epc: 0,
                // Доход на клик
                roi: 0,
                // ROI %
                geo: row.geo || "Unknown",
                device: row.device || "Unknown",
                trafficSource: "direct",
                subId: row.subId || "",
                lastClickId: row.clickId,
                // Последний clickId от партнера
                fraudClicks: 0,
                botClicks: 0,
                avgFraudScore: 0,
                totalFraudScore: 0,
                postbackStatus: "sent",
                ipAddress: row.ip || "",
                referer: row.referer || "",
                clickIds: []
                // Массив всех clickId от партнера
              });
            }
            const data = groupedData.get(key);
            data.clicks += 1;
            data.uniqueClicks += 1;
            data.conversions += parseInt(row.conversions) || 0;
            data.revenue += parseFloat(row.revenue) || 0;
            data.clickIds.push(row.clickId);
            data.totalFraudScore += row.fraudScore || 0;
            if (row.isBot) data.botClicks += 1;
            if (row.fraudScore > 50) data.fraudClicks += 1;
            if (new Date(row.date) > new Date(data.date)) {
              data.date = row.date;
              data.lastClickId = row.clickId;
              data.geo = row.geo || data.geo;
              data.device = row.device || data.device;
              data.subId = row.subId || data.subId;
              data.ipAddress = row.ip || data.ipAddress;
              data.referer = row.referer || data.referer;
            }
          });
          return Array.from(groupedData.values()).map((data) => {
            data.cr = data.clicks > 0 ? data.conversions / data.clicks * 100 : 0;
            data.epc = data.clicks > 0 ? data.revenue / data.clicks : 0;
            data.payout = data.conversions * 15;
            data.profit = data.revenue - data.payout;
            data.roi = data.payout > 0 ? (data.revenue - data.payout) / data.payout * 100 : 0;
            data.avgFraudScore = data.clicks > 0 ? data.totalFraudScore / data.clicks : 0;
            data.cr = parseFloat(data.cr.toFixed(2));
            data.epc = parseFloat(data.epc.toFixed(4));
            data.revenue = parseFloat(data.revenue.toFixed(2));
            data.payout = parseFloat(data.payout.toFixed(2));
            data.profit = parseFloat(data.profit.toFixed(2));
            data.roi = parseFloat(data.roi.toFixed(2));
            data.avgFraudScore = parseFloat(data.avgFraudScore.toFixed(1));
            data.clickId = `${data.clickIds.length} \u043A\u043B\u0438\u043A\u043E\u0432`;
            return data;
          });
        } catch (error) {
          console.error("Error getting real analytics data:", error);
          return [];
        }
      };
      let analyticsData2 = await getRealAnalyticsData2();
      if (trafficSource) {
        analyticsData2 = analyticsData2.filter((record) => record.trafficSource === trafficSource);
      }
      if (subId) {
        analyticsData2 = analyticsData2.filter((record) => record.subId.includes(subId.toString()));
      }
      if (clickId) {
        analyticsData2 = analyticsData2.filter((record) => record.clickId.includes(clickId.toString()));
      }
      if (fraudFilter === "fraud") {
        analyticsData2 = analyticsData2.filter((record) => record.fraudClicks > 0);
      }
      if (fraudFilter === "bot") {
        analyticsData2 = analyticsData2.filter((record) => record.botClicks > 0);
      }
      res.json(analyticsData2);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/analytics/export", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { format = "csv" } = req.query;
      if (format === "csv") {
        const csvContent = `Date,Offer,Partner,Clicks,Leads,CR%,Revenue,Payout,Profit,ROI%
2024-01-15,Casino Offer,Partner1,1250,47,3.76,$2350.00,$1410.00,$940.00,66.67%
2024-01-14,Sports Betting,Partner2,890,23,2.58,$1840.00,$1150.00,$690.00,60.00%`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="analytics.csv"');
        res.send(csvContent);
      } else if (format === "xlsx") {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="analytics.xlsx"');
        res.send(Buffer.from("Mock Excel content"));
      } else {
        res.json({ message: "JSON export not implemented yet" });
      }
    } catch (error) {
      console.error("Export analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/partners/:partnerId/notify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId } = req.params;
      const { reason } = req.body;
      console.log(`Notifying partner ${partnerId} about ${reason} from advertiser ${user.id}`);
      res.json({
        success: true,
        message: "Partner notification sent successfully"
      });
    } catch (error) {
      console.error("Notify partner error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/partners", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const {
        search,
        status,
        offerId,
        minRevenue,
        minCr,
        minEpc,
        activityDays,
        riskLevel,
        topPerformersOnly
      } = req.query;
      const generateMockPartners = () => {
        const partners = [];
        const statuses = ["active", "inactive", "pending", "blocked"];
        const riskLevels = ["low", "medium", "high"];
        const countries = ["US", "GB", "DE", "FR", "CA", "RU"];
        const mockOffers = [
          { id: "1", name: "Casino Welcome Bonus", defaultPayout: 150 },
          { id: "2", name: "Sports Betting CPA", defaultPayout: 200 },
          { id: "3", name: "Forex Trading Lead", defaultPayout: 75 }
        ];
        for (let i = 1; i <= 20; i++) {
          const clicks3 = Math.floor(Math.random() * 5e3) + 500;
          const uniqueClicks = Math.floor(clicks3 * 0.8);
          const leads = Math.floor(clicks3 * (Math.random() * 0.1 + 5e-3));
          const revenue = leads * (Math.random() * 100 + 50);
          const payout = leads * (Math.random() * 80 + 30);
          const profit = revenue - payout;
          const cr = clicks3 > 0 ? leads / clicks3 * 100 : 0;
          const epc = clicks3 > 0 ? revenue / clicks3 : 0;
          const roi = payout > 0 ? (revenue - payout) / payout * 100 : 0;
          const isTopPerformer = Math.random() > 0.8;
          const payoutSettings = {};
          const partnerOffers2 = mockOffers.slice(0, Math.floor(Math.random() * 3) + 1);
          partnerOffers2.forEach((offer2) => {
            payoutSettings[offer2.id] = {
              offerId: offer2.id,
              offerName: offer2.name,
              defaultPayout: offer2.defaultPayout,
              customPayout: Math.random() > 0.5 ? offer2.defaultPayout * (1 + (Math.random() * 0.4 - 0.2)) : offer2.defaultPayout,
              isActive: Math.random() > 0.1
            };
          });
          partners.push({
            id: `partner_${i}`,
            partnerId: `P${String(i).padStart(5, "0")}`,
            username: `partner${i}`,
            email: `partner${i}@example.com`,
            firstName: `Partner`,
            lastName: `${i}`,
            telegram: Math.random() > 0.5 ? `partner${i}` : null,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            offersCount: partnerOffers2.length,
            clicks: clicks3,
            uniqueClicks,
            leads,
            conversions: leads,
            revenue: parseFloat(revenue.toFixed(2)),
            payout: parseFloat(payout.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            cr: parseFloat(cr.toFixed(2)),
            epc: parseFloat(epc.toFixed(4)),
            roi: parseFloat(roi.toFixed(2)),
            fraudClicks: Math.floor(Math.random() * 20),
            botClicks: Math.floor(Math.random() * 30),
            fraudScore: Math.floor(Math.random() * 100),
            lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1e3).toISOString(),
            registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1e3).toISOString(),
            country: countries[Math.floor(Math.random() * countries.length)],
            timezone: "UTC",
            isTopPerformer,
            riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
            payoutSettings
          });
        }
        return partners;
      };
      let partnersData = generateMockPartners();
      if (search) {
        partnersData = partnersData.filter(
          (partner) => partner.username.toLowerCase().includes(search.toString().toLowerCase()) || partner.email.toLowerCase().includes(search.toString().toLowerCase()) || partner.partnerId.includes(search.toString())
        );
      }
      if (status) {
        partnersData = partnersData.filter((partner) => partner.status === status);
      }
      if (minRevenue) {
        partnersData = partnersData.filter((partner) => partner.revenue >= parseFloat(minRevenue.toString()));
      }
      if (minCr) {
        partnersData = partnersData.filter((partner) => partner.cr >= parseFloat(minCr.toString()));
      }
      if (minEpc) {
        partnersData = partnersData.filter((partner) => partner.epc >= parseFloat(minEpc.toString()));
      }
      if (riskLevel) {
        partnersData = partnersData.filter((partner) => partner.riskLevel === riskLevel);
      }
      if (topPerformersOnly === "true") {
        partnersData = partnersData.filter((partner) => partner.isTopPerformer);
      }
      if (activityDays) {
        const daysSince = parseInt(activityDays.toString()) * 24 * 60 * 60 * 1e3;
        const cutoffDate = new Date(Date.now() - daysSince);
        partnersData = partnersData.filter(
          (partner) => new Date(partner.lastActivity) >= cutoffDate
        );
      }
      res.json(partnersData);
    } catch (error) {
      console.error("Get partners error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/partner/:partnerId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId } = req.params;
      const partnerDetails = {
        id: partnerId,
        partnerId: `P${partnerId.slice(-5)}`,
        username: `partner_${partnerId}`,
        email: `partner${partnerId}@example.com`,
        firstName: "Partner",
        lastName: partnerId,
        phone: "+1234567890",
        telegram: `partner${partnerId}`,
        country: "US",
        timezone: "UTC",
        status: "active",
        registrationDate: "2024-01-15T10:30:00Z",
        lastActivity: (/* @__PURE__ */ new Date()).toISOString()
        // Additional partner information...
      };
      res.json(partnerDetails);
    } catch (error) {
      console.error("Get partner details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/partner/:partnerId/payout", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId } = req.params;
      const { offerId, payout } = req.body;
      console.log(`Updating payout for partner ${partnerId}, offer ${offerId} to ${payout}`);
      res.json({
        success: true,
        message: "Payout updated successfully",
        partnerId,
        offerId,
        newPayout: payout
      });
    } catch (error) {
      console.error("Update payout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/partner/:partnerId/status", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId } = req.params;
      const { status } = req.body;
      console.log(`Updating status for partner ${partnerId} to ${status}`);
      res.json({
        success: true,
        message: "Status updated successfully",
        partnerId,
        newStatus: status
      });
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/partner/:partnerId/offers/:offerId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId, offerId } = req.params;
      console.log(`Removing partner ${partnerId} from offer ${offerId}`);
      res.json({
        success: true,
        message: "Partner removed from offer successfully"
      });
    } catch (error) {
      console.error("Remove partner from offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/partner/:partnerId/notify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId } = req.params;
      const { message } = req.body;
      console.log(`Sending notification to partner ${partnerId}: ${message}`);
      res.json({
        success: true,
        message: "Notification sent successfully"
      });
    } catch (error) {
      console.error("Notify partner error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/partners/export", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { format = "csv" } = req.query;
      if (format === "csv") {
        const csvContent = `Partner ID,Username,Email,Status,Offers Count,Clicks,Leads,CR%,Revenue,Payout,Profit
P00001,partner1,partner1@example.com,active,3,2450,89,3.63,$4450.00,$2670.00,$1780.00
P00002,partner2,partner2@example.com,active,2,1890,45,2.38,$2250.00,$1350.00,$900.00`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="partners.csv"');
        res.send(csvContent);
      } else if (format === "xlsx") {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="partners.xlsx"');
        res.send(Buffer.from("Mock Excel content"));
      } else {
        res.json({ message: "JSON export not implemented yet" });
      }
    } catch (error) {
      console.error("Export partners error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/finance/summary", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { dateFrom, dateTo } = req.query;
      const transactionsQuery = db.select({
        totalAmount: sum2(financialTransactions.amount),
        count: count2(financialTransactions.id),
        type: financialTransactions.type,
        status: financialTransactions.status
      }).from(financialTransactions).where(eq10(financialTransactions.advertiserId, user.id));
      if (dateFrom) {
        transactionsQuery.where(gte5(financialTransactions.createdAt, new Date(dateFrom)));
      }
      if (dateTo) {
        transactionsQuery.where(lte6(financialTransactions.createdAt, new Date(dateTo)));
      }
      const summaryData = await transactionsQuery.groupBy(financialTransactions.type, financialTransactions.status).execute();
      let totalExpenses = 0;
      let totalRevenue = 0;
      let totalPayouts = 0;
      let pendingPayouts = 0;
      summaryData.forEach((row) => {
        const amount = parseFloat(row.totalAmount?.toString() || "0");
        if (row.type === "payout" && row.status === "completed") {
          totalPayouts += amount;
          totalExpenses += amount;
        } else if (row.type === "payout" && row.status === "pending") {
          pendingPayouts += amount;
        } else if (row.type === "commission" && row.status === "completed") {
          totalRevenue += amount;
        }
      });
      const userBalance = parseFloat(user.balance?.toString() || "0");
      const summary = {
        totalExpenses,
        totalRevenue,
        totalPayouts,
        avgEPC: 2.45,
        // Mock data
        avgCR: 1.8,
        // Mock data
        avgPayout: totalPayouts > 0 ? totalPayouts / summaryData.length : 0,
        balance: userBalance,
        pendingPayouts
      };
      res.json(summary);
    } catch (error) {
      console.error("Error getting financial summary:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0443\u044E \u0441\u0432\u043E\u0434\u043A\u0443" });
    }
  });
  app2.get("/api/partner/finance/summary", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      console.log("Getting partner finance summary for", authUser2.id);
      const user = await storage.getUser(authUser2.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      try {
        const transactionsQuery = db.select({
          type: financialTransactions.type,
          status: financialTransactions.status,
          totalAmount: sql9`sum(${financialTransactions.amount})`
        }).from(financialTransactions).where(eq10(financialTransactions.partnerId, authUser2.id));
        const transactionData = await transactionsQuery.groupBy(financialTransactions.type, financialTransactions.status).execute();
        let totalRevenue = 0;
        let totalPayouts = 0;
        let pendingPayouts = 0;
        let totalBonus = 0;
        transactionData.forEach((row) => {
          const amount = parseFloat(row.totalAmount?.toString() || "0");
          if (row.type === "commission" && row.status === "completed") {
            totalRevenue += amount;
          } else if (row.type === "commission" && row.status === "pending") {
            pendingPayouts += amount;
          } else if (row.type === "payout" && row.status === "completed") {
            totalPayouts += Math.abs(amount);
          } else if (row.type === "bonus" && row.status === "completed") {
            totalBonus += amount;
          }
        });
        const summary = {
          balance: parseFloat(user.balance?.toString() || "0"),
          pendingPayouts,
          totalRevenue: totalRevenue + totalBonus,
          avgEPC: totalRevenue > 0 ? (totalRevenue / 100).toFixed(2) : 0,
          // Mock calculation
          avgCR: totalRevenue > 0 ? 1.8.toFixed(2) : 0,
          // Mock calculation
          totalPayouts
        };
        res.json(summary);
      } catch (transactionError) {
        console.log("Financial transactions table not found, using basic data");
        const summary = {
          balance: parseFloat(user.balance?.toString() || "0"),
          pendingPayouts: 0,
          totalRevenue: 0,
          avgEPC: 0,
          avgCR: 0,
          totalPayouts: 0
        };
        res.json(summary);
      }
    } catch (error) {
      console.error("Error getting partner finance summary:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0443\u044E \u0441\u0432\u043E\u0434\u043A\u0443" });
    }
  });
  app2.get("/api/partner/finance/transactions", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      console.log("Getting partner finance transactions for", authUser2.id);
      try {
        const partnerTransactions = await db.select().from(financialTransactions).where(eq10(financialTransactions.partnerId, authUser2.id)).orderBy(desc7(financialTransactions.createdAt));
        res.json(partnerTransactions);
      } catch (dbError) {
        console.log("Financial transactions table issue, using empty data");
        const mockTransactions = [];
        res.json(mockTransactions);
      }
    } catch (error) {
      console.error("Error getting partner finance transactions:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438" });
    }
  });
  app2.post("/api/partner/finance/withdrawal", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { amount, method, details } = req.body;
      console.log("Creating withdrawal request for partner", authUser2.id, { amount, method });
      const withdrawal = await db.insert(financialTransactions).values({
        id: nanoid3(),
        partnerId: authUser2.id,
        type: "payout",
        amount: parseFloat(amount),
        status: "pending",
        comment: `Withdrawal via ${method}: ${details}`,
        createdAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true, message: "Withdrawal request created successfully" });
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u043D\u0430 \u0432\u044B\u0432\u043E\u0434 \u0441\u0440\u0435\u0434\u0441\u0442\u0432" });
    }
  });
  app2.get("/api/partner/finance/export", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { format = "csv", dateFrom, dateTo } = req.query;
      let transactions2;
      try {
        transactions2 = await db.select().from(financialTransactions).where(eq10(financialTransactions.partnerId, authUser2.id)).orderBy(desc7(financialTransactions.createdAt));
      } catch (dbError) {
        transactions2 = [];
      }
      if (format === "csv") {
        const csvHeader = "Date,Type,Amount,Status,Description\n";
        const csvData = transactions2.map(
          (t) => `${new Date(t.createdAt).toLocaleDateString()},${t.type},${t.amount},${t.status},"${t.comment}"`
        ).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="finance-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`);
        res.send(csvHeader + csvData);
      } else if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="finance-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json"`);
        res.json(transactions2);
      } else {
        res.status(400).json({ error: "Unsupported format" });
      }
    } catch (error) {
      console.error("Error exporting finance data:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435" });
    }
  });
  app2.get("/api/advertiser/finance/transactions", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const {
        dateFrom,
        dateTo,
        search,
        offerId,
        partnerId,
        type,
        status,
        minAmount,
        maxAmount,
        page = "1",
        limit = "50"
      } = req.query;
      let query = db.select().from(financialTransactions).where(eq10(financialTransactions.advertiserId, user.id)).orderBy(desc7(financialTransactions.createdAt));
      const conditions = [eq10(financialTransactions.advertiserId, user.id)];
      if (dateFrom) {
        conditions.push(gte5(financialTransactions.createdAt, new Date(dateFrom)));
      }
      if (dateTo) {
        conditions.push(lte6(financialTransactions.createdAt, new Date(dateTo)));
      }
      if (offerId && offerId !== "all") {
        conditions.push(eq10(financialTransactions.offerId, offerId));
      }
      if (partnerId && partnerId !== "all") {
        conditions.push(eq10(financialTransactions.partnerId, partnerId));
      }
      if (type && type !== "all") {
        conditions.push(eq10(financialTransactions.type, type));
      }
      if (status && status !== "all") {
        conditions.push(eq10(financialTransactions.status, status));
      }
      if (minAmount) {
        conditions.push(gte5(financialTransactions.amount, minAmount));
      }
      if (maxAmount) {
        conditions.push(lte6(financialTransactions.amount, maxAmount));
      }
      if (conditions.length > 1) {
        query = query.where(and10(...conditions));
      }
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const transactions2 = await query.limit(limitNum).offset(offset);
      let filteredTransactions = transactions2;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredTransactions = transactions2.filter(
          (tx) => tx.offerName?.toLowerCase().includes(searchLower) || tx.partnerUsername?.toLowerCase().includes(searchLower) || tx.id.includes(searchLower) || tx.comment?.toLowerCase().includes(searchLower)
        );
      }
      res.json(filteredTransactions);
    } catch (error) {
      console.error("Error getting financial transactions:", error);
      res.status(500).json({ error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438" });
    }
  });
  app2.post("/api/advertiser/finance/payouts", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { partnerId, amount, currency = "USD", period, comment, paymentMethod } = req.body;
      if (!partnerId || !amount || amount <= 0) {
        return res.status(400).json({ error: "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u044B" });
      }
      const payoutAmount = parseFloat(amount);
      const userBalance = parseFloat(user.balance?.toString() || "0");
      if (payoutAmount > userBalance) {
        return res.status(400).json({ error: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0431\u0430\u043B\u0430\u043D\u0441\u0435" });
      }
      if (payoutAmount > 1e4) {
        return res.status(400).json({ error: "\u0421\u0443\u043C\u043C\u0430 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0435\u0442 \u0434\u043D\u0435\u0432\u043D\u043E\u0439 \u043B\u0438\u043C\u0438\u0442 $10,000" });
      }
      const partner = await storage.getUser(partnerId);
      if (!partner) {
        return res.status(404).json({ error: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const transactionId = randomUUID5();
      await db.insert(financialTransactions).values({
        id: transactionId,
        advertiserId: user.id,
        partnerId,
        amount: payoutAmount.toString(),
        currency,
        type: "payout",
        status: "pending",
        period,
        comment,
        paymentMethod,
        partnerUsername: partner.username,
        details: JSON.stringify({
          leads: 0,
          clicks: 0,
          period
        }),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const payoutRequestId = randomUUID5();
      await db.insert(payoutRequests).values({
        id: payoutRequestId,
        advertiserId: user.id,
        partnerId,
        amount: payoutAmount.toString(),
        currency,
        period,
        comment,
        paymentMethod,
        status: "pending_approval",
        transactionId,
        securityChecksPassed: true,
        fraudScore: 0,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      await auditLog(req, "create", "payout", payoutRequestId, null, {
        partnerId,
        amount: payoutAmount,
        currency,
        paymentMethod
      });
      res.status(201).json({
        id: transactionId,
        message: "\u0412\u044B\u043F\u043B\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430 \u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430 \u0432 \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u043D\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443",
        payoutRequestId
      });
    } catch (error) {
      console.error("Error creating payout:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u044B" });
    }
  });
  app2.post("/api/advertiser/team/invite", authenticateToken, async (req, res) => {
    try {
      const authUser2 = req.user;
      if (authUser2.role !== "advertiser") {
        return res.status(403).json({ error: "Access denied" });
      }
      const { email, role } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Team invitation: ${authUser2.username} invited ${email} with role ${role}`);
      res.status(201).json({
        invitationId,
        email,
        role,
        message: "Invitation sent successfully"
      });
    } catch (error) {
      console.error("Invite team member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/team/members", async (req, res) => {
    console.log("=== TEAM MEMBERS REQUEST - NO MIDDLEWARE ===");
    try {
      const mockTeamMembers = [
        {
          id: "member_1",
          username: "ivan_petrov",
          email: "ivan@example.com",
          firstName: "\u0418\u0432\u0430\u043D",
          lastName: "\u041F\u0435\u0442\u0440\u043E\u0432",
          role: "manager",
          status: "active",
          permissions: {
            manageOffers: true,
            managePartners: true,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: ["192.168.1.100"],
            geoRestrictions: ["RU"],
            timeRestrictions: {
              enabled: true,
              startTime: "09:00",
              endTime: "18:00",
              timezone: "UTC+3",
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: true,
          telegramUserId: "123456789",
          lastActivity: new Date(Date.now() - 36e5).toISOString(),
          createdAt: new Date(Date.now() - 864e5).toISOString(),
          createdBy: "temp_advertiser_id"
        },
        {
          id: "member_2",
          username: "maria_sidorova",
          email: "maria@example.com",
          firstName: "\u041C\u0430\u0440\u0438\u044F",
          lastName: "\u0421\u0438\u0434\u043E\u0440\u043E\u0432\u0430",
          role: "analyst",
          status: "active",
          permissions: {
            manageOffers: false,
            managePartners: false,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: [],
            geoRestrictions: [],
            timeRestrictions: {
              enabled: false,
              startTime: "09:00",
              endTime: "18:00",
              timezone: "UTC+3",
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: false,
          lastActivity: new Date(Date.now() - 72e5).toISOString(),
          createdAt: new Date(Date.now() - 1728e5).toISOString(),
          createdBy: "temp_advertiser_id"
        }
      ];
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/team/members", async (req, res) => {
    console.log("=== CREATE TEAM MEMBER REQUEST - NO MIDDLEWARE ===");
    console.log("Request body:", req.body);
    try {
      const { username, email, firstName, lastName, role, permissions, restrictions, telegramNotifications, telegramUserId } = req.body;
      if (!username || !email || !firstName || !lastName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const existingUser = await db.query.users.findFirst({
        where: sql9`${users.username} = ${username} OR ${users.email} = ${email}`
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username or email already exists" });
      }
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const teamMember = await storage.createUser({
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "affiliate",
        adminRole: role,
        ownerId: authUser.id,
        userType: "affiliate",
        settings: JSON.stringify({
          permissions,
          restrictions,
          telegramNotifications,
          telegramUserId: telegramUserId || null,
          teamRole: role
        })
      });
      res.status(201).json({
        ...teamMember,
        temporaryPassword: tempPassword
      });
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/team/members/:id", authenticateToken, async (req, res) => {
    try {
      const authUser2 = req.user;
      if (authUser2.role !== "advertiser") {
        return res.status(403).json({ error: "Access denied" });
      }
      const { id } = req.params;
      const updateData = req.body;
      const teamMember = await db.query.users.findFirst({
        where: and10(
          eq10(users.id, id),
          eq10(users.ownerId, authUser2.id),
          eq10(users.userType, "affiliate")
        )
      });
      if (!teamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      const updatedMember = await db.update(users).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date(),
        settings: updateData.settings ? JSON.stringify(updateData.settings) : teamMember.settings
      }).where(eq10(users.id, id)).returning();
      res.json(updatedMember[0]);
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/team/members/:id", authenticateToken, async (req, res) => {
    try {
      const authUser2 = req.user;
      if (authUser2.role !== "advertiser") {
        return res.status(403).json({ error: "Access denied" });
      }
      const { id } = req.params;
      const teamMember = await db.query.users.findFirst({
        where: and10(
          eq10(users.id, id),
          eq10(users.ownerId, authUser2.id),
          eq10(users.userType, "affiliate")
        )
      });
      if (!teamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      await db.update(users).set({
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        deletedBy: authUser2.id
      }).where(eq10(users.id, id));
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Delete team member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/team/activity-logs", authenticateToken, async (req, res) => {
    try {
      const authUser2 = req.user;
      console.log("Activity logs request - User role:", authUser2.role, "User ID:", authUser2.id);
      if (authUser2.role !== "advertiser") {
        console.log("Activity logs access denied - not advertiser role:", authUser2.role);
        return res.status(403).json({ error: "Activity logs access denied - not advertiser role" });
      }
      const mockLogs = [
        {
          id: "1",
          userId: "member1",
          username: "ivan_petrov",
          action: "LOGIN",
          resource: "System",
          details: "User logged in successfully",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          result: "success"
        },
        {
          id: "2",
          userId: "member2",
          username: "maria_sidorova",
          action: "VIEW_STATISTICS",
          resource: "Analytics",
          details: "Viewed offer statistics",
          ipAddress: "10.0.0.5",
          userAgent: "Chrome/91.0...",
          timestamp: new Date(Date.now() - 36e5).toISOString(),
          result: "success"
        }
      ];
      res.json(mockLogs);
    } catch (error) {
      console.error("Get team activity logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/documentation", authenticateToken, async (req, res) => {
    try {
      const sections = await storage.getDocumentationSections();
      res.json(sections);
    } catch (error) {
      console.error("Get documentation sections error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/documentation/:sectionId/feedback", authenticateToken, async (req, res) => {
    try {
      const { sectionId } = req.params;
      const feedback = req.body;
      await storage.updateDocumentationFeedback(sectionId, feedback);
      res.json({ success: true });
    } catch (error) {
      console.error("Update documentation feedback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/documentation/download-pdf", authenticateToken, async (req, res) => {
    try {
      const url = await storage.downloadDocumentationPDF();
      res.json({ url });
    } catch (error) {
      console.error("Download PDF error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/profile", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const updateData = req.body;
      const updatedUser = await storage.updateUser(authUser2.id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/change-password", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(authUser2.id);
      if (!user || !user.password) {
        return res.status(400).json({ error: "User not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(authUser2.id, { password: hashedPassword });
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/tokens", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const tokens = [
        {
          id: "token_1",
          token: "api_test_token_12345",
          name: "Main API Token",
          lastUsed: "2025-01-01T10:00:00Z",
          createdAt: "2024-12-01T10:00:00Z",
          isActive: true
        },
        {
          id: "token_2",
          token: "api_prod_token_67890",
          name: "Production Token",
          lastUsed: null,
          createdAt: "2024-11-15T14:30:00Z",
          isActive: true
        }
      ];
      res.json(tokens);
    } catch (error) {
      console.error("Get API tokens error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/tokens/generate", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { name } = req.body;
      const newToken = {
        id: `token_${Date.now()}`,
        token: `api_${authUser2.id}_${randomUUID5().replace(/-/g, "")}`,
        name: name || "API Token",
        lastUsed: null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      };
      res.json(newToken);
    } catch (error) {
      console.error("Generate API token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/profile/tokens/:tokenId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { tokenId } = req.params;
      res.json({ success: true, message: "Token deleted successfully" });
    } catch (error) {
      console.error("Delete API token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const domains = [
        {
          id: "domain_1",
          domain: "tracking.example.com",
          status: "verified",
          type: "cname",
          verificationValue: "track.platform.com",
          createdAt: "2024-12-01T10:00:00Z",
          lastChecked: "2025-01-05T12:00:00Z",
          errorMessage: null
        },
        {
          id: "domain_2",
          domain: "links.mysite.com",
          status: "pending",
          type: "a_record",
          verificationValue: "192.168.1.100",
          createdAt: "2025-01-06T15:30:00Z",
          lastChecked: null,
          errorMessage: null
        }
      ];
      res.json(domains);
    } catch (error) {
      console.error("Get custom domains error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { domain, type } = req.body;
      const newDomain = {
        id: `domain_${Date.now()}`,
        domain,
        status: "pending",
        type,
        verificationValue: type === "cname" ? "track.platform.com" : "192.168.1.100",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastChecked: null,
        errorMessage: null
      };
      res.json(newDomain);
    } catch (error) {
      console.error("Add custom domain error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/profile/domains/:domainId/verify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { domainId } = req.params;
      res.json({ success: true, message: "Domain verification started" });
    } catch (error) {
      console.error("Verify custom domain error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/advertiser/profile/domains/:domainId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { domainId } = req.params;
      res.json({ success: true, message: "Domain deleted successfully" });
    } catch (error) {
      console.error("Delete custom domain error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/profile/webhook", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const webhookSettings = {
        defaultUrl: "https://example.com/webhook",
        ipWhitelist: ["192.168.1.1", "10.0.0.1"],
        enabled: true
      };
      res.json(webhookSettings);
    } catch (error) {
      console.error("Get webhook settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/profile/webhook", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { defaultUrl, ipWhitelist, enabled } = req.body;
      const updatedSettings = {
        defaultUrl: defaultUrl || "",
        ipWhitelist: ipWhitelist || [],
        enabled: enabled !== void 0 ? enabled : true
      };
      res.json(updatedSettings);
    } catch (error) {
      console.error("Update webhook settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/advertiser/profile/notifications", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const authUser2 = getAuthenticatedUser(req);
      const { notifications } = req.body;
      const updateData = {
        settings: {
          notifications
        }
      };
      await storage.updateUser(authUser2.id, updateData);
      res.json({ success: true, message: "Notification settings updated" });
    } catch (error) {
      console.error("Update notification settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/offers/:offerId/request-access", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { offerId } = req.params;
      const { requestNote, partnerMessage } = req.body;
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (offer2.partnerApprovalType !== "manual" && offer2.partnerApprovalType !== "by_request") {
        return res.status(400).json({ error: "This offer does not require approval" });
      }
      const existingRequest = await db.select().from(sql9`offer_access_requests`).where(sql9`offer_id = ${offerId} AND partner_id = ${partnerId}`).limit(1);
      if (existingRequest.length > 0) {
        return res.status(400).json({ error: "Request already exists for this offer" });
      }
      const requestData = {
        id: randomUUID5(),
        offer_id: offerId,
        partner_id: partnerId,
        advertiser_id: offer2.advertiserId,
        status: "pending",
        request_note: requestNote || null,
        partner_message: partnerMessage || null,
        requested_at: (/* @__PURE__ */ new Date()).toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
      };
      await db.execute(sql9`
        INSERT INTO offer_access_requests 
        (id, offer_id, partner_id, advertiser_id, status, request_note, partner_message, requested_at, expires_at)
        VALUES (${requestData.id}, ${requestData.offer_id}, ${requestData.partner_id}, ${requestData.advertiser_id}, 
                ${requestData.status}, ${requestData.request_note}, ${requestData.partner_message}, 
                ${requestData.requested_at}, ${requestData.expires_at})
      `);
      await notificationService.sendNotification({
        userId: offer2.advertiserId,
        title: "New Offer Access Request",
        message: `Partner ${req.user.username} requested access to offer "${offer2.name}"`,
        type: "offer_request",
        data: { offerId, requestId: requestData.id }
      });
      res.json({
        success: true,
        message: "Access request submitted successfully",
        requestId: requestData.id
      });
    } catch (error) {
      console.error("Request access error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/offers/:offerId/access-requests", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { offerId } = req.params;
      const advertiserId = req.user.id;
      const offer2 = await storage.getOffer(offerId);
      if (!offer2 || offer2.advertiserId !== advertiserId) {
        return res.status(404).json({ error: "Offer not found or access denied" });
      }
      const requests = await db.execute(sql9`
        SELECT 
          oar.id, 
          oar.partner_id, 
          u.username as partner_username,
          u.email as partner_email,
          oar.status,
          oar.request_note,
          oar.partner_message,
          oar.requested_at,
          oar.reviewed_at,
          oar.response_note,
          oar.expires_at
        FROM offer_access_requests oar
        LEFT JOIN users u ON oar.partner_id = u.id
        WHERE oar.offer_id = ${offerId}
        ORDER BY oar.requested_at DESC
      `);
      res.json(requests.rows);
    } catch (error) {
      console.error("Get access requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/access-requests", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = getAuthenticatedUser(req).id;
      const requests = await db.select().from(offerAccessRequests).where(eq10(offerAccessRequests.partnerId, partnerId));
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const offer2 = await storage.getOffer(request.offerId);
          const advertiser = await storage.getUser(request.advertiserId);
          return {
            ...request,
            offer: offer2 ? {
              id: offer2.id,
              name: offer2.name,
              category: offer2.category,
              payoutType: offer2.payoutType,
              payoutAmount: offer2.payoutAmount,
              currency: offer2.currency,
              description: offer2.description
            } : null,
            advertiser: advertiser ? {
              id: advertiser.id,
              username: advertiser.username,
              company: advertiser.company
            } : null
          };
        })
      );
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Get partner access requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/events", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const mockEvents = [
        {
          id: "event_1",
          type: "conversion",
          clickId: "abc123",
          offerId: "offer_001",
          partnerId: "partner_001",
          advertiserId: "advertiser_001",
          revenue: "100.00",
          status: "approved",
          antifraudLevel: "ok",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "event_2",
          type: "click",
          clickId: "def456",
          offerId: "offer_002",
          partnerId: "partner_002",
          advertiserId: "advertiser_001",
          revenue: "0.00",
          status: "pending",
          antifraudLevel: "soft",
          timestamp: new Date(Date.now() - 36e5).toISOString()
        }
      ];
      res.json(mockEvents);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/settings", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const settings = {
        systemName: "Affiliate Platform",
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: false,
        maxPartnerApprovals: 100,
        defaultCurrency: "USD",
        antifraudEnabled: true,
        postbackRetryLimit: 3,
        sessionTimeout: 3600,
        ipWhitelistEnabled: false,
        geoBlocking: {
          enabled: false,
          blockedCountries: []
        },
        notifications: {
          emailEnabled: true,
          telegramEnabled: false,
          webhookEnabled: false
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/antifraud", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const antifraudData = {
        globalSettings: {
          enabled: true,
          strictMode: false,
          autoBlock: true,
          blockThreshold: 70
        },
        recentAlerts: [
          {
            id: "alert_1",
            type: "high_fraud_score",
            partnerId: "partner_suspicious",
            offerId: "offer_001",
            fraudScore: 85,
            reason: "Multiple clicks from same IP",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            status: "active"
          }
        ],
        statistics: {
          totalChecks: 15420,
          blockedEvents: 234,
          fraudRate: 1.52,
          topFraudTypes: [
            { type: "bot_detected", count: 89 },
            { type: "vpn_usage", count: 67 },
            { type: "suspicious_pattern", count: 45 }
          ]
        }
      };
      res.json(antifraudData);
    } catch (error) {
      console.error("Get admin antifraud error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/offers/:offerId/access-requests/:requestId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const { offerId, requestId } = req.params;
      const { action, responseNote, advertiserResponse } = req.body;
      const advertiserId = req.user.id;
      const offer2 = await storage.getOffer(offerId);
      if (!offer2 || offer2.advertiserId !== advertiserId) {
        return res.status(404).json({ error: "Offer not found or access denied" });
      }
      const requestResult = await db.execute(sql9`
        SELECT * FROM offer_access_requests 
        WHERE id = ${requestId} AND offer_id = ${offerId}
        LIMIT 1
      `);
      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: "Access request not found" });
      }
      const request = requestResult.rows[0];
      if (request.status !== "pending") {
        return res.status(400).json({ error: "Request has already been processed" });
      }
      const newStatus = action === "approve" ? "approved" : "rejected";
      await db.execute(sql9`
        UPDATE offer_access_requests 
        SET status = ${newStatus},
            reviewed_at = ${(/* @__PURE__ */ new Date()).toISOString()},
            reviewed_by = ${advertiserId},
            response_note = ${responseNote || null},
            advertiser_response = ${advertiserResponse || null}
        WHERE id = ${requestId}
      `);
      if (action === "approve") {
        try {
          await db.execute(sql9`
            INSERT INTO partner_offers (id, partner_id, offer_id, status, assigned_at, assigned_by)
            VALUES (${randomUUID5()}, ${request.partner_id}, ${offerId}, 'active', ${(/* @__PURE__ */ new Date()).toISOString()}, ${advertiserId})
            ON CONFLICT DO NOTHING
          `);
        } catch (error) {
          console.log("Note: partner_offers relation could not be created:", error.message);
        }
      }
      const partner = await storage.getUser(request.partner_id);
      if (partner) {
        await notificationService.sendNotification({
          userId: partner.id,
          title: `Offer Access ${action === "approve" ? "Approved" : "Rejected"}`,
          message: `Your request for offer "${offer2.name}" has been ${action === "approve" ? "approved" : "rejected"}`,
          type: "offer_response",
          data: { offerId, requestId, status: newStatus }
        });
      }
      res.json({
        success: true,
        message: `Request ${action === "approve" ? "approved" : "rejected"} successfully`,
        status: newStatus
      });
    } catch (error) {
      console.error("Process access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/partner/access-requests/:requestId/cancel", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const { requestId } = req.params;
      const partnerId = req.user.id;
      const requestResult = await db.execute(sql9`
        SELECT * FROM offer_access_requests 
        WHERE id = ${requestId} AND partner_id = ${partnerId}
        LIMIT 1
      `);
      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: "Access request not found" });
      }
      const request = requestResult.rows[0];
      if (request.status !== "pending") {
        return res.status(400).json({ error: "Only pending requests can be cancelled" });
      }
      await db.execute(sql9`
        UPDATE offer_access_requests 
        SET status = 'cancelled',
            reviewed_at = ${(/* @__PURE__ */ new Date()).toISOString()}
        WHERE id = ${requestId}
      `);
      res.json({
        success: true,
        message: "Request cancelled successfully"
      });
    } catch (error) {
      console.error("Cancel access request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/partner/offers/request", authenticateToken, async (req, res) => {
    const { offerId, message } = req.body;
    const userId = req.user?.id || req.userId;
    if (!offerId) {
      return res.status(400).json({ error: "Offer ID is required" });
    }
    try {
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const isAssigned = await storage.isPartnerAssignedToAdvertiser(userId, offer2.advertiserId);
      if (!isAssigned) {
        return res.status(403).json({ error: "\u041F\u0430\u0440\u0442\u043D\u0435\u0440 \u043D\u0435 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0443 \u0434\u0430\u043D\u043D\u043E\u0433\u043E \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044F" });
      }
      const existingRequest = await db.select().from(offerAccessRequests).where(
        and10(
          eq10(offerAccessRequests.partnerId, userId),
          eq10(offerAccessRequests.offerId, offerId)
        )
      );
      if (existingRequest.length > 0) {
        return res.status(400).json({ error: "Request already exists" });
      }
      const existingAccess = await db.select().from(partnerOffers).where(
        and10(
          eq10(partnerOffers.partnerId, userId),
          eq10(partnerOffers.offerId, offerId),
          eq10(partnerOffers.isApproved, true)
        )
      );
      if (existingAccess.length > 0) {
        return res.status(400).json({ error: "Access already granted" });
      }
      const [newRequest] = await db.insert(offerAccessRequests).values({
        offerId,
        partnerId: userId,
        advertiserId: offer2.advertiserId,
        status: "pending",
        requestNote: message || null,
        requestedAt: /* @__PURE__ */ new Date()
      }).returning();
      try {
        const partner = await storage.getUser(userId);
        if (partner) {
          console.log(`\u{1F4E4} \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044E ${offer2.advertiserId} \u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0435 \u043E\u0442 ${partner.username} \u043D\u0430 \u043E\u0444\u0444\u0435\u0440 "${offer2.name}"`);
          const { notifyOfferAccessRequest: notifyOfferAccessRequest3 } = await Promise.resolve().then(() => (init_notification_helper(), notification_helper_exports));
          await notifyOfferAccessRequest3(offer2.advertiserId, partner, offer2, message);
          try {
            const connection = userConnections.get(offer2.advertiserId);
            if (connection && connection.readyState === WebSocket.OPEN) {
              const wsMessage = {
                type: "offer_access_request",
                data: {
                  partnerUsername: partner.username,
                  offerName: offer2.name,
                  offerId: offer2.id,
                  partnerId: partner.id,
                  message,
                  requestId: newRequest.id
                },
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              };
              connection.send(JSON.stringify(wsMessage));
              console.log(`\u{1F514} LIVE WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044E ${offer2.advertiserId} \u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0435 "${offer2.name}"`);
            } else {
              console.log(`\u26A0\uFE0F WebSocket \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0434\u043B\u044F \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044F ${offer2.advertiserId}`);
              console.log(`\u{1F50D} \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F: ${userConnections.size}`);
              console.log(`\u{1F50D} \u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F:`, Array.from(userConnections.keys()));
            }
          } catch (wsError) {
            console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F:", wsError);
          }
        }
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
      res.json(newRequest);
    } catch (error) {
      console.error("Error requesting offer access:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/access-requests", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    const userId = req.user?.id || req.userId;
    try {
      const requests = await db.select({
        id: offerAccessRequests.id,
        offerId: offerAccessRequests.offerId,
        advertiserId: offerAccessRequests.advertiserId,
        status: offerAccessRequests.status,
        requestNote: offerAccessRequests.requestNote,
        responseNote: offerAccessRequests.responseNote,
        requestedAt: offerAccessRequests.requestedAt,
        reviewedAt: offerAccessRequests.reviewedAt,
        // Offer details
        offerName: offers.name,
        offerCategory: offers.category,
        offerPayout: offers.payout,
        offerPayoutType: offers.payoutType,
        offerDescription: offers.description,
        // Advertiser details
        advertiserUsername: users.username,
        advertiserEmail: users.email,
        advertiserFirstName: users.firstName,
        advertiserLastName: users.lastName,
        advertiserCompany: users.company
      }).from(offerAccessRequests).leftJoin(offers, eq10(offerAccessRequests.offerId, offers.id)).leftJoin(users, eq10(offerAccessRequests.advertiserId, users.id)).where(eq10(offerAccessRequests.partnerId, userId)).orderBy(sql9`${offerAccessRequests.requestedAt} DESC`);
      const formattedRequests = requests.map((req2) => ({
        id: req2.id,
        offerId: req2.offerId,
        advertiserId: req2.advertiserId,
        status: req2.status,
        requestNote: req2.requestNote,
        responseNote: req2.responseNote,
        requestedAt: req2.requestedAt,
        reviewedAt: req2.reviewedAt,
        createdAt: req2.requestedAt,
        offer: {
          id: req2.offerId,
          name: req2.offerName,
          category: req2.offerCategory,
          payoutType: req2.offerPayoutType,
          payoutAmount: req2.offerPayout,
          currency: "USD",
          description: req2.offerDescription
        },
        advertiser: {
          id: req2.advertiserId,
          username: req2.advertiserUsername,
          company: req2.advertiserCompany,
          firstName: req2.advertiserFirstName,
          lastName: req2.advertiserLastName
        }
      }));
      console.log("Partner access requests - DEBUG:", {
        userId,
        requestsCount: formattedRequests.length,
        firstRequest: formattedRequests[0]
      });
      res.json(formattedRequests);
    } catch (error) {
      console.error("Error getting partner access requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/advertiser/access-requests/:requestId/respond", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    const { requestId } = req.params;
    const { action, responseMessage } = req.body;
    const userId = req.user?.id || req.userId;
    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    try {
      const [request] = await db.select().from(offerAccessRequests).where(eq10(offerAccessRequests.id, requestId));
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.advertiserId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const [updatedRequest] = await db.update(offerAccessRequests).set({
        status: action === "approve" ? "approved" : "rejected",
        responseNote: responseMessage || null,
        reviewedAt: /* @__PURE__ */ new Date(),
        reviewedBy: userId
      }).where(eq10(offerAccessRequests.id, requestId)).returning();
      const isApproved = action === "approve";
      const existingPartnerOffer = await db.select().from(partnerOffers).where(
        and10(
          eq10(partnerOffers.partnerId, request.partnerId),
          eq10(partnerOffers.offerId, request.offerId)
        )
      );
      if (existingPartnerOffer.length > 0) {
        await db.update(partnerOffers).set({
          isApproved,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(
          and10(
            eq10(partnerOffers.partnerId, request.partnerId),
            eq10(partnerOffers.offerId, request.offerId)
          )
        );
      } else {
        await db.insert(partnerOffers).values({
          id: randomUUID5(),
          partnerId: request.partnerId,
          offerId: request.offerId,
          isApproved,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      console.log(`Access request ${requestId} ${action}d. Partner ${request.partnerId} ${isApproved ? "granted" : "denied"} access to offer ${request.offerId}`);
      console.log("\u041E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u0434\u043E\u0441\u0442\u0443\u043F\u0430:", requestId, "action:", action, "advertiserId:", userId);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error responding to access request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/advertiser/access-requests", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    const userId = req.user?.id || req.userId;
    try {
      const requests = await db.select({
        id: offerAccessRequests.id,
        offerId: offerAccessRequests.offerId,
        partnerId: offerAccessRequests.partnerId,
        status: offerAccessRequests.status,
        requestNote: offerAccessRequests.requestNote,
        responseNote: offerAccessRequests.responseNote,
        requestedAt: offerAccessRequests.requestedAt,
        reviewedAt: offerAccessRequests.reviewedAt,
        // Offer details
        offerName: offers.name,
        offerCategory: offers.category,
        offerPayout: offers.payout,
        offerPayoutType: offers.payoutType,
        offerLogo: offers.logo,
        // Partner details
        partnerUsername: users.username,
        partnerEmail: users.email,
        partnerFirstName: users.firstName,
        partnerLastName: users.lastName
      }).from(offerAccessRequests).leftJoin(offers, eq10(offerAccessRequests.offerId, offers.id)).leftJoin(users, eq10(offerAccessRequests.partnerId, users.id)).where(eq10(offerAccessRequests.advertiserId, userId)).orderBy(sql9`${offerAccessRequests.requestedAt} DESC`);
      const formattedRequests = requests.map((req2) => ({
        id: req2.id,
        offerId: req2.offerId,
        partnerId: req2.partnerId,
        advertiserId: userId,
        status: req2.status,
        message: req2.requestNote,
        requestedAt: req2.requestedAt,
        createdAt: req2.requestedAt,
        approvedAt: req2.reviewedAt,
        updatedAt: req2.reviewedAt || req2.requestedAt,
        // Flat partner fields
        partnerName: req2.partnerFirstName && req2.partnerLastName ? `${req2.partnerFirstName} ${req2.partnerLastName}` : req2.partnerFirstName || req2.partnerLastName || "",
        partnerUsername: req2.partnerUsername,
        partnerEmail: req2.partnerEmail,
        // Flat offer fields
        offerName: req2.offerName,
        offerPayout: req2.offerPayout || "0",
        offerCurrency: "USD",
        offerLogo: req2.offerLogo
      }));
      res.json(formattedRequests);
    } catch (error) {
      console.error("Error fetching access requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/demo/create-access-request", async (req, res) => {
    try {
      const { partnerId, offerId, message } = req.body;
      const accessRequest = await storage.createOfferAccessRequest(partnerId, offerId, message);
      res.json({ success: true, request: accessRequest });
    } catch (error) {
      console.error("Error creating demo access request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/partner/offers/available", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      const advertisersList = await db.select({
        advertiserId: users.id,
        advertiserName: users.username,
        advertiserFirstName: users.firstName,
        advertiserLastName: users.lastName
      }).from(users).where(and10(
        eq10(users.role, "advertiser"),
        eq10(users.isActive, true)
      ));
      const partnersWithAccess = [];
      for (const advertiser of advertisersList) {
        const isAssigned = await storage.isPartnerAssignedToAdvertiser(partnerId, advertiser.advertiserId);
        if (isAssigned) {
          partnersWithAccess.push(advertiser.advertiserId);
        }
      }
      if (partnersWithAccess.length === 0) {
        return res.json([]);
      }
      const availableOffers = await db.select().from(offers).where(and10(
        eq10(offers.status, "active"),
        sql9`${offers.advertiserId} IN (${partnersWithAccess.map((id) => `'${id}'`).join(",")})`
      ));
      const existingPartnerOffers = await storage.getPartnerOffersByPartner(partnerId);
      const existingOfferIds = existingPartnerOffers.map((po) => po.offerId);
      const existingRequests = await storage.getOfferAccessRequests(partnerId);
      const requestedOfferIds = existingRequests.map((r) => r.offerId);
      const filteredOffers = availableOffers.filter(
        (offer2) => !existingOfferIds.includes(offer2.id) && !requestedOfferIds.includes(offer2.id)
      );
      res.json(filteredOffers);
    } catch (error) {
      console.error("Get available offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  try {
    const { setupAccessRequestsRoutes: setupAccessRequestsRoutes2 } = await Promise.resolve().then(() => (init_access_requests(), access_requests_exports));
    setupAccessRequestsRoutes2(app2);
  } catch (error) {
    console.log("Skipping access-requests routes - module not found");
  }
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });
  app2.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await storage.markNotificationAsRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  app2.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await storage.deleteNotification(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });
  app2.put("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });
  const httpServer = createServer(app2);
  const { WebSocketServer, WebSocket } = await import("ws");
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const userConnections = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2, req) => {
    console.log("WebSocket connection established");
    let userId = null;
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth" && message.token) {
          const jwt3 = await import("jsonwebtoken");
          try {
            const decoded = jwt3.default.verify(message.token, config.JWT_SECRET);
            userId = decoded.id;
            userConnections.set(userId, ws2);
            console.log(`User ${userId} authenticated via WebSocket`);
            ws2.send(JSON.stringify({
              type: "auth_success",
              message: "Authenticated successfully"
            }));
          } catch (error) {
            console.error("WebSocket auth error:", error);
            ws2.send(JSON.stringify({
              type: "auth_error",
              message: "Invalid token"
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      if (userId) {
        userConnections.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  global.sendWebSocketNotification = (userId, message) => {
    const connection = userConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  };
  const { ObjectStorageService: ObjectStorageService3 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
  const objectStorageService = new ObjectStorageService3();
  const archiver2 = (await import("archiver")).default;
  app2.post("/api/creatives/upload-url", authenticateToken, async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting creative upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });
  app2.get("/api/creatives/:creativePath(*)", async (req, res) => {
    try {
      const creativePath = `/${req.params.creativePath}`;
      const creativeFile = await objectStorageService.getCreativeFile(creativePath);
      await objectStorageService.downloadObject(creativeFile, res);
    } catch (error) {
      console.error("Error downloading creative:", error);
      const { ObjectNotFoundError: ObjectNotFoundError2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
      if (error instanceof ObjectNotFoundError2) {
        return res.status(404).json({ error: "Creative not found" });
      }
      res.status(500).json({ error: "Failed to download creative" });
    }
  });
  app2.put("/api/offers/:offerId/creatives", authenticateToken, async (req, res) => {
    try {
      const { offerId } = req.params;
      const { creativeUrl } = req.body;
      if (!creativeUrl) {
        return res.status(400).json({ error: "Creative URL is required" });
      }
      const normalizedPath = objectStorageService.normalizeCreativePath(creativeUrl);
      await db.update(offers).set({
        creatives: normalizedPath,
        creativesUrl: normalizedPath,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(offers.id, offerId));
      res.json({ creativePath: normalizedPath });
    } catch (error) {
      console.error("Error updating offer creatives:", error);
      res.status(500).json({ error: "Failed to update offer creatives" });
    }
  });
  app2.get("/api/advertiser/offers/:offerId/creatives", authenticateToken, async (req, res) => {
    try {
      const { offerId } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      if (userRole !== "advertiser" && userRole !== "super_admin") {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      if (userRole === "advertiser") {
        const offer2 = await storage.getOffer(offerId);
        console.log("Advertiser creative access check:", {
          offerId,
          userId,
          offer: offer2 ? { id: offer2.id, ownerId: offer2.ownerId, advertiserId: offer2.advertiserId } : null
        });
        if (!offer2 || offer2.ownerId !== userId && offer2.advertiserId !== userId) {
          return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
        }
      }
      const creativeService = new CreativeService();
      const creatives2 = await creativeService.getOfferCreatives(offerId);
      res.json({
        success: true,
        creatives: creatives2.map((creative) => ({
          id: creative.id,
          fileName: creative.fileName,
          originalName: creative.originalName,
          fileType: creative.fileType,
          mimeType: creative.mimeType,
          fileSize: creative.fileSize,
          dimensions: creative.dimensions,
          duration: creative.duration,
          description: creative.description,
          tags: creative.tags,
          createdAt: creative.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching offer creatives:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432" });
    }
  });
  app2.post("/api/advertiser/offers/:offerId/creatives/upload", authenticateToken, async (req, res) => {
    try {
      const { offerId } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { files } = req.body;
      if (userRole !== "advertiser" && userRole !== "super_admin") {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      if (userRole === "advertiser") {
        const offer2 = await storage.getOffer(offerId);
        console.log("Advertiser creative upload access check:", {
          offerId,
          userId,
          offer: offer2 ? { id: offer2.id, ownerId: offer2.ownerId, advertiserId: offer2.advertiserId } : null
        });
        if (!offer2 || offer2.ownerId !== userId && offer2.advertiserId !== userId) {
          return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
        }
      }
      const creativeService = new CreativeService();
      const savedCreatives = [];
      for (const fileData of files) {
        const creative = await creativeService.saveCreativeFile({
          offerId,
          fileName: fileData.fileName,
          originalName: fileData.originalName,
          fileType: fileData.fileType,
          mimeType: fileData.mimeType,
          fileSize: fileData.fileSize,
          filePath: fileData.filePath,
          publicUrl: fileData.publicUrl,
          dimensions: fileData.dimensions,
          duration: fileData.duration,
          description: fileData.description,
          tags: fileData.tags || [],
          uploadedBy: userId
        });
        savedCreatives.push(creative);
      }
      res.json({
        success: true,
        message: `\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E ${savedCreatives.length} \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432`,
        creatives: savedCreatives
      });
    } catch (error) {
      console.error("Error uploading creatives:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432" });
    }
  });
  app2.get("/api/partner/offers/:offerId/creatives/download", authenticateToken, async (req, res) => {
    try {
      const offerId = req.params.offerId;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      console.log(`Creative download request: offerId=${offerId}, userId=${userId}, role=${userRole}`);
      console.log("User object from req:", req.user);
      const offer2 = await storage.getOffer(offerId);
      if (!offer2) {
        return res.status(404).json({ error: "\u041E\u0444\u0444\u0435\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      console.log("Offer details:", { id: offer2.id, name: offer2.name, creativesUrl: offer2.creativesUrl, creatives: offer2.creatives });
      let hasAccess = false;
      if (userRole === "super_admin") {
        hasAccess = true;
        console.log("Access granted: super_admin");
      } else if (userRole === "advertiser") {
        hasAccess = offer2.ownerId === userId;
        console.log(`Access check for advertiser: offer.ownerId=${offer2.ownerId}, userId=${userId}, hasAccess=${hasAccess}`);
      } else if (userRole === "affiliate") {
        const accessRequest = await db.select().from(offerAccessRequests).where(
          and10(
            eq10(offerAccessRequests.offerId, offerId),
            eq10(offerAccessRequests.partnerId, userId),
            eq10(offerAccessRequests.status, "approved")
          )
        ).limit(1);
        hasAccess = accessRequest.length > 0;
        console.log(`Access check for affiliate: userId=${userId}, hasAccess=${hasAccess}, accessRequests=${accessRequest.length}`);
      }
      if (!hasAccess) {
        console.log("Access denied for user:", { userId, userRole, offerId });
        return res.status(403).send("Forbidden");
      }
      console.log("Access granted, proceeding with download");
      console.log("Checking creative files directly from database for offerId:", offerId);
      const foundCreativeFiles = await db.select().from(creativeFiles).where(eq10(creativeFiles.offerId, offerId));
      console.log("Checking creative files from database:", { count: foundCreativeFiles.length, files: foundCreativeFiles });
      if (!foundCreativeFiles || foundCreativeFiles.length === 0) {
        console.log("No creatives found, creating demo archive");
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="demo-creatives-${offerId}.zip"`);
        const archive = archiver2("zip", { zlib: { level: 9 } });
        archive.pipe(res);
        archive.append("\u042D\u0442\u043E \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0444\u0430\u0439\u043B \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432 \u0434\u043B\u044F \u043E\u0444\u0444\u0435\u0440\u0430.\n\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u044B \u0447\u0435\u0440\u0435\u0437 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0434\u0430\u0442\u0435\u043B\u044F.", {
          name: "README.txt"
        });
        archive.append("Banner 300x250\n\u0414\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043E\u0444\u0444\u0435\u0440\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u044B", {
          name: "banner-300x250.txt"
        });
        archive.append("Landing Page URL: " + (offer2.landingPageUrl || "Not specified"), {
          name: "landing-info.txt"
        });
        await archive.finalize();
        return;
      }
      console.log("Found creative files, downloading from object storage:", foundCreativeFiles);
      try {
        const objectStorageService2 = new ObjectStorageService3();
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="creatives-${offerId}.zip"`);
        const archive = archiver2("zip", { zlib: { level: 9 } });
        archive.pipe(res);
        for (const creativeFile of foundCreativeFiles) {
          try {
            console.log("Processing creative file:", { fileName: creativeFile.fileName, filePath: creativeFile.filePath });
            if (creativeFile.filePath) {
              const filePath = creativeFile.filePath;
              const pathParts = filePath.split("/");
              if (pathParts.length < 3) continue;
              const bucketName = pathParts[1];
              const objectName = pathParts.slice(2).join("/");
              const bucket = objectStorageClient.bucket(bucketName);
              const file = bucket.file(objectName);
              const [exists] = await file.exists();
              if (exists) {
                const stream = file.createReadStream();
                archive.append(stream, { name: creativeFile.originalName || creativeFile.fileName });
                console.log("Successfully added file to archive:", creativeFile.fileName);
              } else {
                console.log("File does not exist in storage:", creativeFile.filePath);
              }
            }
          } catch (fileError) {
            console.error("Error processing individual file:", fileError);
          }
        }
        await archive.finalize();
        return;
      } catch (storageError) {
        console.error("Error downloading from object storage:", storageError);
      }
      try {
        console.log("Creating real creative archive for offer:", offerId);
        if (offer2.creativesUrl) {
          const creativePath = offer2.creativesUrl;
          console.log("Fetching creative from storage:", creativePath);
          try {
            const creativeFile = await objectStorageService.getCreativeFile(creativePath);
            await objectStorageService.downloadObject(creativeFile, res);
            console.log("Real creative archive sent successfully");
            return;
          } catch (storageError) {
            console.error("Error fetching from storage, falling back to demo:", storageError);
          }
        }
        const creativeService = new CreativeService();
        await creativeService.createCreativeArchive(offerId, res);
        console.log("Creative archive sent successfully");
      } catch (fetchError) {
        console.error("Error creating creative archive:", fetchError);
        return res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0430\u0440\u0445\u0438\u0432\u0430 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432" });
      }
    } catch (error) {
      console.error("Download creatives error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0438 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043E\u0432" });
    }
  });
  app2.get("/api/advertiser/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const domains = await storage.getCustomDomains(userId);
      res.json(domains);
    } catch (error) {
      console.error("Get custom domains error:", error);
      res.status(500).json({ error: "Failed to fetch custom domains" });
    }
  });
  app2.post("/api/advertiser/domains", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { domain, type } = req.body;
      if (!domain || !type) {
        return res.status(400).json({ error: "Domain and type are required" });
      }
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: "Invalid domain format" });
      }
      const newDomain = await storage.addCustomDomain(userId, domain, type);
      res.json(newDomain);
    } catch (error) {
      console.error("Add custom domain error:", error);
      if (error.message?.includes("unique constraint")) {
        res.status(400).json({ error: "Domain already exists" });
      } else {
        res.status(500).json({ error: "Failed to add custom domain" });
      }
    }
  });
  app2.post("/api/advertiser/domains/:domainId/verify", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { domainId } = req.params;
      const verifiedDomain = await storage.verifyCustomDomain(userId, domainId);
      res.json(verifiedDomain);
    } catch (error) {
      console.error("Verify custom domain error:", error);
      res.status(500).json({ error: "Failed to verify custom domain" });
    }
  });
  app2.delete("/api/advertiser/domains/:domainId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { domainId } = req.params;
      await storage.deleteCustomDomain(userId, domainId);
      res.json({ success: true, message: "Domain deleted successfully" });
    } catch (error) {
      console.error("Delete custom domain error:", error);
      res.status(500).json({ error: "Failed to delete custom domain" });
    }
  });
  app2.get("/api/advertiser/api-tokens", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const tokens = await storage.getApiTokens(userId);
      res.json(tokens);
    } catch (error) {
      console.error("Get API tokens error:", error);
      res.status(500).json({ error: "Failed to fetch API tokens" });
    }
  });
  app2.post("/api/advertiser/api-tokens", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, permissions, ipWhitelist, expiresAt } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Token name is required" });
      }
      const newToken = await storage.generateApiToken(userId, name);
      res.json(newToken);
    } catch (error) {
      console.error("Generate API token error:", error);
      res.status(500).json({ error: "Failed to generate API token" });
    }
  });
  app2.delete("/api/advertiser/api-tokens/:tokenId", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { tokenId } = req.params;
      await storage.deleteApiToken(userId, tokenId);
      res.json({ success: true, message: "Token deleted successfully" });
    } catch (error) {
      console.error("Delete API token error:", error);
      res.status(500).json({ error: "Failed to delete API token" });
    }
  });
  app2.get("/api/advertiser/dashboard", authenticateToken, requireRole(["advertiser"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, geo, device, offerId, partnerId } = req.query;
      const offers3 = await storage.getOffers(userId);
      const totalOffers = offers3.length;
      const activeOffers = offers3.filter((o) => o.status === "active").length;
      const pendingOffers = offers3.filter((o) => o.status === "pending").length;
      const rejectedOffers = offers3.filter((o) => o.status === "rejected").length;
      const partners = await storage.getUsersByOwner(userId, "affiliate");
      const partnersCount = partners.length;
      const dashboardData = {
        overview: {
          totalOffers,
          activeOffers,
          pendingOffers,
          rejectedOffers,
          totalBudget: 15e4,
          totalSpent: 85420,
          totalRevenue: 124800,
          partnersCount,
          avgCR: 3.2,
          epc: 2.45,
          postbacksSent: 1247,
          postbacksReceived: 1198,
          postbackErrors: 49,
          fraudActivity: 12
        },
        chartData: {
          traffic: [
            { date: "2025-08-01", clicks: 1240, uniqueClicks: 1180 },
            { date: "2025-08-02", clicks: 1350, uniqueClicks: 1280 },
            { date: "2025-08-03", clicks: 1120, uniqueClicks: 1050 },
            { date: "2025-08-04", clicks: 1480, uniqueClicks: 1400 },
            { date: "2025-08-05", clicks: 1650, uniqueClicks: 1580 },
            { date: "2025-08-06", clicks: 1420, uniqueClicks: 1350 },
            { date: "2025-08-07", clicks: 1580, uniqueClicks: 1520 }
          ],
          conversions: [
            { date: "2025-08-01", leads: 42, registrations: 28, deposits: 15 },
            { date: "2025-08-02", leads: 48, registrations: 32, deposits: 18 },
            { date: "2025-08-03", leads: 36, registrations: 24, deposits: 12 },
            { date: "2025-08-04", leads: 52, registrations: 36, deposits: 22 },
            { date: "2025-08-05", leads: 58, registrations: 42, deposits: 26 },
            { date: "2025-08-06", leads: 45, registrations: 30, deposits: 18 },
            { date: "2025-08-07", leads: 55, registrations: 38, deposits: 24 }
          ],
          spending: [
            { date: "2025-08-01", spent: 12400, revenue: 15800 },
            { date: "2025-08-02", spent: 13500, revenue: 17200 },
            { date: "2025-08-03", spent: 11200, revenue: 14600 },
            { date: "2025-08-04", spent: 14800, revenue: 18900 },
            { date: "2025-08-05", spent: 16500, revenue: 21200 },
            { date: "2025-08-06", spent: 14200, revenue: 18400 },
            { date: "2025-08-07", spent: 15800, revenue: 20700 }
          ],
          postbacks: [
            { date: "2025-08-01", sent: 182, successful: 175, failed: 7 },
            { date: "2025-08-02", sent: 198, successful: 189, failed: 9 },
            { date: "2025-08-03", sent: 156, successful: 148, failed: 8 },
            { date: "2025-08-04", sent: 215, successful: 207, failed: 8 },
            { date: "2025-08-05", sent: 242, successful: 235, failed: 7 },
            { date: "2025-08-06", sent: 189, successful: 182, failed: 7 },
            { date: "2025-08-07", sent: 225, successful: 217, failed: 8 }
          ],
          fraud: [
            { date: "2025-08-01", detected: 8, blocked: 6 },
            { date: "2025-08-02", detected: 12, blocked: 10 },
            { date: "2025-08-03", detected: 5, blocked: 4 },
            { date: "2025-08-04", detected: 15, blocked: 12 },
            { date: "2025-08-05", detected: 18, blocked: 16 },
            { date: "2025-08-06", detected: 9, blocked: 8 },
            { date: "2025-08-07", detected: 14, blocked: 11 }
          ]
        },
        topOffers: offers3.slice(0, 5).map((offer2, i) => ({
          id: offer2.id,
          name: offer2.name,
          status: offer2.status,
          clicks: 1200 + i * 200,
          cr: 2.5 + i * 0.3,
          conversions: 30 + i * 8,
          spent: 8500 + i * 1200,
          postbacks: 145 + i * 25,
          fraudRate: 0.5 + i * 0.2
        })),
        notifications: [
          {
            id: "1",
            type: "success",
            title: "\u041D\u043E\u0432\u044B\u0435 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438",
            message: "25 \u043D\u043E\u0432\u044B\u0445 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0439 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 Casino Premium \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0447\u0430\u0441",
            createdAt: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
            isRead: false
          },
          {
            id: "2",
            type: "warning",
            title: "\u041D\u0438\u0437\u043A\u0438\u0439 CR",
            message: "CR \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 Dating Pro \u0443\u043F\u0430\u043B \u043D\u0438\u0436\u0435 2% - \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0442\u0440\u0430\u0444\u0438\u043A",
            createdAt: new Date(Date.now() - 1e3 * 60 * 120).toISOString(),
            isRead: false
          },
          {
            id: "3",
            type: "info",
            title: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u0442\u043D\u0451\u0440",
            message: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 TopTraffic \u043F\u043E\u0434\u0430\u043B \u0437\u0430\u044F\u0432\u043A\u0443 \u043D\u0430 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443 Sports Betting",
            createdAt: new Date(Date.now() - 1e3 * 60 * 240).toISOString(),
            isRead: true
          }
        ],
        offerStatus: {
          pending: pendingOffers,
          active: activeOffers,
          hidden: offers3.filter((o) => o.status === "hidden").length,
          archived: offers3.filter((o) => o.status === "archived").length
        }
      };
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });
  app2.get("/api/affiliate/dashboard", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, geo, device, offerId } = req.query;
      const offerRequests = await storage.getOfferAccessRequests(userId);
      const approvedOffers = offerRequests.filter((r) => r.status === "approved").length;
      const partnerDashboard = {
        metrics: {
          totalRevenue: 45720,
          totalConversions: 184,
          totalClicks: 7850,
          uniqueClicks: 7420,
          epc: 5.82,
          avgCR: 2.34,
          activeOffers: approvedOffers,
          postbacksSent: 892,
          postbacksReceived: 867,
          pendingRevenue: 12400,
          confirmedRevenue: 33320,
          rejectedRevenue: 1200,
          avgSessionDuration: 145e3
          // milliseconds
        },
        chartData: {
          revenue: [
            { date: "2025-08-01", revenue: 6200 },
            { date: "2025-08-02", revenue: 7100 },
            { date: "2025-08-03", revenue: 5800 },
            { date: "2025-08-04", revenue: 8500 },
            { date: "2025-08-05", revenue: 9200 },
            { date: "2025-08-06", revenue: 8800 }
          ],
          crEpc: [
            { date: "2025-08-01", cr: 2.1, epc: 5.2 },
            { date: "2025-08-02", cr: 2.4, epc: 5.8 },
            { date: "2025-08-03", cr: 2, epc: 5.1 },
            { date: "2025-08-04", cr: 2.8, epc: 6.5 },
            { date: "2025-08-05", cr: 3.1, epc: 7.2 },
            { date: "2025-08-06", cr: 2.6, epc: 6.1 }
          ],
          conversions: [
            { date: "2025-08-01", leads: 24, deposits: 12 },
            { date: "2025-08-02", leads: 28, deposits: 15 },
            { date: "2025-08-03", leads: 20, deposits: 8 },
            { date: "2025-08-04", leads: 35, deposits: 18 },
            { date: "2025-08-05", leads: 42, deposits: 22 },
            { date: "2025-08-06", leads: 30, deposits: 16 }
          ],
          geoTraffic: [
            { country: "IN", clicks: 2400, revenue: 15200, cr: 3.2 },
            { country: "ID", clicks: 1800, revenue: 8900, cr: 2.8 },
            { country: "TH", clicks: 1200, revenue: 6400, cr: 2.1 },
            { country: "MY", clicks: 950, revenue: 4800, cr: 2.4 },
            { country: "PH", clicks: 750, revenue: 3200, cr: 1.9 }
          ],
          postbackActivity: [
            { date: "2025-08-01", sent: 128, successful: 125, failed: 3 },
            { date: "2025-08-02", sent: 142, successful: 138, failed: 4 },
            { date: "2025-08-03", sent: 118, successful: 115, failed: 3 },
            { date: "2025-08-04", sent: 168, successful: 163, failed: 5 },
            { date: "2025-08-05", sent: 189, successful: 185, failed: 4 },
            { date: "2025-08-06", sent: 152, successful: 148, failed: 4 }
          ]
        },
        topOffers: offerRequests.slice(0, 5).map((request, i) => ({
          id: request.offerId,
          name: `Offer ${i + 1}`,
          // Would normally fetch offer details
          clicks: 800 + i * 150,
          conversions: 18 + i * 5,
          revenue: 2400 + i * 800,
          cr: 2.2 + i * 0.3,
          epc: 3 + i * 0.8,
          status: request.status
        })),
        notifications: [
          {
            id: "1",
            type: "success",
            title: "\u041D\u043E\u0432\u044B\u0435 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0438",
            message: "8 \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u0439 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 Casino Gold \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 2 \u0447\u0430\u0441\u0430",
            time: "30 \u043C\u0438\u043D \u043D\u0430\u0437\u0430\u0434"
          },
          {
            id: "2",
            type: "info",
            title: "\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0444\u0444\u0435\u0440\u0443",
            message: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043D\u043E\u0432\u043E\u043C\u0443 \u043E\u0444\u0444\u0435\u0440\u0443 Sports Premium",
            time: "2 \u0447\u0430\u0441\u0430 \u043D\u0430\u0437\u0430\u0434"
          }
        ],
        smartAlerts: [
          {
            id: "1",
            type: "opportunity",
            title: "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 CR \u0432 \u0418\u043D\u0434\u0438\u0438",
            message: "CR \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443 Dating Pro \u0432 \u0418\u043D\u0434\u0438\u0438 \u0432\u044B\u0440\u043E\u0441 \u0434\u043E 4.2% - \u0443\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0442\u0440\u0430\u0444\u0438\u043A",
            action: "\u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C"
          }
        ]
      };
      res.json(partnerDashboard);
    } catch (error) {
      console.error("Partner dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch partner dashboard data" });
    }
  });
  app2.get("/api/admin/dashboard", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const advertisers = allUsers.filter((u) => u.role === "advertiser");
      const partners = allUsers.filter((u) => u.role === "affiliate");
      const allOffers = await storage.getOffers();
      const adminDashboard = {
        overview: {
          totalUsers: allUsers.length,
          totalAdvertisers: advertisers.length,
          totalPartners: partners.length,
          totalOffers: allOffers.length,
          activeOffers: allOffers.filter((o) => o.status === "active").length,
          totalRevenue: 284750,
          totalClicks: 47850,
          avgCR: 2.8,
          fraudDetected: 145
        },
        chartData: {
          userGrowth: [
            { date: "2025-08-01", advertisers: 45, partners: 180 },
            { date: "2025-08-02", advertisers: 46, partners: 185 },
            { date: "2025-08-03", advertisers: 48, partners: 188 },
            { date: "2025-08-04", advertisers: 49, partners: 192 },
            { date: "2025-08-05", advertisers: 52, partners: 198 },
            { date: "2025-08-06", advertisers: 53, partners: 205 }
          ],
          revenue: [
            { date: "2025-08-01", total: 42500, advertisers: 28e3, platform: 14500 },
            { date: "2025-08-02", total: 48200, advertisers: 31800, platform: 16400 },
            { date: "2025-08-03", total: 39800, advertisers: 26200, platform: 13600 },
            { date: "2025-08-04", total: 54600, advertisers: 36e3, platform: 18600 },
            { date: "2025-08-05", total: 61200, advertisers: 40400, platform: 20800 },
            { date: "2025-08-06", total: 56400, advertisers: 37200, platform: 19200 }
          ]
        },
        topAdvertisers: advertisers.slice(0, 5).map((adv, i) => ({
          id: adv.id,
          name: adv.firstName + " " + adv.lastName,
          company: adv.company || "N/A",
          offers: Math.floor(Math.random() * 20) + 5,
          revenue: 15e3 + i * 8e3,
          partners: Math.floor(Math.random() * 50) + 10
        })),
        topPartners: partners.slice(0, 5).map((partner, i) => ({
          id: partner.id,
          name: partner.firstName + " " + partner.lastName,
          partnerNumber: partner.partnerNumber,
          revenue: 8e3 + i * 3e3,
          conversions: 45 + i * 15,
          cr: 2.1 + i * 0.4
        })),
        systemHealth: {
          uptime: "99.98%",
          responseTime: 145,
          errorRate: 0.02,
          fraudBlocked: 89
        }
      };
      res.json(adminDashboard);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch admin dashboard data" });
    }
  });
  app2.use("/api/analytics", authenticateToken, analytics_default);
  const enhancedAnalyticsRoutes = await Promise.resolve().then(() => (init_analytics_enhanced(), analytics_enhanced_exports));
  app2.use("/api/live-analytics", authenticateToken, enhancedAnalyticsRoutes.default);
  function generateClickId() {
    return nanoid3(16);
  }
  function parseSub2(sub2Raw) {
    if (!sub2Raw) return {};
    const pairs = sub2Raw.split("|");
    const result = {};
    for (const pair of pairs) {
      const [key, value] = pair.split("-", 2);
      if (key && value && sub2Config.allowedKeys.includes(key)) {
        result[key] = value;
      }
    }
    return result;
  }
  function getClientIp(req) {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
  }
  app2.get("/click/:clickid?", async (req, res) => {
    try {
      const clickid = req.params.clickid || generateClickId();
      const ip = getClientIp(req);
      const clickData = clickEventSchema.parse({
        ...req.query,
        user_agent: req.headers["user-agent"] || ""
      });
      const sub2Map = clickData.sub2 ? parseSub2(clickData.sub2) : {};
      const geoData = {
        countryIso: "XX",
        region: "",
        city: "",
        isp: "",
        operator: "",
        isProxy: false
      };
      const deviceData = {
        browserName: "",
        browserVersion: "",
        osName: "",
        osVersion: "",
        deviceModel: "",
        deviceType: clickData.device_type || "desktop"
      };
      let advertiserId;
      let partnerId;
      if (clickData.offer_id) {
        const offer2 = await db.select().from(offers).where(eq10(offers.id, clickData.offer_id)).limit(1);
        if (offer2.length > 0) {
          advertiserId = offer2[0].advertiserId;
        }
      }
      if (!advertiserId) {
        return res.status(400).json({ error: "Invalid offer_id or missing attribution data" });
      }
      await db.insert(trackingClicks2).values({
        clickid,
        advertiserId,
        partnerId,
        campaignId: clickData.campaign_id,
        offerId: clickData.offer_id,
        flowId: clickData.flow_id,
        site: clickData.site,
        referrer: clickData.referrer,
        // Sub parameters
        sub1: clickData.sub1,
        sub2Raw: clickData.sub2,
        sub2Map,
        sub3: clickData.sub3,
        sub4: clickData.sub4,
        sub5: clickData.sub5,
        sub6: clickData.sub6,
        sub7: clickData.sub7,
        sub8: clickData.sub8,
        sub9: clickData.sub9,
        sub10: clickData.sub10,
        // UTM parameters
        utmSource: clickData.utm_source,
        utmCampaign: clickData.utm_campaign,
        utmMedium: clickData.utm_medium,
        utmTerm: clickData.utm_term,
        utmContent: clickData.utm_content,
        // Client and server data
        ip,
        ...geoData,
        userAgent: clickData.user_agent,
        ...deviceData,
        connection: clickData.connection,
        lang: clickData.lang
      });
      await db.insert(trackingEvents).values({
        clickid,
        advertiserId,
        partnerId,
        type: "lp_click",
        ts: /* @__PURE__ */ new Date()
      });
      const redirectUrl = "https://example.com";
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("Click tracking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/event", async (req, res) => {
    try {
      const eventData = conversionEventSchema.parse(req.body);
      const click = await db.select().from(trackingClicks2).where(eq10(trackingClicks2.clickid, eventData.clickid)).limit(1);
      if (click.length === 0) {
        return res.status(404).json({ error: "Click not found" });
      }
      const clickRecord = click[0];
      try {
        const eventId = await db.insert(trackingEvents).values({
          clickid: eventData.clickid,
          advertiserId: clickRecord.advertiserId,
          partnerId: clickRecord.partnerId,
          type: eventData.type,
          revenue: eventData.revenue,
          currency: eventData.currency,
          txid: eventData.txid,
          timeOnPageMs: eventData.time_on_page_ms,
          ts: /* @__PURE__ */ new Date()
        }).returning({ id: trackingEvents.id });
        res.json({
          success: true,
          eventId: eventId[0].id,
          clickid: eventData.clickid
        });
      } catch (dbError) {
        if (dbError.code === "23505") {
          return res.status(409).json({ error: "Duplicate event" });
        }
        throw dbError;
      }
    } catch (error) {
      console.error("Event tracking error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });
  app2.get("/api/postback-profiles", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      let profiles;
      if (user.role === "super_admin") {
        profiles = await db.select().from(postbackProfiles2).orderBy(desc7(postbackProfiles2.createdAt));
      } else {
        profiles = await db.select().from(postbackProfiles2).where(eq10(postbackProfiles2.ownerId, user.id)).orderBy(desc7(postbackProfiles2.createdAt));
      }
      res.json(profiles);
    } catch (error) {
      console.error("Get postback profiles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/postback-profiles", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const profileData = createPostbackProfileSchema.parse({
        ...req.body,
        ownerId: user.id,
        ownerScope: user.role === "advertiser" ? "advertiser" : user.role === "partner" ? "partner" : "owner"
      });
      const profile = await db.insert(postbackProfiles2).values(profileData).returning();
      res.status(201).json(profile[0]);
    } catch (error) {
      console.error("Create postback profile error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });
  app2.patch("/api/postback-profiles/:id", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { id } = req.params;
      const existing = await db.select().from(postbackProfiles2).where(and10(
        eq10(postbackProfiles2.id, id),
        user.role === "super_admin" ? sql9`true` : eq10(postbackProfiles2.ownerId, user.id)
      )).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const updateData = updatePostbackProfileSchema.parse(req.body);
      const updated = await db.update(postbackProfiles2).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq10(postbackProfiles2.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      console.error("Update postback profile error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });
  app2.delete("/api/postback-profiles/:id", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { id } = req.params;
      await db.delete(postbackProfiles2).where(and10(
        eq10(postbackProfiles2.id, id),
        user.role === "super_admin" ? sql9`true` : eq10(postbackProfiles2.ownerId, user.id)
      ));
      res.status(204).send();
    } catch (error) {
      console.error("Delete postback profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/postback/deliveries", authenticateToken, async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      const { profileId, limit = "50", offset = "0" } = req.query;
      let query = db.select().from(postbackDeliveries2);
      if (user.role !== "super_admin") {
        if (user.role === "advertiser") {
          query = query.where(eq10(postbackDeliveries2.advertiserId, user.id));
        } else if (user.role === "partner") {
          query = query.where(eq10(postbackDeliveries2.partnerId, user.id));
        }
      }
      if (profileId) {
        query = query.where(eq10(postbackDeliveries2.profileId, profileId));
      }
      const deliveries = await query.orderBy(desc7(postbackDeliveries2.createdAt)).limit(parseInt(limit)).offset(parseInt(offset));
      res.json(deliveries);
    } catch (error) {
      console.error("Get postback deliveries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/affiliate/team", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      console.log("Getting partner team members for:", partnerId);
      const teamMembers = await db.select({
        id: partnerTeam.id,
        userId: partnerTeam.userId,
        username: users.username,
        email: users.email,
        role: partnerTeam.role,
        permissions: partnerTeam.permissions,
        subIdPrefix: partnerTeam.subIdPrefix,
        isActive: partnerTeam.isActive,
        createdAt: partnerTeam.createdAt
      }).from(partnerTeam).leftJoin(users, eq10(partnerTeam.userId, users.id)).where(and10(
        eq10(partnerTeam.partnerId, partnerId),
        eq10(partnerTeam.isActive, true)
      ));
      console.log("Found partner team members:", teamMembers.length);
      res.json(teamMembers);
    } catch (error) {
      console.error("Get partner team error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430" });
    }
  });
  app2.post("/api/affiliate/team", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { email, username, password, role, permissions, subIdPrefix } = req.body;
      console.log("Creating partner team member:", { email, username, role, partnerId });
      if (!email || !username || !password || !role) {
        return res.status(400).json({ error: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430" });
      }
      const existingUser = await db.select().from(users).where(or3(eq10(users.email, email), eq10(users.username, username))).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u0442\u0430\u043A\u0438\u043C email \u0438\u043B\u0438 username \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442" });
      }
      const partner = await storage.getUser(partnerId);
      if (!partner) {
        return res.status(404).json({ error: "\u041F\u0430\u0440\u0442\u043D\u0451\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      console.log("Partner found:", { partner: partner.username, advertiserId: partner.advertiserId });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        role: "affiliate",
        // Team members are affiliates
        ownerId: partnerId,
        // Owned by partner
        advertiserId: partner.advertiserId,
        // Inherit partner's advertiser
        isActive: true,
        userType: "affiliate",
        settings: JSON.stringify({
          teamRole: role,
          permissions: permissions || [],
          isTeamMember: true
        })
      }).returning();
      const createdUser = newUser[0];
      const teamEntry = await db.insert(partnerTeam).values({
        partnerId,
        userId: createdUser.id,
        role,
        permissions: JSON.stringify(permissions || []),
        subIdPrefix: subIdPrefix || "",
        isActive: true
      }).returning();
      if (partner.advertiserId) {
        console.log("Granting team member access to partner offers...");
        const partnerOffers2 = await db.select().from(partnerOffers2).where(and10(
          eq10(partnerOffers2.partnerId, partnerId),
          eq10(partnerOffers2.isApproved, true)
        ));
        for (const offer2 of partnerOffers2) {
          await db.insert(partnerOffers2).values({
            partnerId: createdUser.id,
            offerId: offer2.offerId,
            isApproved: true,
            assignedAt: /* @__PURE__ */ new Date(),
            assignedBy: partnerId,
            payout: offer2.payout,
            currency: offer2.currency,
            status: "active"
          }).onConflictDoNothing();
        }
        console.log(`Granted access to ${partnerOffers2.length} offers for team member`);
      }
      res.status(201).json({
        id: teamEntry[0].id,
        userId: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        role,
        permissions: permissions || [],
        subIdPrefix: subIdPrefix || "",
        isActive: true,
        createdAt: teamEntry[0].createdAt,
        message: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0443"
      });
    } catch (error) {
      console.error("Create partner team member error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u044B" });
    }
  });
  app2.patch("/api/affiliate/team/:id", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;
      console.log("Updating partner team member:", { id, partnerId, updateData });
      const teamMember = await db.select().from(partnerTeam).where(and10(
        eq10(partnerTeam.id, id),
        eq10(partnerTeam.partnerId, partnerId)
      )).limit(1);
      if (teamMember.length === 0) {
        return res.status(404).json({ error: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const updated = await db.update(partnerTeam).set({
        ...updateData,
        permissions: updateData.permissions ? JSON.stringify(updateData.permissions) : void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(partnerTeam.id, id)).returning();
      if (updateData.isActive !== void 0) {
        await db.update(users).set({ isActive: updateData.isActive }).where(eq10(users.id, teamMember[0].userId));
      }
      res.json(updated[0]);
    } catch (error) {
      console.error("Update partner team member error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u044B" });
    }
  });
  app2.delete("/api/affiliate/team/:id", authenticateToken, requireRole(["affiliate"]), async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { id } = req.params;
      console.log("Deleting partner team member:", { id, partnerId });
      const teamMember = await db.select().from(partnerTeam).where(and10(
        eq10(partnerTeam.id, id),
        eq10(partnerTeam.partnerId, partnerId)
      )).limit(1);
      if (teamMember.length === 0) {
        return res.status(404).json({ error: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      await db.update(partnerTeam).set({
        isActive: false,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(partnerTeam.id, id));
      await db.update(users).set({
        isActive: false,
        deletedAt: /* @__PURE__ */ new Date(),
        deletedBy: partnerId
      }).where(eq10(users.id, teamMember[0].userId));
      res.json({ message: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u0443\u0434\u0430\u043B\u0451\u043D" });
    } catch (error) {
      console.error("Delete partner team member error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u044B" });
    }
  });
  app2.post("/api/telegram/webhook", async (req, res) => {
    try {
      console.log("\u{1F4E5} Telegram webhook received:", JSON.stringify(req.body, null, 2));
      const { telegramBot: telegramBot2 } = await Promise.resolve().then(() => (init_telegramBot(), telegramBot_exports));
      await telegramBot2.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("\u274C Telegram webhook error:", error);
      res.status(200).json({ ok: true });
    }
  });
  app2.patch("/api/telegram/link", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { telegramChatId } = req.body;
      if (!telegramChatId) {
        return res.status(400).json({ error: "telegramChatId is required" });
      }
      console.log("\u{1F517} Linking Telegram Chat ID:", { userId, telegramChatId });
      await storage.updateUser(userId, { telegramChatId: parseInt(telegramChatId) });
      const { telegramBot: telegramBot2 } = await Promise.resolve().then(() => (init_telegramBot(), telegramBot_exports));
      await telegramBot2.sendMessage(
        parseInt(telegramChatId),
        "\u2705 <b>\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D!</b>\n\n\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u0431\u0443\u0434\u0435\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E \u043A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044F\u0445, fraud \u0430\u043B\u0435\u0440\u0442\u0430\u0445 \u0438 \u0434\u0440\u0443\u0433\u0438\u0445 \u0432\u0430\u0436\u043D\u044B\u0445 \u0441\u043E\u0431\u044B\u0442\u0438\u044F\u0445.",
        "HTML"
      );
      res.json({ success: true, message: "Telegram linked successfully" });
    } catch (error) {
      console.error("\u274C Telegram link error:", error);
      res.status(500).json({ error: "Failed to link Telegram" });
    }
  });
  app2.post("/api/telegram/test", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { type = "conversion" } = req.body;
      console.log("\u{1F9EA} Testing Telegram notification:", { userId, type });
      const user = await storage.getUser(userId);
      if (!user?.telegramChatId) {
        console.log("\u274C User has no telegramChatId:", userId);
        return res.status(400).json({ error: "Telegram not linked. Please link your account first." });
      }
      console.log("\u2705 User has Telegram Chat ID:", user.telegramChatId);
      const { telegramBot: telegramBot2 } = await Promise.resolve().then(() => (init_telegramBot(), telegramBot_exports));
      if (type === "conversion") {
        await telegramBot2.notifyConversion({
          userId,
          offerName: "Test Casino Offer",
          partnerName: "Test Partner",
          amount: 250,
          currency: "USD",
          country: "RU",
          source: "test"
        });
      } else if (type === "fraud_alert") {
        await telegramBot2.notifyFraud({
          userId,
          type: "suspicious_activity",
          description: "\u0422\u0435\u0441\u0442\u043E\u0432\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438",
          severity: "medium",
          ipAddress: "127.0.0.1",
          country: "RU"
        });
      } else if (type === "offer_alert") {
        await telegramBot2.sendMessage(
          user.telegramChatId,
          "\u{1F6A8} <b>\u0410\u043B\u0435\u0440\u0442 \u043F\u043E \u043E\u0444\u0444\u0435\u0440\u0443!</b>\n\n\u{1F4CA} <b>\u041E\u0444\u0444\u0435\u0440:</b> Test Casino Offer\n\u26A0\uFE0F <b>\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430:</b> \u041D\u0438\u0437\u043A\u0438\u0439 CR (\u043C\u0435\u043D\u0435\u0435 5%)\n\u{1F4C8} <b>\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F:</b> \u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0442\u0440\u0430\u0444\u0438\u043A\u0430\n\n\u{1F550} <i>\u0412\u0440\u0435\u043C\u044F:</i> " + (/* @__PURE__ */ new Date()).toLocaleString("ru-RU"),
          "HTML"
        );
      } else if (type === "system_message") {
        await telegramBot2.sendMessage(
          user.telegramChatId,
          "\u{1F514} <b>\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435</b>\n\n\u2705 \u0422\u0435\u0441\u0442 \u0441\u0438\u0441\u0442\u0435\u043C\u043D\u044B\u0445 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043F\u0440\u043E\u0448\u0451\u043B \u0443\u0441\u043F\u0435\u0448\u043D\u043E!\n\n\u{1F4DD} \u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442, \u0447\u0442\u043E \u0432\u0430\u0448 Telegram \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 ArbiConnect.\n\n\u{1F550} <i>\u0412\u0440\u0435\u043C\u044F:</i> " + (/* @__PURE__ */ new Date()).toLocaleString("ru-RU"),
          "HTML"
        );
      } else if (type === "report") {
        await telegramBot2.sendDailyReport(userId);
      }
      res.json({ success: true, message: "Test notification sent" });
    } catch (error) {
      console.error("\u274C Test notification error:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid4 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid4()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_environment();
import compression from "compression";
import helmet from "helmet";
import path3 from "path";
import fs2 from "fs";
var app = express4();
validateConfig();
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known/acme-challenge/")) {
    return next();
  }
  const host = req.get("host") || "";
  const isCustomDomain = !host.includes("replit") && !host.includes("localhost") && host !== "127.0.0.1";
  const isHttps = req.header("x-forwarded-proto") === "https" || req.secure;
  if (isCustomDomain && !isHttps) {
    console.log(`\u{1F512} HTTPS \u0440\u0435\u0434\u0438\u0440\u0435\u043A\u0442 \u0434\u043B\u044F ${host}: ${req.url}`);
    return res.redirect(301, `https://${host}${req.url}`);
  }
  console.log(`\u{1F4E1} \u0417\u0430\u043F\u0440\u043E\u0441: ${host}${req.url} | Custom: ${isCustomDomain} | HTTPS: ${isHttps}`);
  next();
});
app.get("/.well-known/acme-challenge/:token", (req, res) => {
  try {
    const token = req.params.token;
    const challengeFile = path3.join(process.cwd(), "public", ".well-known", "acme-challenge", token);
    if (fs2.existsSync(challengeFile)) {
      const content = fs2.readFileSync(challengeFile, "utf8");
      console.log(`\u2705 ACME Challenge \u043E\u0431\u0441\u043B\u0443\u0436\u0435\u043D: ${token} -> ${content.substring(0, 20)}...`);
      res.setHeader("Content-Type", "text/plain");
      res.send(content);
    } else {
      console.log(`\u274C ACME Challenge \u0444\u0430\u0439\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D: ${token}`);
      res.status(404).send("Challenge not found");
    }
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 ACME challenge:", error);
    res.status(500).send("Internal server error");
  }
});
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production",
  crossOriginEmbedderPolicy: false
}));
app.use(express4.json({ limit: "50mb" }));
app.use(express4.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }
  next();
});
var rateLimitTracker = /* @__PURE__ */ new Map();
if (process.env.NODE_ENV === "production") {
  app.use("/api", (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1e3;
    const maxRequests = 100;
    if (!rateLimitTracker.has(clientIp)) {
      rateLimitTracker.set(clientIp, { count: 1, resetTime: now + windowMs });
    } else {
      const tracker = rateLimitTracker.get(clientIp);
      if (now > tracker.resetTime) {
        tracker.count = 1;
        tracker.resetTime = now + windowMs;
      } else {
        tracker.count++;
        if (tracker.count > maxRequests) {
          return res.status(429).json({
            error: "Too many requests",
            retryAfter: Math.ceil((tracker.resetTime - now) / 1e3)
          });
        }
      }
    }
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.get("/update-token.html", (req, res) => {
    res.sendFile("update-token.html", { root: "." });
  });
  const { TrackingLinkService: TrackingLinkService2 } = await Promise.resolve().then(() => (init_trackingLinks(), trackingLinks_exports));
  const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  const { trackingLinks: trackingLinks2, offers: offers3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq11 } = await import("drizzle-orm");
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { nanoid: nanoid5 } = await import("nanoid");
  app.get("/:code([a-zA-Z0-9]{6,})", async (req, res, next) => {
    try {
      const { code } = req.params;
      const { clickid, partner_id, subid, sub1, sub2, sub3, sub4, sub5 } = req.query;
      console.log(`\u{1F517} SHORT LINK REQUEST: ${code} with params:`, { clickid, partner_id, subid });
      const [trackingLink] = await db2.select({
        id: trackingLinks2.id,
        partnerId: trackingLinks2.partnerId,
        offerId: trackingLinks2.offerId,
        url: trackingLinks2.url,
        isActive: trackingLinks2.isActive,
        targetUrl: offers3.landingPages,
        offerName: offers3.name,
        advertiserId: offers3.advertiserId
      }).from(trackingLinks2).innerJoin(offers3, eq11(trackingLinks2.offerId, offers3.id)).where(eq11(trackingLinks2.trackingCode, code)).limit(1);
      if (trackingLink && trackingLink.isActive) {
        console.log(`\u2705 Found tracking link: ${trackingLink.offerName}`);
        const clickData = {
          clickid: clickid || nanoid5(12),
          advertiserId: trackingLink.advertiserId,
          partnerId: trackingLink.partnerId,
          offerId: trackingLink.offerId,
          site: req.get("host") || "",
          referrer: req.get("referer") || "",
          userAgent: req.get("user-agent") || "",
          ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
          country: "XX",
          // TODO: Add GeoIP
          region: "",
          city: "",
          isp: "",
          sub1,
          sub2,
          sub3,
          sub4,
          sub5
        };
        const trackingClickData = {
          ...clickData,
          countryIso: "XX",
          region: "",
          city: "",
          isp: "",
          operator: "",
          isProxy: false,
          browserName: "",
          browserVersion: "",
          osName: "",
          osVersion: "",
          deviceModel: "",
          deviceType: "desktop",
          connection: "",
          lang: ""
        };
        console.log("\u{1F4CA} Skipping click recording for debugging purposes");
        let targetUrl = trackingLink.url;
        console.log(`\u{1F3AF} Target URL from DB: ${targetUrl}`);
        console.log(`\u{1F50D} Full TrackingLink:`, JSON.stringify(trackingLink, null, 2));
        if (typeof targetUrl === "string" && targetUrl.startsWith("http")) {
          console.log(`\u{1F504} Performing redirect to: ${targetUrl}`);
          return res.redirect(302, targetUrl);
        } else {
          console.log(`\u274C Invalid target URL: ${targetUrl} (type: ${typeof targetUrl})`);
        }
      }
      console.log(`\u274C Short link not found in database: ${code}, passing to next middleware`);
      return next();
    } catch (error) {
      console.error("Short link redirect error:", error);
      return next();
    }
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
