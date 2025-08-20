import { z } from 'zod';

// Partner Profile Schema
export const partnerProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['affiliate', 'partner']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string().datetime(),
  balance: z.number().default(0),
  total_earnings: z.number().default(0),
});

export const updatePartnerProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// Partner Offer Schema
export const partnerOfferSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  advertiser_name: z.string().optional(),
  advertiserId: z.string().optional(),
  advertiser_company: z.string().optional(),
  payout: z.union([z.string(), z.number()]),
  currency: z.string().default('USD'),
  category: z.string(),
  status: z.enum(['active', 'paused', 'stopped']),
  description: z.string().optional(),
  countries: z.array(z.string()).optional(),
  tracking_url: z.string().url().optional(),
});

// Offer Access Request Schema
export const offerAccessRequestSchema = z.object({
  offerId: z.union([z.string(), z.number()]),
  message: z.string().optional(),
});

export const offerAccessRequestResponseSchema = z.object({
  id: z.string(),
  offerId: z.union([z.string(), z.number()]),
  partnerId: z.string(),
  message: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  created_at: z.string().datetime(),
});

// Partner Link Generation Schema
export const generateLinkSchema = z.object({
  offerId: z.union([z.string(), z.number()]),
  subId: z.string().optional(),
});

export const generateLinkResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tracking_url: z.string().url(),
    click_id: z.string(),
    offer_id: z.union([z.string(), z.number()]),
    sub_id: z.string().nullable(),
  }),
});

// Partner Dashboard Schema
export const partnerDashboardSchema = z.object({
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  revenue: z.number().default(0),
  ctr: z.number().default(0),
  cr: z.number().default(0),
  epc: z.number().default(0),
  recent: z.array(z.any()).default([]),
});

// Partner Finance Summary Schema
export const partnerFinanceSummarySchema = z.object({
  balance: z.number().default(0),
  pending: z.number().default(0),
  paid: z.number().default(0),
  currency: z.string().default('USD'),
  last_payment: z.string().datetime().nullable().optional(),
  next_payment: z.string().datetime().nullable().optional(),
});

// Partner Referral Schema
export const partnerReferralSchema = z.object({
  total_referrals: z.number().default(0),
  active_referrals: z.number().default(0),
  referral_earnings: z.number().default(0),
  referrals: z.array(z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    status: z.string(),
    earnings: z.number(),
    joined_at: z.string().datetime(),
  })).default([]),
});

// Type exports
export type PartnerProfile = z.infer<typeof partnerProfileSchema>;
export type UpdatePartnerProfile = z.infer<typeof updatePartnerProfileSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type PartnerOffer = z.infer<typeof partnerOfferSchema>;
export type OfferAccessRequest = z.infer<typeof offerAccessRequestSchema>;
export type OfferAccessRequestResponse = z.infer<typeof offerAccessRequestResponseSchema>;
export type GenerateLink = z.infer<typeof generateLinkSchema>;
export type GenerateLinkResponse = z.infer<typeof generateLinkResponseSchema>;
export type PartnerDashboard = z.infer<typeof partnerDashboardSchema>;
export type PartnerFinanceSummary = z.infer<typeof partnerFinanceSummarySchema>;
export type PartnerReferral = z.infer<typeof partnerReferralSchema>;