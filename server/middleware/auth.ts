import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import unified authentication system
import {
  authenticateToken,
  requireRole,
  getAuthenticatedUser,
  requireAuth as unifiedRequireAuth
} from './unifiedAuth';

// Re-export unified functions for compatibility
export {
  authenticateToken,
  requireRole,
  getAuthenticatedUser
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// File-based token verification - specific to this app's architecture
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

// Get token info from .token file - specific to this app's architecture
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

// Legacy requireAuth function - now uses unified system
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  return unifiedRequireAuth(req, res, next);
}
