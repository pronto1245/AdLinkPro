// Main schema file - re-exports from modular schema files for backward compatibility
// This approach maintains all existing imports while improving organization and maintainability

// Import and re-export all enums, tables, relations, and types from modular schemas

// === USERS MODULE ===
export {
  // Enums
  userRoleEnum,
  auditActionEnum,
  // Tables
  users,
  teamInvitations,
  staffMembers,
  partnerTeam,
  customRoles,
  userRoleAssignments,
  userSessions,
  userNotifications,
  passwordResetTokens,
  userAnalytics,
  loginLogs,
  auditLogs,
  // Relations
  usersRelations,
  teamInvitationsRelations,
  staffMembersRelations,
  partnerTeamRelations,
  customRolesRelations,
  userRoleAssignmentsRelations,
  userSessionsRelations,
  userNotificationsRelations,
  passwordResetTokensRelations,
  loginLogsRelations,
  auditLogsRelations,
  // Schema validations
  insertUserSchema,
  insertTeamInvitationSchema,
  insertStaffMemberSchema,
  insertCustomRoleSchema,
  insertUserNotificationSchema,
  // Types
  User,
  InsertUser,
  TeamInvitation,
  InsertTeamInvitation,
  StaffMember,
  InsertStaffMember,
  CustomRole,
  InsertCustomRole,
  UserSession,
  UserNotification,
  InsertUserNotification,
  PasswordResetToken,
  LoginLog,
  AuditLog,
  UserAnalytics,
} from './users';

// === OFFERS MODULE ===
export {
  // Enums
  offerStatusEnum,
  accessRequestStatusEnum,
  // Tables
  offers,
  offerDomains,
  partnerOffers,
  offerAccessRequests,
  offerLogs,
  offerCategories,
  receivedOffers,
  partnerRatings,
  whiteLabels,
  // Relations
  offersRelations,
  offerDomainsRelations,
  partnerOffersRelations,
  offerAccessRequestsRelations,
  offerLogsRelations,
  offerCategoriesRelations,
  receivedOffersRelations,
  partnerRatingsRelations,
  whiteLabelsRelations,
  // Schema validations
  insertOfferSchema,
  insertOfferAccessRequestSchema,
  insertReceivedOfferSchema,
  insertPartnerRatingSchema,
  insertWhiteLabelSchema,
  // Types
  Offer,
  InsertOffer,
  OfferDomain,
  PartnerOffer,
  OfferAccessRequest,
  InsertOfferAccessRequest,
  OfferLog,
  OfferCategory,
  ReceivedOffer,
  InsertReceivedOffer,
  PartnerRating,
  InsertPartnerRating,
  WhiteLabel,
  InsertWhiteLabel,
} from './offers';

// === FINANCIAL MODULE ===
export {
  // Enums
  transactionStatusEnum,
  walletTypeEnum,
  cryptoCurrencyEnum,
  walletStatusEnum,
  // Tables
  transactions,
  deposits,
  payouts,
  cryptoWallets,
  cryptoTransactions,
  financialTransactions,
  financialSummaries,
  payoutRequests,
  platformCommissions,
  referralCommissions,
  // Relations
  transactionsRelations,
  depositsRelations,
  payoutsRelations,
  cryptoWalletsRelations,
  cryptoTransactionsRelations,
  financialTransactionsRelations,
  financialSummariesRelations,
  payoutRequestsRelations,
  platformCommissionsRelations,
  referralCommissionsRelations,
  // Schema validations
  insertTransactionSchema,
  insertDepositSchema,
  insertPayoutSchema,
  insertCryptoWalletSchema,
  insertPayoutRequestSchema,
  // Types
  Transaction,
  InsertTransaction,
  Deposit,
  InsertDeposit,
  Payout,
  InsertPayout,
  CryptoWallet,
  InsertCryptoWallet,
  CryptoTransaction,
  FinancialTransaction,
  FinancialSummary,
  PayoutRequest,
  InsertPayoutRequest,
  PlatformCommission,
  ReferralCommission,
} from './financial';

// === TRACKING MODULE ===
export {
  // Tables
  trackingLinks,
  trackingClicks,
  statistics,
  trafficSources,
  // Relations
  trackingLinksRelations,
  trackingClicksRelations,
  statisticsRelations,
  trafficSourcesRelations,
  // Schema validations
  insertTrackingLinkSchema,
  insertTrackingClickSchema,
  insertStatisticsSchema,
  insertTrafficSourceSchema,
  // Types
  TrackingLink,
  InsertTrackingLink,
  TrackingClick,
  InsertTrackingClick,
  Statistics,
  InsertStatistics,
  TrafficSource,
  InsertTrafficSource,
} from './tracking';

