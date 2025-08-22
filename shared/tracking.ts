import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";

// Tracking links
export const trackingLinks = pgTable("tracking_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  trackingCode: text("tracking_code").notNull().unique(),
  url: text("url").notNull(),
  customDomain: text("custom_domain"), // Custom domain for white-label links
  subId1: text("sub_id_1"),
  subId2: text("sub_id_2"),
  subId3: text("sub_id_3"),
  subId4: text("sub_id_4"),
  subId5: text("sub_id_5"),
  isActive: boolean("is_active").default(true),
  clickCount: integer("click_count").default(0),
  lastClickAt: timestamp("last_click_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tracking clicks for postback system
export const trackingClicks = pgTable("tracking_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: text("click_id").notNull().unique(), // Generated clickid for macros
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
  riskLevel: text("risk_level").default('low'), // 'low', 'medium', 'high'
  // Additional analytics fields
  mobileCarrier: text("mobile_carrier"),
  connectionType: text("connection_type"), // 'wifi', 'mobile', 'cable'
  timeOnLanding: integer("time_on_landing"), // seconds
  landingUrl: text("landing_url"),
  isUnique: boolean("is_unique").default(true),
  status: text("status").default('active'), // 'active', 'converted', 'rejected'
  conversionData: jsonb("conversion_data"), // Additional conversion details
  createdAt: timestamp("created_at").defaultNow(),
});

// Statistics
export const statistics = pgTable("statistics", {
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
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  payout: decimal("payout", { precision: 10, scale: 2 }).default('0'),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ip: text("ip"),
});

// Traffic sources
export const trafficSources = pgTable("traffic_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),  
  name: text("name").notNull(),
  type: text("type").notNull(), // 'push', 'pop', 'native', 'seo', 'social', 'email', 'display', 'search'
  description: text("description"),
  website: text("website"),
  volume: integer("volume"), // daily volume estimate
  quality: text("quality").default('medium'), // 'low', 'medium', 'high'
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const trackingLinksRelations = relations(trackingLinks, ({ one, many }) => ({
  partner: one(users, {
    fields: [trackingLinks.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [trackingLinks.offerId],
    references: [offers.id],
  }),
  trackingClicks: many(trackingClicks),
  statistics: many(statistics),
}));

export const trackingClicksRelations = relations(trackingClicks, ({ one }) => ({
  partner: one(users, {
    fields: [trackingClicks.partnerId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [trackingClicks.offerId],
    references: [offers.id],
  }),
  trackingLink: one(trackingLinks, {
    fields: [trackingClicks.trackingLinkId],
    references: [trackingLinks.id],
  }),
}));

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

export const trafficSourcesRelations = relations(trafficSources, ({ one }) => ({
  partner: one(users, {
    fields: [trafficSources.partnerId],
    references: [users.id],
  }),
}));

// Schema validations
export const insertTrackingLinkSchema = createInsertSchema(trackingLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrackingClickSchema = createInsertSchema(trackingClicks).omit({
  id: true,
  createdAt: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
});

export const insertTrafficSourceSchema = createInsertSchema(trafficSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = z.infer<typeof insertTrackingLinkSchema>;
export type TrackingClick = typeof trackingClicks.$inferSelect;
export type InsertTrackingClick = z.infer<typeof insertTrackingClickSchema>;
export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type TrafficSource = typeof trafficSources.$inferSelect;
export type InsertTrafficSource = z.infer<typeof insertTrafficSourceSchema>;