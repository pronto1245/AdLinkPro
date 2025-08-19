import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(m[1], JWT_SECRET) as any;
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Enhanced token authentication middleware
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database to ensure they still exist and get latest data
    const user = await storage.getUser(decoded.id || decoded.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is active/not blocked
    if (user.status === 'blocked' || user.status === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Get authenticated user from request
export function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}

// Role-based access control middleware
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        required: roles, 
        current: req.user.role 
      });
    }

    next();
  };
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Note: This doesn't fetch from database for performance
    req.user = decoded;
  } catch (error) {
    // Ignore token errors for optional auth
    console.log('Optional auth token error:', error);
  }

  next();
}

// Admin-only access
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!['super_admin', 'admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

// Check if user can access specific resource based on ownership
export function requireOwnership(getResourceUserId: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceUserId = getResourceUserId(req);
    
    // Admin can access any resource
    if (['super_admin', 'admin', 'owner'].includes(req.user.role)) {
      return next();
    }

    // User can only access their own resources
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}
