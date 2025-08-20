# 2FA Authentication Endpoints

This document describes the 2FA authentication endpoints available in the AdLinkPro API.

## Overview

The system supports Two-Factor Authentication (2FA) with the following flow:
1. User logs in with username/password via `/api/auth/v2/login`
2. If user has 2FA enabled, system returns a temporary token
3. User provides 2FA code along with temporary token to complete authentication
4. System returns JWT token upon successful verification

## Endpoints

### POST /api/auth/v2/login
Standard login endpoint that initiates 2FA flow when required.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (2FA Required):**
```json
{
  "requires2FA": true,
  "tempToken": "string",
  "message": "Please provide 2FA code"
}
```

### POST /api/auth/2fa/verify
**New endpoint** - Verifies 2FA code with direct parameter names.

**Request Body:**
```json
{
  "tempToken": "string",
  "code": "string"
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
    "twoFactorEnabled": true
  }
}
```

**Error Responses:**
- `400`: Missing tempToken or code
- `401`: Invalid or expired temporary token
- `401`: Invalid 2FA code
- `500`: Internal server error

### POST /api/auth/v2/verify-2fa
Legacy endpoint - Verifies 2FA code with mapped parameters.

**Request Body:**
```json
{
  "token": "temporary_token_string",
  "code": "string"
}
```

*Note: This endpoint maps the `token` parameter to `tempToken` internally.*

## Implementation Details

- Temporary tokens expire after 5 minutes
- Both endpoints share the same backend logic via shared utilities
- Both endpoints return identical response structures
- The new `/api/auth/2fa/verify` endpoint uses more intuitive parameter names
- All 2FA operations use the same token storage and validation logic

## Usage Recommendation

Use the new `/api/auth/2fa/verify` endpoint for cleaner API integration, as it accepts `tempToken` directly without requiring client-side parameter mapping.