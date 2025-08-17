# Custom Domain Management System - Complete Documentation

## Overview

The AdLinkPro Custom Domain Management System provides comprehensive functionality for advertisers to manage custom domains for their tracking links. The system includes advanced features such as DNS validation, SSL certificate management, caching, and multi-provider support.

## Features

### 🎯 Core Features
- **Multiple Domains**: Each advertiser can manage up to 5 domains (configurable)
- **DNS Validation**: Automatic DNS record validation with detailed error reporting
- **SSL Certificates**: Multi-provider SSL support (Let's Encrypt, Cloudflare, AWS ACM)
- **Real-time Validation**: Live DNS validation while typing domain names
- **Progress Tracking**: Visual progress indicators for long operations
- **Batch Operations**: Efficient bulk updates for tracking links
- **DNS Caching**: Optimized DNS queries with configurable TTL

### 🔧 Technical Features
- **Error Handling**: Detailed error messages with actionable suggestions
- **Performance**: Batch database operations and DNS caching
- **Scalability**: Environment-configurable limits and timeouts
- **Testing**: Comprehensive unit test coverage
- **Documentation**: Complete JSDoc documentation for all methods

## Environment Configuration

Add these variables to your `.env` file:

```env
# Custom Domain Settings
MAX_DOMAINS_PER_ADVERTISER=5
DNS_CACHE_TTL_SECONDS=300
DNS_TIMEOUT_MS=5000
SSL_PROVIDER=letsencrypt

# SSL Provider Settings
CLOUDFLARE_API_TOKEN=your-cloudflare-token
AWS_ACM_REGION=us-east-1

# Server Settings
SERVER_IP=your-server-ip
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_DOMAINS_PER_ADVERTISER` | `5` | Maximum domains per advertiser |
| `DNS_CACHE_TTL_SECONDS` | `300` | DNS cache lifetime (5 minutes) |
| `DNS_TIMEOUT_MS` | `5000` | DNS query timeout (5 seconds) |
| `SSL_PROVIDER` | `letsencrypt` | SSL provider (`letsencrypt`, `cloudflare`, `aws-acm`) |
| `CLOUDFLARE_API_TOKEN` | - | Cloudflare API token for SSL |
| `AWS_ACM_REGION` | `us-east-1` | AWS region for ACM certificates |

## API Endpoints

### Domain Management

#### Create Custom Domain
```http
POST /api/advertiser/profile/domains
Content-Type: application/json

{
  "domain": "track.example.com",
  "type": "cname"
}
```

#### Get Advertiser Domains
```http
GET /api/advertiser/profile/domains
```

#### Verify Domain
```http
POST /api/advertiser/profile/domains/{domainId}/verify
```

#### Issue SSL Certificate
```http
POST /api/advertiser/profile/domains/{domainId}/ssl
```

#### Delete Domain
```http
DELETE /api/advertiser/profile/domains/{domainId}
```

#### Validate Domain (Real-time)
```http
POST /api/advertiser/domains/validate
Content-Type: application/json

{
  "domain": "track.example.com",
  "type": "cname"
}
```

## Service Documentation

### CustomDomainService

The main service class for managing custom domains.

#### Methods

##### `createCustomDomain(data)`
Create a new custom domain for an advertiser.

```typescript
const domain = await CustomDomainService.createCustomDomain({
  advertiserId: 'user-123',
  domain: 'track.example.com',
  type: 'cname'
});
```

**Parameters:**
- `data.advertiserId` (string): The advertiser's unique identifier
- `data.domain` (string): The domain name to add
- `data.type` ('a_record' | 'cname'): DNS record type for verification

**Returns:** `Promise<CustomDomain>`

**Throws:** Error when domain limit is exceeded or validation fails

##### `verifyDomain(domainId)`
Verify domain ownership through DNS records.

```typescript
const result = await CustomDomainService.verifyDomain('domain-123');
if (result.success) {
  console.log('Domain verified successfully');
} else {
  console.error('Verification failed:', result.error);
}
```

**Parameters:**
- `domainId` (string): The domain's unique identifier

**Returns:** Promise with verification result and detailed error info

##### `updateTrackingLinksWithDomain(advertiserId, domain)`
Update tracking links to use custom domain with optimized batch operations.

```typescript
await CustomDomainService.updateTrackingLinksWithDomain('user-123', 'track.example.com');
```

**Parameters:**
- `advertiserId` (string): The advertiser's unique identifier
- `domain` (string): The custom domain to set for tracking links

##### `requestSSLCertificate(domain, domainId)`
Request SSL certificate for a verified domain using configured provider.

```typescript
await CustomDomainService.requestSSLCertificate('track.example.com', 'domain-123');
```

**Parameters:**
- `domain` (string): Domain name for SSL certificate
- `domainId` (string): Database ID of the domain record

##### `getDomainStats(advertiserId)`
Get comprehensive domain statistics for advertiser.

```typescript
const stats = await CustomDomainService.getDomainStats('user-123');
console.log(`Total domains: ${stats.total}, Verified: ${stats.verified}`);
```

**Returns:** Promise with detailed statistics object

### Enhanced DNS Service

Advanced DNS resolution with caching and error handling.

```typescript
import { enhancedDNS } from './enhancedDNS';

// Resolve CNAME with caching
const result = await enhancedDNS.resolveCname('example.com');
if (result.success) {
  console.log('Records:', result.records);
  console.log('From cache:', result.fromCache);
} else {
  console.log('Error:', result.error);
}
```

### SSL Provider Service

Multi-provider SSL certificate management.

```typescript
import { SSLProviderService } from './sslProvider';

const sslService = new SSLProviderService();
const certificate = await sslService.issueCertificate('example.com', 'domain-123');

console.log('Certificate issued by:', certificate.issuer);
console.log('Valid until:', certificate.validUntil);
```

## DNS Record Types

### CNAME Record (Recommended)
For subdomains like `track.example.com`:

```
Name: track
Type: CNAME
Value: affiliate-tracker.replit.app
TTL: 300
```

### A Record
For root domains or when CNAME is not available:

```
Name: @
Type: A
Value: YOUR_SERVER_IP
TTL: 300
```

### TXT Record
For domain verification:

```
Name: @
Type: TXT
Value: platform-verify=abc123...
TTL: 300
```

## SSL Certificate Providers

### Let's Encrypt (Default)
- **Free SSL certificates**
- **90-day validity**
- **Automatic renewal available**
- **Requirements**: Domain must resolve to your server

### Cloudflare SSL
- **1-year validity**
- **Fast issuance**
- **Requirements**: Domain managed by Cloudflare DNS

Configuration:
```env
SSL_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=your-api-token
```

### AWS Certificate Manager
- **Free for AWS services**
- **1-year validity with auto-renewal**
- **Requirements**: Domain in Route53, proper IAM permissions

Configuration:
```env
SSL_PROVIDER=aws-acm
AWS_ACM_REGION=us-east-1
```

## Error Handling

### DNS Error Types

| Error Type | Description | User Action |
|------------|-------------|-------------|
| `TIMEOUT` | DNS query timed out | Retry after a few minutes |
| `RECORD_NOT_FOUND` | DNS record doesn't exist | Add the required DNS record |
| `DNS_SERVER_UNAVAILABLE` | DNS server is down | Try again later |
| `NETWORK_ERROR` | Network connectivity issue | Check internet connection |
| `INVALID_DOMAIN` | Malformed domain name | Correct the domain format |

### SSL Error Types

| Error | Description | Solution |
|-------|-------------|----------|
| `Validation Failed` | Domain not accessible | Ensure domain points to your server |
| `Rate Limit` | Too many requests | Wait before retrying |
| `Timeout` | SSL request timed out | Try again later |
| `Provider Error` | SSL provider issue | Check provider status |

## Caching System

### DNS Cache
- **TTL**: Configurable (default 5 minutes)
- **Storage**: In-memory with automatic cleanup
- **Benefits**: Reduces DNS query load and improves performance

### Cache Operations
```typescript
// Clear cache for specific domain
CustomDomainService.clearDNSCache('example.com');

// Clear specific record type
CustomDomainService.clearDNSCache('example.com', 'CNAME');

// Get cache statistics
const stats = CustomDomainService.getDNSCacheStats();
```

## Testing

### Unit Tests
Run the comprehensive test suite:

```bash
npm test server/services/__tests__/customDomains.test.ts
```

### Test Coverage
- ✅ Domain creation and validation
- ✅ DNS verification with error handling
- ✅ Batch operations performance
- ✅ SSL certificate management
- ✅ Caching functionality
- ✅ Error scenarios and edge cases

### Manual Testing Scenarios

1. **Domain Addition**:
   - Add valid domain
   - Add invalid domain format
   - Add duplicate domain
   - Exceed domain limit

2. **DNS Verification**:
   - Verify with correct DNS records
   - Verify with missing records
   - Verify with incorrect records
   - Test timeout scenarios

3. **SSL Certificates**:
   - Issue SSL for verified domain
   - Issue SSL for unverified domain
   - Test different providers
   - Handle SSL errors

## Performance Optimization

### Database Operations
- **Batch Updates**: Use `inArray()` instead of loops
- **Indexed Queries**: Proper database indexes on domain fields
- **Connection Pooling**: Efficient database connections

### DNS Operations
- **Caching**: Automatic result caching with TTL
- **Timeouts**: Prevent hanging operations
- **Parallel Queries**: Multiple DNS queries when needed

### UI Performance
- **Progress Indicators**: Real-time feedback for long operations
- **Debounced Validation**: Avoid excessive API calls
- **Optimistic Updates**: Immediate UI feedback

## Troubleshooting

### Common Issues

#### Domain Verification Fails
1. **Check DNS propagation**: Use tools like `dig` or online DNS checkers
2. **Verify record format**: Ensure correct CNAME/A record syntax
3. **Wait for propagation**: DNS changes can take up to 24 hours
4. **Clear cache**: Use `clearDNSCache()` to force re-check

#### SSL Certificate Issues
1. **Domain must be verified first**: SSL requires valid domain verification
2. **Check provider configuration**: Verify API tokens and settings
3. **Rate limits**: Respect SSL provider rate limits
4. **Firewall issues**: Ensure ports 80/443 are accessible

#### Performance Issues
1. **Enable caching**: Verify DNS cache is enabled
2. **Database optimization**: Check for proper indexes
3. **Batch operations**: Use bulk updates for large operations
4. **Monitor timeouts**: Adjust timeout values if needed

### Debug Tools

```typescript
// Enable debug logging
process.env.DEBUG = 'custom-domains:*';

// Check DNS cache stats
const stats = CustomDomainService.getDNSCacheStats();
console.log('Cache stats:', stats);

// Manual DNS check
const result = await enhancedDNS.resolveCname('example.com');
console.log('DNS result:', result);
```

## Migration Guide

### From Single Domain to Multiple Domains

Existing advertisers will automatically have their single domain migrated. New limits apply:

```sql
-- Check current domain counts
SELECT advertiserId, COUNT(*) as domain_count 
FROM custom_domains 
GROUP BY advertiserId 
HAVING COUNT(*) > 5;
```

### Environment Variable Updates

Update your `.env` file with new configuration options:

```diff
+ MAX_DOMAINS_PER_ADVERTISER=5
+ DNS_CACHE_TTL_SECONDS=300
+ DNS_TIMEOUT_MS=5000
+ SSL_PROVIDER=letsencrypt
```

## Security Considerations

### Domain Validation
- **Input sanitization**: All domain inputs are validated
- **SQL injection prevention**: Parameterized queries only
- **Rate limiting**: Prevent abuse of validation endpoints

### SSL Certificates
- **Private key security**: SSL keys stored encrypted
- **Provider authentication**: Secure API token storage
- **Certificate validation**: Verify certificate authenticity

### DNS Security
- **Cache poisoning protection**: TTL limits and validation
- **DNS over HTTPS**: Support for secure DNS queries
- **Input validation**: Strict domain format checking

## Support and Maintenance

### Monitoring
- **DNS query success rates**
- **SSL certificate expiration dates**
- **Cache hit ratios**
- **Error frequency by type**

### Maintenance Tasks
- **Certificate renewal**: Automatic for Let's Encrypt
- **Cache cleanup**: Automatic expired entry removal
- **Database optimization**: Regular index maintenance
- **Log rotation**: Prevent log file bloat

### Updates
- **Backward compatibility**: All changes maintain compatibility
- **Database migrations**: Automatic schema updates
- **Configuration updates**: Environment variable additions only

---

## Quick Start Example

```typescript
import { CustomDomainService } from './services/customDomains';

// 1. Create a custom domain
const domain = await CustomDomainService.createCustomDomain({
  advertiserId: 'advertiser-123',
  domain: 'track.mysite.com',
  type: 'cname'
});

// 2. Get DNS instructions
const instructions = CustomDomainService.getDNSInstructions(domain);
console.log('Add this DNS record:', instructions);

// 3. Verify domain after DNS setup
const verification = await CustomDomainService.verifyDomain(domain.id);
if (verification.success) {
  console.log('Domain verified!');
  
  // 4. Request SSL certificate
  await CustomDomainService.requestSSLCertificate(domain.domain, domain.id);
  
  // 5. Update tracking links
  await CustomDomainService.updateTrackingLinksWithDomain(
    'advertiser-123', 
    domain.domain
  );
}
```

This documentation covers all aspects of the custom domain management system. For additional help or feature requests, please refer to the issue tracker or contact the development team.