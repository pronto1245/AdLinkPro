import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";

// Financial-related enums
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);
export const walletTypeEnum = pgEnum('wallet_type', ['hot', 'cold', 'external']);
export const cryptoCurrencyEnum = pgEnum('crypto_currency', ['BTC', 'ETH', 'USDT', 'USDC', 'TRX', 'LTC']);
export const walletStatusEnum = pgEnum('wallet_status', ['active', 'inactive', 'suspended', 'locked']);

// Core transactions table
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

// Deposits table
export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  status: transactionStatusEnum("status").default('pending'),
  method: text("method").notNull(), // 'bank_transfer', 'crypto', 'card', 'manual'
  transactionId: text("transaction_id"), // External transaction ID
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payouts table  
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  status: transactionStatusEnum("status").default('pending'),
  method: text("method").notNull(), // 'bank_transfer', 'crypto', 'paypal', 'manual'
  walletAddress: text("wallet_address"), // For crypto payouts
  bankDetails: jsonb("bank_details"), // For bank transfer payouts
  transactionHash: text("transaction_hash"), // For crypto payouts
  notes: text("notes"),
  rejectionReason: text("rejection_reason"), // Reason for rejection
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Financial Transactions - Core finance table
export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  offerName: text("offer_name"), // Cached for performance
  partnerUsername: text("partner_username"), // Cached for performance
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  type: text("type").$type<'payout' | 'commission' | 'refund' | 'bonus' | 'adjustment'>().notNull(),
  status: text("status").$type<'completed' | 'pending' | 'cancelled' | 'failed'>().default('pending'),
  period: text("period"), // YYYY-MM format
  comment: text("comment"),
  paymentMethod: text("payment_method"), // 'bank', 'crypto', 'paypal', 'wise'
  txHash: text("tx_hash"), // For crypto transactions
  bankReference: text("bank_reference"), // For bank transfers
  details: jsonb("details"), // { leads: number, clicks: number, period: string }
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Summary Cache - Pre-computed metrics for performance
export const financialSummaries = pgTable("financial_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  periodDate: text("period_date").notNull(), // YYYY-MM-DD format
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default('0.00'),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default('0.00'),
  totalPayouts: decimal("total_payouts", { precision: 15, scale: 2 }).default('0.00'),
  pendingPayouts: decimal("pending_payouts", { precision: 15, scale: 2 }).default('0.00'),
  avgEPC: decimal("avg_epc", { precision: 10, scale: 4 }).default('0.0000'),
  avgCR: decimal("avg_cr", { precision: 10, scale: 4 }).default('0.0000'),
  avgPayout: decimal("avg_payout", { precision: 10, scale: 2 }).default('0.00'),
  totalTransactions: integer("total_transactions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout Requests - Detailed payout workflow
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  period: text("period").notNull(), // YYYY-MM format
  comment: text("comment"),
  paymentMethod: text("payment_method").notNull(),
  paymentDetails: jsonb("payment_details"), // Bank account, crypto wallet, etc.
  status: text("status").$type<'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'>().default('draft'),
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
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Referral commissions
export const referralCommissions = pgTable("referral_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // Партнер-реферер
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id), // Приглашенный пользователь
  transactionId: varchar("transaction_id"), // ID транзакции выплаты
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(), // Оригинальная сумма выплаты
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }).notNull(), // Размер комиссии
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Процент комиссии
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [deposits.processedBy],
    references: [users.id],
    relationName: 'depositProcessor'
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [payouts.processedBy],
    references: [users.id],
    relationName: 'payoutProcessor'
  }),
}));

export const cryptoWalletsRelations = relations(cryptoWallets, ({ one, many }) => ({
  user: one(users, {
    fields: [cryptoWallets.userId],
    references: [users.id],
  }),
  cryptoTransactions: many(cryptoTransactions),
}));

export const cryptoTransactionsRelations = relations(cryptoTransactions, ({ one }) => ({
  wallet: one(cryptoWallets, {
    fields: [cryptoTransactions.walletId],
    references: [cryptoWallets.id],
  }),
  transaction: one(transactions, {
    fields: [cryptoTransactions.transactionId],
    references: [transactions.id],
  }),
}));

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
    relationName: 'transactionProcessor'
  }),
}));

export const financialSummariesRelations = relations(financialSummaries, ({ one }) => ({
  advertiser: one(users, {
    fields: [financialSummaries.advertiserId],
    references: [users.id],
  }),
}));

export const payoutRequestsRelations = relations(payoutRequests, ({ one }) => ({
  advertiser: one(users, {
    fields: [payoutRequests.advertiserId],
    references: [users.id],
    relationName: 'advertiserPayoutRequests'
  }),
  partner: one(users, {
    fields: [payoutRequests.partnerId],
    references: [users.id],
    relationName: 'partnerPayoutRequests'
  }),
  approvedBy: one(users, {
    fields: [payoutRequests.approvedBy],
    references: [users.id],
    relationName: 'payoutApprover'
  }),
  processedBy: one(users, {
    fields: [payoutRequests.processedBy],
    references: [users.id],
    relationName: 'payoutRequestProcessor'
  }),
  transaction: one(financialTransactions, {
    fields: [payoutRequests.transactionId],
    references: [financialTransactions.id],
  }),
}));

export const platformCommissionsRelations = relations(platformCommissions, ({ one }) => ({
  advertiser: one(users, {
    fields: [platformCommissions.advertiserId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [platformCommissions.offerId],
    references: [offers.id],
  }),
}));

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

// Schema validations
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;
export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type FinancialSummary = typeof financialSummaries.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type PlatformCommission = typeof platformCommissions.$inferSelect;
export type ReferralCommission = typeof referralCommissions.$inferSelect;