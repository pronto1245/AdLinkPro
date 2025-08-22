# AdLinkPro - Advanced Affiliate Marketing Platform

A comprehensive affiliate marketing platform with advanced link tracking, analytics, and fraud detection capabilities.

## 🚀 Features

- **Link Management**: Create and manage shortened links with detailed analytics
- **Campaign Tracking**: Advanced campaign management with postback integration
- **Anti-Fraud System**: Real-time fraud detection and IP blocking
- **Multi-User Support**: Role-based access control for partners and advertisers
- **Analytics Dashboard**: Comprehensive reporting and real-time analytics
- **External Integrations**: Support for Keitaro, RedTrack, Voluum, and other platforms
- **Secure Authentication**: JWT-based auth with 2FA support
- **File Storage**: Google Cloud Storage integration
- **Email Notifications**: SendGrid integration for notifications

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Caching**: Redis (optional)
- **File Storage**: Google Cloud Storage (optional)
- **Queue System**: BullMQ for background jobs

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL 13+
- Redis (optional, for caching)
- Google Cloud Storage account (optional)
- SendGrid account (optional, for emails)

## 🚀 Quick Start

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
JWT_SECRET="your-super-secure-jwt-secret-256-bits-minimum"
SESSION_SECRET="your-super-secure-session-secret"

# Application
NODE_ENV="production"
PORT="5000"
```

### 3. Optional Services

```env
# Email (Optional - warnings only if missing)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# External Trackers (Optional)
KEITARO_TOKEN="your-keitaro-api-key"
VOLUUM_TOKEN="your-voluum-api-key" 
REDTRACK_TOKEN="your-redtrack-api-key"

# Google Cloud Storage (Optional)
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

### 4. Installation & Deployment

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build application
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres
      
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=adlinkpro
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Direct Docker Build

```bash
# Build image
docker build -t adlinkpro .

# Run container
docker run -p 5000:5000 --env-file .env adlinkpro
```

## ☁️ Platform Deployments

### Railway
1. Connect your GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push

### Vercel
```json
{
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server/index.ts"
    }
  ]
}
```

### Render
1. Connect repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Start frontend (in another terminal)
cd client && npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run check        # TypeScript type checking
```

## 🛡️ Security Features

- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **XSS Prevention**: Input escaping and CSP headers
- **Rate Limiting**: Request rate limiting by IP
- **JWT Security**: Secure token generation with expiration
- **Password Security**: bcrypt with configurable rounds
- **Audit Logging**: Security event tracking

## 📊 Monitoring & Logging

### Log Files
- `logs/app.log` - Application logs
- `logs/error.log` - Error logs only  
- `logs/audit.log` - Security audit logs
- `logs/performance.log` - Performance metrics

### Health Check Endpoint
```
GET /api/health
```

Returns application health status, uptime, and system metrics.

### Performance Monitoring

The application includes built-in performance monitoring:
- Request/response time tracking
- Memory usage monitoring
- Database query performance
- Error rate tracking

## 🗄️ Database Management

### Initial Setup

```bash
# Push database schema
npm run db:push
```

### Performance Optimization

See `docs/database-optimization.md` for recommended database indexes and optimization strategies.

### Backup Strategy

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * pg_dump $DATABASE_URL > /backups/adlinkpro-$(date +\%Y\%m\%d).sql
```

## 🔐 Production Security Checklist

- [ ] Strong JWT_SECRET (32+ characters, cryptographically random)
- [ ] HTTPS enabled (SSL/TLS certificates)
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Environment Variable Issues**
   ```bash
   # Validate environment
   node -e "console.log(process.env.JWT_SECRET ? 'JWT_SECRET is set' : 'JWT_SECRET missing')"
   ```

### Log Analysis

```bash
# View recent errors
tail -f logs/error.log

# Search for specific issues
grep "UNAUTHORIZED_ACCESS" logs/audit.log

# Monitor authentication
grep "LOGIN" logs/audit.log | tail -20
```

## 📈 Performance Optimization

### Database Optimization
- Implement recommended indexes (see `docs/database-optimization.md`)
- Use connection pooling (already configured)
- Monitor slow queries with `pg_stat_statements`

### Caching Strategy
- Analytics queries: 5-15 minutes
- User profiles: 1 hour  
- Campaign data: 30 minutes
- Static content: 4 hours

### Frontend Optimization
- Code splitting with Vite
- Lazy loading components
- Image optimization
- CDN for static assets

## 🔗 API Documentation

The platform provides comprehensive REST API endpoints:

- Authentication: `/api/auth/*`
- Link Management: `/api/links/*`
- Analytics: `/api/analytics/*`
- Campaign Management: `/api/campaigns/*`
- User Management: `/api/users/*`

See `ENHANCED_BACKEND_API_DOCS.md` for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For deployment issues:
1. Check application logs (`logs/error.log`)
2. Verify environment configuration
3. Test database connectivity
4. Review security settings

## 🚀 Production Ready

This platform is production-ready with:
- ✅ Comprehensive security measures
- ✅ Performance monitoring
- ✅ Error handling and logging
- ✅ Scalable architecture
- ✅ Database optimization
- ✅ CI/CD pipeline
- ✅ Docker containerization
- ✅ Cloud platform compatibility

---

**Version**: 1.0.0  
**Node.js**: 20+  
**Database**: PostgreSQL 13+