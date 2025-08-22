import { z } from "zod";

// Import tables for type inference
import { 
  users, userProfiles, teamInvitations, apiKeys, userSessions, auditLogs 
} from "./user-tables";
import { 
  offers, offerDomains, partnerOffers, offerAccessRequests, 
  creativeFiles, creativeSets, creativeSetFiles 
} from "./offer-tables";
import { 
  trackingLinks, trackingClicks, statistics, events, clicks 
} from "./tracking-tables";
import { 
  transactions, deposits, payouts, cryptoWallets, cryptoTransactions, 
  financialTransactions, referralCommissions, partnerRatings 
} from "./financial-tables";
import { 
  tickets, ticketMessages, postbacks, postbackLogs, fraudAlerts, 
  complianceRules, systemNotifications, systemSettings 
} from "./system-tables";
import {
  creatives, offerLogs, offerCategories, moderationTemplates, whiteLabels,
  staffMembers, kycDocuments, receivedOffers, abTestGroups, loginLogs,
  financialSummaries, payoutRequests
} from "./admin-tables";
import {
  fraudRules, deviceTracking, globalPostbacks, postbackDeliveryLogs,
  webhooks, blacklist, platformCommissions, partnerTeam, trafficSources,
  conversions, enhancedPostbackProfiles, analyticsData, passwordResetTokens,
  userAnalytics, apiTokens
} from "./advanced-tables";

// Import validation schemas for inferred types
import {
  insertUserSchema, insertUserProfileSchema, insertTeamInvitationSchema,
  insertApiKeySchema, insertUserSessionSchema, insertAuditLogSchema,
  insertOfferSchema, insertOfferDomainSchema, insertPartnerOfferSchema,
  insertOfferAccessRequestSchema, insertCreativeFileSchema, insertCreativeSetSchema,
  insertCreativeSetFileSchema, insertTrackingLinkSchema, insertTrackingClickSchema,
  insertStatisticSchema, insertEventSchema, insertClickSchema,
  insertTransactionSchema, insertDepositSchema, insertPayoutSchema,
  insertCryptoWalletSchema, insertCryptoTransactionSchema, insertFinancialTransactionSchema,
  insertReferralCommissionSchema, insertPartnerRatingSchema, insertTicketSchema,
  insertTicketMessageSchema, insertPostbackSchema, insertPostbackLogSchema,
  insertFraudAlertSchema, insertComplianceRuleSchema, insertSystemNotificationSchema,
  insertSystemSettingSchema, insertCreativeSchema, insertOfferLogSchema,
  insertOfferCategorySchema, insertModerationTemplateSchema, insertWhiteLabelSchema,
  insertStaffMemberSchema, insertKycDocumentSchema, insertReceivedOfferSchema,
  insertAbTestGroupSchema, insertLoginLogSchema, insertFinancialSummarySchema,
  insertPayoutRequestSchema, insertFraudRuleSchema, insertDeviceTrackingSchema,
  insertGlobalPostbackSchema, insertPostbackDeliveryLogSchema, insertWebhookSchema,
  insertBlacklistSchema, insertPlatformCommissionSchema, insertPartnerTeamSchema,
  insertTrafficSourceSchema, insertConversionSchema, insertEnhancedPostbackProfileSchema,
  insertAnalyticsDataSchema, insertPasswordResetTokenSchema, insertUserAnalyticsSchema,
  insertApiTokenSchema
} from "./validation-schemas";

// User Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Offer Types
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type OfferDomain = typeof offerDomains.$inferSelect;
export type InsertOfferDomain = z.infer<typeof insertOfferDomainSchema>;

export type PartnerOffer = typeof partnerOffers.$inferSelect;
export type InsertPartnerOffer = z.infer<typeof insertPartnerOfferSchema>;

export type OfferAccessRequest = typeof offerAccessRequests.$inferSelect;
export type InsertOfferAccessRequest = z.infer<typeof insertOfferAccessRequestSchema>;

export type CreativeFile = typeof creativeFiles.$inferSelect;
export type InsertCreativeFile = z.infer<typeof insertCreativeFileSchema>;

export type CreativeSet = typeof creativeSets.$inferSelect;
export type InsertCreativeSet = z.infer<typeof insertCreativeSetSchema>;

