# AdLinkPro API Documentation

## Overview

The AdLinkPro API provides comprehensive endpoints for managing affiliate marketing operations including user management, offer management, analytics, and financial operations. All endpoints use RESTful conventions and JSON for data exchange.

**Base URL**: `https://api.adlinkpro.com/api`
**Version**: 1.0
**Authentication**: JWT Bearer Token

## Authentication

### Overview
All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format
JWT tokens contain the following claims:
- `sub` or `id`: User identifier
- `role`: User role (owner, advertiser, partner, staff)
- `email`: User email address
- `username`: Username
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp

### Security Features
- **Token Validation**: Comprehensive format and payload validation
- **Expiration Handling**: Automatic token expiry detection
- **Role Verification**: Database-verified role checking
- **Audit Logging**: All authentication events are logged

---

## Authentication Endpoints

### POST `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "role": "partner",
    "isActive": true
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `429`: Too many login attempts

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Full Name",
  "role": "partner",
  "companyName": "Company Name (optional)",
  "phoneNumber": "+1234567890 (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "role": "partner",
    "isActive": true
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `409`: Email already exists
- `422`: Password too weak

### GET `/auth/verify`
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "partner",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `401`: Invalid or expired token
- `403`: Token format invalid

### POST `/auth/logout`
Logout and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### POST `/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## User Management

### GET `/users/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "name": "Full Name",
  "role": "partner",
  "companyName": "Company Name",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "isBlocked": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH `/users/profile`
