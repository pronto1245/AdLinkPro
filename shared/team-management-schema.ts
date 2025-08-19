/**
 * Team Management Shared Schema Integration
 * Implementing shared schemas for better type safety and validation
 */

import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Team Member Role Enum
export const TeamMemberRoleEnum = z.enum(['buyer', 'analyst', 'manager']);

// Available Permissions Enum
export const TeamPermissionsEnum = z.enum([
  'view_offers',
  'generate_links', 
  'view_statistics',
  'view_creatives',
  'view_payouts',
  'manage_team'
]);

// SubID Prefix Validation
export const SubIdPrefixSchema = z.string()
  .min(1, 'SubID prefix is required')
  .max(5, 'SubID prefix must be 5 characters or less')
  .regex(/^[A-Z0-9]+$/, 'SubID prefix must contain only uppercase letters and numbers');

// Team Member Base Schema
export const TeamMemberBaseSchema = z.object({
  id: z.string().uuid('Invalid team member ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email format'),
  role: TeamMemberRoleEnum,
  permissions: z.array(TeamPermissionsEnum),
  subIdPrefix: SubIdPrefixSchema,
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime('Invalid created date format'),
});

// Create Team Member Schema
export const CreateTeamMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: TeamMemberRoleEnum,
  permissions: z.array(TeamPermissionsEnum).default([]),
  subIdPrefix: SubIdPrefixSchema.optional(),
});

// Update Team Member Schema
export const UpdateTeamMemberSchema = z.object({
  role: TeamMemberRoleEnum.optional(),
  permissions: z.array(TeamPermissionsEnum).optional(),
  subIdPrefix: SubIdPrefixSchema.optional(),
  isActive: z.boolean().optional(),
}).strict();

// Team Member Response Schema
export const TeamMemberResponseSchema = TeamMemberBaseSchema.extend({
  partnerId: z.string().uuid('Invalid partner ID format').optional(),
  updatedAt: z.string().datetime('Invalid updated date format').optional(),
});

// API Response Schemas
export const TeamMembersListResponseSchema = z.object({
  success: z.boolean().default(true),
  data: z.array(TeamMemberResponseSchema),
  count: z.number().int().min(0),
  message: z.string().optional(),
});

export const TeamMemberCreateResponseSchema = z.object({
  success: z.boolean().default(true),
  data: TeamMemberResponseSchema,
  message: z.string().optional(),
});

export const TeamMemberUpdateResponseSchema = z.object({
  success: z.boolean().default(true),
  data: TeamMemberResponseSchema,
  message: z.string().optional(),
});

export const TeamMemberDeleteResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
});

// Error Response Schema
export const TeamManagementErrorSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  code: z.number().int().optional(),
  details: z.record(z.any()).optional(),
});

// Role-based default permissions
export const ROLE_DEFAULT_PERMISSIONS = {
  buyer: ['view_offers', 'generate_links', 'view_statistics'] as const,
  analyst: ['view_offers', 'view_statistics', 'view_creatives'] as const,
  manager: ['view_offers', 'generate_links', 'view_statistics', 'view_creatives', 'manage_team'] as const,
} as const;

// Validation helpers
export const validateTeamMemberRole = (role: string): role is z.infer<typeof TeamMemberRoleEnum> => {
  return TeamMemberRoleEnum.safeParse(role).success;
};

export const validateTeamPermission = (permission: string): permission is z.infer<typeof TeamPermissionsEnum> => {
  return TeamPermissionsEnum.safeParse(permission).success;
};

export const getDefaultPermissionsForRole = (role: z.infer<typeof TeamMemberRoleEnum>) => {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
};

export const validateSubIdPrefix = (prefix: string): boolean => {
  return SubIdPrefixSchema.safeParse(prefix).success;
};

// Advertiser Team Management Schemas (separate from affiliate team)
export const AdvertiserTeamPermissionsSchema = z.object({
  manageOffers: z.boolean().default(false),
  managePartners: z.boolean().default(false),
  viewStatistics: z.boolean().default(true),
  financialOperations: z.boolean().default(false),
  postbacksApi: z.boolean().default(false),
});

export const AdvertiserTeamMemberSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['manager', 'analyst', 'financier', 'support']),
  status: z.enum(['active', 'inactive', 'blocked']),
  permissions: AdvertiserTeamPermissionsSchema,
  telegramNotifications: z.boolean().default(false),
  telegramUserId: z.string().optional(),
  lastActivity: z.string().datetime(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

// Type exports for use in components and API
export type TeamMember = z.infer<typeof TeamMemberBaseSchema>;
export type CreateTeamMemberData = z.infer<typeof CreateTeamMemberSchema>;
export type UpdateTeamMemberData = z.infer<typeof UpdateTeamMemberSchema>;
export type TeamMemberResponse = z.infer<typeof TeamMemberResponseSchema>;
export type TeamMembersListResponse = z.infer<typeof TeamMembersListResponseSchema>;
export type TeamMemberRole = z.infer<typeof TeamMemberRoleEnum>;
export type TeamPermission = z.infer<typeof TeamPermissionsEnum>;
export type AdvertiserTeamMember = z.infer<typeof AdvertiserTeamMemberSchema>;
export type AdvertiserTeamPermissions = z.infer<typeof AdvertiserTeamPermissionsSchema>;

// Validation functions for API middleware
export const validateCreateTeamMemberRequest = (data: any) => {
  return CreateTeamMemberSchema.safeParse(data);
};

export const validateUpdateTeamMemberRequest = (data: any) => {
  return UpdateTeamMemberSchema.safeParse(data);
};

export const validateTeamMemberResponse = (data: any) => {
  return TeamMemberResponseSchema.safeParse(data);
};

console.log('✅ Team Management Shared Schemas Initialized');
console.log('🔧 Available Schemas:');
console.log('- TeamMemberBaseSchema');
console.log('- CreateTeamMemberSchema');  
console.log('- UpdateTeamMemberSchema');
console.log('- TeamMemberResponseSchema');
console.log('- API Response Schemas');
console.log('- Validation Helpers');
console.log('🎯 Enhanced Type Safety: READY');