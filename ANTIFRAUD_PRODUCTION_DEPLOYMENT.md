# 🚀 Production Deployment Guide - Anti-Fraud Module

## ✅ Pre-deployment Checklist

### 1. Database Migrations
```bash
# Run the fraud-related migrations
psql -d your_database -f migrations/002_add_fraud_optimistic_locking.sql

# Verify tables were created
psql -d your_database -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'fraud%' OR table_name = 'antifraud_config';"
```

### 2. Environment Configuration
```bash
# Set environment variables
export ANTIFRAUD_ENABLED=true
export ANTIFRAUD_AUTO_TRIGGERS=false  # IMPORTANT: Keep disabled initially
export ANTIFRAUD_AUTO_BLOCKING=false  # IMPORTANT: Keep disabled initially
export ANTIFRAUD_LOG_LEVEL=info
```

### 3. Verify System Health
```bash
# Check anti-fraud system health
curl -X GET "https://your-domain.com/api/admin/production-fraud/health" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected response:
# {"healthy": true, "details": {...}}
```

## 🔧 Initial Production Setup

### Step 1: Enable Real-time Analysis Only
```bash
# Enable safe real-time analysis (no auto-actions)
curl -X POST "https://your-domain.com/api/admin/production-fraud/production-config/auto-triggers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'  # Keep disabled for monitoring phase

# Verify configuration
curl -X GET "https://your-domain.com/api/admin/production-fraud/production-config" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 2: Monitor Performance (1-2 weeks)
```bash
# Check metrics regularly
curl -X GET "https://your-domain.com/api/admin/production-fraud/metrics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Monitor key metrics:
# - antifraud_total_events
# - antifraud_fraud_rate  
# - antifraud_system_healthy
```

### Step 3: Gradual Feature Activation

#### Phase 1: Enable Auto-triggers (after 1-2 weeks monitoring)
```bash
# Enable automatic fraud detection triggers
curl -X POST "https://your-domain.com/api/admin/production-fraud/production-config/auto-triggers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Monitor for 3-5 days before next step
```

#### Phase 2: Enable Auto-blocking (after successful auto-triggers)
```bash
# Enable automatic blocking with conservative threshold
curl -X POST "https://your-domain.com/api/admin/production-fraud/production-config/auto-blocking" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "threshold": 85}'  # High threshold for safety

# Monitor blocked IPs and false positives
```

## 📊 Monitoring & Alerts

### Health Check Endpoint
```bash
# Setup monitoring system to check every 5 minutes
curl -f "https://your-domain.com/api/admin/production-fraud/health"
```

### Key Metrics to Monitor
- **System Health**: `antifraud_system_healthy` should be 1
- **Fraud Rate**: `antifraud_fraud_rate` - watch for sudden spikes  
- **Blocked IPs**: `antifraud_blocked_ips` - monitor growth rate
- **False Positives**: Manual review of blocked traffic

### Recommended Alerts
```yaml
# Example alerting configuration
alerts:
  - name: "AntifraudSystemDown"
    condition: "antifraud_system_healthy == 0"
    severity: "critical"
    
  - name: "HighFraudRate" 
    condition: "antifraud_fraud_rate > 15"  # Above 15%
    severity: "warning"
    
  - name: "TooManyBlocked"
    condition: "rate(antifraud_blocked_ips[5m]) > 10"  # >10 blocks per 5min
    severity: "warning"
```

## 🔒 Security & Access Control

### Admin API Access
```bash
# Only super_admin role can access production fraud config
# Verify role-based access is working:
curl -X GET "https://your-domain.com/api/admin/production-fraud/production-config" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
# Should return 403 Forbidden
```

### IP Whitelist Management
```bash
# Add trusted IPs to whitelist before enabling auto-blocking
curl -X POST "https://your-domain.com/api/admin/enhanced-fraud/whitelist" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "your.office.ip.address",
    "description": "Office IP - trusted",
    "addedBy": "admin",
    "isActive": true
  }'
```

## 🚨 Emergency Procedures

### Disable Auto-blocking Immediately
```bash
# If too many false positives occur
curl -X POST "https://your-domain.com/api/admin/production-fraud/production-config/auto-blocking" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "threshold": 70}'
```

### Disable All Auto-triggers
```bash
# If system causes issues
curl -X POST "https://your-domain.com/api/admin/production-fraud/production-config/auto-triggers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Remove IP from Blocklist
```bash
# If legitimate IP was blocked
curl -X DELETE "https://your-domain.com/api/admin/enhanced-fraud/whitelist/BLOCKED_IP" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📈 Performance Optimization

### Database Indexes
```sql
-- Ensure these indexes exist for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_clicks_fraud_score 
  ON tracking_clicks(fraud_score) WHERE fraud_score > 70;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_reports_status_created 
  ON fraud_reports(status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_blocks_active 
  ON fraud_blocks(type, is_active) WHERE is_active = true;
```

### Caching Recommendations
```javascript
// Consider caching whitelist results
const whitelistCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache fraud detection results for repeated IPs
const fraudScoreCache = new Map();
```

## 🔍 Troubleshooting

### Common Issues

1. **High CPU Usage**: 
   - Check `antifraud_total_events` metrics
   - Consider reducing `ipClickThreshold` if processing too many clicks

2. **False Positives**:
   - Review blocked IPs: `GET /api/admin/enhanced-fraud/whitelist`  
   - Lower `botScoreThreshold` if needed
   - Add legitimate IPs to whitelist

3. **Database Performance**:
   - Monitor fraud-related query performance
   - Ensure indexes are in place
   - Consider partitioning for high-volume deployments

### Debug Mode
```bash
# Enable detailed logging
export ANTIFRAUD_DEBUG=true
export ANTIFRAUD_LOG_LEVEL=debug

# Check logs for detailed fraud detection info
tail -f /var/log/adlinkpro/antifraud.log
```

## ✅ Post-deployment Verification

### Smoke Tests
```bash
# 1. Verify system health
curl -f "https://your-domain.com/api/admin/production-fraud/health"

# 2. Test fraud detection on suspicious traffic
curl -X POST "https://your-domain.com/api/admin/production-fraud/webhooks/test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "fraud_detected", "testData": {"clickId": "test"}}'

# 3. Verify metrics endpoint
curl "https://your-domain.com/api/admin/production-fraud/metrics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. Test optimistic locking (should return 409 on version mismatch)
curl -X PUT "https://your-domain.com/api/admin/production-fraud/fraud-reports/test-id" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"updates": {"status": "resolved"}, "expectedVersion": 999}'
```

## 🎯 Success Criteria

- ✅ System health endpoint returns `{"healthy": true}`
- ✅ Fraud detection processes clicks without blocking main flow
- ✅ Admin can enable/disable features via API
- ✅ Metrics are being collected and monitored
- ✅ No false positives in first week of monitoring
- ✅ System handles expected traffic load without performance issues

---

**⚠️ Important**: Always test configuration changes in staging environment first!

**📞 Support**: Monitor system closely for first 2 weeks after deployment.