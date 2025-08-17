// Enhanced antifraud schema extensions
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, serial, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Webhook endpoints table
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  events: jsonb("events").notNull(), // Array of event types to listen for
  isActive: boolean("is_active").notNull().default(true),
  retryConfig: jsonb("retry_config").notNull().default(sql`'{"maxRetries": 3, "backoffMs": 5000}'`),
  headers: jsonb("headers"), // Additional headers to send
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Webhook events log table
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpointId: varchar("endpoint_id").notNull().references(() => webhookEndpoints.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull(), // 'success', 'failed', 'retrying'
  responseStatus: integer("response_status"),
  errorMessage: text("error_message"),
  attempt: integer("attempt").notNull().default(1),
  deliveredAt: timestamp("delivered_at"),
  failedAt: timestamp("failed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced fraud rules table
export const fraudRules = pgTable("fraud_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ip_block', 'country_block', 'user_agent_block', 'rate_limit', etc.
  conditions: jsonb("conditions").notNull(), // Rule conditions as JSON
  actions: jsonb("actions").notNull(), // Actions to take when rule matches
  priority: integer("priority").notNull().default(50), // 1-100, higher = more important
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  updatedBy: varchar("updated_by"),
  deletedBy: varchar("deleted_by"),
  deletedReason: text("deleted_reason"),
  updateReason: text("update_reason"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced fraud blocks table
export const fraudBlocks = pgTable("fraud_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'ip', 'country', 'user_agent', 'domain', etc.
  value: text("value").notNull(), // The blocked value
  reason: text("reason").notNull(),
  severity: text("severity").notNull().default('medium'), // 'low', 'medium', 'high'
  isActive: boolean("is_active").notNull().default(true),
  sourceRuleId: varchar("source_rule_id").references(() => fraudRules.id),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull(),
  unblockedBy: varchar("unblocked_by"),
  unblockReason: text("unblock_reason"),
  unblockedAt: timestamp("unblocked_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced fraud alerts table  
export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default('medium'),
  status: text("status").notNull().default('open'), // 'open', 'resolved', 'ignored', 'escalated'
  data: jsonb("data").notNull(), // Alert-specific data
  sourceIp: text("source_ip"),
  userId: varchar("user_id"),
  ruleId: varchar("rule_id").references(() => fraudRules.id),
  assignedTo: varchar("assigned_to"),
  processedBy: varchar("processed_by"),
  processReason: text("process_reason"),
  processedAt: timestamp("processed_at"),
  resolvedAt: timestamp("resolved_at"),
  ignoredAt: timestamp("ignored_at"),
  escalatedAt: timestamp("escalated_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// ML fraud detection models
export const fraudModels = pgTable("fraud_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version").notNull(),
  type: text("type").notNull(), // 'decision_tree', 'neural_network', 'ensemble', etc.
  config: jsonb("config").notNull(),
  features: jsonb("features").notNull(), // Feature definitions
  weights: jsonb("weights"), // Model weights/parameters
  metrics: jsonb("metrics"), // Performance metrics
  isActive: boolean("is_active").notNull().default(false),
  trainedOn: timestamp("trained_on"),
  deployedAt: timestamp("deployed_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// ML fraud predictions
export const fraudPredictions = pgTable("fraud_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull().references(() => fraudModels.id),
  clickId: varchar("click_id"),
  features: jsonb("features").notNull(),
  score: decimal("score", { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
  prediction: boolean("prediction").notNull(), // fraud/not fraud
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(),
  explanation: jsonb("explanation"), // Feature importance for explainable AI
  actualOutcome: boolean("actual_outcome"), // For training feedback
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Notification rules table
export const notificationRules = pgTable("notification_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  eventTypes: jsonb("event_types").notNull(), // Array of event types
  channels: jsonb("channels").notNull(), // Array of notification channels
  conditions: jsonb("conditions"), // Conditions for triggering
  isActive: boolean("is_active").notNull().default(true),
  cooldownMinutes: integer("cooldown_minutes"),
  lastTriggered: timestamp("last_triggered"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// User notifications table
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'offer_access_request', 'offer_access_approved', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  channel: text("channel").notNull().default('system'), // 'system', 'email', 'telegram', 'slack'
  status: text("status").notNull().default('sent'), // 'sent', 'delivered', 'failed'
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Regular notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Bulk operation logs
export const bulkOperationLogs = pgTable("bulk_operation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationType: text("operation_type").notNull(), // 'block_ips', 'create_rules', etc.
  targetType: text("target_type").notNull(), // 'ip', 'rule', 'user', etc.
  targetIds: jsonb("target_ids").notNull(), // Array of affected IDs
  parameters: jsonb("parameters").notNull(), // Operation parameters
  results: jsonb("results"), // Operation results
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'failed', 'partial'
  errorMessage: text("error_message"),
  executedBy: varchar("executed_by").notNull(),
  startedAt: timestamp("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Fraud reports table (if not exists)
export const fraudReports = pgTable("fraud_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default('medium'),
  status: text("status").notNull().default('open'),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  userId: varchar("user_id"),
  clickId: varchar("click_id"),
  data: jsonb("data"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Add indexes for performance
export const webhookEndpointsNameIndex = index("webhook_endpoints_name_idx").on(webhookEndpoints.name);
export const webhookEventsEndpointIndex = index("webhook_events_endpoint_idx").on(webhookEvents.endpointId);
export const fraudRulesTypeIndex = index("fraud_rules_type_idx").on(fraudRules.type);
export const fraudBlocksValueIndex = index("fraud_blocks_value_idx").on(fraudBlocks.value);
export const fraudAlertsStatusIndex = index("fraud_alerts_status_idx").on(fraudAlerts.status);
export const notificationsUserIndex = index("notifications_user_idx").on(notifications.userId);
export const userNotificationsUserIndex = index("user_notifications_user_idx").on(userNotifications.userId);