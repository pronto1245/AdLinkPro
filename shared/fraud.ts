import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";
import { trackingLinks } from "./tracking";

// Fraud alerts
export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  offerId: varchar("offer_id").references(() => offers.id),
  type: text("type").notNull(), // 'suspicious_activity', 'high_velocity', 'duplicate_conversion'
  severity: text("severity").default('medium'),
  description: text("description"),
  data: jsonb("data"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud Reports - Main fraud incidents table
export const fraudReports = pgTable('fraud_reports', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  type: text('type').$type<'ip_fraud' | 'device_fraud' | 'geo_fraud' | 'anomaly_ctr' | 'anomaly_cr' | 'anomaly_epc' | 'duplicate_actions' | 'click_speed' | 'mass_registration' | 'device_spoofing'>().notNull(),
  severity: text('severity').$type<'low' | 'medium' | 'high' | 'critical'>().notNull(),
  status: text('status').$type<'pending' | 'reviewing' | 'confirmed' | 'rejected' | 'resolved'>().default('pending'),
  offerId: text('offer_id').references(() => offers.id),
  partnerId: text('partner_id').references(() => users.id),
  trackingLinkId: text('tracking_link_id').references(() => trackingLinks.id),
  clickId: text('click_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceFingerprint: text('device_fingerprint'),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  description: text('description').notNull(),
  detectionRules: jsonb('detection_rules'),
  evidenceData: jsonb('evidence_data'),
  autoBlocked: boolean('auto_blocked').default(false),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Fraud Rules Configuration
export const fraudRules = pgTable('fraud_rules', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  type: text('type').$type<'ip_fraud' | 'device_fraud' | 'geo_fraud' | 'anomaly_ctr' | 'anomaly_cr' | 'anomaly_epc' | 'duplicate_actions' | 'click_speed' | 'mass_registration' | 'device_spoofing'>().notNull(),
  scope: text('scope').$type<'platform' | 'offer' | 'partner' | 'traffic_source'>().notNull(),
  targetId: text('target_id'),
  isActive: boolean('is_active').default(true),
  autoBlock: boolean('auto_block').default(false),
  severity: text('severity').$type<'low' | 'medium' | 'high' | 'critical'>().notNull(),
  conditions: jsonb('conditions').notNull(),
  actions: jsonb('actions').notNull(),
  thresholds: jsonb('thresholds'),
  createdBy: text('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Device Tracking
export const deviceTracking = pgTable('device_tracking', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  deviceFingerprint: text('device_fingerprint').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  screenResolution: text('screen_resolution'),
  timezone: text('timezone'),
  language: text('language'),
  plugins: jsonb('plugins'),
  webglRenderer: text('webgl_renderer'),
  canvasFingerprint: text('canvas_fingerprint'),
  clickId: text('click_id'),
  trackingLinkId: text('tracking_link_id').references(() => trackingLinks.id),
  partnerId: text('partner_id').references(() => users.id),
  offerId: text('offer_id').references(() => offers.id),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  isp: text('isp'),
  isProxy: boolean('is_proxy').default(false),
  isVpn: boolean('is_vpn').default(false),
  isTor: boolean('is_tor').default(false),
  isMobile: boolean('is_mobile').default(false),
  isBot: boolean('is_bot').default(false),
  riskScore: integer('risk_score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// IP Analysis
export const ipAnalysis = pgTable('ip_analysis', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text('ip_address').notNull().unique(),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  isp: text('isp'),
  organization: text('organization'),
  isProxy: boolean('is_proxy').default(false),
  isVpn: boolean('is_vpn').default(false),
  isTor: boolean('is_tor').default(false),
  isHosting: boolean('is_hosting').default(false),
  isMalicious: boolean('is_malicious').default(false),
  riskScore: integer('risk_score').default(0),
  threatTypes: jsonb('threat_types'),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
  clickCount: integer('click_count').default(0),
  conversionCount: integer('conversion_count').default(0),
  uniquePartnersCount: integer('unique_partners_count').default(0),
  flaggedAt: timestamp('flagged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Fraud Blocks - Blocked entities
export const fraudBlocks = pgTable('fraud_blocks', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  type: text('type').$type<'ip' | 'device' | 'partner' | 'offer' | 'traffic_source'>().notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  reportId: text('report_id').references(() => fraudReports.id),
  autoBlocked: boolean('auto_blocked').default(false),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  blockedBy: text('blocked_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [fraudAlerts.offerId],
    references: [offers.id],
  }),
}));

export const fraudReportsRelations = relations(fraudReports, ({ one }) => ({
  offer: one(offers, {
    fields: [fraudReports.offerId],
    references: [offers.id],
  }),
  partner: one(users, {
    fields: [fraudReports.partnerId],
    references: [users.id],
    relationName: 'partnerFraudReports'
  }),
  trackingLink: one(trackingLinks, {
    fields: [fraudReports.trackingLinkId],
    references: [trackingLinks.id],
  }),
  reviewer: one(users, {
    fields: [fraudReports.reviewedBy],
    references: [users.id],
    relationName: 'fraudReportReviewer'
  }),
}));

export const fraudRulesRelations = relations(fraudRules, ({ one }) => ({
  creator: one(users, {
    fields: [fraudRules.createdBy],
    references: [users.id],
  }),
}));

export const deviceTrackingRelations = relations(deviceTracking, ({ one }) => ({
  trackingLink: one(trackingLinks, {
    fields: [deviceTracking.trackingLinkId],
    references: [trackingLinks.id],
  }),
  partner: one(users, {
    fields: [deviceTracking.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [deviceTracking.offerId],
    references: [offers.id],
  }),
}));

export const fraudBlocksRelations = relations(fraudBlocks, ({ one }) => ({
  report: one(fraudReports, {
    fields: [fraudBlocks.reportId],
    references: [fraudReports.id],
  }),
  blockedBy: one(users, {
    fields: [fraudBlocks.blockedBy],
    references: [users.id],
  }),
}));

// Schema validations
export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertFraudReportSchema = createInsertSchema(fraudReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudRuleSchema = createInsertSchema(fraudRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceTrackingSchema = createInsertSchema(deviceTracking).omit({
  id: true,
  createdAt: true,
});

export const insertIpAnalysisSchema = createInsertSchema(ipAnalysis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudBlockSchema = createInsertSchema(fraudBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudReport = typeof fraudReports.$inferSelect;
export type InsertFraudReport = z.infer<typeof insertFraudReportSchema>;
export type FraudRule = typeof fraudRules.$inferSelect;
export type InsertFraudRule = z.infer<typeof insertFraudRuleSchema>;
export type DeviceTracking = typeof deviceTracking.$inferSelect;
export type InsertDeviceTracking = z.infer<typeof insertDeviceTrackingSchema>;
export type IpAnalysis = typeof ipAnalysis.$inferSelect;
export type InsertIpAnalysis = z.infer<typeof insertIpAnalysisSchema>;
export type FraudBlock = typeof fraudBlocks.$inferSelect;
export type InsertFraudBlock = z.infer<typeof insertFraudBlockSchema>;