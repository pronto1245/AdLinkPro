# Environment Configuration Guide

This document explains how to properly configure environment variables for the AdLinkPro platform.

## Problem Resolved

Previously, the frontend was making requests to the wrong port (8000) instead of the configured server port (5050). This was due to:

1. **Inconsistent environment variable names**: The code used both `VITE_API_URL` and `VITE_API_BASE`
2. **Missing environment files**: No `.env` files were configured
3. **Incorrect proxy configuration**: Vite proxy was pointing to port 5000 instead of 5050

## Solution

### 1. Environment Files Setup

**Important**: `.env` files are gitignored for security reasons. You need to create them locally based on the `.env.example` templates.

**Root `.env` (Server configuration):**
```bash
# Copy the example file
cp .env.example .env
# Edit with your values
```
Example content:
```env
NODE_ENV=development
PORT=5050
JWT_SECRET=development-jwt-secret-2024-adlinkpro
JWT_EXPIRES_IN=24h
SESSION_SECRET=development-session-secret-2024-adlinkpro
DATABASE_URL=
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Client `.env` (Frontend configuration):**
```bash
# Create from example
cp client/.env.example client/.env
```
Example content:
```env
VITE_API_URL=http://localhost:5050
VITE_WS_URL=ws://localhost:5050
```

### 2. Code Changes

- **Fixed environment variable naming**: Updated `client/src/services/http.ts` and `client/src/lib/api.ts` to use `VITE_API_URL` consistently
- **Updated TypeScript definitions**: Added `VITE_API_BASE` to `client/src/vite-env.d.ts` for backward compatibility
- **Fixed Vite proxy**: Updated `client/vite.config.ts` to proxy to the correct port (5050)

### 3. Port Configuration

- **Server**: Now runs on port 5050 by default
- **Client**: Runs on port 3000 (development server)
- **API requests**: All go to `http://localhost:5050/api/*`

## Usage

### Quick Setup

1. **Create environment files:**
   ```bash
   # Server configuration
   cp .env.example .env
   
   # Client configuration  
   cp client/.env.example client/.env
   ```

2. **Edit the files with your values** (the defaults work for development)

### Development Mode

1. **Start the backend server:**
   ```bash
   npm run dev
   # Server starts at http://localhost:5050
   ```

2. **Start the frontend (in another terminal):**
   ```bash
   npx vite --config client/vite.config.ts --port 3000
   # Frontend serves at http://localhost:3000
   ```

### Environment Variables Priority

1. **VITE_API_URL**: Primary variable used by the application
2. **VITE_API_BASE**: Secondary variable (for backward compatibility)
3. **Default fallback**: `/api` (relative path)

### Testing

You can verify the configuration works by:

```bash
# Test API connectivity (should work)
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Expected response: {"error":"Invalid credentials"} (401 status)
```

## Environment Variable Reference

### Server (.env)
- `PORT`: Server port (default: 5050)
- `NODE_ENV`: Environment mode
- `JWT_SECRET`: JWT signing key
- `DATABASE_URL`: Database connection string

### Client (client/.env)
- `VITE_API_URL`: Full API base URL (e.g., http://localhost:5050)
- `VITE_WS_URL`: WebSocket URL for real-time features

## Troubleshooting

**Issue**: Requests still going to wrong port
- **Solution**: Ensure both `.env` files exist and contain correct URLs
- **Verify**: Restart both servers after changing environment variables

**Issue**: Build fails due to missing environment variables
- **Solution**: Copy `.env.example` to `.env` and configure values

**Issue**: CORS errors
- **Solution**: Update `ALLOWED_ORIGINS` in server `.env` file