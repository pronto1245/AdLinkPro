# AdLinkPro - Advanced Affiliate Marketing Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![Security](https://img.shields.io/badge/security-hardened-green.svg)

A comprehensive affiliate marketing platform with advanced security, real-time analytics, fraud detection, and performance optimization.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/pronto1245/AdLinkPro.git
cd AdLinkPro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### Core Functionality
- **Multi-Role User Management**: Owner, Advertiser, Partner, Staff roles with granular permissions
- **Offer Management**: Complete offer lifecycle with targeting, payouts, and creative assets
- **Real-Time Analytics**: Comprehensive tracking of clicks, conversions, and revenue
- **Fraud Detection**: Advanced fraud detection with risk scoring and automated alerts
- **Postback System**: Reliable postback delivery with retry mechanisms
- **Financial Management**: Automated payouts, invoicing, and financial reporting

### Security & Performance
- **Enhanced JWT Authentication**: Comprehensive token validation with format checking
- **Role-Based Access Control**: Database-verified permissions with audit logging
- **Rate Limiting**: Configurable rate limiting across all endpoints
- **Input Validation**: XSS and injection attack prevention
- **Caching Layer**: Redis-based caching for improved performance
- **Queue System**: Background job processing for heavy operations

### User Experience
- **Responsive Design**: Mobile-first responsive interface
- **Internationalization**: Multi-language support (English, Russian)
- **Real-Time Notifications**: WebSocket-based real-time updates
- **Advanced Filtering**: Powerful search and filtering capabilities
- **Dashboard Analytics**: Interactive charts and reporting

## 🏗 Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for performance optimization
- **Queue System**: BullMQ for background job processing
- **Authentication**: JWT with enhanced validation

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight routing
- **State Management**: React Query for server state
- **UI Library**: Radix UI with Tailwind CSS
- **Build Tool**: Vite for fast development and builds

**Infrastructure:**
- **Security**: Helmet.js, CORS, rate limiting
- **Monitoring**: Comprehensive audit logging
- **File Storage**: Google Cloud Storage support
- **Email**: SendGrid integration
- **SSL**: Automated SSL certificate management

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   PostgreSQL    │
│                 │────│                 │────│    Database     │
│  - Components   │    │  - API Routes   │    │                 │
│  - State Mgmt   │    │  - Middleware   │    │  - Users        │
│  - UI/UX        │    │  - Services     │    │  - Offers       │
└─────────────────┘    └─────────────────┘    │  - Analytics    │
         │                       │             └─────────────────┘
         │              ┌─────────────────┐
         │              │  Redis Cache    │
         └──────────────│                 │
                        │  - Sessions     │
                        │  - Rate Limits  │
                        │  - Queue Jobs   │
                        └─────────────────┘
```

## 🔧 Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 13 or higher
- **Redis**: Version 6 or higher (optional, for caching)
- **Git**: For version control

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/pronto1245/AdLinkPro.git
   cd AdLinkPro
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb adlinkpro
   
   # Run database migrations
   npm run db:push
   
   # Seed initial data (optional)
   npm run db:seed
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/adlinkpro"
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET="your-super-secure-jwt-secret-key-here"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # Email Configuration
   SENDGRID_API_KEY="your-sendgrid-api-key"
   
   # File Storage
   GOOGLE_CLOUD_STORAGE_BUCKET="your-gcs-bucket"
   ```

5. **Security Setup**
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update JWT_SECRET in .env with generated value
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `REDIS_URL` | Redis connection string | No | redis://localhost:6379 |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `SENDGRID_API_KEY` | Email service API key | No | - |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | File storage bucket | No | - |

### Advanced Configuration

**Database Configuration:**
```typescript
// drizzle.config.ts
export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Cache Configuration:**
```typescript
// Cache TTL settings
const CACHE_CONFIG = {
  USER_TTL: 300,        // 5 minutes
  OFFER_TTL: 600,       // 10 minutes  
  STATS_TTL: 180,       // 3 minutes
  SESSION_TTL: 3600,    // 1 hour
};
```

## 🔨 Development

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Database operations
npm run db:push          # Push schema changes
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow TypeScript best practices
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Changes**
   ```bash
   npm run check    # TypeScript compilation
   npm test         # Run test suite
   npm run lint     # Code linting
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Enforced code style with automatic fixing
- **Prettier**: Consistent code formatting
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                    # Unit tests
├── integration/            # Integration tests
├── e2e/                   # End-to-end tests
├── security/              # Security tests
└── performance/           # Performance tests
```

### Running Tests

```bash
# All tests
npm test

# Specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

The project maintains high test coverage:

- **Unit Tests**: >90% coverage for core business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user workflows (login, registration, offers)
- **Security Tests**: Authentication, authorization, input validation

### Writing Tests

Example test structure:
```typescript
describe('Authentication Service', () => {
  describe('JWT Token Validation', () => {
    it('should validate valid tokens', async () => {
      const token = generateValidToken();
      const result = await validateToken(token);
      expect(result.isValid).toBe(true);
    });
    
    it('should reject expired tokens', async () => {
      const expiredToken = generateExpiredToken();
      const result = await validateToken(expiredToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('expired');
    });
  });
});
```

