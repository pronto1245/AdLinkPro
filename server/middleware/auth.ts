import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    ownerId?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from storage
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

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