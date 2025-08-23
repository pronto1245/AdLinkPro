import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { auditLog } from './security';

// Import the new unified authentication system
import {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  canAccessUser,
  getAuthenticatedUser
} from './unifiedAuth';

// Re-export the unified authentication functions for backward compatibility
export {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  canAccessUser,
  getAuthenticatedUser
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Legacy functions are now imported from unifiedAuth
// This file serves as a compatibility layer and maintains some specific business logic

// Apply ownerId filtering to database queries - specialized business logic
export function applyOwnerIdFilter(query: any, currentUser: any, targetTable: any) {
  if (!currentUser) {return query;}
  
  if (currentUser.role === 'OWNER' || currentUser.role === 'super_admin') {
    return query; // No filtering for owners/super admins
  }
  
  // Filter by owner ID for other users
  return query.where(eq(targetTable.ownerId, currentUser.ownerId || currentUser.id));
}

// Enhanced canAccessUser with business-specific logic
export async function canAccessUserEnhanced(currentUserId: string, targetUserId: string): Promise<boolean> {
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

    if (!currentUser) {return false;}

    // Super admin can access anyone
    if (currentUser.role === 'super_admin') {return true;}

    // Users can always access their own data
    if (currentUserId === targetUserId) {return true;}

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

    if (!targetUser) {return false;}

    // Role-based access rules specific to AdLinkPro business logic:
    switch (currentUser.role) {
      case 'OWNER':
        // Owner can access their own organization's users
        return targetUser.ownerId === currentUser.id || targetUser.id === currentUser.id;
      
      case 'ADVERTISER':
        // Advertisers can access their own and their partners' data
        return (targetUser.ownerId === currentUser.id) ||
               (currentUser.ownerId === targetUser.ownerId);
               
      case 'PARTNER':
        // Partners can only access their own data
        return false;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}