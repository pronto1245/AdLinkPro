# Enhanced Backend Platform - API Documentation

## Overview

The AdLinkPro platform has been significantly enhanced with a comprehensive backend system that provides full functionality for affiliate marketing operations, financial management, anti-fraud protection, analytics, and team management.

## Architecture

### Controllers
- **AuthController** - Authentication, profile management, password changes
- **FinanceController** - Deposits, payouts, transactions, invoices
- **AnalyticsController** - Commission data, financial charts, performance metrics
- **FraudController** - Fraud detection, IP blocking, alert management
- **TeamController** - Team member management, invitations, permissions

### Middleware
- **Authorization** - JWT authentication, role-based access control, permissions
- **Validation** - Zod schema validation for all inputs
- **Logging** - Winston-based comprehensive logging system
- **Security** - Rate limiting, audit trails, IP tracking

## API Endpoints

### Authentication (`/api/admin/auth/`)

#### GET `/api/admin/auth/me`
Get current user profile
- **Auth**: Required
- **Response**: User profile data

#### PUT `/api/admin/auth/profile`
Update user profile
- **Auth**: Required
- **Body**: `{ firstName?, lastName?, company?, phone?, country?, language?, timezone?, currency? }`
- **Response**: Updated user profile

#### POST `/api/admin/auth/change-password`
Change user password
- **Auth**: Required  
- **Body**: `{ currentPassword: string, newPassword: string }`
- **Response**: Success message

### Financial Management (`/api/admin/`)

#### GET `/api/admin/deposits`
Get deposits with filtering and pagination
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Query**: `page?, limit?, status?, userId?, fromDate?, toDate?, sortBy?, sortOrder?`
- **Response**: Paginated deposits list

#### GET `/api/admin/payouts`
Get payouts with filtering and pagination
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Query**: Similar to deposits
- **Response**: Paginated payouts list

#### PATCH `/api/admin/transactions/:id`
Update transaction status
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Body**: `{ status: 'pending'|'approved'|'rejected'|'completed', notes?, rejectionReason? }`
- **Query**: `transactionType: 'deposit'|'payout'`
- **Response**: Updated transaction

#### POST `/api/admin/payouts/:id/:action`
Process payout action (approve/reject)
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Params**: `action: 'approve'|'reject'`
- **Body**: `{ reason?, notes? }`
- **Response**: Processed payout

#### POST `/api/admin/invoices`
Create invoice
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Body**: `{ amount: number, currency?, description?, dueDate?, paymentMethod? }`
- **Response**: Created invoice

#### POST `/api/admin/invoices/:id/mark-paid`
Mark invoice as paid
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageFinances
- **Body**: `{ transactionId?, notes? }`
- **Response**: Updated invoice

#### GET `/api/admin/financial-summary`
Get financial summary
- **Auth**: Required (super_admin, advertiser, staff)
- **Permissions**: viewFinances
- **Query**: `period?: '7d'|'30d'|'90d'`
- **Response**: Financial summary data

### Analytics (`/api/admin/`)

#### GET `/api/admin/commission-data`
Get commission data with caching
- **Auth**: Required (super_admin, advertiser, staff)
- **Permissions**: viewAnalytics
- **Query**: `period?, partnerId?, offerId?, fromDate?, toDate?, groupBy?`
- **Response**: Commission analytics data
- **Cache**: 5 minutes

#### GET `/api/admin/financial-chart/:period`
Get financial chart data
- **Auth**: Required (super_admin, advertiser, staff)
- **Permissions**: viewAnalytics
- **Params**: `period: 'day'|'week'|'month'|'quarter'|'year'`
- **Query**: `partnerId?, offerId?, fromDate?, toDate?, metric?`
- **Response**: Chart data points
- **Cache**: 10 minutes

#### GET `/api/admin/analytics-summary`
Get analytics summary with top performers
- **Auth**: Required (super_admin, advertiser, staff)
- **Permissions**: viewAnalytics
- **Query**: `period?, partnerId?, offerId?`
- **Response**: Analytics summary with top offers and partners
- **Cache**: 15 minutes

#### POST `/api/admin/analytics/clear-cache`
Clear analytics cache
- **Auth**: Required (super_admin)
- **Permissions**: systemSettings
- **Response**: Success message

### Anti-Fraud Management (`/api/admin/fraud/`)

#### GET `/api/admin/fraud/alerts`
Get fraud alerts with filtering
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Query**: `page?, limit?, severity?, status?, fromDate?, toDate?`
- **Response**: Paginated fraud alerts

#### POST `/api/admin/fraud/analyze/:type/:id`
Run fraud analysis on click or conversion
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Params**: `type: 'click'|'conversion', id: uuid`
- **Response**: Fraud analysis results

