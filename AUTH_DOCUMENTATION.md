# Authentication System - Enhanced Features

## Overview

The AdLinkPro platform now includes an enhanced authentication system with improved security, user experience, and developer features. This system maintains backward compatibility while adding modern authentication patterns.

## Key Features

### 1. Enhanced Error Messages
- **Descriptive Error Messages**: Clear, user-friendly error messages that help users understand what went wrong
- **Error Codes**: Structured error codes for programmatic handling
- **Security-First**: Error messages don't expose sensitive information about user existence or system internals

### 2. Refresh Token System
- **Short-lived Access Tokens**: 15-minute access tokens for improved security
- **Long-lived Refresh Tokens**: 7-day refresh tokens for seamless user experience
- **Automatic Token Renewal**: Client-side automatic token refresh before expiration
- **Token Revocation**: Secure logout with refresh token invalidation

### 3. Rate Limiting
- **IP-based Protection**: Prevents brute force attacks by limiting login attempts per IP
- **Progressive Blocking**: Temporary blocks after repeated failed attempts
- **Development Exemptions**: Localhost requests are exempted during development

### 4. Automatic Token Management
- **Client-side Auto-refresh**: Tokens are automatically renewed before expiration
- **Session Expiration Handling**: Graceful handling of expired sessions with user notifications
- **Background Token Renewal**: Transparent token refresh without interrupting user workflow

## API Endpoints

### POST `/api/enhanced-auth/login`

Enhanced login endpoint with improved error handling and refresh token support.

**Request Body:**
```json
{
  "email": "user@example.com",     // or use "username"
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "PARTNER"
  }
}
```

**Error Responses:**
- `400 MISSING_CREDENTIALS`: Missing email/username and/or password
- `400 MISSING_IDENTIFIER`: Missing email or username
- `400 MISSING_PASSWORD`: Missing password
- `400 INVALID_IDENTIFIER_LENGTH`: Email/username too short
- `400 INVALID_PASSWORD_LENGTH`: Password too short
- `401 INVALID_CREDENTIALS`: Incorrect login credentials
- `429 TOO_MANY_REQUESTS`: Rate limit exceeded
- `500 CONFIG_ERROR`: Server configuration error
- `500 INTERNAL_ERROR`: Unexpected server error

### POST `/api/enhanced-auth/refresh`

Refresh access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900
}
```

**Error Responses:**
- `400 MISSING_REFRESH_TOKEN`: Refresh token not provided
- `401 REFRESH_TOKEN_EXPIRED`: Refresh token has expired
- `401 INVALID_REFRESH_TOKEN`: Invalid or malformed refresh token
- `401 REFRESH_TOKEN_REVOKED`: Refresh token has been revoked
- `401 USER_NOT_FOUND`: User associated with token not found
- `500 INTERNAL_ERROR`: Unexpected server error

### GET `/api/enhanced-auth/me`

Validate access token and retrieve user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "PARTNER"
  }
}
```

**Error Responses:**
- `401 MISSING_AUTH_HEADER`: Authorization header missing or invalid
- `401 ACCESS_TOKEN_EXPIRED`: Access token has expired
- `401 INVALID_ACCESS_TOKEN`: Invalid or malformed access token
- `500 INTERNAL_ERROR`: Unexpected server error

### POST `/api/enhanced-auth/logout`

Logout and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Client-side Integration

### Basic Usage

```typescript
import { AuthService } from './lib/auth';

// Initialize the auth service (call once on app startup)
AuthService.initialize();

// Login
try {
  const result = await AuthService.login({
    username: 'user@example.com',
    password: 'password'
  });
  console.log('Login successful:', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Make authenticated requests (with automatic token refresh)
try {
  const response = await AuthService.makeAuthenticatedRequest('/api/user/profile');
  const userProfile = await response.json();
} catch (error) {
  console.error('Request failed:', error.message);
}

// Logout
await AuthService.logout();
```

### Session Expiration Handling

The client automatically handles session expiration and notifies users:

