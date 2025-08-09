-- Enhanced postback system indexes for performance
-- Run this migration to add all necessary indexes

-- Conversions table indexes
CREATE INDEX IF NOT EXISTS ix_conv_clickid ON conversions(clickid);
CREATE INDEX IF NOT EXISTS ix_conv_status ON conversions(conversion_status);
CREATE INDEX IF NOT EXISTS ix_conv_advertiser ON conversions(advertiser_id);
CREATE INDEX IF NOT EXISTS ix_conv_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS ix_conv_created ON conversions(created_at);
CREATE INDEX IF NOT EXISTS ix_conv_type ON conversions(type);

-- Enhanced postback profiles indexes
CREATE INDEX IF NOT EXISTS ix_pb_scope ON enhanced_postback_profiles(owner_scope, owner_id, scope_type);
CREATE INDEX IF NOT EXISTS ix_pb_enabled ON enhanced_postback_profiles(enabled);
CREATE INDEX IF NOT EXISTS ix_pb_priority ON enhanced_postback_profiles(priority);

-- Postback deliveries indexes
CREATE INDEX IF NOT EXISTS ix_delivery_profile ON postback_deliveries(profile_id);
CREATE INDEX IF NOT EXISTS ix_delivery_clickid ON postback_deliveries(clickid);
CREATE INDEX IF NOT EXISTS ix_delivery_attempt ON postback_deliveries(attempt);
CREATE INDEX IF NOT EXISTS ix_delivery_created ON postback_deliveries(created_at);
CREATE INDEX IF NOT EXISTS ix_delivery_status ON postback_deliveries(response_code);

-- Compound indexes for complex queries
CREATE INDEX IF NOT EXISTS ix_conv_advertiser_status ON conversions(advertiser_id, conversion_status);
CREATE INDEX IF NOT EXISTS ix_conv_partner_status ON conversions(partner_id, conversion_status);
CREATE INDEX IF NOT EXISTS ix_delivery_profile_attempt ON postback_deliveries(profile_id, attempt);

-- Performance optimizations for reporting
CREATE INDEX IF NOT EXISTS ix_conv_revenue_created ON conversions(revenue, created_at) WHERE revenue > 0;
CREATE INDEX IF NOT EXISTS ix_delivery_success_created ON postback_deliveries(created_at) WHERE response_code BETWEEN 200 AND 299;