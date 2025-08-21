# Authentication Endpoints Deployment Guide

## Problem Solved
Fixed missing authentication endpoints `/api/auth/login` and `/auth/login` on the server.

## Changes Made

### 1. Route Registration Fix
**File:** `server/index.ts`
- Added proper mounting of authentication routes
- Ensured all auth endpoints are accessible at multiple paths for compatibility

### 2. Environment Configuration
**File:** `.env` (not committed to repo)
```env
JWT_SECRET=production-safe-jwt-secret-2024-arbiconnect-platform
OWNER_EMAIL=9791207@gmail.com
OWNER_PASSWORD=Affilix123!
ADVERTISER_EMAIL=12345@gmail.com
ADVERTISER_PASSWORD=adv123
PARTNER_EMAIL=4321@gmail.com
PARTNER_PASSWORD=partner123
```

### 3. Available Endpoints
After the fix, these endpoints are now available:

- ✅ `GET /api/health` - Health check
- ✅ `POST /api/auth/login` - Main authentication endpoint  
- ✅ `POST /auth/login` - Alternative authentication endpoint
- ✅ `POST /api/auth/v2/login` - V2 authentication endpoint
- ✅ `POST /api/auth/fixed/login` - Fixed authentication endpoint
- ✅ `GET /api/me` - User profile endpoint (requires JWT token)

## Deployment Instructions

### For Koyeb Deployment

1. **Set Environment Variables in Koyeb Dashboard:**
   ```
   JWT_SECRET=production-safe-jwt-secret-2024-arbiconnect-platform
   NODE_ENV=production
   PORT=8000
   ```

2. **Deploy Latest Code:**
   - Ensure the latest commit with authentication fixes is deployed
   - Koyeb should automatically redeploy when new commits are pushed to main branch

3. **Verify Deployment:**
   ```bash
   # Run the verification script
   ./scripts/verify-auth-endpoints.sh
   ```

### Testing Authentication

#### Owner Login:
```bash
curl -X POST https://central-matelda-pronto12-95b8129d.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"Affilix123!"}'
```

#### Advertiser Login:
```bash
curl -X POST https://central-matelda-pronto12-95b8129d.koyeb.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"advertiser","password":"adv123"}'
```

### Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "username": "owner",
    "email": "9791207@gmail.com",
    "role": "OWNER",
    "twoFactorEnabled": false
  }
}
```

## Troubleshooting

### Issue: "JWT_SECRET missing"
- **Solution:** Set JWT_SECRET environment variable in deployment platform

### Issue: "Invalid credentials"
- **Solution:** Use correct test credentials or set custom ones via environment variables

### Issue: "Cannot POST /auth/login" (404)
- **Solution:** Ensure latest code is deployed with proper route mounting

### Issue: CORS errors
- **Solution:** Add your domain to CORS_ORIGIN environment variable

## Test Credentials

| Role | Username | Password | 
|------|----------|----------|
| Owner | `owner` | `Affilix123!` |
| Advertiser | `advertiser` | `adv123` |
| Partner | `partner` | `partner123` |

## Development

### Running Locally:
```bash
npm run dev
```

### Running Tests:
```bash
npm test
```

All authentication tests should pass with 6/6 test cases successful.