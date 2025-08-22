-- Performance Optimization Database Indexes
-- This migration adds critical indexes for improved query performance

-- Users table indexes for authentication and lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_email_active 
    ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_role_active 
    ON users(role) WHERE is_active = true AND is_blocked = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_created 
    ON users(created_at);

-- Offers table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_category_status 
    ON offers(category, status) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_advertiser_status 
    ON offers(advertiser_id, status) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_payout_type 
    ON offers(payout_type, payout) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_countries_gin 
    ON offers USING GIN(countries) WHERE countries IS NOT NULL;

-- Tracking Links performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_tracking_partner_offer 
    ON tracking_links(partner_id, offer_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_tracking_created 
    ON tracking_links(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_tracking_link_hash 
    ON tracking_links(link_hash) WHERE link_hash IS NOT NULL;

-- Clicks table indexes for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_tracking_timestamp 
    ON clicks(tracking_link_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_partner_timestamp 
    ON clicks(partner_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_offer_timestamp 
    ON clicks(offer_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_country_timestamp 
    ON clicks(country, created_at) WHERE country IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_device_timestamp 
    ON clicks(device_type, created_at) WHERE device_type IS NOT NULL;

-- Conversions table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_partner_timestamp 
    ON conversions(partner_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_advertiser_timestamp 
    ON conversions(advertiser_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_offer_timestamp 
    ON conversions(offer_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_status_timestamp 
    ON conversions(conversion_status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_revenue 
    ON conversions(revenue, created_at) WHERE revenue > 0;

-- Financial transactions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_financial_user_type_timestamp 
    ON financial_transactions(user_id, transaction_type, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_financial_status_timestamp 
    ON financial_transactions(status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_financial_amount 
    ON financial_transactions(amount) WHERE amount != 0;

-- Audit logs performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_audit_user_timestamp 
    ON audit_logs(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_audit_action_timestamp 
    ON audit_logs(action, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_audit_ip_timestamp 
    ON audit_logs(ip_address, created_at) WHERE ip_address IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_audit_success_timestamp 
    ON audit_logs(success, created_at);

-- Fraud detection indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_fraud_type_severity_timestamp 
    ON fraud_reports(type, severity, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_fraud_partner_timestamp 
    ON fraud_reports(partner_id, created_at) WHERE partner_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_fraud_offer_timestamp 
    ON fraud_reports(offer_id, created_at) WHERE offer_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_fraud_status 
    ON fraud_reports(status) WHERE status != 'resolved';

-- Notifications indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_notifications_user_read 
    ON notifications(user_id, is_read, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_notifications_type_timestamp 
    ON notifications(type, created_at);

-- Sessions performance (if using database sessions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_sessions_user_expires 
    ON sessions(user_id, expires_at) WHERE expires_at > NOW();
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_sessions_expires 
    ON sessions(expires_at);

-- Composite indexes for complex reporting queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_clicks_partner_offer_timestamp 
    ON clicks(partner_id, offer_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversions_partner_offer_timestamp 
    ON conversions(partner_id, offer_id, created_at);

-- Partial indexes for active/important records only
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_active_featured 
    ON offers(featured, created_at) WHERE is_active = true AND featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_active_staff 
    ON users(role, created_at) WHERE is_active = true AND role IN ('owner', 'admin', 'staff');

-- Full-text search indexes for offers
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_search_name 
    ON offers USING GIN(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_offers_search_description 
    ON offers USING GIN(to_tsvector('english', description::text));

-- Cleanup old statistics and refresh
ANALYZE users, offers, tracking_links, clicks, conversions, financial_transactions, audit_logs, fraud_reports;

-- Add helpful comments
COMMENT ON INDEX ix_users_email_active IS 'Optimizes user authentication queries';
COMMENT ON INDEX ix_offers_category_status IS 'Optimizes offer listing by category';
COMMENT ON INDEX ix_clicks_tracking_timestamp IS 'Optimizes click analytics queries';
COMMENT ON INDEX ix_conversions_revenue IS 'Optimizes revenue reporting queries';
COMMENT ON INDEX ix_audit_action_timestamp IS 'Optimizes security audit queries';