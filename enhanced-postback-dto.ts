// Enhanced postback system DTOs and validations
import { z } from 'zod';

// Core event DTOs for tracking system
export const EventDto = z.object({
  type: z.enum(["reg","purchase"]),
  clickid: z.string().min(1),
  txid: z.string().min(1),
  value: z.number().optional().default(0),
  currency: z.string().length(3).optional(),
  meta: z.record(z.any()).optional(),
});

export const AffiliateWebhookDto = z.object({
  type: z.literal("reg"),
  txid: z.string(),
  status: z.enum(["approved","declined"]),
  payout: z.number().optional().default(0),
  currency: z.string().length(3).optional(),
  raw: z.record(z.any()).optional(),
});

export const PspWebhookDto = z.object({
  type: z.literal("purchase"),
  txid: z.string(),
  status: z.enum(["approved","declined","refunded","chargeback"]),
  amount: z.number().optional(),
  currency: z.string().length(3).optional(),
  raw: z.record(z.any()).optional(),
});

export type EventDtoType = z.infer<typeof EventDto>;
export type AffiliateWebhookDtoType = z.infer<typeof AffiliateWebhookDto>;
export type PspWebhookDtoType = z.infer<typeof PspWebhookDto>;

// Conversion event DTO
export const conversionEventSchema = z.object({
  advertiserId: z.number().int().positive(),
  partnerId: z.number().int().positive().optional(),
  campaignId: z.number().int().positive().optional(),
  offerId: z.number().int().positive().optional(),
  flowId: z.number().int().positive().optional(),
  
  clickid: z.string().min(1).max(255),
  type: z.enum(['reg', 'purchase', 'rebill', 'refund', 'chargeback']),
  txid: z.string().min(1).max(255),
  revenue: z.string().regex(/^\d+(\.\d{1,6})?$/).optional().default('0'),
  currency: z.string().length(3).optional().default('USD'),
  
  conversionStatus: z.enum([
    'initiated', 'pending', 'approved', 'declined', 
    'refunded', 'chargeback', 'duplicate', 'test'
  ]).default('initiated'),
  
  antifraudLevel: z.enum(['ok', 'soft', 'hard']).optional(),
  antifraudScore: z.number().int().min(0).max(100).optional(),
  antifraudReasons: z.record(z.unknown()).optional().default({}),
  
  details: z.record(z.unknown()).optional().default({}),
});

export type ConversionEventDTO = z.infer<typeof conversionEventSchema>;

// Postback profile creation DTO
export const postbackProfileSchema = z.object({
  ownerScope: z.enum(['owner', 'advertiser', 'partner']),
  ownerId: z.number().int().positive(),
  
  scopeType: z.enum(['global', 'campaign', 'offer', 'flow']).default('global'),
  scopeId: z.number().int().positive().optional(),
  
  name: z.string().min(1).max(255),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(1000).default(100),
  
  endpointUrl: z.string().url(),
  method: z.enum(['GET', 'POST']).default('GET'),
  idParam: z.enum(['subid', 'clickid']).default('subid'),
  
  authQueryKey: z.string().optional(),
  authQueryVal: z.string().optional(),
  authHeaderName: z.string().optional(),
  authHeaderVal: z.string().optional(),
  
  paramsTemplate: z.record(z.string()).default({}),
  statusMap: z.record(z.record(z.string())).default({}),
  
  hmacEnabled: z.boolean().default(false),
  hmacSecret: z.string().optional(),
  hmacPayloadTpl: z.string().optional(),
  hmacParamName: z.string().optional(),
  
  retries: z.number().int().min(0).max(10).default(5),
  timeoutMs: z.number().int().min(1000).max(30000).default(4000),
  backoffBaseSec: z.number().int().min(1).max(60).default(2),
  
  filterRevenueGt0: z.boolean().default(false),
  filterExcludeFraudHard: z.boolean().default(true),
});

export type PostbackProfileDTO = z.infer<typeof postbackProfileSchema>;

// Webhook event DTO for external systems
export const webhookEventSchema = z.object({
  event: z.enum(['conversion.created', 'conversion.updated', 'postback.delivered', 'postback.failed']),
  timestamp: z.string().datetime(),
  data: z.object({
    conversion: conversionEventSchema.optional(),
    postback: z.object({
      profileId: z.number().int(),
      url: z.string().url(),
      responseCode: z.number().int().optional(),
      error: z.string().optional(),
      attempt: z.number().int(),
      durationMs: z.number().int().optional(),
    }).optional(),
  }),
  signature: z.string().optional(), // HMAC signature for verification
});

export type WebhookEventDTO = z.infer<typeof webhookEventSchema>;

// Postback delivery filter DTO
export const deliveryFilterSchema = z.object({
  profileId: z.number().int().positive().optional(),
  clickid: z.string().optional(),
  responseCode: z.number().int().optional(),
  attempt: z.number().int().min(1).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.enum(['success', 'failed', 'pending']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

export type DeliveryFilterDTO = z.infer<typeof deliveryFilterSchema>;

// Bulk operations DTO
export const bulkConversionSchema = z.object({
  conversions: z.array(conversionEventSchema).min(1).max(1000),
  batchId: z.string().uuid().optional(),
});

export type BulkConversionDTO = z.infer<typeof bulkConversionSchema>;

// Response DTOs
export const conversionResponseSchema = z.object({
  success: z.boolean(),
  conversionId: z.number().int().optional(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export type ConversionResponseDTO = z.infer<typeof conversionResponseSchema>;

export const postbackDeliveryResponseSchema = z.object({
  success: z.boolean(),
  deliveredCount: z.number().int(),
  failedCount: z.number().int(),
  deliveries: z.array(z.object({
    profileId: z.number().int(),
    url: z.string(),
    responseCode: z.number().int().optional(),
    error: z.string().optional(),
    durationMs: z.number().int().optional(),
  })),
});

export type PostbackDeliveryResponseDTO = z.infer<typeof postbackDeliveryResponseSchema>;