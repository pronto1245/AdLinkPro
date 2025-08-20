CREATE TYPE "public"."access_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('super', 'financial', 'technical', 'moderator', 'analyst');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject');--> statement-breakpoint
CREATE TYPE "public"."crypto_currency" AS ENUM('BTC', 'ETH', 'USDT', 'USDC', 'TRX', 'LTC', 'BCH', 'XRP');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('active', 'paused', 'draft', 'pending', 'archived', 'on_request');--> statement-breakpoint
CREATE TYPE "public"."postback_status" AS ENUM('pending', 'sent', 'failed', 'retry');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'advertiser', 'affiliate', 'staff');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked', 'deleted', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('advertiser', 'affiliate', 'staff', 'admin');--> statement-breakpoint
CREATE TYPE "public"."wallet_status" AS ENUM('active', 'suspended', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('platform', 'user');--> statement-breakpoint
CREATE TABLE "ab_test_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"offer_ids" jsonb NOT NULL,
	"traffic_split" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"winner_offer_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"offer_id" varchar,
	"partner_id" varchar,
	"date" timestamp NOT NULL,
	"clicks" integer DEFAULT 0,
	"unique_clicks" integer DEFAULT 0,
	"leads" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"revenue" numeric(15, 2) DEFAULT '0.00',
	"payout" numeric(15, 2) DEFAULT '0.00',
	"profit" numeric(15, 2) DEFAULT '0.00',
	"cr" numeric(5, 2) DEFAULT '0.00',
	"epc" numeric(8, 2) DEFAULT '0.00',
	"roi" numeric(5, 2) DEFAULT '0.00',
	"geo" text,
	"device" text,
	"traffic_source" text,
	"sub_id" text,
	"click_id" text,
	"fraud_clicks" integer DEFAULT 0,
	"bot_clicks" integer DEFAULT 0,
	"fraud_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"last_used" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action" "audit_action" NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" varchar,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now(),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "blacklist" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"reason" text,
	"added_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "compliance_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"type" text NOT NULL,
	"rule" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversion_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"click_id" text NOT NULL,
	"sub_id" text,
	"advertiser_id" varchar NOT NULL,
	"offer_id" varchar NOT NULL,
	"partner_id" varchar NOT NULL,
	"click_time" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referer" text,
	"country" text,
	"city" text,
	"device" text,
	"os" text,
	"browser" text,
	"is_converted" boolean DEFAULT false,
	"conversion_time" timestamp,
	"conversion_value" numeric(10, 2),
	"is_fraud" boolean DEFAULT false,
	"is_bot" boolean DEFAULT false,
	"fraud_reason" text,
	"postback_sent" boolean DEFAULT false,
	"postback_time" timestamp,
	"postback_status" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "conversion_data_click_id_unique" UNIQUE("click_id")
);
--> statement-breakpoint
CREATE TABLE "creatives" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"format" text,
	"size" text,
	"url" text NOT NULL,
	"preview" text,
	"clicks" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"ctr" numeric(5, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"is_approved" boolean DEFAULT false,
	"moderation_status" text DEFAULT 'pending',
	"moderation_comment" text,
	"target_geo" jsonb,
	"target_device" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crypto_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"transaction_id" varchar,
	"tx_hash" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" "crypto_currency" NOT NULL,
	"network_fee" numeric(18, 8) DEFAULT '0',
	"confirmations" integer DEFAULT 0,
	"required_confirmations" integer DEFAULT 1,
	"status" "transaction_status" DEFAULT 'pending',
	"block_number" text,
	"block_hash" text,
	"network" text NOT NULL,
	"is_incoming" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	CONSTRAINT "crypto_transactions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "crypto_wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"wallet_type" "wallet_type" NOT NULL,
	"currency" "crypto_currency" NOT NULL,
	"address" text NOT NULL,
	"private_key" text,
	"public_key" text,
	"mnemonic" text,
	"balance" numeric(18, 8) DEFAULT '0',
	"locked_balance" numeric(18, 8) DEFAULT '0',
	"network" text NOT NULL,
	"derivation_path" text,
	"is_active" boolean DEFAULT true,
	"status" "wallet_status" DEFAULT 'active',
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "crypto_wallets_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "custom_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" jsonb NOT NULL,
	"advertiser_id" varchar,
	"ip_restrictions" jsonb,
	"geo_restrictions" jsonb,
	"time_restrictions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_tracking" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_fingerprint" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text NOT NULL,
	"screen_resolution" text,
	"timezone" text,
	"language" text,
	"plugins" jsonb,
	"webgl_renderer" text,
	"canvas_fingerprint" text,
	"click_id" text,
	"tracking_link_id" text,
	"partner_id" text,
	"offer_id" text,
	"country" text,
	"region" text,
	"city" text,
	"isp" text,
	"is_proxy" boolean DEFAULT false,
	"is_vpn" boolean DEFAULT false,
	"is_tor" boolean DEFAULT false,
	"is_mobile" boolean DEFAULT false,
	"is_bot" boolean DEFAULT false,
	"risk_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_summaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"period" text NOT NULL,
	"period_date" text NOT NULL,
	"total_expenses" numeric(15, 2) DEFAULT '0.00',
	"total_revenue" numeric(15, 2) DEFAULT '0.00',
	"total_payouts" numeric(15, 2) DEFAULT '0.00',
	"pending_payouts" numeric(15, 2) DEFAULT '0.00',
	"avg_epc" numeric(10, 4) DEFAULT '0.0000',
	"avg_cr" numeric(10, 4) DEFAULT '0.0000',
	"avg_payout" numeric(10, 2) DEFAULT '0.00',
	"total_transactions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"partner_id" varchar,
	"offer_id" varchar,
	"offer_name" text,
	"partner_username" text,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"period" text,
	"comment" text,
	"payment_method" text,
	"tx_hash" text,
	"bank_reference" text,
	"details" jsonb,
	"processed_by" varchar,
	"processed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"offer_id" varchar,
	"type" text NOT NULL,
	"severity" text DEFAULT 'medium',
	"description" text,
	"data" jsonb,
	"is_resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_blocks" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"report_id" text,
	"auto_blocked" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"blocked_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'pending',
	"offer_id" text,
	"partner_id" text,
	"tracking_link_id" text,
	"click_id" text,
	"ip_address" text,
	"user_agent" text,
	"device_fingerprint" text,
	"country" text,
	"region" text,
	"city" text,
	"description" text NOT NULL,
	"detection_rules" jsonb,
	"evidence_data" jsonb,
	"auto_blocked" boolean DEFAULT false,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_notes" text,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_rules" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"scope" text NOT NULL,
	"target_id" text,
	"is_active" boolean DEFAULT true,
	"auto_block" boolean DEFAULT false,
	"severity" text NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"thresholds" jsonb,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_postbacks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"macros" jsonb,
	"headers" jsonb,
	"is_active" boolean DEFAULT true,
	"retry_attempts" integer DEFAULT 3,
	"timeout" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ip_analysis" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"country" text,
	"region" text,
	"city" text,
	"isp" text,
	"organization" text,
	"is_proxy" boolean DEFAULT false,
	"is_vpn" boolean DEFAULT false,
	"is_tor" boolean DEFAULT false,
	"is_hosting" boolean DEFAULT false,
	"is_malicious" boolean DEFAULT false,
	"risk_score" integer DEFAULT 0,
	"threat_types" jsonb,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"click_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"unique_partners_count" integer DEFAULT 0,
	"flagged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ip_analysis_ip_address_unique" UNIQUE("ip_address")
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"file_url" text NOT NULL,
	"notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"login_time" timestamp DEFAULT now(),
	"success" boolean NOT NULL,
	"failure_reason" text,
	"session_id" text
);
--> statement-breakpoint
CREATE TABLE "moderation_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_access_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"partner_id" varchar NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"request_note" text,
	"response_note" text,
	"requested_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" varchar,
	"partner_message" text,
	"advertiser_response" text,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "offer_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "offer_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "offer_domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"domain" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text,
	"name" text NOT NULL,
	"description" jsonb,
	"logo" text,
	"category" text NOT NULL,
	"vertical" text,
	"goals" jsonb,
	"advertiser_id" varchar NOT NULL,
	"payout" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payout_type" text NOT NULL,
	"currency" text DEFAULT 'USD',
	"countries" jsonb,
	"geo_targeting" text,
	"tracking_url" text,
	"landing_page_url" text,
	"landing_pages" jsonb,
	"base_url" text,
	"preview_url" text,
	"geo_pricing" jsonb,
	"allowed_apps" jsonb,
	"kpi_conditions" jsonb,
	"traffic_sources" jsonb,
	"allowed_applications" jsonb DEFAULT '[]'::jsonb,
	"daily_limit" integer,
	"monthly_limit" integer,
	"auto_approve_partners" boolean DEFAULT false,
	"partner_approval_type" text DEFAULT 'manual',
	"antifraud_enabled" boolean DEFAULT true,
	"antifraud_methods" jsonb DEFAULT '[]'::jsonb,
	"status" "offer_status" DEFAULT 'draft',
	"moderation_status" text DEFAULT 'pending',
	"moderation_comment" text,
	"restrictions" text,
	"fraud_restrictions" text,
	"macros" text,
	"smartlink_enabled" boolean DEFAULT false,
	"kyc_required" boolean DEFAULT false,
	"is_private" boolean DEFAULT false,
	"is_blocked" boolean DEFAULT false,
	"blocked_reason" text,
	"is_archived" boolean DEFAULT false,
	"region_visibility" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"offer_id" varchar NOT NULL,
	"is_approved" boolean DEFAULT false,
	"custom_payout" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"advertiser_id" varchar,
	"revenue" numeric(12, 2) DEFAULT '0',
	"conversion_rate" numeric(5, 2) DEFAULT '0',
	"epc" numeric(8, 2) DEFAULT '0',
	"fraud_score" integer DEFAULT 0,
	"traffic_quality" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0',
	"rank" integer DEFAULT 0,
	"achievements" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_team" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"sub_id_prefix" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"partner_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"period" text NOT NULL,
	"comment" text,
	"payment_method" text NOT NULL,
	"payment_details" jsonb,
	"status" text DEFAULT 'draft',
	"approved_by" varchar,
	"approved_at" timestamp,
	"processed_by" varchar,
	"processed_at" timestamp,
	"transaction_id" varchar,
	"failure_reason" text,
	"security_checks_passed" boolean DEFAULT false,
	"fraud_score" integer DEFAULT 0,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar,
	"offer_id" varchar,
	"type" text NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"currency" text DEFAULT 'USD',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "postback_delivery_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postback_id" varchar,
	"conversion_id" varchar,
	"offer_id" varchar,
	"partner_id" varchar,
	"url" text NOT NULL,
	"method" text DEFAULT 'GET',
	"headers" jsonb,
	"payload" jsonb,
	"response_code" integer,
	"response_body" text,
	"response_time" integer,
	"status" text NOT NULL,
	"error_message" text,
	"attempt" integer DEFAULT 1,
	"max_attempts" integer DEFAULT 3,
	"next_retry_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "postback_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postback_id" varchar,
	"click_id" varchar,
	"event_type" text NOT NULL,
	"url" text NOT NULL,
	"method" text NOT NULL,
	"headers" jsonb,
	"payload" jsonb,
	"response_status" integer,
	"response_body" text,
	"response_time" integer,
	"retry_count" integer DEFAULT 0,
	"status" "postback_status" DEFAULT 'pending',
	"error_message" text,
	"signature" text,
	"sent_at" timestamp,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "postback_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"parameters" jsonb,
	"headers" jsonb,
	"retry_attempts" integer DEFAULT 3,
	"timeout" integer DEFAULT 30,
	"is_active" boolean DEFAULT true,
	"offer_id" varchar,
	"advertiser_id" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "postbacks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"offer_id" varchar,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"method" text DEFAULT 'GET',
	"events" jsonb,
	"macros" jsonb,
	"signature_key" text,
	"ip_whitelist" jsonb,
	"is_active" boolean DEFAULT true,
	"retry_enabled" boolean DEFAULT true,
	"max_retries" integer DEFAULT 3,
	"retry_delay" integer DEFAULT 60,
	"timeout" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "received_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"geo" jsonb NOT NULL,
	"devices" jsonb NOT NULL,
	"payout_type" text NOT NULL,
	"supplier_rate" numeric(10, 2) NOT NULL,
	"partner_rate" numeric(10, 2) NOT NULL,
	"target_url" text NOT NULL,
	"postback_url" text NOT NULL,
	"conditions" text,
	"supplier_source" text,
	"status" text DEFAULT 'active',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text NOT NULL,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"offer_id" varchar NOT NULL,
	"tracking_link_id" varchar,
	"date" timestamp NOT NULL,
	"clicks" integer DEFAULT 0,
	"unique_clicks" integer DEFAULT 0,
	"leads" integer DEFAULT 0,
	"approved_leads" integer DEFAULT 0,
	"rejected_leads" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"revenue" numeric(10, 2) DEFAULT '0',
	"payout" numeric(10, 2) DEFAULT '0',
	"country" text,
	"device" text,
	"browser" text,
	"os" text,
	"ip" text
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tracking_clicks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"click_id" text NOT NULL,
	"partner_id" varchar NOT NULL,
	"offer_id" varchar NOT NULL,
	"tracking_link_id" varchar,
	"ip" text,
	"user_agent" text,
	"referer" text,
	"country" text,
	"device" text,
	"browser" text,
	"os" text,
	"sub_id_1" text,
	"sub_id_2" text,
	"sub_id_3" text,
	"sub_id_4" text,
	"sub_id_5" text,
	"sub_id_6" text,
	"sub_id_7" text,
	"sub_id_8" text,
	"sub_id_9" text,
	"sub_id_10" text,
	"sub_id_11" text,
	"sub_id_12" text,
	"sub_id_13" text,
	"sub_id_14" text,
	"sub_id_15" text,
	"sub_id_16" text,
	"sub_id_17" text,
	"sub_id_18" text,
	"sub_id_19" text,
	"sub_id_20" text,
	"sub_id_21" text,
	"sub_id_22" text,
	"sub_id_23" text,
	"sub_id_24" text,
	"sub_id_25" text,
	"sub_id_26" text,
	"sub_id_27" text,
	"sub_id_28" text,
	"sub_id_29" text,
	"sub_id_30" text,
	"fraud_score" integer DEFAULT 0,
	"is_bot" boolean DEFAULT false,
	"vpn_detected" boolean DEFAULT false,
	"risk_level" text DEFAULT 'low',
	"mobile_carrier" text,
	"connection_type" text,
	"time_on_landing" integer,
	"landing_url" text,
	"is_unique" boolean DEFAULT true,
	"status" text DEFAULT 'active',
	"conversion_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tracking_clicks_click_id_unique" UNIQUE("click_id")
);
--> statement-breakpoint
CREATE TABLE "tracking_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"offer_id" varchar NOT NULL,
	"tracking_code" text NOT NULL,
	"url" text NOT NULL,
	"sub_id_1" text,
	"sub_id_2" text,
	"sub_id_3" text,
	"sub_id_4" text,
	"sub_id_5" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tracking_links_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "traffic_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"website" text,
	"volume" integer,
	"quality" text DEFAULT 'medium',
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "transaction_status" DEFAULT 'pending',
	"description" text,
	"reference" text,
	"payment_method" text,
	"tx_hash" text,
	"from_address" text,
	"to_address" text,
	"confirmations" integer DEFAULT 0,
	"required_confirmations" integer DEFAULT 1,
	"network_fee" numeric(18, 8) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"total_users" integer DEFAULT 0,
	"active_users_24h" integer DEFAULT 0,
	"active_users_7d" integer DEFAULT 0,
	"active_users_30d" integer DEFAULT 0,
	"new_registrations" integer DEFAULT 0,
	"users_by_role" jsonb,
	"users_by_status" jsonb,
	"users_by_country" jsonb,
	"fraud_alerts" integer DEFAULT 0,
	"blocked_users" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending',
	"is_read" boolean DEFAULT false,
	"sent_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_role_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"custom_role_id" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"is_active" boolean DEFAULT true,
	"last_activity" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'affiliate' NOT NULL,
	"admin_role" "admin_role",
	"ip_restrictions" jsonb,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" text,
	"last_ip_address" text,
	"session_token" text,
	"first_name" text,
	"last_name" text,
	"company" text,
	"phone" text,
	"telegram" text,
	"country" text,
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"currency" text DEFAULT 'USD',
	"kyc_status" "kyc_status" DEFAULT 'pending',
	"is_active" boolean DEFAULT true,
	"status" "user_status" DEFAULT 'active',
	"user_type" "user_type" DEFAULT 'affiliate',
	"last_login_at" timestamp,
	"registration_ip" text,
	"geo_restrictions" jsonb,
	"time_restrictions" jsonb,
	"is_blocked" boolean DEFAULT false,
	"block_reason" text,
	"blocked_at" timestamp,
	"blocked_by" varchar,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"deleted_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar,
	"advertiser_id" varchar,
	"balance" numeric(15, 2) DEFAULT '0.00',
	"hold_amount" numeric(15, 2) DEFAULT '0.00',
	"registration_approved" boolean DEFAULT false,
	"documents_verified" boolean DEFAULT false,
	"settings" jsonb,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"secret" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "white_labels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"brand_name" text NOT NULL,
	"logo" text,
	"primary_color" text DEFAULT '#0066cc',
	"secondary_color" text DEFAULT '#ffffff',
	"domain" text,
	"custom_css" text,
	"favicon" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "analytics_data" ADD CONSTRAINT "analytics_data_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_data" ADD CONSTRAINT "analytics_data_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_data" ADD CONSTRAINT "analytics_data_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_rules" ADD CONSTRAINT "compliance_rules_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_data" ADD CONSTRAINT "conversion_data_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_data" ADD CONSTRAINT "conversion_data_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_data" ADD CONSTRAINT "conversion_data_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creatives" ADD CONSTRAINT "creatives_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_transactions" ADD CONSTRAINT "crypto_transactions_wallet_id_crypto_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."crypto_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_transactions" ADD CONSTRAINT "crypto_transactions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_tracking" ADD CONSTRAINT "device_tracking_tracking_link_id_tracking_links_id_fk" FOREIGN KEY ("tracking_link_id") REFERENCES "public"."tracking_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_tracking" ADD CONSTRAINT "device_tracking_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_tracking" ADD CONSTRAINT "device_tracking_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_summaries" ADD CONSTRAINT "financial_summaries_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_blocks" ADD CONSTRAINT "fraud_blocks_report_id_fraud_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."fraud_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_blocks" ADD CONSTRAINT "fraud_blocks_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_tracking_link_id_tracking_links_id_fk" FOREIGN KEY ("tracking_link_id") REFERENCES "public"."tracking_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_rules" ADD CONSTRAINT "fraud_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_access_requests" ADD CONSTRAINT "offer_access_requests_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_access_requests" ADD CONSTRAINT "offer_access_requests_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_access_requests" ADD CONSTRAINT "offer_access_requests_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_access_requests" ADD CONSTRAINT "offer_access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_domains" ADD CONSTRAINT "offer_domains_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_logs" ADD CONSTRAINT "offer_logs_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_logs" ADD CONSTRAINT "offer_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_offers" ADD CONSTRAINT "partner_offers_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_offers" ADD CONSTRAINT "partner_offers_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_ratings" ADD CONSTRAINT "partner_ratings_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_ratings" ADD CONSTRAINT "partner_ratings_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_team" ADD CONSTRAINT "partner_team_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_team" ADD CONSTRAINT "partner_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_transaction_id_financial_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."financial_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_commissions" ADD CONSTRAINT "platform_commissions_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_commissions" ADD CONSTRAINT "platform_commissions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_delivery_logs" ADD CONSTRAINT "postback_delivery_logs_postback_id_postback_templates_id_fk" FOREIGN KEY ("postback_id") REFERENCES "public"."postback_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_delivery_logs" ADD CONSTRAINT "postback_delivery_logs_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_delivery_logs" ADD CONSTRAINT "postback_delivery_logs_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_logs" ADD CONSTRAINT "postback_logs_postback_id_postback_templates_id_fk" FOREIGN KEY ("postback_id") REFERENCES "public"."postback_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_logs" ADD CONSTRAINT "postback_logs_click_id_tracking_clicks_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."tracking_clicks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_templates" ADD CONSTRAINT "postback_templates_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_templates" ADD CONSTRAINT "postback_templates_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postback_templates" ADD CONSTRAINT "postback_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postbacks" ADD CONSTRAINT "postbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postbacks" ADD CONSTRAINT "postbacks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "received_offers" ADD CONSTRAINT "received_offers_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_tracking_link_id_tracking_links_id_fk" FOREIGN KEY ("tracking_link_id") REFERENCES "public"."tracking_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_clicks" ADD CONSTRAINT "tracking_clicks_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_clicks" ADD CONSTRAINT "tracking_clicks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_clicks" ADD CONSTRAINT "tracking_clicks_tracking_link_id_tracking_links_id_fk" FOREIGN KEY ("tracking_link_id") REFERENCES "public"."tracking_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_sources" ADD CONSTRAINT "traffic_sources_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_custom_role_id_custom_roles_id_fk" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "white_labels" ADD CONSTRAINT "white_labels_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;