import { sql, relations } from "drizzle-orm";
import { pgTable, text, uuid, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User-related enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'advertiser', 'partner', 'manager']);
export const auditActionEnum = pgEnum('audit_action', ['login', 'logout', 'create', 'update', 'delete', 'view', 'access_denied']);

// Core users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username"),
  role: text("role").default("partner"),
});

// Team invitations
export const teamInvitations = pgTable("team_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  message: text("message"),
  token: text("token").notNull().unique(),
  status: text("status").default('pending'), // 'pending', 'accepted', 'declined', 'cancelled', 'expired'
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff members
export const staffMembers = pgTable("staff_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'manager', 'support', 'analyst', 'accountant'
  permissions: jsonb("permissions"), // Array of permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner team
export const partnerTeam = pgTable("partner_team", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'buyer', 'analyst', 'manager'
  permissions: jsonb("permissions").notNull(), // разрешения на ссылки, креативы, статистику
  subIdPrefix: text("sub_id_prefix"), // уникальный префикс для SubID
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom roles
export const customRoles = pgTable("custom_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // Array of permission strings
  advertiserId: varchar("advertiser_id").references(() => users.id), // null = global role
  ipRestrictions: jsonb("ip_restrictions"), // Array of allowed IPs
  geoRestrictions: jsonb("geo_restrictions"), // Array of allowed countries
  timeRestrictions: jsonb("time_restrictions"), // Time-based access restrictions
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User role assignments
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  customRoleId: varchar("custom_role_id").notNull().references(() => customRoles.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Optional role expiration
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions for tracking active sessions
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notifications
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // registration, block, login, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional notification data
  channel: text("channel").notNull(), // email, telegram, system
  status: text("status").default('pending'), // pending, sent, failed
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User analytics for dashboard
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers24h: integer("active_users_24h").default(0),
  activeUsers7d: integer("active_users_7d").default(0),
  activeUsers30d: integer("active_users_30d").default(0),
  newRegistrations: integer("new_registrations").default(0),
  usersByRole: jsonb("users_by_role"), // Breakdown by role
  usersByStatus: jsonb("users_by_status"), // Breakdown by status
  usersByCountry: jsonb("users_by_country"), // Geographic breakdown
  fraudAlerts: integer("fraud_alerts").default(0),
  blockedUsers: integer("blocked_users").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login logs
export const loginLogs = pgTable("login_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").defaultNow(),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"),
  sessionId: text("session_id"),
});

// Audit logs table for tracking all admin actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: auditActionEnum("action").notNull(),
  resourceType: text("resource_type").notNull(), // users, offers, transactions, etc.
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  description: text("description"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teamInvitations: many(teamInvitations),
  staffMembers: many(staffMembers),
  partnerTeam: many(partnerTeam),
  userRoleAssignments: many(userRoleAssignments),
  userSessions: many(userSessions),
  userNotifications: many(userNotifications),
  passwordResetTokens: many(passwordResetTokens),
  loginLogs: many(loginLogs),
  auditLogs: many(auditLogs),
}));

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  inviter: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const staffMembersRelations = relations(staffMembers, ({ one }) => ({
  advertiser: one(users, {
    fields: [staffMembers.advertiserId],
    references: [users.id],
    relationName: 'advertiserStaff'
  }),
  user: one(users, {
    fields: [staffMembers.userId],
    references: [users.id],
    relationName: 'staffMember'
  }),
}));

export const partnerTeamRelations = relations(partnerTeam, ({ one }) => ({
  partner: one(users, {
    fields: [partnerTeam.partnerId],
    references: [users.id],
    relationName: 'partnerTeamOwner'
  }),
  user: one(users, {
    fields: [partnerTeam.userId],
    references: [users.id],
    relationName: 'partnerTeamMember'
  }),
}));

export const customRolesRelations = relations(customRoles, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [customRoles.advertiserId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [customRoles.createdBy],
    references: [users.id],
    relationName: 'roleCreator'
  }),
  userRoleAssignments: many(userRoleAssignments),
}));

export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userRoleAssignments.userId],
    references: [users.id],
  }),
  customRole: one(customRoles, {
    fields: [userRoleAssignments.customRoleId],
    references: [customRoles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoleAssignments.assignedBy],
    references: [users.id],
    relationName: 'roleAssigner'
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userNotificationsRelations = relations(userNotifications, ({ one }) => ({
  user: one(users, {
    fields: [userNotifications.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, {
    fields: [loginLogs.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Schema validations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
});

export const insertCustomRoleSchema = createInsertSchema(customRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type CustomRole = typeof customRoles.$inferSelect;
export type InsertCustomRole = z.infer<typeof insertCustomRoleSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type LoginLog = typeof loginLogs.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type UserAnalytics = typeof userAnalytics.$inferSelect;