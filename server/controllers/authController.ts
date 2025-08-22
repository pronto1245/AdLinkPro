import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Enhanced registration schema with comprehensive validation
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['affiliate', 'advertiser', 'partner']).default('affiliate'),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  country: z.string().max(2).optional(),
  language: z.string().max(10).default('en'),
  agreeTerms: z.boolean().refine(val => val === true, 'Must agree to terms of service'),
  agreePrivacy: z.boolean().refine(val => val === true, 'Must agree to privacy policy'),
  // Optional fields for referrals
  referralCode: z.string().optional(),
  clickId: z.string().optional()
});

type RegistrationData = z.infer<typeof registrationSchema>;

export class AuthController {
  /**
   * Get current user profile
   */
  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
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
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
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
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
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

  /**
   * Enhanced user registration with comprehensive validation and error handling
   */
  static async register(req: Request, res: Response) {
    try {
      // Enhanced data validation with detailed error messages
      const validationResult = registrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        
        auditLog(req, 'REGISTRATION_VALIDATION_FAILED', undefined, false, { errors });
        
        return res.status(400).json({
          error: 'Registration validation failed',
          details: errors
        });
      }

      const data: RegistrationData = validationResult.data;

      // Comprehensive duplicate check
      const existingUsers = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username
        })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUsers.length > 0) {
        auditLog(req, 'REGISTRATION_DUPLICATE_EMAIL', undefined, false, { email: data.email });
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Process referral code if provided
      let referredBy: string | null = null;
      if (data.referralCode) {
        try {
          const [referrer] = await db
            .select({ id: users.id, username: users.username })
            .from(users)
            .where(eq(users.referralCode, data.referralCode))
            .limit(1);

          if (referrer) {
            referredBy = referrer.id;
            auditLog(req, 'REFERRAL_CODE_APPLIED', undefined, true, { 
              referrerUsername: referrer.username,
              referralCode: data.referralCode 
            });
          } else {
            auditLog(req, 'REFERRAL_CODE_INVALID', undefined, false, { 
              referralCode: data.referralCode 
            });
          }
        } catch (referralError) {
          console.error('[REGISTRATION] Referral processing error:', referralError);
          auditLog(req, 'REFERRAL_PROCESSING_ERROR', undefined, false, { 
            error: referralError instanceof Error ? referralError.message : 'Unknown error'
          });
        }
      }

      // Generate secure password hash
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate unique referral code for new user (if affiliate)
      const generateReferralCode = () => {
        const crypto = require('crypto');
        return crypto.randomBytes(4).toString('hex').toUpperCase();
      };

      const newUserReferralCode = data.role === 'affiliate' ? generateReferralCode() : null;

      // Generate username from email if not provided
      const username = data.email.split('@')[0];

      // Create user with comprehensive data
      const userData = {
        email: data.email,
        password: hashedPassword,
        username: username,
        role: data.role,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        company: data.company,
        phone: data.phone,
        country: data.country,
        language: data.language,
        referredBy: referredBy,
        referralCode: newUserReferralCode,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Database-first approach with fallback
      let newUser;
      try {
        [newUser] = await db
          .insert(users)
          .values(userData)
          .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            firstName: users.firstName,
            lastName: users.lastName,
            referralCode: users.referralCode,
            createdAt: users.createdAt
          });

        auditLog(req, 'USER_CREATED_DATABASE', 'users', true, { 
          userId: newUser.id, 
          role: newUser.role,
          referralCode: newUser.referralCode
        });
      } catch (dbError) {
        console.error('[REGISTRATION] Database creation failed, using fallback:', dbError);
        
        // Fallback: Create user in memory for development
        if (process.env.NODE_ENV === 'development') {
          newUser = {
            id: `temp-${Date.now()}`,
            email: data.email,
            username: username,
            role: data.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            referralCode: newUserReferralCode,
            createdAt: new Date()
          };

          auditLog(req, 'USER_CREATED_FALLBACK', 'users', true, { 
            userId: newUser.id, 
            role: newUser.role,
            fallback: true
          });
        } else {
          throw dbError;
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          username: newUser.username
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Send success response with role-specific messages
      const successMessage = data.role === 'advertiser' 
        ? 'Registration successful! Your account will be reviewed and activated within 24 hours.'
        : 'Registration successful! You can now start using the platform.';

      auditLog(req, 'REGISTRATION_SUCCESS', 'users', true, { 
        userId: newUser.id, 
        role: newUser.role,
        email: data.email 
      });

      res.status(201).json({
        success: true,
        message: successMessage,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          referralCode: newUser.referralCode
        }
      });

    } catch (error) {
      console.error('[REGISTRATION] Registration error:', error);
      auditLog(req, 'REGISTRATION_ERROR', undefined, false, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      // Don't expose internal errors to client
      res.status(500).json({
        error: 'Registration failed',
        message: 'An internal error occurred during registration. Please try again.'
      });
    }
  }
}