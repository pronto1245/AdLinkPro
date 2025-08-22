import { sql } from "drizzle-orm";
import { pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { userRoleEnum, auditActionEnum } from "./enums";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username"),
  role: text("role").default("partner"),
});

// Team Invitations table
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

// User Profiles table
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  country: text("country"),
  timezone: text("timezone"),
  language: text("language").default('en'),
  avatar: text("avatar"),
  bio: text("bio"),
  telegramUsername: text("telegram_username"),
  skypeId: text("skype_id"),
  whatsappNumber: text("whatsapp_number"),
  
  // Marketing preferences
  emailNotifications: text("email_notifications").default('enabled'), // 'enabled', 'disabled', 'marketing_only'
  smsNotifications: text("sms_notifications").default('disabled'),
  
  // KYC and verification
  isVerified: text("is_verified").default('no'), // 'no', 'pending', 'yes', 'rejected'
  verificationDocuments: text("verification_documents").array().default([]),
  verifiedAt: timestamp("verified_at"),
  
  // Business info
  taxId: text("tax_id"),
  businessType: text("business_type"), // 'individual', 'company', 'partnership'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: text("permissions").array().default([]), // Array of permission strings
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: text("is_active").default('yes'),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  refreshToken: text("refresh_token").unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
  isActive: text("is_active").default('yes'),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: auditActionEnum("action").notNull(),
  resourceType: text("resource_type").notNull(), // users, offers, transactions, etc.
  resourceId: varchar("resource_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  description: text("description"),
});