import { Request, Response } from 'express';
import { db } from '../db';
import { users, teamInvitations } from '@shared/schema';
import { eq, desc, and, or, ne, sql } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { canAccessUser } from '../middleware/authorization';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class TeamController {
  /**
   * Get team members
   */
  static async getTeamMembers(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        page = 1,
        limit = 20,
        role,
        status,
        search
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build base query - get users created by current user or in same hierarchy
      let query = db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          isActive: users.isActive,
          isBlocked: users.isBlocked,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          settings: users.settings
        })
        .from(users);

      // Apply access filtering based on user role
      if (currentUser.role === 'super_admin') {
        // Super admin can see everyone
        query = query.where(ne(users.id, currentUser.id));
      } else if (currentUser.role === 'advertiser') {
        // Advertisers can see users they created
        query = query.where(eq(users.ownerId, currentUser.id));
      } else {
        // Staff and affiliates can only see users in same hierarchy
        query = query.where(
          and(
            eq(users.ownerId, currentUser.ownerId || currentUser.id),
            ne(users.id, currentUser.id)
          )
        );
      }

      // Apply filters
      const conditions = [];
      
      if (role) {
        conditions.push(eq(users.role, role as string));
      }
      
      if (status === 'active') {
        conditions.push(and(eq(users.isActive, true), eq(users.isBlocked, false)));
      } else if (status === 'inactive') {
        conditions.push(or(eq(users.isActive, false), eq(users.isBlocked, true)));
      }
      
      if (search) {
        conditions.push(
          or(
            sql`${users.username} ILIKE ${`%${search}%`}`,
            sql`${users.email} ILIKE ${`%${search}%`}`,
            sql`${users.firstName} ILIKE ${`%${search}%`}`,
            sql`${users.lastName} ILIKE ${`%${search}%`}`
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting and pagination
      query = query
        .orderBy(desc(users.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const results = await query;

      // Get total count
      const [countResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / Number(limit));

      auditLog(req, 'GET_TEAM_MEMBERS', 'users');

      res.json({
        members: results,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      console.error('Get team members error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create team member
   */
  static async createTeamMember(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        username,
        email,
        password,
        role,
        firstName,
        lastName,
        company,
        phone,
        permissions,
        restrictions
      } = req.body;

      // Validate required fields
      if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'Username, email, password, and role are required' });
      }

      // Validate role permissions
      const allowedRoles = ['affiliate', 'staff'];
      if (currentUser.role === 'super_admin') {
        allowedRoles.push('advertiser');
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ 
          error: `Cannot create user with role ${role}`,
          allowedRoles
        });
      }

      // Check if username or email already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(or(eq(users.username, username), eq(users.email, email)))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Prepare user settings
      const settings = {
        permissions: permissions || {},
        restrictions: restrictions || {
          ipWhitelist: [],
          geoRestrictions: [],
          timeRestrictions: {
            enabled: false,
            startTime: '09:00',
            endTime: '18:00',
            timezone: 'UTC',
            workingDays: [1, 2, 3, 4, 5]
          }
        }
      };

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email,
          password: hashedPassword,
          role: role as any,
          firstName,
          lastName,
          company,
          phone,
          ownerId: currentUser.id,
          advertiserId: currentUser.role === 'advertiser' ? currentUser.id : currentUser.advertiserId,
          isActive: true,
          settings,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          isActive: users.isActive,
          createdAt: users.createdAt
        });

      auditLog(req, 'CREATE_TEAM_MEMBER', 'users', true, {
        newUserId: newUser.id,
        role,
        username
      });

      res.json({
        member: newUser,
        message: 'Team member created successfully'
      });
    } catch (error) {
      console.error('Create team member error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send team invitation
   */
  static async sendInvitation(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        email,
        role,
        firstName,
        lastName,
        message,
        expiresInDays = 7
      } = req.body;

      if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' });
      }

      // Validate role permissions
      const allowedRoles = ['affiliate', 'staff'];
      if (currentUser.role === 'super_admin') {
        allowedRoles.push('advertiser');
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ 
          error: `Cannot invite user with role ${role}`,
          allowedRoles
        });
      }

      // Check if user already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Check if invitation already exists and is active
      const [existingInvite] = await db
        .select({ id: teamInvitations.id })
        .from(teamInvitations)
        .where(
          and(
            eq(teamInvitations.email, email),
            eq(teamInvitations.status, 'pending'),
            sql`${teamInvitations.expiresAt} > NOW()`
          )
        )
        .limit(1);

      if (existingInvite) {
        return res.status(400).json({ error: 'Active invitation already exists for this email' });
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Create invitation
      const [invitation] = await db
        .insert(teamInvitations)
        .values({
          invitedBy: currentUser.id,
          email,
          role: role as any,
          firstName,
          lastName,
          message,
          token,
          status: 'pending',
          expiresAt,
          createdAt: new Date()
        })
        .returning();

      // TODO: Send invitation email using email service
      // await EmailService.sendInvitation({
      //   to: email,
      //   inviterName: currentUser.firstName || currentUser.username,
      //   role,
      //   token,
      //   expiresAt
      // });

      auditLog(req, 'SEND_TEAM_INVITATION', 'team_invitations', true, {
        invitationId: invitation.id,
        email,
        role
      });

      res.json({
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt
        },
        message: 'Team invitation sent successfully'
      });
    } catch (error) {
      console.error('Send invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Accept team invitation
   */
  static async acceptInvitation(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find invitation
      const [invitation] = await db
        .select()
        .from(teamInvitations)
        .where(
          and(
            eq(teamInvitations.token, token),
            eq(teamInvitations.status, 'pending'),
            sql`${teamInvitations.expiresAt} > NOW()`
          )
        )
        .limit(1);

      if (!invitation) {
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }

      // Check if username already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email: invitation.email,
          password: hashedPassword,
          role: invitation.role,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          ownerId: invitation.invitedBy,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName
        });

      // Update invitation status
      await db
        .update(teamInvitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(teamInvitations.id, invitation.id));

      auditLog(req, 'ACCEPT_TEAM_INVITATION', 'team_invitations', true, {
        invitationId: invitation.id,
        newUserId: newUser.id,
        username
      });

      res.json({
        user: newUser,
        message: 'Invitation accepted successfully'
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Decline team invitation
   */
  static async declineInvitation(req: Request, res: Response) {
    try {
      const { token } = req.params;

      // Find and update invitation
      const [invitation] = await db
        .update(teamInvitations)
        .set({
          status: 'declined',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(teamInvitations.token, token),
            eq(teamInvitations.status, 'pending')
          )
        )
        .returning();

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found or already processed' });
      }

      auditLog(req, 'DECLINE_TEAM_INVITATION', 'team_invitations', true, {
        invitationId: invitation.id
      });

      res.json({
        message: 'Invitation declined successfully'
      });
    } catch (error) {
      console.error('Decline invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update team member
   */
  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const {
        firstName,
        lastName,
        company,
        phone,
        permissions,
        restrictions,
        isActive
      } = req.body;

      // Check if user can access this member
      const canAccess = await canAccessUser(currentUser.id, id);
      if (!canAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date()
      };

      if (firstName !== undefined) {updateData.firstName = firstName;}
      if (lastName !== undefined) {updateData.lastName = lastName;}
      if (company !== undefined) {updateData.company = company;}
      if (phone !== undefined) {updateData.phone = phone;}
      if (isActive !== undefined) {updateData.isActive = isActive;}

      // Update settings if provided
      if (permissions || restrictions) {
        const [currentUserData] = await db
          .select({ settings: users.settings })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        const currentSettings = currentUserData?.settings || {};
        
        updateData.settings = {
          ...currentSettings,
          ...(permissions && { permissions }),
          ...(restrictions && { restrictions })
        };
      }

      // Update user
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone,
          isActive: users.isActive,
          settings: users.settings,
          updatedAt: users.updatedAt
        });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      auditLog(req, 'UPDATE_TEAM_MEMBER', 'users', true, {
        memberId: id,
        changes: Object.keys(updateData)
      });

      res.json({
        member: updatedUser,
        message: 'Team member updated successfully'
      });
    } catch (error) {
      console.error('Update team member error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove team member
   */
  static async removeTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Check if user can access this member
      const canAccess = await canAccessUser(currentUser.id, id);
      if (!canAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Soft delete - mark as deleted instead of actually deleting
      const [deletedUser] = await db
        .update(users)
        .set({
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          deletedBy: currentUser.id,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email
        });

      if (!deletedUser) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      auditLog(req, 'REMOVE_TEAM_MEMBER', 'users', true, {
        memberId: id,
        username: deletedUser.username
      });

      res.json({
        message: 'Team member removed successfully'
      });
    } catch (error) {
      console.error('Remove team member error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get pending invitations
   */
  static async getPendingInvitations(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;

      const invitations = await db
        .select({
          id: teamInvitations.id,
          email: teamInvitations.email,
          role: teamInvitations.role,
          firstName: teamInvitations.firstName,
          lastName: teamInvitations.lastName,
          status: teamInvitations.status,
          expiresAt: teamInvitations.expiresAt,
          createdAt: teamInvitations.createdAt
        })
        .from(teamInvitations)
        .where(
          and(
            eq(teamInvitations.invitedBy, currentUser.id),
            eq(teamInvitations.status, 'pending'),
            sql`${teamInvitations.expiresAt} > NOW()`
          )
        )
        .orderBy(desc(teamInvitations.createdAt));

      auditLog(req, 'GET_PENDING_INVITATIONS', 'team_invitations');

      res.json({ invitations });
    } catch (error) {
      console.error('Get pending invitations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Cancel invitation
   */
  static async cancelInvitation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const [invitation] = await db
        .update(teamInvitations)
        .set({
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(teamInvitations.id, id),
            eq(teamInvitations.invitedBy, currentUser.id),
            eq(teamInvitations.status, 'pending')
          )
        )
        .returning();

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found or cannot be cancelled' });
      }

      auditLog(req, 'CANCEL_TEAM_INVITATION', 'team_invitations', true, {
        invitationId: id
      });

      res.json({
        message: 'Invitation cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}