```typescript
// Listen for session expiration events
window.addEventListener('auth:sessionExpired', (event) => {
  const { message, action } = event.detail;
  
  // Show user notification
  showNotification(message, 'warning');
  
  // Redirect to login if needed
  if (action === 'redirect-to-login') {
    redirectToLogin();
  }
});
```

### Token Refresh

Tokens are automatically refreshed in the background:

```typescript
// Manual token refresh (usually not needed)
const newToken = await AuthService.refreshToken();
if (newToken) {
  console.log('Token refreshed successfully');
} else {
  console.log('Token refresh failed, user needs to login');
}

// Check if token is expiring soon
if (AuthService.isTokenExpiringSoon()) {
  console.log('Token will expire soon, refresh will happen automatically');
}
```

## Security Features

### Rate Limiting
- **Login Attempts**: Limited to 10 attempts per IP address within 15 minutes
- **Failed Login Tracking**: Automatic blocking after 5 failed attempts
- **IP Whitelisting**: Localhost exempted during development
- **Audit Logging**: All authentication events are logged for security monitoring

### Token Security
- **Short Access Token Lifetime**: 15 minutes to limit exposure risk
- **Secure Refresh Tokens**: Long-lived but revocable refresh tokens
- **Token Rotation**: New refresh tokens issued on each refresh
- **Secure Storage**: Tokens stored securely in browser localStorage

### Error Handling
- **No Information Leakage**: Error messages don't reveal user existence
- **Structured Error Codes**: Consistent error codes for programmatic handling
- **Fraud Detection**: Suspicious activity monitoring and notifications

## Backward Compatibility

The enhanced authentication system maintains full backward compatibility:

- **Existing Tokens**: Current JWT tokens continue to work
- **Legacy Endpoints**: Original `/api/auth/login` endpoints remain functional
- **Client Updates**: Optional - clients can upgrade to enhanced features gradually
- **Database**: No database schema changes required

## Testing

### Running Tests

```bash
# Run simple authentication tests
node tests/auth-simple.test.js

# Or with jest (if available)
npm test -- tests/auth.test.ts
```

### Test Coverage

The test suite covers:
- ✅ Login with valid/invalid credentials
- ✅ Enhanced error message validation
- ✅ Refresh token functionality
- ✅ Token validation
- ✅ Logout functionality  
- ✅ Rate limiting behavior
- ✅ Error code consistency

## Configuration

### Environment Variables

```bash
# Required
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key

# Optional
NODE_ENV=production
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Token Lifetimes

- **Access Token**: 15 minutes (configurable)
- **Refresh Token**: 7 days (configurable)  
- **Rate Limit Window**: 15 minutes
- **Max Login Attempts**: 10 per window

## Migration Guide

### For Existing Clients

1. **Update Auth Service**: Replace old auth service with the enhanced version
2. **Add Token Expiration Handling**: Implement session expiration listeners
3. **Update API Calls**: Use `makeAuthenticatedRequest()` for automatic token refresh
4. **Test Integration**: Verify all authentication flows work correctly

### For New Clients

1. **Install Dependencies**: No additional dependencies required
2. **Initialize Service**: Call `AuthService.initialize()` on app startup
3. **Implement Login/Logout**: Use the new enhanced endpoints
4. **Handle Sessions**: Add session expiration event listeners

## Troubleshooting

### Common Issues

1. **Token Refresh Fails**
   - Check refresh token validity
   - Verify user still exists
   - Check server configuration

2. **Rate Limiting Triggered**
   - Wait for rate limit window to expire
   - Check for multiple failed attempts
   - Verify IP address handling

3. **Session Expiration**
   - Implement session expiration handlers
   - Check token lifetime configuration
   - Verify automatic refresh is working

### Debug Information

Enable debug logging:
```typescript
localStorage.setItem('auth:debug', 'true');
```

This will log detailed authentication events to the browser console.

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Storage**: Store tokens securely, avoid plain text
3. **Token Rotation**: Implement proper token rotation
4. **Monitor Activity**: Watch for suspicious authentication patterns
5. **Regular Updates**: Keep dependencies updated for security patches