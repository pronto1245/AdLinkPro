# Authentication Endpoint Fix - Setup Guide

## Problem Solved
Fixed the missing `/api/auth/login` route that was returning 404 errors.

## Quick Setup

### 1. Create Environment File
Copy the example environment file and configure JWT_SECRET:

```bash
cp .env.example .env
```

Add this line to your `.env` file:
```env
JWT_SECRET="your-secret-key-here-change-in-production"
```

### 2. Start the Server
```bash
npm install
npm run dev
```

### 3. Test the Login Endpoint
```bash
# Test with owner credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"9791207@gmail.com","password":"Affilix123!"}'

# Test with partner credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"partner","password":"partner123"}'
```

## Available Mock Users (for development without database)

| Email | Username | Password | Role |
|-------|----------|----------|------|
| 9791207@gmail.com | owner | Affilix123! | OWNER |
| 12345@gmail.com | advertiser | adv123 | ADVERTISER |
| 4321@gmail.com | partner | partner123 | PARTNER |

## Technical Changes Made

1. **Fixed Route Mounting Order**: Reordered authentication router mounting in `server/index.ts` to ensure `/api/auth/login` is handled by the correct router.

2. **Added Database Fallback**: Enhanced `src/services/users.ts` to fallback to mock users when database is unavailable.

3. **Enhanced User Lookup**: Updated queries to support both email and username login.

## Endpoints Now Working

- ✅ `POST /api/auth/login` - Main login endpoint
- ✅ `GET /api/me` - User profile with JWT token
- ✅ `GET /api/health` - Server health check

## Production Notes

- Change JWT_SECRET to a secure random string in production
- Set up proper PostgreSQL database connection
- The mock user fallback will be disabled when database is available