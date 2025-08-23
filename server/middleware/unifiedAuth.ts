import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { auditLog } from './security';
import {
  sendAuthenticationRequired,
  sendInvalidToken,
  sendInsufficientPermissions,
  sendUserNotFound,
  sendInternalError,
  validateJWTFormat,
  sendJWTValidationError,
  sendValidationError
} from '../utils/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Enhanced JWT token extraction and validation
function extractAndValidateToken(req: Request): { token: string | null; errors: string[] } {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return { token: null, errors: ['Authorization header missing'] };
  }

  // Support both "Bearer TOKEN" and "TOKEN" formats
  const tokenMatch = authHeader.match(/^(?:Bearer\s+)?(.+)$/);
  
  if (!tokenMatch) {
    return { token: null, errors: ['Invalid authorization header format'] };
  }

  const token = tokenMatch[1].trim();
  
  // Enhanced JWT format validation
  const validation = validateJWTFormat(token);
  
  return { token: validation.isValid ? token : null, errors: validation.errors };
}

// Unified authentication middleware - replaces both auth.ts and authorization.ts versions
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log("🛡️  [AUTH_MIDDLEWARE] Authenticating token...", {
    path: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers['authorization']
  });

  const { token, errors } = extractAndValidateToken(req);

  if (!token) {
    console.log("🛡️  [AUTH_MIDDLEWARE] Token extraction failed:", errors);
    auditLog(req, 'AUTH_FAILED', undefined, false, { errors });
    return sendAuthenticationRequired(req, res);
  }

  try {
    console.log("🛡️  [AUTH_MIDDLEWARE] Verifying JWT token...");
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Additional token payload validation
    if (!decoded.sub && !decoded.id) {
      console.error("🛡️  [AUTH_MIDDLEWARE] Missing user identifier in token");
      return sendJWTValidationError(req, res, { reason: 'Missing user identifier in token' });
    }

    if (!decoded.role) {
      console.error("🛡️  [AUTH_MIDDLEWARE] Missing role in token");
      return sendJWTValidationError(req, res, { reason: 'Missing role in token' });
    }

    req.user = decoded;
    
    console.log("🛡️  [AUTH_MIDDLEWARE] Token verified successfully", {
      userId: decoded.sub || decoded.id,
      role: decoded.role
    });
    
    // Log successful authentication
    auditLog(req, 'AUTH_SUCCESS', decoded.sub || decoded.id, true, { 
      role: decoded.role, 
      method: 'JWT' 
    });
    
    next();
  } catch (_error) {
    let errorDetails = 'Unknown JWT error';
    
    if (error instanceof jwt.JsonWebTokenError) {
      errorDetails = 'Invalid JWT format or signature';
    } else if (error instanceof jwt.TokenExpiredError) {
      errorDetails = 'Token expired';
    } else if (error instanceof jwt.NotBeforeError) {
      errorDetails = 'Token not active yet';
    }

    console.error("🛡️  [AUTH_MIDDLEWARE] Token verification failed:", errorDetails, _error);
    auditLog(req, 'INVALID_TOKEN', undefined, false, { error: errorDetails });
    return sendInvalidToken(req, res, { reason: errorDetails });
  }
}

// Enhanced role-based access control middleware
export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return sendAuthenticationRequired(req, res);
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return sendInsufficientPermissions(req, res, allowedRoles, user.role);
      }

      // Enhanced user verification - check if user still exists and is active
      try {
        const [dbUser] = await db
          .select({ 
            isActive: users.isActive,
            isBlocked: users.isBlocked,
            role: users.role
          })
          .from(users)
          .where(eq(users.id, user.sub || user.id))
          .limit(1);

        if (!dbUser) {
          auditLog(req, 'USER_NOT_FOUND', user.sub || user.id, false);
          return sendUserNotFound(req, res);
        }

        if (dbUser.isBlocked) {
          auditLog(req, 'BLOCKED_USER_ACCESS', user.sub || user.id, false);
          return sendInsufficientPermissions(req, res, ['active'], 'blocked');
        }

        if (!dbUser.isActive) {
          auditLog(req, 'INACTIVE_USER_ACCESS', user.sub || user.id, false);
          return sendInsufficientPermissions(req, res, ['active'], 'inactive');
        }

        // Verify role hasn't changed
        if (dbUser.role !== user.role) {
          auditLog(req, 'ROLE_MISMATCH', user.sub || user.id, false, { 
            tokenRole: user.role, 
            dbRole: dbUser.role 
          });
          return sendInvalidToken(req, res, { reason: 'Role mismatch - token may be outdated' });
        }

        next();
      } catch (dbError) {
        console.error('Database error during role verification:', dbError);
        // In case of DB error, continue with token-based auth as fallback
        // but log the issue for monitoring
        auditLog(req, 'DB_ERROR_FALLBACK', user.sub || user.id, true, { error: 'Database verification failed' });
        next();
      }
    } catch (error) {
      console.error('Role middleware error:', error);
      return sendInternalError(req, res, error);
    }
  };
}

