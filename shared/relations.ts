import { relations } from "drizzle-orm";

// Import all tables from their respective modules
import { users, teamInvitations, userProfiles, apiKeys, userSessions, auditLogs } from "./user-tables";
import { offers, offerDomains, partnerOffers, offerAccessRequests, creativeFiles, creativeSets, creativeSetFiles, customDomains } from "./offer-tables";
import { trackingLinks, trackingClicks, statistics, dailyStatistics, hourlyStatistics, events, clicks, conversionData } from "./tracking-tables";
import { transactions, deposits, payouts, cryptoWallets, cryptoTransactions, financialTransactions, referralCommissions, partnerRatings } from "./financial-tables";
import { tickets, ticketMessages, postbacks, postbackLogs, fraudAlerts, complianceRules, systemNotifications, systemSettings, fraudReports, ipAnalysis, fraudBlocks, userNotifications, postbackTemplates, customRoles, userRoleAssignments } from "./system-tables";

// User Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  // User-related relations
  profile: one(userProfiles),
  sessions: many(userSessions),
  apiKeys: many(apiKeys),
  teamInvitations: many(teamInvitations),
  
  // Offer-related relations
  offers: many(offers),
  partnerOffers: many(partnerOffers),
  offerAccessRequests: many(offerAccessRequests),
  
  // Tracking relations
  trackingLinks: many(trackingLinks),
  statistics: many(statistics),
  
  // Financial relations
  transactions: many(transactions),
  deposits: many(deposits),
  payouts: many(payouts),
  cryptoWallets: many(cryptoWallets),
  cryptoTransactions: many(cryptoTransactions),
  financialTransactions: many(financialTransactions),
  referralCommissions: many(referralCommissions),
  partnerRatings: many(partnerRatings),
  
  // System relations
  postbacks: many(postbacks),
  tickets: many(tickets),
  assignedTickets: many(tickets, { relationName: 'assignedTickets' }),
  fraudAlerts: many(fraudAlerts),
  notifications: many(systemNotifications),
  auditLogs: many(auditLogs),
}));

// User Profile Relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Team Invitation Relations
export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  invitedBy: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
  }),
}));

// API Key Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

// User Session Relations
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Audit Logs Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Offer Relations
export const offersRelations = relations(offers, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [offers.advertiserId],
    references: [users.id],
  }),
  domains: many(offerDomains),
  partnerOffers: many(partnerOffers),
  accessRequests: many(offerAccessRequests),
  trackingLinks: many(trackingLinks),
  statistics: many(statistics),
  fraudAlerts: many(fraudAlerts),
  complianceRules: many(complianceRules),
  creativeFiles: many(creativeFiles),
  creativeSets: many(creativeSets),
  financialTransactions: many(financialTransactions),
}));

// Offer Domains Relations
export const offerDomainsRelations = relations(offerDomains, ({ one }) => ({
  offer: one(offers, {
    fields: [offerDomains.offerId],
    references: [offers.id],
  }),
}));

// Partner Offers Relations
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

// Offer Access Requests Relations
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
  reviewer: one(users, {
    fields: [offerAccessRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewerRequests'
  }),
}));

// Creative Files Relations
export const creativeFilesRelations = relations(creativeFiles, ({ one, many }) => ({
  offer: one(offers, {
    fields: [creativeFiles.offerId],
    references: [offers.id],
  }),
  creativeSetFiles: many(creativeSetFiles),
}));

// Creative Sets Relations
export const creativeSetsRelations = relations(creativeSets, ({ one, many }) => ({
  offer: one(offers, {
    fields: [creativeSets.offerId],
    references: [offers.id],
  }),
  files: many(creativeSetFiles),
}));

// Creative Set Files Relations
export const creativeSetFilesRelations = relations(creativeSetFiles, ({ one }) => ({
  set: one(creativeSets, {
    fields: [creativeSetFiles.setId],
    references: [creativeSets.id],
  }),
  file: one(creativeFiles, {
    fields: [creativeSetFiles.fileId],
    references: [creativeFiles.id],
  }),
}));

// Tracking Links Relations
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
  clicks: many(clicks),
}));

// Statistics Relations
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

// Transactions Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Deposits Relations
export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [deposits.processedBy],
    references: [users.id],
    relationName: 'processedDeposits'
  }),
}));

// Payouts Relations
export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [payouts.processedBy],
    references: [users.id],
    relationName: 'processedPayouts'
  }),
}));

// Crypto Wallets Relations
export const cryptoWalletsRelations = relations(cryptoWallets, ({ one, many }) => ({
  user: one(users, {
    fields: [cryptoWallets.userId],
    references: [users.id],
  }),
  transactions: many(cryptoTransactions),
}));

// Crypto Transactions Relations
export const cryptoTransactionsRelations = relations(cryptoTransactions, ({ one }) => ({
  user: one(users, {
    fields: [cryptoTransactions.userId],
    references: [users.id],
  }),
  wallet: one(cryptoWallets, {
    fields: [cryptoTransactions.walletId],
    references: [cryptoWallets.id],
  }),
}));

// Financial Transactions Relations
export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  advertiser: one(users, {
    fields: [financialTransactions.advertiserId],
    references: [users.id],
    relationName: 'advertiserTransactions'
  }),
  partner: one(users, {
    fields: [financialTransactions.partnerId],
    references: [users.id],
    relationName: 'partnerTransactions'
  }),
  offer: one(offers, {
    fields: [financialTransactions.offerId],
    references: [offers.id],
  }),
  processedBy: one(users, {
    fields: [financialTransactions.processedBy],
    references: [users.id],
    relationName: 'processedFinancialTransactions'
  }),
}));

