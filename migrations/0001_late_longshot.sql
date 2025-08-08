CREATE TYPE "public"."domain_status" AS ENUM('pending', 'verified', 'error');--> statement-breakpoint
CREATE TYPE "public"."domain_type" AS ENUM('a_record', 'cname');--> statement-breakpoint
CREATE TABLE "api_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"name" text NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"permissions" jsonb,
	"ip_whitelist" jsonb,
	"last_used" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "creative_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"public_url" text,
	"dimensions" text,
	"duration" integer,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creative_set_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" varchar NOT NULL,
	"file_id" varchar NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creative_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"version" text DEFAULT '1.0',
	"is_default" boolean DEFAULT false,
	"archive_path" text,
	"archive_size" integer,
	"download_count" integer DEFAULT 0,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"status" "domain_status" DEFAULT 'pending',
	"type" "domain_type" DEFAULT 'cname',
	"verification_value" text NOT NULL,
	"target_value" text,
	"ssl_enabled" boolean DEFAULT false,
	"ssl_certificate_expiry" timestamp,
	"last_checked" timestamp,
	"next_check" timestamp,
	"error_message" text,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "partner_approval_type" SET DEFAULT 'by_request';--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "payout_by_geo" jsonb;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "creatives" text;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "creatives_url" text;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_files" ADD CONSTRAINT "creative_files_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_set_files" ADD CONSTRAINT "creative_set_files_set_id_creative_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."creative_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_set_files" ADD CONSTRAINT "creative_set_files_file_id_creative_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."creative_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_sets" ADD CONSTRAINT "creative_sets_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;