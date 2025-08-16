import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

import { config } from '../config/environment.js';
const JWT_SECRET = config.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    ownerId?: string;
  };
}

// Удален старый authMiddleware - используем только authenticateToken

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Главный middleware для аутентификации
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Enhanced logging for production debugging
  console.log('🔐 Authentication attempt:', {
    hasAuthHeader: !!authHeader,
    tokenLength: token?.length || 0,
    tokenStart: token?.substring(0, 20) || 'none',
    url: req.url,
    method: req.method
  });

  if (!token) {
    console.log('❌ No token provided');
    res.status(401).json({ error: 'Authentication required', code: 'TOKEN_MISSING' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token decoded successfully:', { userId: decoded.userId || decoded.id, role: decoded.role });
    
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.log('❌ No userId in token');
      res.status(403).json({ error: 'Invalid token format', code: 'NO_USER_ID' });
      return;
    }
    
    const user = await storage.getUser(userId);
    console.log('👤 User lookup result:', { found: !!user, userId });
    
    if (!user) {
      console.log('❌ User not found in database');
      res.status(403).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId
    };
    console.log('🎉 Authentication successful for user:', user.id);
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', {
      message: (error as Error).message,
      tokenStart: token?.substring(0, 20),
      JWT_SECRET_exists: !!JWT_SECRET,
      JWT_SECRET_length: JWT_SECRET?.length || 0
    });
    res.status(403).json({ error: 'Invalid token', code: 'TOKEN_INVALID', details: (error as Error).message });
  }
};

export const getAuthenticatedUser = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
};