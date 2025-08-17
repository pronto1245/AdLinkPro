# Real Data Integration Technical Documentation

## Overview

This document describes the updated real data integration system for the AdLinkPro platform. The integration provides comprehensive data flow management, validation, and export capabilities for real advertiser data sources and BI systems.

## Table of Contents

1. [Architecture](#architecture)
2. [Data Sources Integration](#data-sources-integration)
3. [BI Systems Integration](#bi-systems-integration)
4. [Data Validation & Format Conversion](#data-validation--format-conversion)
5. [Monitoring & Error Tracking](#monitoring--error-tracking)
6. [API Endpoints](#api-endpoints)
7. [Configuration](#configuration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Advertisers    │───▶│   AdLinkPro      │───▶│  BI Systems     │
│  (Real Data)    │    │   Platform       │    │  (Analytics)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Monitoring     │
                       │   & Alerting     │
                       └──────────────────┘
```

### Core Services

1. **BI Integration Service** (`server/services/biIntegration.ts`)
   - Manages connections to Looker, Metabase, Power BI
   - Handles data export and scheduling
   - Provides health monitoring for BI connections

2. **Data Validation Service** (`server/services/dataValidation.ts`)
   - Validates advertiser data formats
   - Converts between different data formats
   - Ensures data integrity and compatibility

3. **Integration Monitoring Service** (`server/services/integrationMonitoring.ts`)
   - Monitors system health and performance
   - Tracks integration metrics
   - Sends alerts for critical issues

4. **Integration API Routes** (`server/routes/integration.ts`)
   - RESTful endpoints for data integration
   - Authentication and authorization
   - Request/response handling

## Data Sources Integration

### Supported Data Sources

#### Real Advertiser Data
- **Source**: PostgreSQL database with tracking_clicks table
- **Format**: Standardized schema with validation
- **Real-time**: Yes, with caching and optimization
- **Volume**: Supports high-volume data processing

#### Data Fields
```typescript
interface AdvertiserData {
  clickId: string;
  advertiserId: string;
  partnerId?: string;
  offerId?: string;
  timestamp: Date;
  country?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  os?: string;
  browser?: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  isUnique?: boolean;
  isFraud?: boolean;
  riskScore?: number;
  fraudReason?: string;
  revenue?: number;
  payout?: number;
  currency?: string;
}
```

### Data Processing Flow

1. **Data Ingestion**
   - Real-time data from tracking system
   - Batch imports from external sources
   - API-based data submission

2. **Validation & Cleaning**
   - Schema validation using Zod
   - Data integrity checks
   - Format normalization

3. **Storage & Indexing**
   - PostgreSQL with optimized indexes
   - Query caching for performance
   - Data archiving strategies

## BI Systems Integration

### Supported BI Platforms

#### 1. Looker
- **Connection**: REST API with OAuth 2.0
- **Data Export**: JSON format with metadata
- **Features**: Real-time dashboards, scheduled reports
- **Configuration**:
  ```env
  LOOKER_ENDPOINT=https://your-company.looker.com
  LOOKER_API_KEY=your-api-key
  LOOKER_CLIENT_ID=your-client-id
  LOOKER_CLIENT_SECRET=your-client-secret
  ```

#### 2. Metabase
- **Connection**: REST API with session-based auth
- **Data Export**: Direct database connection or API push
- **Features**: Interactive dashboards, SQL queries
- **Configuration**:
  ```env
  METABASE_ENDPOINT=https://your-metabase.com
  METABASE_USERNAME=your-username
  METABASE_PASSWORD=your-password
  ```

#### 3. Power BI
- **Connection**: Microsoft Graph API with OAuth 2.0
- **Data Export**: Power BI REST API
- **Features**: Enterprise dashboards, automated reports
- **Configuration**:
  ```env
  POWERBI_ENDPOINT=https://api.powerbi.com
  POWERBI_TENANT_ID=your-azure-tenant
  POWERBI_CLIENT_ID=your-client-id
  POWERBI_CLIENT_SECRET=your-client-secret
  ```

### Export Formats

- **JSON**: Structured data for API consumption
- **CSV**: Tabular data for spreadsheet analysis
- **Parquet**: Compressed columnar format for big data

### Scheduling

- **Cron-based**: Standard cron expressions for scheduling
- **Event-driven**: Triggered by data updates
- **Manual**: On-demand exports via API

## Data Validation & Format Conversion

### Validation Levels

1. **Schema Validation**
   - Required field checks
   - Data type validation
   - Format constraints

2. **Business Logic Validation**
   - Cross-reference with database
   - Fraud detection rules
   - Data integrity checks

3. **BI-Specific Validation**
   - Target system compatibility
   - Field mapping validation
   - Export format compliance

### Format Conversion

```typescript
// Standard to BI format conversion
const convertToBIFormat = async (data: AdvertiserData, targetBI: string) => {
  const converter = new DataFormatConverter();
  return await converter.convert(data, 'standard', targetBI);
};
```

### Custom Format Support

```typescript
// Add custom format configuration
dataValidationService.addFormatConfig('custom_advertiser', {
  requiredFields: ['clickId', 'customerId', 'eventTime'],
  transformations: {
    eventTime: (value: any) => new Date(value),
    customerId: (value: string) => value.toUpperCase()
  },
  validationRules: {
    customerId: (value: string) => /^CX[0-9]+$/.test(value)
  }
});
```

## Monitoring & Error Tracking

### Health Monitoring

The system continuously monitors:
- **Database connectivity**
- **BI system availability**
- **API response times**
- **Data validation rates**
- **Error frequencies**

### Alert System

#### Alert Types
- **Info**: General information
- **Warning**: Non-critical issues
- **Error**: Service disruptions
- **Critical**: System failures requiring immediate attention

#### Alert Channels
- **Telegram**: Instant notifications for critical alerts
- **Email**: Detailed error reports
- **Dashboard**: Real-time status display

### Metrics Collection

```typescript
// Example metrics tracking
integrationMonitoring.recordMetric('api_response_time', responseTime);
integrationMonitoring.recordMetric('data_validation_rate', validationRate);
integrationMonitoring.recordMetric('bi_export_success', success ? 1 : 0);
```

## API Endpoints

### Authentication

All integration endpoints require Bearer token authentication:
```http
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### 1. Real Data Access
```http
GET /api/integration/real-data
```

**Parameters:**
- `dateFrom` (ISO date): Start date
- `dateTo` (ISO date): End date
- `advertiserId` (UUID, optional): Filter by advertiser
- `format` (string): Export format (json, csv, parquet)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "totalRecords": 1000,
    "validRecords": 950,
    "validationRate": 95.0
  }
}
```

#### 2. BI Export
```http
POST /api/integration/bi-export
```

**Body:**
```json
{
  "biSystem": "looker",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "schedule": "0 0 * * *",
  "filters": {
    "country": "US"
  }
}
```

#### 3. Data Validation
```http
POST /api/integration/validate-data
```

**Body:**
```json
{
  "data": [
    {
      "clickId": "click_123",
      "advertiserId": "uuid-here",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "format": "standard",
  "strictMode": false
}
```

#### 4. Health Monitoring
```http
GET /api/integration/health
```

**Response:**
```json
{
  "health": {
    "overall": "healthy",
    "services": [...],
    "biSystems": {...}
  },
  "monitoring": {
    "activeAlerts": 0,
    "criticalAlerts": 0
  }
}
```

#### 5. Integration Statistics
```http
GET /api/integration/statistics
```

**Parameters:**
- `dateFrom` (ISO date): Period start
- `dateTo` (ISO date): Period end

## Configuration

### Environment Variables

#### Required
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret
```

#### Optional BI Integration
```env
# Looker
LOOKER_ENDPOINT=https://company.looker.com
LOOKER_API_KEY=key
LOOKER_CLIENT_ID=id
LOOKER_CLIENT_SECRET=secret

# Metabase
METABASE_ENDPOINT=https://metabase.company.com
METABASE_USERNAME=username
METABASE_PASSWORD=password

# Power BI
POWERBI_ENDPOINT=https://api.powerbi.com
POWERBI_TENANT_ID=tenant-id
POWERBI_CLIENT_ID=client-id
POWERBI_CLIENT_SECRET=client-secret
```

#### Optional Monitoring
```env
# Telegram alerts
TELEGRAM_BOT_TOKEN=bot-token
TELEGRAM_CHAT_ID=chat-id

# Email alerts
SENDGRID_API_KEY=sendgrid-key
```

### Service Configuration

#### BI Integration Service
```typescript
const biService = new BIIntegrationService({
  retryAttempts: 3,
  timeout: 30000,
  batchSize: 1000
});
```

#### Data Validation Service
```typescript
const validationService = new DataValidationService({
  strictMode: false,
  cacheValidation: true,
  maxRecordsPerBatch: 10000
});
```

## Testing

### Automated Testing

Run the comprehensive integration test suite:
```bash
./test-real-data-integration.sh
```

**Test Coverage:**
- API endpoint functionality
- Data validation accuracy
- BI system connectivity
- Error handling
- Security and authentication

### Manual Testing

#### 1. Test Data Validation
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "clickId": "test_123",
      "advertiserId": "uuid-here",
      "timestamp": "2024-01-01T00:00:00Z"
    }]
  }' \
  http://localhost:5000/api/integration/validate-data
```

#### 2. Test Health Monitoring
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/integration/health
```

### Performance Testing

Test with large datasets:
```bash
# Test with 10,000 records
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/integration/real-data?dateFrom=2024-01-01&dateTo=2024-01-31&limit=10000"
```

## Deployment

### Production Checklist

- [ ] Configure environment variables
- [ ] Set up BI system connections
- [ ] Configure monitoring alerts
- [ ] Enable SSL/HTTPS
- [ ] Set up backup and recovery
- [ ] Configure log rotation
- [ ] Test all integrations

### Scaling Considerations

1. **Database Optimization**
   - Index optimization for large datasets
   - Connection pooling
   - Query optimization

2. **API Performance**
   - Rate limiting
   - Caching strategies
   - Load balancing

3. **BI Integration**
   - Batch processing for large exports
   - Async processing with queues
   - Error recovery mechanisms

### Monitoring in Production

1. **Application Metrics**
   - Response times
   - Error rates
   - Throughput

2. **Business Metrics**
   - Data validation rates
   - Export success rates
   - BI system availability

3. **Infrastructure Metrics**
   - CPU and memory usage
   - Database performance
   - Network latency

## Troubleshooting

### Common Issues

#### 1. BI Connection Failures
**Symptoms**: Export failures, connection timeouts
**Solutions**:
- Check API credentials
- Verify network connectivity
- Review firewall settings
- Check rate limiting

#### 2. Data Validation Errors
**Symptoms**: High validation failure rates
**Solutions**:
- Review data format requirements
- Check source data quality
- Update validation rules
- Monitor data sources

#### 3. Performance Issues
**Symptoms**: Slow API responses, timeouts
**Solutions**:
- Optimize database queries
- Implement caching
- Increase resource allocation
- Review data processing logic

### Debug Commands

#### Check Service Health
```bash
# Get detailed health status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/integration/health | jq '.'
```

#### View Recent Alerts
```bash
# Check monitoring alerts
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/integration/health | jq '.monitoring.recentAlerts'
```

#### Test BI Connectivity
```bash
# Test specific BI system
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"biSystem": "metabase", "dateFrom": "2024-01-01", "dateTo": "2024-01-02"}' \
  http://localhost:5000/api/integration/bi-export
```

### Log Analysis

#### Application Logs
```bash
# View integration service logs
tail -f logs/integration.log | grep -E "(ERROR|WARN|INFO)"

# Filter by specific service
tail -f logs/app.log | grep -i "biintegration"
```

#### Database Logs
```bash
# Check PostgreSQL logs for slow queries
tail -f /var/log/postgresql/postgresql.log | grep "slow query"
```

### Support and Maintenance

#### Regular Maintenance Tasks
1. **Daily**: Monitor alert dashboard
2. **Weekly**: Review performance metrics
3. **Monthly**: Update BI system connections
4. **Quarterly**: Review and optimize data schemas

#### Emergency Procedures
1. **Critical Alert Response**: Immediate investigation and resolution
2. **Data Loss Prevention**: Backup and recovery procedures
3. **Security Incident**: Isolation and remediation steps

## Conclusion

The real data integration system provides comprehensive capabilities for:
- Seamless integration with advertiser data sources
- Multi-platform BI system connectivity
- Robust data validation and format conversion
- Comprehensive monitoring and alerting
- High-performance API endpoints

The system is designed for scalability, reliability, and ease of maintenance, ensuring consistent data flow and analytics capabilities for the AdLinkPro platform.

For additional support or questions, consult the API documentation or contact the development team.