// === FRAUD MODULE ===
export {
  // Tables
  fraudAlerts,
  fraudReports,
  fraudRules,
  deviceTracking,
  ipAnalysis,
  fraudBlocks,
  // Relations
  fraudAlertsRelations,
  fraudReportsRelations,
  fraudRulesRelations,
  deviceTrackingRelations,
  fraudBlocksRelations,
  // Schema validations
  insertFraudAlertSchema,
  insertFraudReportSchema,
  insertFraudRuleSchema,
  insertDeviceTrackingSchema,
  insertIpAnalysisSchema,
  insertFraudBlockSchema,
  // Types
  FraudAlert,
  InsertFraudAlert,
  FraudReport,
  InsertFraudReport,
  FraudRule,
  InsertFraudRule,
  DeviceTracking,
  InsertDeviceTracking,
  IpAnalysis,
  InsertIpAnalysis,
  FraudBlock,
  InsertFraudBlock,
} from './fraud';

// === SYSTEM MODULE ===
export {
  // Enums
  domainStatusEnum,
  domainTypeEnum,
  // Tables
  apiKeys,
  apiTokens,
  webhooks,
  systemSettings,
  blacklist,
  customDomains,
  // Relations
  apiKeysRelations,
  apiTokensRelations,
  systemSettingsRelations,
  blacklistRelations,
  customDomainsRelations,
  // Schema validations
  insertApiKeySchema,
  insertApiTokenSchema,
  insertWebhookSchema,
  insertSystemSettingSchema,
  insertBlacklistSchema,
  insertCustomDomainSchema,
  // Types
  ApiKey,
  InsertApiKey,
  ApiToken,
  InsertApiToken,
  Webhook,
  InsertWebhook,
  SystemSetting,
  InsertSystemSetting,
  Blacklist,
  InsertBlacklist,
  CustomDomain,
  InsertCustomDomain,
} from './system';

// === ANALYTICS MODULE ===
export {
  // Enums
  eventTypeEnum,
  // Tables
  clicks,
  events,
  conversions,
  enhancedPostbackProfiles,
  analyticsData,
  conversionData,
  // Relations
  clicksRelations,
  eventsRelations,
  analyticsDataRelations,
  conversionDataRelations,
  // Schema validations
  insertClickSchema,
  insertEventSchema,
  insertConversionSchema,
  insertAnalyticsDataSchema,
  insertConversionDataSchema,
  // Types
  Click,
  InsertClick,
  Event,
  InsertEvent,
  Conversion,
  InsertConversion,
  EnhancedPostbackProfile,
  AnalyticsData,
  InsertAnalyticsData,
  ConversionData,
  InsertConversionData,
} from './analytics';

// === SUPPORT MODULE ===
export {
  // Enums
  ticketStatusEnum,
  // Tables
  tickets,
  moderationTemplates,
  creatives,
  // Relations
  ticketsRelations,
  creativesRelations,
  // Schema validations
  insertTicketSchema,
  insertModerationTemplateSchema,
  insertCreativeSchema,
  // Types
  Ticket,
  InsertTicket,
  ModerationTemplate,
  InsertModerationTemplate,
  Creative,
  InsertCreative,
} from './support';

// === COMPLIANCE MODULE ===
export {
  // Tables
  kycDocuments,
  abTestGroups,
  complianceRules,
  // Relations
  kycDocumentsRelations,
  complianceRulesRelations,
  // Schema validations
  insertKycDocumentSchema,
  insertAbTestGroupSchema,
  insertComplianceRuleSchema,
  // Types
  KycDocument,
  InsertKycDocument,
  AbTestGroup,
  InsertAbTestGroup,
  ComplianceRule,
  InsertComplianceRule,
} from './compliance';

// === EXTERNAL MODULES ===
// Import postback tables from dedicated schema to avoid duplication
export { postbackProfiles, postbackDeliveries } from './postback-schema';

// Import existing specialized schemas
export * from './tracking-events-schema';
export * from './creatives-schema';

// === REMAINING ENUMS ===
// Additional enums that may be used across modules
import { pgEnum } from "drizzle-orm/pg-core";

export const postbackStatusEnum = pgEnum('postback_status', ['pending', 'active', 'inactive', 'disabled']);
export const ownerScopeEnum = pgEnum('owner_scope', ['owner', 'advertiser', 'partner']);
export const postbackScopeTypeEnum = pgEnum('postback_scope_type', ['global', 'campaign', 'offer', 'flow']);
export const postbackMethodEnum = pgEnum('postback_method', ['GET', 'POST']);
export const postbackIdParamEnum = pgEnum('postback_id_param', ['subid', 'clickid']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'success', 'failed', 'retrying']);

// === REMAINING TABLES ===
// Tables that haven't been moved to modules yet (if any) would be defined here
// Currently, all major tables have been moved to appropriate modules