## 🚀 Deployment

### Production Deployment

#### Option 1: Traditional Server Deployment

1. **Server Setup**
   ```bash
   # Install Node.js, PostgreSQL, Redis
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql redis-server
   ```

2. **Application Deployment**
   ```bash
   # Clone and build
   git clone https://github.com/pronto1245/AdLinkPro.git
   cd AdLinkPro
   npm install --production
   npm run build
   
   # Set up process manager
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: Docker Deployment

```dockerfile
# Dockerfile included in project
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Deploy with Docker
docker build -t adlinkpro .
docker run -p 3000:3000 --env-file .env adlinkpro
```

#### Option 3: Cloud Platform Deployment

**Render.com:**
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

**Railway:**
```bash
railway login
railway init
railway add postgresql redis
railway deploy
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log aggregation set up

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "partner"
  }
}
```

#### POST `/api/auth/register`
Register new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "New User",
  "role": "partner"
}
```

#### GET `/api/auth/verify`
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

### Offer Management

#### GET `/api/offers`
Retrieve offers list with filtering and pagination.

**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

#### POST `/api/offers`
Create new offer (Advertiser only).

**Request:**
```json
{
  "name": "Sample Offer",
  "description": "Offer description",
  "category": "finance",
  "payout": 50.00,
  "payoutType": "cpa",
  "countries": ["US", "UK", "CA"]
}
```

### Analytics Endpoints

#### GET `/api/analytics/stats`
Get analytics statistics.

**Query Parameters:**
- `timeframe` - Time period (24h, 7d, 30d)
- `groupBy` - Group by (day, week, month)
- `offerId` - Filter by offer
- `partnerId` - Filter by partner

**Response:**
```json
{
  "clicks": 1250,
  "conversions": 87,
  "revenue": 4350.00,
  "conversionRate": 6.96,
  "epc": 3.48
}
```

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` - Authentication token required
- `INVALID_TOKEN` - JWT token invalid or expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 🔒 Security

### Security Features

- **Enhanced JWT Validation**: Comprehensive token format and payload validation
- **Role-Based Access Control**: Database-verified user permissions
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: Configurable limits per endpoint and user
- **Audit Logging**: Complete security event logging with risk scoring
- **CORS Protection**: Properly configured cross-origin policies
- **Security Headers**: Helmet.js for security headers
- **Session Security**: Secure session configuration
- **Password Security**: bcrypt hashing with salt rounds

### Security Best Practices

1. **Environment Security**
   - Never commit secrets to version control
   - Use strong, random JWT secrets
   - Regularly rotate API keys
   - Enable SSL/TLS in production

2. **Database Security**
   - Use parameterized queries (Drizzle ORM)
   - Implement proper indexing
   - Regular security updates
   - Backup encryption

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only
   - Monitor for suspicious activity

### Security Incident Response

1. **Detection**: Automated fraud detection and alerting
2. **Assessment**: Risk scoring and threat analysis
3. **Response**: Automated blocking and manual review
4. **Recovery**: Account restoration and security improvements

## ⚡ Performance

### Performance Optimizations

- **Database Indexing**: Optimized indexes for all common queries
- **Redis Caching**: Strategic caching of frequently accessed data
- **Queue System**: Background processing of heavy operations
- **CDN Integration**: Static asset delivery optimization
- **Code Splitting**: Lazy loading of client-side components
- **Image Optimization**: Automatic image compression and resizing

### Performance Monitoring

```bash
# Performance testing
npm run perf:test

# Bundle analysis
npm run analyze

# Database query analysis
npm run db:analyze
```

### Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|---------------|--------------|
| User Data | 5 minutes | On profile update |
| Offers | 10 minutes | On offer modification |
| Statistics | 3 minutes | On new data |
| Session Data | 1 hour | On logout |

## 🤝 Contributing

### Contribution Guidelines

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow coding standards and add tests
4. **Test Thoroughly**: Ensure all tests pass
5. **Submit Pull Request**: With detailed description

### Development Standards

- **Code Quality**: Maintain high code quality standards
- **Test Coverage**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Security**: Follow security best practices
- **Performance**: Consider performance implications

### Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error messages and logs

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U username -d adlinkpro -c "SELECT 1;"
```

#### Redis Connection Issues  
```bash
# Check Redis status
redis-cli ping

# Check configuration
redis-cli config get "*"
```

#### JWT Token Issues
- Verify JWT_SECRET in environment
- Check token expiration settings  
- Validate token format and structure

#### Performance Issues
- Monitor database query performance
- Check Redis cache hit rates
- Analyze server resource usage
- Review application logs

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Log Analysis

Logs are structured for easy analysis:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User authentication successful",
  "userId": "user-id",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check existing documentation files
- **Issues**: GitHub Issues for bug reports
- **Security**: Report security issues privately
- **Community**: Join our developer community

---

**AdLinkPro** - Empowering affiliate marketing with advanced technology, security, and performance.

Made with ❤️ by the AdLinkPro Team