Update current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "companyName": "Updated Company",
  "phoneNumber": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    // Updated user object
  }
}
```

### GET `/users` (Admin/Owner only)
List all users with filtering and pagination.

**Query Parameters:**
- `role`: Filter by role (owner, advertiser, partner, staff)
- `status`: Filter by status (active, blocked, pending)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `search`: Search in email, username, name

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "username",
      "role": "partner",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Offer Management

### GET `/offers`
Get offers list with filtering and pagination.

**Query Parameters:**
- `category`: Filter by category
- `status`: Filter by status (active, inactive, pending)
- `advertiser`: Filter by advertiser ID
- `countries`: Filter by target countries (comma-separated)
- `payoutMin`: Minimum payout amount
- `payoutMax`: Maximum payout amount
- `payoutType`: Filter by payout type (cpa, cpl, cps, etc.)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `search`: Search in offer name and description

**Success Response (200):**
```json
{
  "offers": [
    {
      "id": "offer-id-1",
      "name": "Finance App Download",
      "description": "Mobile finance app with high conversion rates",
      "category": "finance",
      "vertical": "fintech",
      "advertiserId": "advertiser-id",
      "advertiserName": "Finance Company",
      "payout": 25.50,
      "payoutType": "cpa",
      "currency": "USD",
      "countries": ["US", "UK", "CA"],
      "logo": "https://cdn.adlinkpro.com/logos/offer-1.png",
      "isActive": true,
      "isFeatured": false,
      "conversionRate": 3.45,
      "epc": 0.88,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "filters": {
    "categories": ["finance", "gaming", "ecommerce"],
    "countries": ["US", "UK", "CA", "DE"],
    "payoutTypes": ["cpa", "cpl", "cps"]
  }
}
```

### GET `/offers/{offerId}`
Get detailed offer information.

**Path Parameters:**
- `offerId`: Unique offer identifier

**Success Response (200):**
```json
{
  "id": "offer-id-1",
  "name": "Finance App Download",
  "description": {
    "en": "Mobile finance app with high conversion rates",
    "ru": "Мобильное финансовое приложение с высокой конверсией"
  },
  "category": "finance",
  "vertical": "fintech",
  "advertiserId": "advertiser-id",
  "advertiserName": "Finance Company",
  "payout": 25.50,
  "payoutType": "cpa",
  "currency": "USD",
  "countries": ["US", "UK", "CA"],
  "geoTargeting": "English-speaking countries",
  "trackingUrl": "https://track.adlinkpro.com/click/{clickId}",
  "landingPageUrl": "https://finance-app.com/landing",
  "previewUrl": "https://finance-app.com/preview",
  "logo": "https://cdn.adlinkpro.com/logos/offer-1.png",
  "image": "https://cdn.adlinkpro.com/images/offer-1.jpg",
  "creatives": "https://cdn.adlinkpro.com/creatives/offer-1.zip",
  "kpiConditions": {
    "en": "Minimum 7-day retention required",
    "ru": "Требуется минимум 7-дневное удержание"
  },
  "trafficSources": ["social", "native", "push", "email"],
  "allowedApplications": ["web", "mobile_app", "webview"],
  "isActive": true,
  "isFeatured": false,
  "stats": {
    "totalClicks": 15420,
    "totalConversions": 532,
    "conversionRate": 3.45,
    "epc": 0.88,
    "revenue": 13565.00
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST `/offers` (Advertiser only)
Create a new offer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Mobile Game",
  "description": {
    "en": "Exciting mobile game with in-app purchases",
    "ru": "Увлекательная мобильная игра с внутриигровыми покупками"
  },
  "category": "gaming",
  "vertical": "mobile_games",
  "payout": 15.00,
  "payoutType": "cpi",
  "currency": "USD",
  "countries": ["US", "UK", "CA", "AU"],
  "geoTargeting": "English-speaking countries, age 18-35",
  "landingPageUrl": "https://game.com/install",
  "previewUrl": "https://game.com/preview",
  "kpiConditions": {
    "en": "User must reach level 3 within 24 hours",
    "ru": "Пользователь должен достичь 3 уровня в течение 24 часов"
  },
  "trafficSources": ["social", "native", "video"],
  "allowedApplications": ["mobile_app"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "offer": {
    "id": "new-offer-id",
    "name": "New Mobile Game",
    "status": "pending_approval",
    // ... other offer fields
  }
}
```

### PATCH `/offers/{offerId}` (Advertiser/Admin only)
Update offer information.

**Path Parameters:**
- `offerId`: Offer ID to update

**Request Body:** (Only include fields to update)
```json
{
  "payout": 18.00,
  "isActive": true,
  "countries": ["US", "UK", "CA", "AU", "NZ"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "offer": {
    // Updated offer object
  }
}
```

---

## Tracking Links

### GET `/tracking/links`
Get user's tracking links.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `offerId`: Filter by offer
- `status`: Filter by status (active, inactive)
- `page`: Page number
- `limit`: Results per page

**Success Response (200):**
```json
{
  "links": [
    {
      "id": "link-id-1",
      "offerId": "offer-id-1",
      "offerName": "Finance App Download",
      "linkUrl": "https://track.adlinkpro.com/click/abc123def456",
      "linkHash": "abc123def456",
      "isActive": true,
      "clicks": 245,
      "conversions": 8,
      "revenue": 204.00,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### POST `/tracking/links`
Create new tracking link.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "offerId": "offer-id-1",
  "subId1": "campaign-123",
  "subId2": "source-facebook",
  "customParameters": {
    "utm_source": "facebook",
    "utm_campaign": "finance-q1"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "link": {
    "id": "new-link-id",
    "offerId": "offer-id-1",
    "linkUrl": "https://track.adlinkpro.com/click/xyz789abc123",
    "linkHash": "xyz789abc123",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Analytics

### GET `/analytics/stats`
Get analytics statistics with flexible filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `timeframe`: Time period (today, yesterday, 7d, 30d, custom)
- `startDate`: Start date for custom timeframe (YYYY-MM-DD)
- `endDate`: End date for custom timeframe (YYYY-MM-DD)
- `groupBy`: Group results by (hour, day, week, month)
- `offerId`: Filter by specific offer
- `partnerId`: Filter by partner (admin only)
- `advertiserId`: Filter by advertiser (admin only)
- `country`: Filter by country code
- `deviceType`: Filter by device type (desktop, mobile, tablet)

**Success Response (200):**
```json
{
  "summary": {
    "clicks": 5420,
    "conversions": 187,
    "revenue": 4675.50,
    "conversionRate": 3.45,
    "epc": 0.86,
    "ctr": 12.34
  },
  "data": [
    {
      "date": "2024-01-01",
      "clicks": 245,
      "conversions": 8,
      "revenue": 204.00,
      "conversionRate": 3.27,
      "epc": 0.83
    },
    // ... more daily data
  ],
  "topOffers": [
    {
      "offerId": "offer-id-1",
      "offerName": "Finance App",
      "clicks": 1250,
      "conversions": 43,
      "revenue": 1075.00
    }
  ],
  "topCountries": [
    {
      "country": "US",
      "countryName": "United States",
      "clicks": 2100,
      "conversions": 89,
      "revenue": 2225.00
    }
  ]
}
```

### GET `/analytics/reports/performance`
Get detailed performance report.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** (Same as stats endpoint)

**Success Response (200):**
```json
{
  "reportId": "report-123456",
  "generatedAt": "2024-01-01T12:00:00.000Z",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "timezone": "UTC"
  },
  "performance": {
    "totalClicks": 45420,
    "uniqueClicks": 38950,
    "totalConversions": 1567,
    "uniqueConversions": 1489,
    "totalRevenue": 39175.50,
    "averagePayout": 25.00,
    "conversionRate": 3.45,
    "epc": 0.86
  },
  "breakdown": {
    "byOffer": [
      {
        "offerId": "offer-id-1",
        "offerName": "Finance App",
        "clicks": 12450,
        "conversions": 430,
        "revenue": 10750.00,
        "conversionRate": 3.45,
        "epc": 0.86
      }
    ],
    "byDate": [
      // Daily breakdown
    ],
    "byCountry": [
      // Country breakdown
    ],
    "byDevice": [
      // Device breakdown
    ]
  }
}
```

---

## Financial Management

### GET `/finance/balance`
Get current account balance.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "currentBalance": 1245.75,
  "availableBalance": 1180.50,
  "pendingBalance": 65.25,
  "currency": "USD",
  "lastUpdated": "2024-01-01T12:00:00.000Z",
  "paymentTerms": "NET30",
  "minimumPayout": 100.00,
  "nextPayoutDate": "2024-01-31T00:00:00.000Z"
}
```

### GET `/finance/transactions`
Get transaction history.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type`: Filter by type (payout, earning, adjustment)
- `status`: Filter by status (pending, completed, failed)
- `startDate`: Start date filter
- `endDate`: End date filter
- `page`: Page number
- `limit`: Results per page

**Success Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn-123456",
      "type": "payout",
      "amount": 500.00,
      "currency": "USD",
      "status": "completed",
      "description": "Monthly payout - January 2024",
      "paymentMethod": "bank_transfer",
      "referenceId": "PAY-789123",
      "processedAt": "2024-01-31T10:00:00.000Z",
      "createdAt": "2024-01-30T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### POST `/finance/payout-request`
Request a payout.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 250.00,
  "paymentMethod": "bank_transfer",
  "paymentDetails": {
    "bankName": "Bank Name",
    "accountNumber": "1234567890",
    "routingNumber": "123456789",
    "accountHolder": "Account Holder Name"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "payoutRequest": {
    "id": "payout-req-123",
    "amount": 250.00,
    "status": "pending",
    "estimatedProcessingDate": "2024-02-05T00:00:00.000Z",
    "createdAt": "2024-01-31T16:00:00.000Z"
  }
}
```

---

## Fraud Detection

### GET `/fraud/reports`
Get fraud detection reports.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `severity`: Filter by severity (low, medium, high, critical)
- `status`: Filter by status (pending, reviewing, confirmed, resolved)
- `type`: Filter by fraud type
- `startDate`: Start date filter
- `endDate`: End date filter

**Success Response (200):**
```json
{
  "reports": [
    {
      "id": "fraud-report-123",
      "type": "click_speed",
      "severity": "high",
      "status": "confirmed",
      "partnerId": "partner-id-1",
      "offerId": "offer-id-1",
      "fraudScore": 85,
      "indicators": ["rapid_clicks", "suspicious_user_agent"],
      "ipAddress": "192.168.1.1",
      "country": "US",
      "detectedAt": "2024-01-31T14:30:00.000Z",
      "reviewedAt": "2024-01-31T15:45:00.000Z",
      "reviewedBy": "fraud-analyst-1"
    }
  ],
  "summary": {
    "totalReports": 45,
    "pendingReports": 8,
    "confirmedFraud": 12,
    "falsePositives": 15
  }
}
```

---

## Rate Limiting

All API endpoints are protected by rate limiting:

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 5 requests | 1 minute |
| User Management | 60 requests | 1 minute |
| Offers | 100 requests | 1 minute |
| Analytics | 30 requests | 1 minute |
| Financial | 10 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

**Rate Limit Exceeded (429):**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Handling

### Standard Error Format

All API errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request / validation error
- `401`: Authentication required
- `403`: Insufficient permissions
- `404`: Resource not found
- `409`: Conflict (e.g., duplicate email)
- `422`: Unprocessable entity
- `429`: Rate limit exceeded
- `500`: Internal server error

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | JWT token invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_EMAIL` | Email already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `FRAUD_DETECTED` | Fraudulent activity detected |
| `PAYOUT_INSUFFICIENT_BALANCE` | Insufficient balance for payout |

---

## Webhooks

### Postback URLs
Partners can configure postback URLs to receive real-time conversion notifications:

**Postback Format:**
```
GET {postback_url}?clickid={click_id}&payout={payout}&status={status}
```

**Parameters:**
- `clickid`: Unique click identifier
- `payout`: Conversion payout amount
- `status`: Conversion status (approved, pending, rejected)
- `currency`: Payout currency
- `timestamp`: Unix timestamp

### Webhook Security
- IP whitelist validation
- HMAC signature verification
- Retry mechanism with exponential backoff
- Delivery status tracking

---

## SDK and Libraries

### JavaScript SDK
```javascript
import { AdLinkProAPI } from '@adlinkpro/js-sdk';

const api = new AdLinkProAPI({
  baseUrl: 'https://api.adlinkpro.com/api',
  token: 'your-jwt-token'
});

// Get offers
const offers = await api.offers.list({ category: 'finance' });

// Create tracking link
const link = await api.tracking.createLink({ offerId: 'offer-123' });
```

### cURL Examples

**Authentication:**
```bash
curl -X POST https://api.adlinkpro.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get Offers:**
```bash
curl -X GET "https://api.adlinkpro.com/api/offers?category=finance" \
  -H "Authorization: Bearer your-jwt-token"
```

**Analytics:**
```bash
curl -X GET "https://api.adlinkpro.com/api/analytics/stats?timeframe=7d" \
  -H "Authorization: Bearer your-jwt-token"
```

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication with JWT
- Complete offer management
- Real-time analytics
- Financial operations
- Fraud detection
- Comprehensive security features

---

## Support

- **API Documentation**: This document
- **Status Page**: https://status.adlinkpro.com
- **Rate Limits**: Contact support for rate limit increases
- **Technical Support**: api-support@adlinkpro.com
- **Security Issues**: security@adlinkpro.com

---

*Last updated: December 2024*