/**
 * Centralized route mapping utility for role-based navigation
 * Updated to match the requirements from the problem statement
 */

export type UserRole = 'advertiser' | 'publisher' | 'admin' | 'partner' | 'affiliate' | 'owner' | 'super_admin' | 'staff';

/**
 * Role to route mapping configuration as per problem statement requirements
 * HOME_BY_ROLE implementation for dashboard redirection
 */
const HOME_BY_ROLE: Record<string, string> = {
  advertiser: '/advertiser',
  publisher: '/publisher', 
  admin: '/admin',
  // Additional mappings for backwards compatibility
  partner: '/publisher',    // Partners map to publisher dashboard
  affiliate: '/publisher',  // Affiliates map to publisher dashboard
  owner: '/admin',         // Owner maps to admin dashboard
  super_admin: '/admin',   // Super admin maps to admin dashboard
  staff: '/publisher'      // Staff maps to publisher dashboard
};

/**
 * Default fallback route for unknown roles or errors  
 */
const DEFAULT_ROUTE = '/publisher';

/**
 * Get the appropriate dashboard route for a user role
 * Implements the HOME_BY_ROLE logic from the problem statement:
 * navigate(HOME_BY_ROLE[user.role]);
 * @param role - User role
 * @returns Dashboard route path
 */
export function routeByRole(role: string | null | undefined): string {
  if (!role) {
    return DEFAULT_ROUTE;
  }

  // Normalize role string (handle case variations and trim whitespace)
  const normalizedRole = role.toLowerCase().trim();
  
  // Direct lookup from HOME_BY_ROLE mapping
  return HOME_BY_ROLE[normalizedRole] || DEFAULT_ROUTE;
}

/**
 * Get all valid routes for role-based access validation
 * @returns Array of all dashboard routes
 */
export function getAllDashboardRoutes(): string[] {
  return [...new Set(Object.values(HOME_BY_ROLE))]; // Remove duplicates
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
 * Get the primary role from a dashboard route
 * @param route - Dashboard route
 * @returns User role or null if route doesn't match
 */
export function getRoleFromRoute(route: string): UserRole | null {
  // Find the first role that maps to this route
  const entry = Object.entries(HOME_BY_ROLE).find(([, routePath]) => routePath === route);
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