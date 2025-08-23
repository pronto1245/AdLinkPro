import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { AuthenticatedRequest } from '../middleware/unifiedAuth';

export class AuthController {
  /**
   * Get current user profile
   */
  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.sub;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          country: users.country,
          language: users.language,
          timezone: users.timezone,
          currency: users.currency,
          balance: users.balance,
          isActive: users.isActive,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      auditLog(req, 'GET_PROFILE', 'users');
      
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const {
        firstName,
        lastName,
        company,
        phone,
        country,
        language,
        timezone,
        currency
      } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          firstName,
          lastName,
          company,
          phone,
          country,
          language,
          timezone,
          currency,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          country: users.country,
          language: users.language,
          timezone: users.timezone,
          currency: users.currency
        });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      auditLog(req, 'UPDATE_PROFILE', 'users');
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }

      // Get current user
      const [user] = await db
        .select({
          id: users.id,
          password: users.password
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        auditLog(req, 'CHANGE_PASSWORD_FAILED', 'users', false);
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      auditLog(req, 'CHANGE_PASSWORD', 'users');
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}