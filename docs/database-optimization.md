# Database Indexing and Performance Recommendations

This file contains SQL commands for creating indexes that will improve query performance in production.

## User Authentication and Sessions
```sql
-- Optimize user lookups by email and username
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Session management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
```

## Links and Campaigns
```sql
-- Campaign performance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Link tracking optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_links_campaign_id ON links(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_links_created_at ON links(created_at);

-- Link analytics (most important for performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_analytics_timestamp ON link_analytics(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_analytics_ip_address ON link_analytics(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_analytics_user_agent ON link_analytics(user_agent);

-- Composite index for common analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_analytics_composite 
ON link_analytics(link_id, timestamp DESC, conversion_status);
```

## Fraud Detection and Security
```sql
-- Anti-fraud system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_attempts_ip ON fraud_attempts(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_attempts_timestamp ON fraud_attempts(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_attempts_user_id ON fraud_attempts(user_id);

-- Security audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
```

## Postback and Conversions
```sql
-- Postback tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postbacks_link_id ON postbacks(link_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postbacks_status ON postbacks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postbacks_timestamp ON postbacks(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postbacks_external_id ON postbacks(external_transaction_id);

-- Conversion tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_link_id ON conversions(link_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_timestamp ON conversions(timestamp);
```

## Performance Optimization Notes

### Query Optimization Tips:
1. Use EXPLAIN ANALYZE to check query performance
2. Monitor pg_stat_statements for slow queries
3. Consider partitioning large analytics tables by date
4. Use connection pooling (already configured in the app)

### Index Maintenance:
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Caching Strategy:
- Analytics queries: Cache for 5-15 minutes
- User profiles: Cache for 1 hour
- Campaign data: Cache for 30 minutes
- Static data (offers, etc): Cache for 4 hours

### Connection Pool Settings:
```
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_POOL_CONNECTION_TIMEOUT=5000
```

Run these commands in your PostgreSQL database after deployment to improve performance.