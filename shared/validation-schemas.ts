import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import tables for schema creation
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

// User validation schemas
export const insertUserSchema = createInsertSchema(users);
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertTeamInvitationSchema = createInsertSchema(teamInvitations);
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertUserSessionSchema = createInsertSchema(userSessions);
export const insertAuditLogSchema = createInsertSchema(auditLogs);

// Offer validation schemas
export const insertOfferSchema = createInsertSchema(offers);
export const insertOfferDomainSchema = createInsertSchema(offerDomains);
export const insertPartnerOfferSchema = createInsertSchema(partnerOffers);
export const insertOfferAccessRequestSchema = createInsertSchema(offerAccessRequests);
export const insertCreativeFileSchema = createInsertSchema(creativeFiles);
export const insertCreativeSetSchema = createInsertSchema(creativeSets);
export const insertCreativeSetFileSchema = createInsertSchema(creativeSetFiles);

// Tracking validation schemas
export const insertTrackingLinkSchema = createInsertSchema(trackingLinks);
export const insertTrackingClickSchema = createInsertSchema(trackingClicks);
export const insertStatisticSchema = createInsertSchema(statistics);
export const insertEventSchema = createInsertSchema(events);
export const insertClickSchema = createInsertSchema(clicks);

// Financial validation schemas
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertDepositSchema = createInsertSchema(deposits);
export const insertPayoutSchema = createInsertSchema(payouts);
export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets);
export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions);
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions);
export const insertReferralCommissionSchema = createInsertSchema(referralCommissions);
export const insertPartnerRatingSchema = createInsertSchema(partnerRatings);

// System validation schemas
export const insertTicketSchema = createInsertSchema(tickets);
export const insertTicketMessageSchema = createInsertSchema(ticketMessages);
export const insertPostbackSchema = createInsertSchema(postbacks);
export const insertPostbackLogSchema = createInsertSchema(postbackLogs);
export const insertFraudAlertSchema = createInsertSchema(fraudAlerts);
export const insertComplianceRuleSchema = createInsertSchema(complianceRules);
export const insertSystemNotificationSchema = createInsertSchema(systemNotifications);
export const insertSystemSettingSchema = createInsertSchema(systemSettings);

// Admin validation schemas
export const insertCreativeSchema = createInsertSchema(creatives);
export const insertOfferLogSchema = createInsertSchema(offerLogs);
export const insertOfferCategorySchema = createInsertSchema(offerCategories);
export const insertModerationTemplateSchema = createInsertSchema(moderationTemplates);
export const insertWhiteLabelSchema = createInsertSchema(whiteLabels);
export const insertStaffMemberSchema = createInsertSchema(staffMembers);
export const insertKycDocumentSchema = createInsertSchema(kycDocuments);
export const insertReceivedOfferSchema = createInsertSchema(receivedOffers);
export const insertAbTestGroupSchema = createInsertSchema(abTestGroups);
export const insertLoginLogSchema = createInsertSchema(loginLogs);
export const insertFinancialSummarySchema = createInsertSchema(financialSummaries);
export const insertPayoutRequestSchema = createInsertSchema(payoutRequests);

// Advanced validation schemas
export const insertFraudRuleSchema = createInsertSchema(fraudRules);
export const insertDeviceTrackingSchema = createInsertSchema(deviceTracking);
export const insertGlobalPostbackSchema = createInsertSchema(globalPostbacks);
export const insertPostbackDeliveryLogSchema = createInsertSchema(postbackDeliveryLogs);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const insertBlacklistSchema = createInsertSchema(blacklist);
export const insertPlatformCommissionSchema = createInsertSchema(platformCommissions);
export const insertPartnerTeamSchema = createInsertSchema(partnerTeam);
export const insertTrafficSourceSchema = createInsertSchema(trafficSources);
export const insertConversionSchema = createInsertSchema(conversions);
export const insertEnhancedPostbackProfileSchema = createInsertSchema(enhancedPostbackProfiles);
export const insertAnalyticsDataSchema = createInsertSchema(analyticsData);
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics);
export const insertApiTokenSchema = createInsertSchema(apiTokens);