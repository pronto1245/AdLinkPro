import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { transactionStatusEnum, walletTypeEnum, walletStatusEnum, cryptoCurrencyEnum } from "./enums";
import { users } from "./user-tables";
import { offers } from "./offer-tables";

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
  userId: varchar("user_id").references(() => users.id),
  walletId: varchar("wallet_id").references(() => cryptoWallets.id),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'internal_transfer'
  currency: cryptoCurrencyEnum("currency").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).default('0'),
  fromAddress: text("from_address"),
  toAddress: text("to_address").notNull(),
  txHash: text("tx_hash").unique(),
  blockHeight: integer("block_height"),
  confirmations: integer("confirmations").default(0),
  requiredConfirmations: integer("required_confirmations").default(1),
  status: transactionStatusEnum("status").default('pending'),
  network: text("network").notNull(),
  gasPrice: decimal("gas_price", { precision: 18, scale: 8 }),
  gasUsed: integer("gas_used"),
  memo: text("memo"), // For networks that support memos
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Financial Transactions - Core finance table
export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  offerName: text("offer_name"), // Cached for performance
  partnerUsername: text("partner_username"), // Cached for performance
  
  // Transaction details
  type: text("type").notNull(), // 'commission', 'bonus', 'penalty', 'adjustment', 'refund'
  subtype: text("subtype"), // More specific categorization
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  
  // Commission details
  conversionId: varchar("conversion_id"), // ID of the conversion that triggered this
  baseAmount: decimal("base_amount", { precision: 15, scale: 2 }), // Original conversion amount
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }), // Commission percentage (0.1500 = 15%)
  
  // Status and processing
  status: transactionStatusEnum("status").default('pending'),
  description: text("description"),
  notes: text("notes"), // Internal notes
  
  // Financial period and reporting
  accountingPeriod: text("accounting_period"), // YYYY-MM format
  reportingDate: timestamp("reporting_date"), // When this should appear in reports
  
  // Processing details
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  payoutBatchId: varchar("payout_batch_id"), // If included in a payout batch
  
  // Audit trail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral Commissions table for tracking partner referral earnings
export const referralCommissions = pgTable("referral_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // Partner-referrer
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id), // Invited user
  transactionId: varchar("transaction_id"), // ID of payout transaction
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(), // Original payout amount
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }).notNull(), // Commission amount
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Commission percentage
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Partner Ratings table for tracking partner performance
export const partnerRatings = pgTable("partner_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  
  // Performance metrics
  qualityScore: decimal("quality_score", { precision: 3, scale: 1 }).default('0.0'), // 0.0 - 10.0
  fraudScore: decimal("fraud_score", { precision: 3, scale: 1 }).default('0.0'), // 0.0 - 10.0
  reliabilityScore: decimal("reliability_score", { precision: 3, scale: 1 }).default('0.0'), // 0.0 - 10.0
  overallRating: decimal("overall_rating", { precision: 3, scale: 1 }).default('0.0'), // 0.0 - 10.0
  
  // Performance data
  totalConversions: integer("total_conversions").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default('0.00'),
  averageCR: decimal("average_cr", { precision: 5, scale: 2 }).default('0.00'),
  averageEPC: decimal("average_epc", { precision: 8, scale: 2 }).default('0.00'),
  
  // Fraud and quality indicators
  fraudIncidents: integer("fraud_incidents").default(0),
  chargebacks: integer("chargebacks").default(0),
  disputedTransactions: integer("disputed_transactions").default(0),
  
  // Rating metadata
  lastReviewDate: timestamp("last_review_date"),
  reviewNotes: text("review_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});