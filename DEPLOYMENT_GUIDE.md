# Enhanced Backend Platform - Deployment Guide

## Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Required Environment Variables
```env
# Database (Required)
DATABASE_URL="postgresql://username:password@host:port/database"

# Security (Required)
JWT_SECRET="your-256-bit-secret-key-change-this"
SESSION_SECRET="your-session-secret-change-this"

# Server Configuration
NODE_ENV="production"
PORT="5000"
ALLOWED_ORIGINS="https://yourdomain.com"
```

### 3. Database Setup
```bash
# Install dependencies
npm install

# Push database schema (if using Drizzle)
npm run db:push

# Or run manual migrations if needed
```

### 4. Build & Start
```bash
# Build the server
npm run build:server

# Start production server
npm start

# Or for development
npm run dev
```

## Production Deployment

### Using Docker (Recommended)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:server

EXPOSE 5000
CMD ["npm", "start"]
```

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name adlinkpro-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Variables for Production

#### Database
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/adlinkpro"
```

#### Security
```env
JWT_SECRET="32-char-production-secret"
SESSION_SECRET="32-char-session-secret"
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
```

#### Email Integration (Optional)
```env
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="AdLinkPro Platform"
```

#### Anti-Fraud (Optional)
```env
ANTIFRAUD_LEVEL="high"
MAX_CLICKS_PER_IP_HOUR="50"
AUTO_BLOCK_SUSPICIOUS_IPS="true"
```

#### Monitoring (Optional)
```env
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="warn"
```

### Database Tables

The following tables need to exist in your database:

#### Core Tables
- `users` - User management
- `offers` - Offer management  
- `deposits` - Deposit management
- `payouts` - Payout management
- `team_invitations` - Team invitation system

#### Analytics Tables
- `tracking_clicks` - Click tracking
- `conversion_data` - Conversion tracking
- `analytics_data` - Analytics data

#### Anti-Fraud Tables  
- `fraud_alerts` - Fraud alerts
- `fraud_blocks` - IP/User blocks
- `ip_analysis` - IP analysis data

### Health Checks

#### Basic Health Check
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "ok": true,
  "where": "server/index.ts",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### API Functionality Test
```bash
# Run the test script
node test-api.mjs
```

### Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

### Performance Considerations

#### Caching
- Analytics queries are cached for 5-15 minutes
- Clear cache via `/api/admin/analytics/clear-cache`

#### Database Optimization
- Ensure proper indexes on frequently queried columns
- Monitor query performance in production
- Use connection pooling (already configured)

#### Rate Limiting
- Default: 300 requests per 15-minute window
- Adjust via environment variables if needed

### Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled in production
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] IP restrictions configured (if needed)

### Monitoring & Alerting

#### Key Metrics to Monitor
- API response times
- Database connection health
- Error rates in logs
- Fraud detection alerts
- Authentication failures

#### Log Analysis
```bash
# View recent errors
tail -f logs/error.log

# Search for specific issues
grep "UNAUTHORIZED_ACCESS" logs/combined.log

# Monitor authentication
grep "LOGIN" logs/combined.log | tail -20
```

### Backup & Recovery

#### Database Backup
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

#### Application Data
- User files (if any)
- Configuration files
- Log files (optional)

### Troubleshooting

#### Common Issues

**Database Connection Error**
- Verify DATABASE_URL format
- Check database server accessibility
- Ensure database exists and user has permissions

**JWT Token Issues**
- Verify JWT_SECRET is set and consistent
- Check token expiration settings
- Validate token format in requests

**Permission Errors**
- Check user roles and permissions in database
- Verify middleware configuration
- Review audit logs for access attempts

**Performance Issues**
- Monitor database query performance
- Check cache hit rates
- Review rate limiting logs

#### Debug Mode
```env
DEBUG="true"
LOG_LEVEL="debug"
```

### Scaling Considerations

#### Horizontal Scaling
- Stateless design allows multiple instances
- Shared database and Redis (if used)
- Load balancer configuration needed

#### Vertical Scaling
- Monitor CPU and memory usage
- Database connection pooling limits
- Log file rotation

### API Documentation

Complete API documentation available in `ENHANCED_BACKEND_API_DOCS.md`.

### Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review security settings

The enhanced backend platform is designed for production use with comprehensive monitoring, security, and scalability features.