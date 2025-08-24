// Partner Settings Types and Schemas
import { z } from 'zod';

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailOffers: z.boolean().default(true),
  emailPayments: z.boolean().default(true), 
  emailNews: z.boolean().default(false),
  pushOffers: z.boolean().default(true),
  pushPayments: z.boolean().default(true),
  pushNews: z.boolean().default(false),
});

// Security Settings Schema  
export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  sessionTimeout: z.string().default('24'), // hours
  ipRestrictions: z.string().default(''),
});

// General Settings Schema
export const generalSettingsSchema = z.object({
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  currency: z.string().default('USD'),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
});

// Complete Partner Settings Schema
export const partnerSettingsSchema = z.object({
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  general: generalSettingsSchema,
  lastUpdated: z.date().default(() => new Date()),
  version: z.string().default('1.0'),
});

// Types
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type PartnerSettings = z.infer<typeof partnerSettingsSchema>;

// Settings Update Schemas
export const updateNotificationSettingsSchema = notificationSettingsSchema.partial();
export const updateSecuritySettingsSchema = securitySettingsSchema.partial();
export const updateGeneralSettingsSchema = generalSettingsSchema.partial();

export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
export type UpdateSecuritySettings = z.infer<typeof updateSecuritySettingsSchema>;
export type UpdateGeneralSettings = z.infer<typeof updateGeneralSettingsSchema>;

// Default settings
export const defaultPartnerSettings: PartnerSettings = {
  notifications: {
    emailOffers: true,
    emailPayments: true,
    emailNews: false,
    pushOffers: true,
    pushPayments: true,
    pushNews: false,
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: '24',
    ipRestrictions: '',
  },
  general: {
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    theme: 'light',
  },
  lastUpdated: new Date(),
  version: '1.0',
};

// Settings validation helpers
export const validateNotificationSettings = (data: unknown): NotificationSettings => {
  return notificationSettingsSchema.parse(data);
};

export const validateSecuritySettings = (data: unknown): SecuritySettings => {
  return securitySettingsSchema.parse(data);
};

export const validateGeneralSettings = (data: unknown): GeneralSettings => {
  return generalSettingsSchema.parse(data);
};

export const validatePartnerSettings = (data: unknown): PartnerSettings => {
  return partnerSettingsSchema.parse(data);
};