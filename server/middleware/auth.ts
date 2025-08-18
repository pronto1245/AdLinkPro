import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
// import { storage } from '../storage'; // Commented out for testing without DB

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
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

// Enhanced authentication middleware with database user lookup
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  
  if (!m) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(m[1], JWT_SECRET) as any;
    
    // Mock user data for testing (in production, this would use storage.getUser)
    // TODO: Enable database integration by uncommenting the storage import and replacing mock data
    // with: const user = await storage.getUser(payload.sub || payload.id);
    const mockUsers = {
      'owner-1': { id: 'owner-1', username: 'owner', email: '9791207@gmail.com', role: 'OWNER', isActive: true },
      'adv-1': { id: 'adv-1', username: 'advertiser', email: '12345@gmail.com', role: 'ADVERTISER', isActive: true },
      'partner-1': { id: 'partner-1', username: 'partner', email: '4321@gmail.com', role: 'PARTNER', isActive: true }
    };
    
    const user = mockUsers[payload.sub];
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Map roles from JWT to system roles
    const roleMapping = {
      'OWNER': 'super_admin',
      'ADVERTISER': 'advertiser', 
      'PARTNER': 'affiliate'
    };
    
    const mappedRole = roleMapping[payload.role] || payload.role.toLowerCase();
    
    // In production, use: user = await storage.getUser(payload.sub || payload.id);
    
    // Attach full user object to request
    req.user = {
      id: user.id,
      sub: user.id,
      username: user.username,
      email: user.email,
      role: mappedRole,
      originalRole: payload.role,
      advertiserId: user.advertiserId,
      ownerId: user.ownerId,
      isActive: user.isActive
    };
    
    return next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get authenticated user from request
export function getAuthenticatedUser(req: Request): any {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
}
