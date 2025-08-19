/**
 * Centralized route mapping utility for role-based navigation
 * Eliminates redirects and provides consistent routing for all user roles
 */

export type UserRole = 'partner' | 'affiliate' | 'advertiser' | 'owner' | 'super_admin' | 'staff';

/**
 * Role to route mapping configuration
 * All routes use the /dashboard prefix for consistency
 */
const ROLE_ROUTES: Record<UserRole, string> = {
  partner: '/dashboard/affiliate',      // Partner is treated as affiliate
  affiliate: '/dashboard/affiliate',    // Standardized affiliate route
  advertiser: '/dashboard/advertiser',
  owner: '/dashboard/owner',
  super_admin: '/dashboard/super-admin',
  staff: '/dashboard/staff'
};

/**
 * Default fallback route for unknown roles or errors
 */
const DEFAULT_ROUTE = '/dashboard/affiliate';

/**
 * Get the appropriate dashboard route for a user role
 * @param role - User role
 * @returns Dashboard route path
 */
export function routeByRole(role: string | null | undefined): string {
  if (!role) {
    return DEFAULT_ROUTE;
  }

  // Normalize role string (handle case variations and trim whitespace)
  const normalizedRole = role.toLowerCase().trim();
  
  // Handle role variations and aliases
  const roleMapping: Record<string, UserRole> = {
    'partner': 'partner',
    'affiliate': 'affiliate', 
    'advertiser': 'advertiser',
    'owner': 'owner',
    'super_admin': 'super_admin',
    'super admin': 'super_admin',
    'superadmin': 'super_admin',
    'staff': 'staff'
  };

  const mappedRole = roleMapping[normalizedRole];
  return ROLE_ROUTES[mappedRole] || DEFAULT_ROUTE;
}

/**
 * Get all valid routes for role-based access validation
 * @returns Array of all dashboard routes
 */
export function getAllDashboardRoutes(): string[] {
  return Object.values(ROLE_ROUTES);
}

/**
 * Check if a route is a valid dashboard route
 * @param route - Route to check
 * @returns True if route is a valid dashboard route
 */
export function isValidDashboardRoute(route: string): boolean {
  return getAllDashboardRoutes().includes(route);
}

/**
 * Get the role from a dashboard route
 * @param route - Dashboard route
 * @returns User role or null if route doesn't match
 */
export function getRoleFromRoute(route: string): UserRole | null {
  const entry = Object.entries(ROLE_ROUTES).find(([, routePath]) => routePath === route);
  return entry ? entry[0] as UserRole : null;
}

/**
 * Extract role from JWT token payload
 * @param token - JWT token
 * @returns User role or null if extraction fails
 */
export function extractRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
    return String(payload.role || '').trim();
  } catch {
    return null;
  }
}