// Referral Commissions Relations
export const referralCommissionsRelations = relations(referralCommissions, ({ one }) => ({
  referrer: one(users, {
    fields: [referralCommissions.referrerId],
    references: [users.id],
    relationName: 'referrerCommissions'
  }),
  referredUser: one(users, {
    fields: [referralCommissions.referredUserId],
    references: [users.id],
    relationName: 'referredUserCommissions'
  }),
}));

// Partner Ratings Relations
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

// Postbacks Relations
export const postbacksRelations = relations(postbacks, ({ one, many }) => ({
  user: one(users, {
    fields: [postbacks.userId],
    references: [users.id],
  }),
  logs: many(postbackLogs),
}));

// Postback Logs Relations
export const postbackLogsRelations = relations(postbackLogs, ({ one }) => ({
  postback: one(postbacks, {
    fields: [postbackLogs.postbackId],
    references: [postbacks.id],
  }),
}));

// Tickets Relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: 'assignedTickets'
  }),
  closedBy: one(users, {
    fields: [tickets.closedBy],
    references: [users.id],
    relationName: 'closedTickets'
  }),
  lastReplyBy: one(users, {
    fields: [tickets.lastReplyBy],
    references: [users.id],
    relationName: 'lastRepliedTickets'
  }),
  messages: many(ticketMessages),
}));

// Ticket Messages Relations
export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id],
  }),
}));

// Fraud Alerts Relations
export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [fraudAlerts.offerId],
    references: [offers.id],
  }),
  investigatedBy: one(users, {
    fields: [fraudAlerts.investigatedBy],
    references: [users.id],
    relationName: 'investigatedAlerts'
  }),
}));

// Compliance Rules Relations
export const complianceRulesRelations = relations(complianceRules, ({ one }) => ({
  offer: one(offers, {
    fields: [complianceRules.offerId],
    references: [offers.id],
  }),
  advertiser: one(users, {
    fields: [complianceRules.advertiserId],
    references: [users.id],
  }),
}));

// System Notifications Relations
export const systemNotificationsRelations = relations(systemNotifications, ({ one }) => ({
  user: one(users, {
    fields: [systemNotifications.userId],
    references: [users.id],
  }),
}));

// System Settings Relations (no relations needed as it's standalone)

// Events Relations (for tracking events)
export const eventsRelations = relations(events, ({ one }) => ({
  partner: one(users, {
    fields: [events.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [events.offerId],
    references: [offers.id],
  }),
}));

// Clicks Relations (legacy table)
export const clicksRelations = relations(clicks, ({ one }) => ({
  partner: one(users, {
    fields: [clicks.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [clicks.offerId],
    references: [offers.id],
  }),
  trackingLink: one(trackingLinks, {
    fields: [clicks.trackingLinkId],
    references: [trackingLinks.id],
  }),
}));

// Conversion Data Relations
export const conversionDataRelations = relations(conversionData, ({ one }) => ({
  advertiser: one(users, {
    fields: [conversionData.advertiserId],
    references: [users.id],
  }),
  partner: one(users, {
    fields: [conversionData.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [conversionData.offerId],
    references: [offers.id],
  }),
}));

// Fraud Reports Relations
export const fraudReportsRelations = relations(fraudReports, ({ one }) => ({
  offer: one(offers, {
    fields: [fraudReports.offerId],
    references: [offers.id],
  }),
  partner: one(users, {
    fields: [fraudReports.partnerId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [fraudReports.reviewedBy],
    references: [users.id],
    relationName: 'reviewedFraudReports'
  }),
}));

// Fraud Blocks Relations
export const fraudBlocksRelations = relations(fraudBlocks, ({ one }) => ({
  report: one(fraudReports, {
    fields: [fraudBlocks.reportId],
    references: [fraudReports.id],
  }),
  blockedBy: one(users, {
    fields: [fraudBlocks.blockedBy],
    references: [users.id],
    relationName: 'blockedFraud'
  }),
}));

// User Notifications Relations
export const userNotificationsRelations = relations(userNotifications, ({ one }) => ({
  user: one(users, {
    fields: [userNotifications.userId],
    references: [users.id],
  }),
}));

// Custom Domains Relations
export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  advertiser: one(users, {
    fields: [customDomains.advertiserId],
    references: [users.id],
  }),
}));

// Postback Templates Relations
export const postbackTemplatesRelations = relations(postbackTemplates, ({ one }) => ({
  offer: one(offers, {
    fields: [postbackTemplates.offerId],
    references: [offers.id],
  }),
  advertiser: one(users, {
    fields: [postbackTemplates.advertiserId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [postbackTemplates.createdBy],
    references: [users.id],
    relationName: 'createdPostbackTemplates'
  }),
}));

// Custom Roles Relations
export const customRolesRelations = relations(customRoles, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [customRoles.advertiserId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [customRoles.createdBy],
    references: [users.id],
    relationName: 'createdRoles'
  }),
  assignments: many(userRoleAssignments),
}));

// User Role Assignments Relations
export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userRoleAssignments.userId],
    references: [users.id],
  }),
  role: one(customRoles, {
    fields: [userRoleAssignments.customRoleId],
    references: [customRoles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoleAssignments.assignedBy],
    references: [users.id],
    relationName: 'assignedRoles'
  }),
}));