// Permission-based access control middleware with enhanced user lookup
export function requirePermission(permission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return sendAuthenticationRequired(req, res);
      }

      // Try to get user permissions from database
      try {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.sub || user.id))
          .limit(1);

        if (!dbUser) {
          return sendUserNotFound(req, res);
        }

        // Check user permissions based on role and settings
        const hasPermission = checkUserPermission(dbUser, permission);
        
        if (!hasPermission) {
          auditLog(req, 'PERMISSION_DENIED', user.sub || user.id, false, { 
            permission,
            userRole: dbUser.role
          });
          return sendInsufficientPermissions(req, res, [permission], 'none');
        }

        next();
      } catch (dbError) {
        console.error('Database error during permission check:', dbError);
        // Fallback to basic role-based permission check
        const basicPermission = checkBasicPermission(user.role, permission);
        
        if (!basicPermission) {
          return sendInsufficientPermissions(req, res, [permission], user.role);
        }

        auditLog(req, 'PERMISSION_FALLBACK', user.sub || user.id, true, { 
          permission, 
          method: 'role-based-fallback' 
        });
        next();
      }
    } catch (error) {
      console.error('Permission middleware error:', error);
      return sendInternalError(req, res, error);
    }
  };
}

// Helper function to check user permissions based on role and settings
function checkUserPermission(user: any, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    OWNER: ['*'], // Owner has all permissions
    ADVERTISER: ['view_offers', 'create_offers', 'edit_own_offers', 'view_statistics'],
    PARTNER: ['view_offers', 'generate_links', 'view_own_statistics']
  };

  // Check if user role has the permission or all permissions (*)
  const userPermissions = rolePermissions[user.role] || [];
  
  if (userPermissions.includes('*') || userPermissions.includes(permission)) {
    return true;
  }

  // Check custom permissions in user settings if available
  const customPermissions = user.permissions || {};
  
  if (customPermissions[permission] === true) {
    return true;
  }

  // Check if permission is explicitly denied
  if (customPermissions[permission] === false) {
    return false;
  }

  return false;
}

// Basic permission check fallback when database is unavailable
function checkBasicPermission(role: string, permission: string): boolean {
  const basicRolePermissions: Record<string, string[]> = {
    OWNER: ['*'],
    ADVERTISER: ['view_offers', 'create_offers', 'edit_own_offers', 'view_statistics'],
    PARTNER: ['view_offers', 'generate_links', 'view_own_statistics']
  };

  const permissions = basicRolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

// Check if user can access another user's data
export async function canAccessUser(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    if (!currentUser) {
      return false;
    }

    // Owner can access anyone
    if (currentUser.role === 'OWNER') {
      return true;
    }

    // Users can access their own data
    if (currentUserId === targetUserId) {
      return true;
    }

    // Advertisers can access their partners' data in some contexts
    // This would need more specific business logic

    return false;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

// Middleware to ensure user owns the resource or has permission to access it
export function requireOwnership(resourceUserIdParam: string = 'userId') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      const targetUserId = req.params[resourceUserIdParam];

      if (!currentUser || !targetUserId) {
        return sendValidationError(req, res, 'Invalid request parameters');
      }

      const canAccess = await canAccessUser(currentUser.id || currentUser.sub, targetUserId);
      
      if (!canAccess) {
        auditLog(req, 'OWNERSHIP_VIOLATION', currentUser.id || currentUser.sub, false, { 
          currentUserId: currentUser.id || currentUser.sub, 
          targetUserId 
        });
        return sendInsufficientPermissions(req, res, ['owner'], 'none');
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return sendInternalError(req, res, error);
    }
  };
}

// Get authenticated user from request
export function getAuthenticatedUser(req: AuthenticatedRequest): any {
  return req.user;
}

// Legacy requireAuth function for backward compatibility
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return authenticateToken(req, res, next);
}