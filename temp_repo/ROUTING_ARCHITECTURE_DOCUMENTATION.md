# Routing Architecture Documentation

## Overview
This document describes the refactored routing system that eliminates redirects and provides consistent navigation patterns for all user roles.

## Key Changes Made

### 1. Centralized Route Management
- Created `client/src/utils/routeByRole.ts` utility for centralized route mapping
- All roles now use consistent `/dashboard/*` prefix paths
- Eliminated hardcoded role-to-route mappings scattered throughout the codebase

### 2. Standardized Route Structure

#### Before (Inconsistent)
```
partner/affiliate → /dash/*
advertiser → /dashboard/advertiser/*
owner → /dashboard/owner/*
super_admin → /dashboard/super-admin/*
```

#### After (Consistent)
```
partner/affiliate → /dashboard/affiliate/*
advertiser → /dashboard/advertiser/*
owner → /dashboard/owner/*
super_admin → /dashboard/super-admin/*
staff → /dashboard/staff/*
```

### 3. Redirect Elimination
- Removed redirect from `/dashboard/partner` to `/dash`
- Added legacy compatibility redirects from `/dash` to `/dashboard/affiliate`
- Eliminated all other implicit route transitions

### 4. Role Mapping Standardization
All roles are mapped through the centralized `routeByRole()` function:

| User Role | Route Path | Components |
|-----------|------------|------------|
| `partner` | `/dashboard/affiliate` | Partner/Affiliate pages |
| `affiliate` | `/dashboard/affiliate` | Partner/Affiliate pages |  
| `advertiser` | `/dashboard/advertiser` | Advertiser pages |
| `owner` | `/dashboard/owner` | Owner pages |
| `super_admin` | `/dashboard/super-admin` | Super Admin pages |
| `staff` | `/dashboard/staff` | Staff pages |

## Route Mapping Functions

### `routeByRole(role: string): string`
Returns the appropriate dashboard route for a given user role.

```typescript
import { routeByRole } from '@/utils/routeByRole';

// Example usage
const role = 'advertiser';
const dashboardPath = routeByRole(role); // Returns '/dashboard/advertiser'
```

### Other Utility Functions
- `getAllDashboardRoutes()` - Returns all valid dashboard routes
- `isValidDashboardRoute(route)` - Validates if a route is a dashboard route
- `getRoleFromRoute(route)` - Extracts role from a dashboard route
- `extractRoleFromToken(token)` - Extracts role from JWT token

## Updated Components

### Authentication Components
- `client/src/pages/auth/login.tsx` - Uses centralized routing
- `client/src/components/auth/AuthRedirector.tsx` - Updated to use `routeByRole()`
- `client/src/components/auth/ProtectedRoute.tsx` - Integrated with route utilities

### Navigation Components
- `client/src/components/layout/AffiliateSidebar.tsx` - Updated all href paths
- `client/src/components/layout/AdvertiserSidebar.tsx` - Updated all href paths

### Main Routing
- `client/src/App.tsx` - Complete route refactoring with consistent patterns

## Testing Scenarios

### Role-Based Login Testing
Test each role login to ensure proper redirection:

1. **Partner/Affiliate Login**
   - Should redirect to `/dashboard/affiliate`
   - Should have access to affiliate-specific pages

2. **Advertiser Login**
   - Should redirect to `/dashboard/advertiser`  
   - Should have access to advertiser-specific pages

3. **Owner Login**
   - Should redirect to `/dashboard/owner`
   - Should have access to owner-specific pages

4. **Super Admin Login**
   - Should redirect to `/dashboard/super-admin`
   - Should have access to super admin pages

5. **Staff Login**
   - Should redirect to `/dashboard/staff`
   - Should have access to staff pages

### Navigation Testing
- Verify all sidebar links work correctly
- Ensure no broken links or 404 errors
- Test direct URL access for all role-specific pages
- Verify legacy `/dash` routes redirect properly

## Legacy Compatibility

### Automatic Redirects
Old `/dash` routes are automatically redirected to new `/dashboard/affiliate` routes:
- `/dash` → `/dashboard/affiliate`
- `/dash/*` → `/dashboard/affiliate`

### Token Compatibility
The system maintains backward compatibility with existing JWT tokens and role naming variations.

## Benefits

1. **No More Redirects** - Clean, direct navigation without intermediate redirects
2. **Consistent Structure** - All roles follow the same `/dashboard/*` pattern
3. **Maintainable** - Centralized route management reduces code duplication
4. **Scalable** - Easy to add new roles and routes
5. **Clear Architecture** - Transparent routing logic for developers

## Future Enhancements

1. **Route Permissions** - Fine-grained permission checking per route
2. **Dynamic Routes** - Support for parameterized routes
3. **Breadcrumbs** - Automatic breadcrumb generation from route structure
4. **Route Analytics** - Track route usage and navigation patterns