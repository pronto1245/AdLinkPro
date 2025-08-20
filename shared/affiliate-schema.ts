import { z } from 'zod';
import { partnerOfferSchema } from './partner-schema';

// Affiliate Summary Schema
export const affiliateSummarySchema = z.object({
  offers: z.number().default(0),
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  revenue: z.number().default(0),
});

// Affiliate Profile Schema (extends partner profile)
export const affiliateProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.literal('affiliate'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string().datetime(),
});

// Affiliate Postback Schema
export const affiliatePostbackSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string().url(),
  status: z.enum(['active', 'inactive']),
  events: z.array(z.string()),
  created_at: z.string().datetime(),
});

export const createPostbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Valid URL is required'),
  events: z.array(z.string()).default(['conversion']),
});

// Postback Log Schema
export const postbackLogSchema = z.object({
  id: z.number(),
  postback_id: z.number(),
  click_id: z.string(),
  offer_id: z.number(),
  status: z.enum(['sent', 'failed', 'pending']),
  response_code: z.number().optional(),
  sent_at: z.string().datetime(),
  response_time: z.number().optional(),
  error: z.string().optional(),
});

// Affiliate Offer Schema (extends partner offer with additional fields)
export const affiliateOfferSchema = partnerOfferSchema.extend({
  advertiser_name: z.string(),
  countries: z.array(z.string()),
  tracking_url: z.string().url(),
});

// Type exports
export type AffiliateSummary = z.infer<typeof affiliateSummarySchema>;
export type AffiliateProfile = z.infer<typeof affiliateProfileSchema>;
export type AffiliatePostback = z.infer<typeof affiliatePostbackSchema>;
export type CreatePostback = z.infer<typeof createPostbackSchema>;
export type PostbackLog = z.infer<typeof postbackLogSchema>;
export type AffiliateOffer = z.infer<typeof affiliateOfferSchema>;