# AdLinkPro - Enhanced Affiliate Marketing Platform

A comprehensive affiliate marketing platform with advanced authentication, security features, and modern user experience.

## 🚀 Features

### Core Platform
- **Multi-role Support**: Super admin, advertiser, affiliate, and staff roles
- **Advanced Analytics**: Real-time tracking and comprehensive reporting  
- **Anti-fraud System**: AI-powered fraud detection and prevention
- **Tracker Integration**: Support for Voluum, Keitaro, Binom, RedTrack
- **Real-time Notifications**: WebSocket-based notification system

### ✨ Enhanced Authentication System
- **🔐 Refresh Token Support**: Secure, long-lived refresh tokens for seamless user experience
- **📱 Auto-refresh**: Automatic token renewal before expiration
- **🛡️ Enhanced Security**: Rate limiting, IP-based protection, audit logging
- **💬 Better UX**: Descriptive error messages and graceful session handling
- **🔒 Backward Compatible**: Works with existing authentication systems

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Enhanced JWT with refresh tokens
- **Security**: Rate limiting, IP blocking, audit logging
- **File Storage**: Object Storage integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pronto1245/AdLinkPro.git
cd AdLinkPro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with the following required variables:

```env
# Authentication (Required)
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key

# Database (Required)
DATABASE_URL=postgresql://user:pass@localhost:5432/adlinkpro

# Optional
NODE_ENV=development
PORT=5000

# Email (Optional)
SENDGRID_API_KEY=your-sendgrid-key

# External Integrations (Optional)
VOLUUM_TOKEN=your-voluum-token
KEITARO_TOKEN=your-keitaro-token
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run check
```

## 🔐 Authentication System

### New Enhanced Features

#### 1. Refresh Tokens
- **Short-lived access tokens** (15 minutes) for enhanced security
- **Long-lived refresh tokens** (7 days) for user convenience
- **Automatic token rotation** on refresh
- **Secure token storage** and management

#### 2. Enhanced Error Messages
- **User-friendly messages** that don't expose sensitive information
- **Structured error codes** for programmatic handling
- **Contextual guidance** to help users resolve issues

#### 3. Rate Limiting
- **IP-based protection** against brute force attacks
- **Progressive blocking** after repeated failed attempts
- **Development exemptions** for localhost testing

#### 4. Auto-refresh System
- **Background token renewal** before expiration
- **Session expiration handling** with user notifications
- **Seamless user experience** without login interruptions

### API Endpoints

#### Authentication Endpoints

```
POST /api/enhanced-auth/login     # Enhanced login with refresh tokens
POST /api/enhanced-auth/refresh   # Refresh access token
POST /api/enhanced-auth/logout    # Secure logout with token revocation
GET  /api/enhanced-auth/me        # Token validation and user info
```

#### Legacy Support
```
POST /api/auth/login             # Legacy login (still supported)
POST /api/dev/login              # Development login
```

### Client Integration

```typescript
import { AuthService } from './lib/auth';

// Initialize on app startup
AuthService.initialize();

// Login
const result = await AuthService.login({
  username: 'user@example.com',
  password: 'password'
});

// Make authenticated requests (auto-refresh)
const response = await AuthService.makeAuthenticatedRequest('/api/user/profile');

// Logout
await AuthService.logout();
```

## 🧪 Testing

### Running Tests

```bash
# Run authentication tests
node tests/auth-simple.test.js

# Expected output:
# 🎉 All tests passed! Authentication system is working correctly.
```

### Test Coverage

The authentication system includes comprehensive tests for:
- ✅ Login with valid/invalid credentials
- ✅ Enhanced error message validation  
- ✅ Refresh token functionality
- ✅ Token validation and expiration
- ✅ Logout and token revocation
- ✅ Rate limiting behavior
- ✅ Session expiration handling

## 📚 Documentation

- **[Authentication Documentation](./AUTH_DOCUMENTATION.md)** - Complete authentication system guide
- **[Deployment Guide](./README_DEPLOY.md)** - Production deployment instructions
- **[API Reference](./api-docs.md)** - Complete API documentation (if available)

## 🔧 Configuration

### Authentication Settings

```typescript
// Token lifetimes (configurable)
ACCESS_TOKEN_EXPIRES_IN = '15m';     // Access token lifetime
REFRESH_TOKEN_EXPIRES_IN = '7d';     // Refresh token lifetime

// Rate limiting
LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000;  // 15 minutes
MAX_LOGIN_ATTEMPTS = 10;                     // Per IP address

// Security
ENABLE_AUDIT_LOGGING = true;
ENABLE_FRAUD_DETECTION = true;
```

### User Roles

The platform supports multiple user roles:

- **OWNER**: Full platform control
- **ADVERTISER**: Offer management and tracking
- **PARTNER**: Affiliate access to offers and statistics  
- **STAFF**: Limited administrative access

## 🛡️ Security Features

### Authentication Security
- **JWT with RS256/HS256** signing algorithms
- **Secure token storage** in browser localStorage
- **Automatic token rotation** on refresh
- **XSS/CSRF protection** headers

### Rate Limiting
- **Login attempt limiting** (10 attempts per 15 minutes)
- **IP-based tracking** and temporary blocking
- **Audit logging** for all authentication events

### Fraud Detection
- **Suspicious IP monitoring**
- **Multiple failed login alerts**
- **Device fingerprinting** for new device notifications
- **Real-time fraud pattern detection**

## 🚀 Deployment

### Production Deployment

1. **Set up environment variables**
2. **Configure PostgreSQL database**
3. **Build the application**: `npm run build`
4. **Start production server**: `npm start`

### Docker Support

```dockerfile
# Dockerfile included for containerized deployment
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables Checklist

- ✅ `JWT_SECRET` - JWT signing secret (required)
- ✅ `REFRESH_TOKEN_SECRET` - Refresh token secret (required) 
- ✅ `DATABASE_URL` - PostgreSQL connection string (required)
- ⚙️ `NODE_ENV` - Environment (development/production)
- ⚙️ `PORT` - Server port (default: 5000)
- 📧 `SENDGRID_API_KEY` - Email service (optional)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

1. **Check the documentation** in this README and AUTH_DOCUMENTATION.md
2. **Run the test suite** to verify your setup
3. **Check issues** for common problems and solutions
4. **Create an issue** for bugs or feature requests

### Common Issues

**Authentication not working?**
- Verify JWT_SECRET and REFRESH_TOKEN_SECRET are set
- Check server logs for detailed error messages
- Ensure PostgreSQL is running (if using database auth)

**Rate limiting triggered?**
- Wait 15 minutes for rate limit window to expire
- Check for multiple failed login attempts
- Verify localhost exemption is working in development

**Token refresh failing?**
- Check refresh token validity and expiration
- Verify user account still exists and is active
- Check server configuration and secrets

### Debug Mode

Enable authentication debug logging:

```typescript
// Browser console
localStorage.setItem('auth:debug', 'true');

// Server logs
DEBUG=auth:* npm run dev
```

## 📊 Recent Updates

### Version 2.0 - Enhanced Authentication
- ✨ **Added refresh token system** with automatic renewal
- 🛡️ **Enhanced security** with rate limiting and audit logging  
- 💬 **Improved error messages** with structured error codes
- 📱 **Better UX** with session expiration handling
- 🧪 **Comprehensive test suite** for authentication flows
- 📚 **Complete documentation** for integration and deployment
- 🔄 **Backward compatibility** with existing authentication

---

**Built with ❤️ by the AdLinkPro team**