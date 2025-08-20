# 🛡️ Anti-Fraud API Endpoints Documentation

## Overview
Complete API documentation for the AdLinkPro anti-fraud system endpoints.

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

Required roles: `super_admin` or `admin`

---

## 📊 Fraud Alerts Management

### GET /api/admin/fraud-alerts
Get paginated list of fraud alerts with filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 20, max: 100)
- `severity` (string) - Filter by severity: 'low', 'medium', 'high', 'critical', 'all' 
- `status` (string) - Filter by status: 'pending', 'resolved', 'all'
- `type` (string) - Filter by alert type
- `dateFrom` (ISO date) - Filter from date
- `dateTo` (ISO date) - Filter to date  
- `search` (string) - Search in description, user info, offer name

**Response:**
```json
{
  "data": [
    {
      "id": "alert_123",
      "type": "suspicious_activity",
      "severity": "high", 
      "description": "High velocity clicks detected",
      "isResolved": false,
      "createdAt": "2025-01-08T10:00:00Z",
      "user": {
        "id": "user_456",
        "username": "partner123",
        "email": "partner@example.com"
      },
      "offer": {
        "id": "offer_789", 
        "name": "Casino Offer",
        "category": "gambling"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET /api/admin/fraud-alerts/:id
Get detailed information for specific fraud alert.

**Response:**
```json
{
  "id": "alert_123",
  "type": "suspicious_activity",
  "severity": "high",
  "description": "Detailed alert description",
  "data": { "additional": "metadata" },
  "isResolved": false,
  "resolvedAt": null,
  "resolvedBy": null,
  "createdAt": "2025-01-08T10:00:00Z",
  "user": { /* user details */ },
  "offer": { /* offer details */ }
}
```

### PATCH /api/admin/fraud-alerts/:id
Update fraud alert status (resolve/reopen).

**Request Body:**
```json
{
  "isResolved": true,
  "resolvedBy": "admin_user_id", 
  "notes": "Resolved after investigation"
}
```

---

## 📈 Fraud Metrics & Statistics

### GET /api/admin/fraud-metrics
Get fraud detection metrics with change tracking.

**Query Parameters:**
- `period` (string) - Time period: '24h', '7d', '30d' (default: '30d')

**Response:**
```json
{
  "activeAlerts": 12,
  "alertsChange": 3,
  "fraudRate": 2.5,
  "fraudRateChange": -0.3,
  "blockedRevenue": 15750,
  "blockedRevenueChange": 2400,
  "resolvedToday": 8,
  "resolvedTodayChange": 2,
  "period": "30d",
  "totalReports": 89,
  "savedAmount": "15750.00"
}
```

### GET /api/admin/fraud-stats  
Get comprehensive fraud statistics from storage layer.

**Query Parameters:**
- `period` (string) - Time period
- `dateFrom` (ISO date) - Start date
- `dateTo` (ISO date) - End date

**Response:**
```json
{
  "totalReports": 156,
  "reportsGrowth": 12,
  "fraudRate": 2.34,
  "fraudRateGrowth": -0.45,
  "blockedIPs": 23,
  "savedAmount": "18650.00"
}
```

### GET /api/admin/smart-alerts
Get dynamic smart alerts based on fraud patterns.

**Response:**
```json
[
  {
    "id": "high-fraud-rate",
    "type": "warning",
    "severity": "high", 
    "title": "High Fraud Rate Detected",
    "message": "Current fraud rate is 5.2% - above normal threshold",
    "action": "Review recent traffic patterns",
    "data": { "currentRate": 5.2 }
  }
]
```

---

## 🚫 Fraud Blocking & Reports

### POST /api/admin/fraud-blocks
Create new fraud block (IP, device, etc.).

**Request Body:**
```json
{
  "type": "ip",
  "targetId": "192.168.1.100",
  "reason": "Repeated fraudulent activity",
  "duration": 72,
  "autoBlocked": false
}
```

**Response:**
```json
{
  "id": "block_123",
  "type": "ip",
  "targetId": "192.168.1.100", 
  "reason": "Repeated fraudulent activity",
  "isActive": true,
  "expiresAt": "2025-01-11T10:00:00Z",
  "createdAt": "2025-01-08T10:00:00Z"
}
```

### GET /api/admin/fraud-reports
Get fraud reports with filtering and search.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Report status: 'pending', 'reviewing', 'confirmed', 'rejected'
- `type` - Report type: 'ip_fraud', 'device_fraud', 'geo_fraud', etc.
- `severity` - Severity level
- `search` - Search term

**Response:**
```json
{
  "data": [
    {
      "id": "report_123",
      "type": "ip_fraud",
      "severity": "high",
      "status": "pending",
      "description": "Suspicious IP behavior detected", 
      "ip": "192.168.1.100",
      "riskScore": 85,
      "createdAt": "2025-01-08T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### DELETE /api/admin/fraud-rules/:id
Delete fraud rule with dependency checking.

**Response:**
```json
{
  "success": true,
  "message": "Fraud rule deleted successfully"
}
```

**Error Response:**
```json
{
  "error": "Cannot delete rule: 3 active blocks depend on this rule"
}
```

---

## 📊 Analytics Integration  

### GET /api/analytics/fraud
Get fraud analytics for reporting.

**Query Parameters:**
- `period` (string) - Analysis period
- `format` (string) - Response format: 'json' (default), 'csv'

**Response (JSON):**
```json
{
  "totalReports": 89,
  "fraudRate": 2.34,
  "botRate": 15.6,
  "vpnRate": 8.2,
  "savedAmount": "18650.00",
  "period": "30d",
  "timestamp": "2025-01-08T10:00:00Z"
}
```

### GET /api/analytics/export
Export analytics data with fraud information.

**Query Parameters:**
- `format` - Export format: 'json', 'csv'  
- `period` - Time period
- `role` - Role filter

**Response:**
- JSON: Complete analytics object
- CSV: Generated CSV file download

---

## 🔧 Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions) 
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## 📝 Usage Examples

### JavaScript/Fetch
```javascript
// Get fraud alerts
const response = await fetch('/api/admin/fraud-alerts?page=1&severity=high', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Resolve an alert  
await fetch(`/api/admin/fraud-alerts/${alertId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isResolved: true,
    notes: 'False positive - legitimate traffic'
  })
});
```

### React Query Integration
```typescript
// Get fraud metrics
const { data: metrics } = useQuery({
  queryKey: ['/api/admin/fraud-metrics', period],
  queryFn: async () => {
    const response = await fetch(`/api/admin/fraud-metrics?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
});
```