// Re-export all enums
export * from "./enums";

// Re-export all tables
export * from "./user-tables";
export * from "./offer-tables";
export * from "./tracking-tables";
export * from "./financial-tables";
export * from "./system-tables";

// Re-export all relations
export * from "./relations";

// Re-export postback tables (keeping compatibility with existing imports)
export { postbackProfiles, postbackDeliveries } from './postback-schema';

// Re-export any Zod schemas and types from the original schema that might be used
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

// Zod validation schemas for common operations
export const insertUserSchema = createInsertSchema(users);

export const insertOfferSchema = createInsertSchema(offers);

export const insertTrackingLinkSchema = createInsertSchema(trackingLinks);

export const insertTransactionSchema = createInsertSchema(transactions);

export const insertTicketSchema = createInsertSchema(tickets);

export const insertPostbackSchema = createInsertSchema(postbacks);

// Event schemas
export const insertEventSchema = createInsertSchema(events);

// Deposits and Payouts schemas
export const insertDepositSchema = createInsertSchema(deposits);

export const insertPayoutSchema = createInsertSchema(payouts);

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

export type PartnerOffer = typeof partnerOffers.$inferSelect;
export type InsertPartnerOffer = typeof partnerOffers.$inferInsert;

export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = typeof trackingLinks.$inferInsert;

export type TrackingClick = typeof trackingClicks.$inferSelect;
export type InsertTrackingClick = typeof trackingClicks.$inferInsert;

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = typeof teamInvitations.$inferInsert;

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = typeof cryptoWallets.$inferInsert;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = typeof cryptoTransactions.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type Postback = typeof postbacks.$inferSelect;
export type InsertPostback = typeof postbacks.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = typeof fraudAlerts.$inferInsert;

export type CreativeFile = typeof creativeFiles.$inferSelect;
export type InsertCreativeFile = typeof creativeFiles.$inferInsert;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

export type ReferralCommission = typeof referralCommissions.$inferSelect;
export type InsertReferralCommission = typeof referralCommissions.$inferInsert;