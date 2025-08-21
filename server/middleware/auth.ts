import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Verify token from .token file
export function verifyTokenFromFile(): boolean {
  try {
    const tokenPath = join(process.cwd(), '.token');
    const token = readFileSync(tokenPath, 'utf8').trim();
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token verification successful for:', payload.username || payload.id);
    return true;
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

// Get token info from .token file
export function getTokenInfoFromFile(): any {
  try {
    const tokenPath = join(process.cwd(), '.token');
    const token = readFileSync(tokenPath, 'utf8').trim();
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload;
  } catch (error) {
    console.error('❌ Failed to get token info:', error instanceof Error ? error.message : error);
    return null;
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

// Enhanced authentication token middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Get authenticated user from request
export function getAuthenticatedUser(req: Request): any {
  return (req as any).user;
}

// Role-based access control middleware
export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: user.role
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
}
