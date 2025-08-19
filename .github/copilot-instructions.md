# AdLinkPro Platform - GitHub Copilot Instructions

Always follow these instructions first and fallback to additional search and context gathering only when the information in these instructions is incomplete or found to be in error.

## Working Effectively

### Bootstrap and Dependencies
- Install Node.js dependencies: `npm install`
  - NEVER CANCEL: Takes 35 seconds. Set timeout to 60+ seconds.
  - May show deprecation warnings - these are normal and can be ignored
  - Results in 974+ packages installed
- Copy environment template: `cp .env.example .env`
- Edit `.env` to set required variables (see Environment Configuration section)

### Build Commands
- TypeScript check: `npm run check`
  - NEVER CANCEL: Takes 25 seconds. Set timeout to 45+ seconds.
  - **WARNING**: Currently has 738+ TypeScript errors but does not block builds
  - These errors are known issues in the codebase - focus only on new errors you introduce
- Build server: `npm run build`
  - NEVER CANCEL: Takes <1 second for server build only. Set timeout to 30+ seconds.
- Build client: `npm run build:client` 
  - **WARNING**: Currently fails due to import path issues in App.tsx
  - Do not rely on client build working - focus on server-side functionality
- Build both: Run `npm run build && npm run build:client` for full build

### Database Operations
- **CRITICAL**: Requires PostgreSQL database connection
- Push migrations: `npm run db:push`
  - NEVER CANCEL: Takes 5+ seconds when database is available. Set timeout to 120+ seconds.
  - **WARNING**: Will fail with ECONNREFUSED if PostgreSQL is not available
- Generate new migration: `npm run db:generate`

### Testing
- Run all tests: `npm test`
  - NEVER CANCEL: Takes 57 seconds. Set timeout to 90+ seconds.
  - **WARNING**: Some tests fail due to missing dependencies (vitest, @testing-library/react)
  - Auth tests pass consistently: `npm test tests/auth.test.ts`
- Run specific test: `npm test tests/auth.test.ts`
  - Takes 8 seconds and should pass with valid configuration

### Development Server
- Start development: `npm run dev`
  - NEVER CANCEL: Takes 15+ seconds to start. Set timeout to 60+ seconds.
  - Starts on port 5000: http://localhost:5000
  - **WARNING**: Will fail if DATABASE_URL is not configured properly
  - Server starts even with database connection errors (continues running)

### Integration Audit
- Run integration analysis: `npm run audit:integration`
  - Takes <1 second. Provides comprehensive codebase analysis.
  - Generates detailed report in INTEGRATION_ANALYSIS_REPORT.md
  - Shows 77% integration score with specific issues identified

## Environment Configuration

### Required Variables
```env
# Database - CRITICAL for any database operations
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT - CRITICAL for authentication 
JWT_SECRET="your-256-bit-secret-key-change-in-production"
SESSION_SECRET="your-session-secret-key-change-in-production"
```

### Optional Variables (Platform Features)
```env
# Email service (SendGrid)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Tracker integrations
VOLUUM_TOKEN="your-voluum-api-token"
KEITARO_TOKEN="your-keitaro-api-token"  
BINOM_TOKEN="your-binom-api-token"
REDTRACK_TOKEN="your-redtrack-api-token"

# File storage (Google Cloud)
GOOGLE_CLOUD_PROJECT_ID="your-gcp-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-gcs-bucket-name"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Notifications (Telegram)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
```

## Validation Scenarios

### Authentication Flow Testing
Always test the login flow when making authentication changes:
1. Start server: `npm run dev`
2. Test login endpoints using test accounts:
   - Super Admin: `admin@example.com` / `admin123`
   - Advertiser: `advertiser1@example.com` / `adv123`
   - Affiliate: `affiliate@test.com` / `aff123`
3. Use curl or API testing tool:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Integration Testing
Always run the integration audit after making structural changes:
```bash
npm run audit:integration
```
Review the generated report for:
- Missing backend routes for frontend API calls
- Orphaned pages without backend connections  
- Dead modules that should be cleaned up
- Infrastructure service integration issues

