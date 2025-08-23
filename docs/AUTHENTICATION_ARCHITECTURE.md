# Authentication System Architecture Documentation

## Overview
This document describes the enhanced authentication system architecture implemented to improve security, user experience, and maintainability.

## Key Components

### 1. Type Definitions (`/types/auth.ts`)
Provides strict typing for authentication-related data structures:

```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  // ... other properties
}

type UserRole = 'owner' | 'super_admin' | 'staff' | 'advertiser' | 'partner' | 'affiliate';
```

**Benefits:**
- Type safety throughout the application
- Better IDE support and error detection
- Clear interface contracts

### 2. Centralized Error Handling (`/hooks/useAuthError.ts`)
Provides consistent error handling across authentication flows:

```typescript
const { error, handleError, clearError, isRateLimited } = useAuthError();
```

**Features:**
- Automatic error message translation to user-friendly text
- Rate limiting detection and handling
- Toast notifications for appropriate errors
- Comprehensive error logging

### 3. Enhanced Authentication Context (`/contexts/auth-context.tsx`)
Improved with server-side token validation and better user management:

```typescript
const { user, isAuthenticated, login, logout, refreshUser } = useAuth();
```

**Enhancements:**
- Server-side token validation on initialization via `/api/me` endpoint
- Enhanced logging for debugging
- Automatic token cleanup on auth failures
- User data caching and refresh capabilities

### 4. Modular API Architecture (`/lib/api/`)
Split into focused modules for better organization:

- `client.ts` - Enhanced API client with comprehensive logging
- `auth.ts` - Authentication-specific API calls
- `user.ts` - User management API calls
- `index.ts` - Central exports for easy importing

**Benefits:**
- Reduced code duplication
- Better error traceability with detailed request logging
- Modular structure for easier maintenance
- Consistent request handling

### 5. Reusable Form Hooks

#### Login Form Hook (`/hooks/useLoginForm.ts`)
```typescript
const { form, loading, handleSubmit, error } = useLoginForm({
  redirectTo: '/dashboard',
  onSuccess: (user) => console.log('Login successful'),
});
```

#### Registration Form Hook (`/hooks/useRegistrationForm.ts`)
```typescript
const { form, loading, handleSubmit, passwordStrengthInfo } = useRegistrationForm({
  role: 'PARTNER',
  onSuccess: (result) => console.log('Registration successful'),
});
```

**Features:**
- Form validation and submission logic
- Password strength checking
- Rate limiting integration
- Flexible redirect handling
- Success/error callbacks

### 6. Global State Management (`/hooks/useGlobalState.ts`)
Centralized state management for loading and error states:

```typescript
const { isLoading, setLoading, hasError, setError } = useGlobalState();
```

**Features:**
- Centralized loading states across the app
- Global error state management
- Convenient hooks for specific states
- Automatic toast notifications for critical errors

### 7. Enhanced Protected Route (`/components/auth/ProtectedRoute.tsx`)
Improved role-based access control with caching:

```typescript
<ProtectedRoute 
  path="/dashboard/*" 
  roles={['admin', 'owner']}
  fallbackPath="/login"
>
  <DashboardComponent />
</ProtectedRoute>
```

**Enhancements:**
- Multiple role support with hierarchy checking
- User data caching to reduce API calls
- Flexible redirect options
- Better loading states
- Enhanced role mapping

## Usage Examples

### Basic Authentication Flow
```typescript
// In a component
function LoginPage() {
  const { form, loading, handleSubmit, error } = useLoginForm({
    redirectTo: '/dashboard',
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <Alert>{error.message}</Alert>}
      <Button disabled={loading}>Login</Button>
    </form>
  );
}
```

### API Usage
```typescript
// Authentication
import { authApi } from '@/lib/api';

const user = await authApi.login({ email, password });
const profile = await authApi.me();

// User management
import { userApi } from '@/lib/api';

const users = await userApi.listUsers({ role: 'partner', limit: 10 });
```

### Global State Management
```typescript
function MyComponent() {
  const { setLoading, isLoading } = useGlobalState();
  
  const handleAsyncOperation = async () => {
    setLoading('api', true);
    try {
      await someApiCall();
    } finally {
      setLoading('api', false);
    }
  };
  
  return <Button disabled={isLoading('api')}>Submit</Button>;
}
```

## Security Features

1. **Server-side Token Validation**: All tokens are validated against the server on app initialization
2. **Rate Limiting**: Built-in protection against brute force attacks
3. **CSRF Protection**: Automatic CSRF token management for state-changing operations
4. **Secure Token Storage**: Enhanced token storage with automatic cleanup
5. **Role-based Access Control**: Comprehensive role checking with hierarchy support
6. **Password Strength Validation**: Real-time password strength feedback

## Migration Guide

### From Old Auth Context
```typescript
// Old way
const { user, login } = useAuth();

// New way (same interface, enhanced functionality)
const { user, login, refreshUser } = useAuth();
```

### From Direct API Calls
```typescript
// Old way
const response = await fetch('/api/auth/login', { ... });

// New way
const response = await authApi.login({ email, password });
```

### From Custom Error Handling
```typescript
// Old way
const [error, setError] = useState('');
// Custom error handling logic

// New way
const { error, handleError } = useAuthError();
handleError(error, 'Login'); // Automatic error handling
```

## Testing

The system includes comprehensive unit tests for:
- Authentication hooks (`tests/auth-hooks.test.ts`)
- API client (`tests/api-client.test.ts`) 
- Global state management (`tests/global-state.test.ts`)

Run tests with:
```bash
npm test
```

## Performance Optimizations

1. **User Data Caching**: Reduces redundant `/api/me` calls
2. **Token Validation Caching**: Caches user data to avoid repeated server validation
3. **Lazy Loading**: Authentication state is loaded asynchronously
4. **Debounced Operations**: Rate limiting prevents excessive API calls

## Future Enhancements

1. **Offline Support**: Cache authentication state for offline usage
2. **Session Management**: Advanced session timeout handling
3. **Multi-factor Authentication**: Framework ready for 2FA integration
4. **Analytics Integration**: Track authentication events
5. **Progressive Enhancement**: Graceful degradation for older browsers