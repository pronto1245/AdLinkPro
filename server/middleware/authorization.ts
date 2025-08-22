import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { auditLog } from './security';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Enhanced error response format for consistency
interface AuthError {
  error: string;
  code: string;
  timestamp: string;
  details?: any;
}

function createAuthError(code: string, message: string, details?: any): AuthError {
  return {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    details
  };
}

// Enhanced authentication middleware with better error handling and JWT validation
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error = createAuthError('TOKEN_MISSING', 'Access token required');
    auditLog(req, 'AUTHENTICATION_FAILED', undefined, false, { reason: 'Missing token' });
    return res.status(401).json(error);
  }

  try {
    // Enhanced JWT verification with proper typing
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { 
      id: string; 
      role: string; 
      email: string; 
    };
    
    // Additional validation checks
    if (!decoded.id || !decoded.role) {
      throw new Error('Invalid token payload: missing required fields');
    }

    // Check token expiration more explicitly
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    (req as any).user = decoded;
    auditLog(req, 'AUTHENTICATION_SUCCESS', undefined, true, { userId: decoded.id });
    next();
  } catch (error) {
    let errorCode = 'TOKEN_INVALID';
    let errorMessage = 'Invalid or expired token';
    
    if (error instanceof jwt.TokenExpiredError) {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Token has expired';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorCode = 'TOKEN_MALFORMED';
      errorMessage = 'Malformed token';
    }
    
    const authError = createAuthError(errorCode, errorMessage);
    auditLog(req, 'AUTHENTICATION_FAILED', undefined, false, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode 
    });
    
    return res.status(403).json(authError);
  }
}

// Role-based access control middleware with enhanced error handling
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        const error = createAuthError('USER_NOT_AUTHENTICATED', 'Authentication required');
        auditLog(req, 'ACCESS_DENIED', undefined, false, { reason: 'No user context' });
        return res.status(401).json(error);
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        const error = createAuthError('INSUFFICIENT_PERMISSIONS', 'Access denied: insufficient permissions', {
          required: allowedRoles,
          current: user.role
        });
        auditLog(req, 'UNAUTHORIZED_ACCESS', undefined, false, { 
          userId: user.id,
          userRole: user.role, 
          requiredRoles: allowedRoles,
          resource: req.path
        });
        return res.status(403).json(error);
      }

      // Additional check - verify user is still active in database
      const [dbUser] = await db
        .select({ 
          isActive: users.isActive,
          isBlocked: users.isBlocked,
          role: users.role
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!dbUser) {
        const error = createAuthError('USER_NOT_FOUND', 'User account not found');
        auditLog(req, 'ACCESS_DENIED', undefined, false, { 
          userId: user.id, 
          reason: 'User not found in database' 
        });
        return res.status(401).json(error);
      }

      if (dbUser.isBlocked) {
        const error = createAuthError('USER_BLOCKED', 'User account is blocked');
        auditLog(req, 'ACCESS_DENIED', undefined, false, { 
          userId: user.id, 
          reason: 'User is blocked' 
        });
        return res.status(403).json(error);
      }

      if (!dbUser.isActive) {
        const error = createAuthError('USER_INACTIVE', 'User account is inactive');
        auditLog(req, 'ACCESS_DENIED', undefined, false, { 
          userId: user.id, 
          reason: 'User is inactive' 
        });
        return res.status(403).json(error);
      }

      // Role sync check - ensure JWT role matches database role
      if (dbUser.role !== user.role) {
        const error = createAuthError('ROLE_MISMATCH', 'User role has been changed, please log in again');
        auditLog(req, 'ACCESS_DENIED', undefined, false, { 
          userId: user.id, 
          jwtRole: user.role, 
          dbRole: dbUser.role,
          reason: 'Role mismatch between JWT and database'
        });
        return res.status(403).json(error);
      }

      auditLog(req, 'ACCESS_GRANTED', req.path, true, { 
        userId: user.id, 
        userRole: user.role,
        resource: req.path
      });
      next();
    } catch (error) {
      const authError = createAuthError('AUTHORIZATION_ERROR', 'Authorization check failed');
      auditLog(req, 'AUTHORIZATION_ERROR', undefined, false, { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return res.status(500).json(authError);
    }
  };
}

