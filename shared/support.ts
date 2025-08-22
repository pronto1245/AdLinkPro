import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { offers } from "./offers";

// Support-related enums
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'pending_user', 'resolved', 'closed']);

// Support tickets
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").default('open'),
  priority: text("priority").default('medium'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Moderation templates
export const moderationTemplates = pgTable("moderation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rejection', 'revision_request', 'approval'
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creative assets for offers (basic definition - detailed creatives are in creatives-schema.ts)
export const creatives = pgTable("creatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'banner', 'video', 'text', 'prelanding'
  format: text("format"), // 'jpg', 'png', 'gif', 'mp4', 'html'
  size: text("size"), // '300x250', '728x90'
  url: text("url").notNull(),
  preview: text("preview"),
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default('0'),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  moderationStatus: text("moderation_status").default('pending'), // pending, approved, rejected
  moderationComment: text("moderation_comment"),
  targetGeo: jsonb("target_geo"), // Array of country codes
  targetDevice: text("target_device"), // 'desktop', 'mobile', 'tablet'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: 'assignedTickets'
  }),
}));

export const creativesRelations = relations(creatives, ({ one }) => ({
  offer: one(offers, {
    fields: [creatives.offerId],
    references: [offers.id],
  }),
}));

// Schema validations
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationTemplateSchema = createInsertSchema(moderationTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertCreativeSchema = createInsertSchema(creatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type ModerationTemplate = typeof moderationTemplates.$inferSelect;
export type InsertModerationTemplate = z.infer<typeof insertModerationTemplateSchema>;
export type Creative = typeof creatives.$inferSelect;
export type InsertCreative = z.infer<typeof insertCreativeSchema>;