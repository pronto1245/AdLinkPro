# Authentication Endpoints

This document describes the authentication endpoints available in the AdLinkPro API.

## Overview

The system provides direct authentication without requiring Two-Factor Authentication (2FA):
1. User logs in with username/password via `/api/auth/v2/login`
2. System validates credentials and returns JWT token immediately
3. No 2FA verification required for current implementation

**Note:** 2FA functionality exists for future use but is currently disabled for all users. All users have `twoFactorEnabled: false` in their profiles.

## Endpoints

### POST /api/auth/v2/login
Primary login endpoint that provides direct authentication.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string", 
    "email": "string",
    "role": "string",
    "twoFactorEnabled": false
  }
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Internal server error

### POST /api/auth/2fa/verify
**Legacy 2FA endpoint** - Currently unused as 2FA is disabled for all users.

This endpoint exists for future 2FA functionality but returns errors for all requests since no temporary tokens are generated.

**Request Body:**
```json
{
  "tempToken": "string",
  "code": "string"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid or expired temporary token"
}
```

### POST /api/auth/v2/verify-2fa
**Legacy 2FA endpoint** - Currently unused as 2FA is disabled for all users.

This endpoint exists for future 2FA functionality but returns errors for all requests since no temporary tokens are generated.

**Request Body:**
```json
{
  "token": "temporary_token_string",
  "code": "string"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid or expired temporary token"
}
```

## Implementation Details

- **2FA is currently disabled** for all users in the system
- All users have `twoFactorEnabled: false` in their profiles
- The `/api/auth/v2/login` endpoint provides direct authentication without 2FA steps
- Legacy 2FA endpoints exist but are non-functional since no temporary tokens are generated
- JWT tokens are issued directly upon successful username/password verification

## Migration Notes

If you were previously using 2FA endpoints:
- Replace calls to `/api/auth/v2/login` followed by `/api/auth/v2/verify-2fa` with just `/api/auth/v2/login`
- The login response now includes the final JWT token directly
- No temporary tokens or 2FA codes are needed

## Future 2FA Implementation

The 2FA infrastructure remains in place for future activation:
- User profiles support `twoFactorEnabled` and `twoFactorSecret` fields
- 2FA verification endpoints are implemented but disabled
- To enable 2FA, modify the `users` data in `server/shared/2fa-utils.ts`