// Permission-based access control middleware
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user with permissions from database
      const [dbUser] = await db
        .select({
          id: users.id,
          role: users.role,
          settings: users.settings,
          isActive: users.isActive,
          isBlocked: users.isBlocked,
          ownerId: users.ownerId
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!dbUser || !dbUser.isActive || dbUser.isBlocked) {
        return res.status(403).json({ error: 'Account is inactive or blocked' });
      }

      // Check if user has the required permission
      const hasPermission = checkUserPermission(dbUser, permission);
      
      if (!hasPermission) {
        auditLog(req, 'PERMISSION_DENIED', undefined, false, { 
          permission, 
          userRole: dbUser.role 
        });
        return res.status(403).json({ 
          error: 'Permission denied',
          required: permission
        });
      }

      // Add user data to request for downstream use
      (req as any).user = { ...user, ...dbUser };
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Check if user can access another user's data
export async function canAccessUser(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const [currentUser] = await db
      .select({
        id: users.id,
        role: users.role,
        ownerId: users.ownerId
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    if (!currentUser) return false;

    // Super admin can access anyone
    if (currentUser.role === 'super_admin') return true;

    // Users can always access their own data
    if (currentUserId === targetUserId) return true;

    // Get target user info
    const [targetUser] = await db
      .select({
        id: users.id,
        ownerId: users.ownerId,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) return false;

    // Advertiser can access their created users (staff/affiliates)
    if (currentUser.role === 'advertiser' && targetUser.ownerId === currentUserId) {
      return true;
    }

    // Staff can access users in same hierarchy
    if (currentUser.role === 'staff' && currentUser.ownerId === targetUser.ownerId) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Access check error:', error);
    return false;
  }
}

// Helper function to check user permissions based on role and settings
function checkUserPermission(user: any, permission: string): boolean {
  const role = user.role;
  const settings = user.settings || {};
  const permissions = settings.permissions || {};

  // Default permissions by role
  const rolePermissions: Record<string, string[]> = {
    'super_admin': [
      'manageUsers', 'manageOffers', 'manageFinances', 'viewAnalytics', 
      'manageAntifraud', 'managePostbacks', 'manageTeam', 'systemSettings'
    ],
    'advertiser': [
      'manageOffers', 'viewAnalytics', 'manageTeam', 'managePostbacks',
      'viewFinances', 'managePartners'
    ],
    'affiliate': [
      'viewOffers', 'viewAnalytics', 'viewFinances'
    ],
    'staff': [
      'viewOffers', 'viewAnalytics'  
    ]
  };

  // Check if role has permission by default
  if (rolePermissions[role]?.includes(permission)) {
    return true;
  }

  // Check custom permissions in user settings
  if (permissions[permission] === true) {
    return true;
  }

  // Check if permission is explicitly denied
  if (permissions[permission] === false) {
    return false;
  }

  return false;
}

// Middleware to ensure user owns the resource or has permission to access it
export function requireOwnership(resourceUserIdParam: string = 'userId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const targetUserId = req.params[resourceUserIdParam];

      if (!currentUser || !targetUserId) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const canAccess = await canAccessUser(currentUser.id, targetUserId);
      
      if (!canAccess) {
        auditLog(req, 'OWNERSHIP_VIOLATION', undefined, false, { 
          currentUserId: currentUser.id, 
          targetUserId 
        });
        return res.status(403).json({ error: 'Access denied - insufficient ownership permissions' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Apply ownerId filtering to database queries
export function applyOwnerIdFilter(query: any, currentUser: any, targetTable: any) {
  if (currentUser.role === 'super_admin') {
    // Super admin sees everything
    return query;
  }

  if (currentUser.role === 'advertiser') {
    // Advertiser sees their own data and data from users they created
    return query.where(
      or(
        eq(targetTable.ownerId, currentUser.id),
        eq(targetTable.userId, currentUser.id),
        eq(targetTable.advertiserId, currentUser.id)
      )
    );
  }

  if (currentUser.role === 'affiliate' || currentUser.role === 'staff') {
    // Affiliates/staff see only their own data
    return query.where(
      or(
        eq(targetTable.userId, currentUser.id),
        eq(targetTable.partnerId, currentUser.id)
      )
    );
  }

  return query;
}