#### GET `/api/admin/fraud/stats`
Get fraud statistics
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Query**: `period?: '7d'|'30d'|'90d'`
- **Response**: Comprehensive fraud statistics

#### POST `/api/admin/fraud/block-ip`
Block IP address
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Body**: `{ ip: string, reason?, duration? }`
- **Response**: Created block record

#### POST `/api/admin/fraud/unblock-ip/:id`
Unblock IP address
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Response**: Updated block record

#### PATCH `/api/admin/fraud/alerts/:id`
Update fraud alert status
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Body**: `{ status: string, resolution? }`
- **Response**: Updated alert

#### GET `/api/admin/fraud/config`
Get fraud configuration
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageAntifraud
- **Response**: Current fraud configuration

#### PUT `/api/admin/fraud/config`
Update fraud configuration
- **Auth**: Required (super_admin)
- **Permissions**: systemSettings
- **Body**: `{ config: FraudConfig }`
- **Response**: Updated configuration

### Team Management (`/api/admin/team/`)

#### GET `/api/admin/team/members`
Get team members
- **Auth**: Required (super_admin, advertiser, staff)
- **Permissions**: manageTeam
- **Query**: `page?, limit?, role?, status?, search?`
- **Response**: Paginated team members

#### POST `/api/admin/team/members`
Create team member
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Body**: `{ username, email, password, role, firstName?, lastName?, permissions?, restrictions? }`
- **Response**: Created member

#### POST `/api/admin/team/invitations`
Send team invitation
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Body**: `{ email, role, firstName?, lastName?, message?, expiresInDays? }`
- **Response**: Created invitation

#### GET `/api/admin/team/invitations`
Get pending invitations
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Response**: Pending invitations list

#### DELETE `/api/admin/team/invitations/:id`
Cancel invitation
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Response**: Success message

#### PUT `/api/admin/team/members/:id`
Update team member
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Body**: `{ firstName?, lastName?, permissions?, restrictions?, isActive? }`
- **Response**: Updated member

#### DELETE `/api/admin/team/members/:id`
Remove team member (soft delete)
- **Auth**: Required (super_admin, advertiser)
- **Permissions**: manageTeam
- **Response**: Success message

### Public Invitation Routes (`/api/invitations/`)

#### POST `/api/invitations/:token/accept`
Accept team invitation
- **Auth**: Not required (public)
- **Body**: `{ username, password }`
- **Response**: Created user account

#### POST `/api/invitations/:token/decline`
Decline team invitation
- **Auth**: Not required (public)
- **Response**: Success message

## Security & Permissions

### Roles
- **super_admin** - Full system access
- **advertiser** - Manage own campaigns, team, finances
- **affiliate** - View own offers and analytics
- **staff** - Limited access based on permissions

### Permissions
- **manageUsers** - User management operations
- **manageOffers** - Offer management
- **manageFinances** - Financial operations
- **viewFinances** - View financial data
- **viewAnalytics** - View analytics and reports
- **manageAntifraud** - Anti-fraud management
- **managePostbacks** - Postback management
- **manageTeam** - Team member management
- **systemSettings** - System configuration

### Access Control
- JWT token-based authentication
- Role-based route protection
- Permission-based operation control
- Ownership-based data filtering
- IP tracking and audit logging

## Environment Configuration

### Required Variables
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-key"
```

### Optional Integrations
```env
# Email
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@domain.com"

# Crypto Payments
BTC_PAY_URL=""
NOWPAYMENTS_API_KEY=""

# External Trackers
KEITARO_API_KEY=""
REDTRACK_API_KEY=""
VOLUUM_API_KEY=""

# Monitoring
SENTRY_DSN=""
LOG_LEVEL="info"
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error description",
  "details": "Detailed error message",
  "issues": [] // Validation errors if applicable
}
```

## Caching Strategy

- **Analytics data**: 5-15 minute cache TTL
- **Commission data**: 5 minutes
- **Financial charts**: 10 minutes  
- **Analytics summary**: 15 minutes
- **Cache management**: Manual clear endpoint available

## Performance Considerations

- Database query optimization with proper indexing
- Ownership-based filtering to limit data scope
- Pagination on all list endpoints
- Caching for expensive analytics queries
- Rate limiting and request throttling
- Comprehensive logging for monitoring

## Development & Testing

### Build
```bash
npm run build:server
```

### Test API
```bash
node test-api.mjs
```

### Development
```bash
npm run dev
```

The enhanced backend platform is now production-ready with comprehensive functionality, security, and monitoring capabilities.