export type CreativeSetFile = typeof creativeSetFiles.$inferSelect;
export type InsertCreativeSetFile = z.infer<typeof insertCreativeSetFileSchema>;

// Tracking Types
export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = z.infer<typeof insertTrackingLinkSchema>;

export type TrackingClick = typeof trackingClicks.$inferSelect;
export type InsertTrackingClick = z.infer<typeof insertTrackingClickSchema>;

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = z.infer<typeof insertStatisticSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Click = typeof clicks.$inferSelect;
export type InsertClick = z.infer<typeof insertClickSchema>;

// Financial Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;

export type ReferralCommission = typeof referralCommissions.$inferSelect;
export type InsertReferralCommission = z.infer<typeof insertReferralCommissionSchema>;

export type PartnerRating = typeof partnerRatings.$inferSelect;
export type InsertPartnerRating = z.infer<typeof insertPartnerRatingSchema>;

// System Types
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;

export type Postback = typeof postbacks.$inferSelect;
export type InsertPostback = z.infer<typeof insertPostbackSchema>;

export type PostbackLog = typeof postbackLogs.$inferSelect;
export type InsertPostbackLog = z.infer<typeof insertPostbackLogSchema>;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;

export type ComplianceRule = typeof complianceRules.$inferSelect;
export type InsertComplianceRule = z.infer<typeof insertComplianceRuleSchema>;

export type SystemNotification = typeof systemNotifications.$inferSelect;
export type InsertSystemNotification = z.infer<typeof insertSystemNotificationSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// Admin Types
export type Creative = typeof creatives.$inferSelect;
export type InsertCreative = z.infer<typeof insertCreativeSchema>;

export type OfferLog = typeof offerLogs.$inferSelect;
export type InsertOfferLog = z.infer<typeof insertOfferLogSchema>;

export type OfferCategory = typeof offerCategories.$inferSelect;
export type InsertOfferCategory = z.infer<typeof insertOfferCategorySchema>;

export type ModerationTemplate = typeof moderationTemplates.$inferSelect;
export type InsertModerationTemplate = z.infer<typeof insertModerationTemplateSchema>;

export type WhiteLabel = typeof whiteLabels.$inferSelect;
export type InsertWhiteLabel = z.infer<typeof insertWhiteLabelSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;

export type ReceivedOffer = typeof receivedOffers.$inferSelect;
export type InsertReceivedOffer = z.infer<typeof insertReceivedOfferSchema>;

export type AbTestGroup = typeof abTestGroups.$inferSelect;
export type InsertAbTestGroup = z.infer<typeof insertAbTestGroupSchema>;

export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = z.infer<typeof insertLoginLogSchema>;

export type FinancialSummary = typeof financialSummaries.$inferSelect;
export type InsertFinancialSummary = z.infer<typeof insertFinancialSummarySchema>;

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;

// Advanced Types
export type FraudRule = typeof fraudRules.$inferSelect;
export type InsertFraudRule = z.infer<typeof insertFraudRuleSchema>;

export type DeviceTracking = typeof deviceTracking.$inferSelect;
export type InsertDeviceTracking = z.infer<typeof insertDeviceTrackingSchema>;

export type GlobalPostback = typeof globalPostbacks.$inferSelect;
export type InsertGlobalPostback = z.infer<typeof insertGlobalPostbackSchema>;

export type PostbackDeliveryLog = typeof postbackDeliveryLogs.$inferSelect;
export type InsertPostbackDeliveryLog = z.infer<typeof insertPostbackDeliveryLogSchema>;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

export type Blacklist = typeof blacklist.$inferSelect;
export type InsertBlacklist = z.infer<typeof insertBlacklistSchema>;

export type PlatformCommission = typeof platformCommissions.$inferSelect;
export type InsertPlatformCommission = z.infer<typeof insertPlatformCommissionSchema>;

export type PartnerTeam = typeof partnerTeam.$inferSelect;
export type InsertPartnerTeam = z.infer<typeof insertPartnerTeamSchema>;

export type TrafficSource = typeof trafficSources.$inferSelect;
export type InsertTrafficSource = z.infer<typeof insertTrafficSourceSchema>;

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;

export type EnhancedPostbackProfile = typeof enhancedPostbackProfiles.$inferSelect;
export type InsertEnhancedPostbackProfile = z.infer<typeof insertEnhancedPostbackProfileSchema>;

export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;

export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;