## Common Tasks

### Key Project Structure
```
├── client/          # React frontend (TypeScript + Vite)
├── server/          # Express backend (Node.js + TypeScript)
├── shared/          # Shared types and schemas (Drizzle ORM)
├── migrations/      # Database migrations
├── tests/           # Jest test suite
├── scripts/         # Utility scripts and tools
└── .github/         # CI/CD workflows
```

### Important Files and Locations
- **Main server entry**: `server/index.ts`
- **Frontend entry**: `client/src/App.tsx`
- **Database schema**: `shared/schema.ts`
- **Environment config**: `server/config/environment.ts`
- **API routes**: `server/routes.ts` (main router)
- **Test configuration**: `jest.config.js`
- **Build configuration**: `vite.config.ts`, `tsconfig.json`

### Database Schema Overview
- **users**: User accounts with role-based access (super_admin, advertiser, affiliate, staff)
- **offers**: Advertising offers with tracking and payout settings
- **partners**: Affiliate partner information and statistics
- **clicks/conversions**: Traffic tracking and conversion data
- **postbacks**: Postback URL configurations for trackers
- **fraud_alerts**: Anti-fraud system data and alerts

### API Endpoint Categories
- `/api/auth/*` - Authentication (login, logout, profile)
- `/api/offers/*` - Offer management 
- `/api/track/*` - Click tracking and redirects
- `/api/postback/*` - Postback handling from trackers
- `/api/statistics/*` - Analytics and reporting
- `/api/admin/*` - Admin-only endpoints (many not implemented)

## Known Issues and Workarounds

### Build Issues
- **Client build fails**: App.tsx has incorrect import paths - use server-only development
- **TypeScript errors**: 738+ errors exist but don't block server builds - ignore unless you introduce new ones
- **Missing test dependencies**: Some tests require vitest and @testing-library packages not installed

### Database Issues  
- **PostgreSQL required**: Application expects PostgreSQL, doesn't work with SQLite
- **Migration failures**: `npm run db:push` fails without valid DATABASE_URL
- **Connection errors**: Server continues running even with DB connection failures

### Integration Issues
- **271 missing API routes**: Many frontend API calls have no matching backend implementation
- **Infrastructure services**: WebSocket, notifications, and themes are poorly integrated
- **Dead modules**: 15+ unused route handlers should be cleaned up

## Deployment and CI/CD

### GitHub Actions Pipeline
- **File**: `.github/workflows/deploy.yml`
- **Triggers**: Push to main branch
- **Steps**: Install → Build → Test production build
- **Environment**: Requires environment variables set in GitHub Secrets

### Deployment Platforms
- **Railway**: Recommended - automatic deployment from GitHub
- **Vercel**: Full-stack support with `vercel.json` configuration
- **Netlify**: Static hosting with `netlify.toml` configuration  
- **Docker**: Dockerfile available for containerized deployment

### Production Environment
- Set all required environment variables in deployment platform
- Ensure PostgreSQL database is provisioned and accessible
- JWT_SECRET and SESSION_SECRET must be secure random strings in production
- Database migrations run automatically on deployment

## Troubleshooting

### Development Issues
- **"Cannot find module" errors**: Usually import path issues - check actual file locations
- **Database connection refused**: Verify DATABASE_URL is correct and PostgreSQL is running
- **Build timeouts**: Increase timeout values, builds can take 45+ minutes in some environments
- **Test failures**: Focus on auth tests which are most reliable

### Performance Considerations
- **Node.js version**: Requires Node.js 18+ (currently uses 20.19.4)
- **Memory usage**: Large dependency tree - ensure sufficient memory for builds
- **Build times**: Server builds are fast (<1s), client builds when working take 2-3 seconds

Always run `npm run audit:integration` after making changes to understand the impact on the codebase integration.