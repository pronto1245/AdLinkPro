import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";

// KYC documents
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'passport', 'id_card', 'selfie', 'address'
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  fileUrl: text("file_url").notNull(),
  notes: text("notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// A/B test groups for offers
export const abTestGroups = pgTable("ab_test_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  offerIds: jsonb("offer_ids").notNull(), // Array of offer IDs
  trafficSplit: jsonb("traffic_split").notNull(), // Object with percentages
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  winnerOfferId: varchar("winner_offer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance rules
export const complianceRules = pgTable("compliance_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  type: text("type").notNull(), // 'kyc_required', 'geo_restriction', 'traffic_source'
  rule: jsonb("rule").notNull(), // Rule configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycDocuments.reviewedBy],
    references: [users.id],
    relationName: 'kycReviewer'
  }),
}));

export const complianceRulesRelations = relations(complianceRules, ({ one }) => ({
  offer: one(offers, {
    fields: [complianceRules.offerId],
    references: [offers.id],
  }),
}));

// Schema validations
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertAbTestGroupSchema = createInsertSchema(abTestGroups).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceRuleSchema = createInsertSchema(complianceRules).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type AbTestGroup = typeof abTestGroups.$inferSelect;
export type InsertAbTestGroup = z.infer<typeof insertAbTestGroupSchema>;
export type ComplianceRule = typeof complianceRules.$inferSelect;
export type InsertComplianceRule = z.infer<typeof insertComplianceRuleSchema>;