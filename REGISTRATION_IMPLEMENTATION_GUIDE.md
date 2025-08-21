# Affiliate Registration System - Implementation Guide

## Overview
The affiliate registration system now provides a fully functional registration process that properly saves users to the database with graceful fallback to in-memory storage.

## Registration Endpoint
**URL:** `POST /api/auth/register`

### Request Format
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "company": "Company Name (optional)",
  "role": "affiliate",
  "agreeTerms": true,
  "agreePrivacy": true
}
```

### Supported Roles
- `affiliate` (default) - Partner/affiliate users
- `advertiser` - Advertising clients  
- `partner` - Partner users

### Response Format
**Success (200 OK):**
```json
{
  "success": true,
  "message": "Регистрация успешна! Проверьте email для подтверждения аккаунта.",
  "user": {
    "id": 123456,
    "email": "user@example.com",
    "name": "User Name",
    "username": "user",
    "role": "AFFILIATE", 
    "emailVerified": false
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "error": "Обязательные поля: имя, email, пароль, согласие на условия и обработку данных"
}
```

**Duplicate User (409 Conflict):**
```json
{
  "error": "Пользователь с таким email уже существует"
}
```

## Implementation Details

### Database-First Approach
1. **Primary:** Attempts to save user to database using `createUser()` function
2. **Fallback:** If database unavailable, stores user in memory for development
3. **Error Handling:** Properly handles unique constraint violations

### Security Features
- **Password Hashing:** bcrypt with salt factor 12
- **Input Validation:** Email format, password strength (8+ characters)
- **Duplicate Prevention:** Checks both database and memory storage
- **SQL Injection Protection:** Uses parameterized queries

### Login Integration
The login system properly handles users registered through both database and memory storage:

```javascript
// Login checks in order:
1. Database users (with bcrypt password verification)
2. In-memory registered users (with bcrypt password verification) 
3. Hardcoded development users (for fallback)
```

## Testing

### Manual Testing Commands
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "affiliate",
    "agreeTerms": true,
    "agreePrivacy": true
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "TestPassword123!"
  }'
```

### Automated Tests
Run the comprehensive test suite:
```bash
npm test -- tests/registration-logic.test.ts
```

## Production Setup

### Environment Variables
```env
# Required
JWT_SECRET=your-secure-jwt-secret-here
DATABASE_URL=postgres://user:pass@host:port/db

# Optional
OWNER_EMAIL=owner@yourcompany.com
OWNER_PASSWORD=secure-owner-password
```

### Database Schema
The registration system uses the existing `users` table with these key fields:
- `id` (UUID, primary key)
- `username` (unique)
- `email` (unique) 
- `password` (hashed)
- `role` (affiliate, advertiser, partner)
- `first_name`, `phone`, `company` (profile data)
- `created_at`, `updated_at` (timestamps)

## Error Handling

### Common Validation Errors
- Missing required fields → 400 Bad Request
- Invalid email format → 400 Bad Request  
- Weak password (< 8 chars) → 400 Bad Request
- Missing terms/privacy agreement → 400 Bad Request

### Database Errors
- Duplicate email → 409 Conflict
- Duplicate username → 409 Conflict
- Database connection failure → Graceful fallback to memory storage

## Logging
The system provides detailed logging for monitoring:
- `🔐 [REGISTER]` - Registration attempts
- `🔍 [REGISTER]` - User lookup operations
- `✅ [REGISTER]` - Successful operations
- `❌ [REGISTER]` - Errors and failures
- `⚠️ [REGISTER]` - Warnings and fallbacks

## Role-Specific Features

### Affiliate Registration
- Default role when not specified
- Standard success message
- No company field required

### Advertiser Registration  
- Special success message about review process
- Company field typically provided
- May require additional approval workflow

### Partner Registration
- Similar to affiliate registration
- Standard success message
- No company field required