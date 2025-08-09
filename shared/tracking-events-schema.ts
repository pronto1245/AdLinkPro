import { z } from 'zod';
import { pgTable, text, timestamp, decimal, integer, jsonb, boolean, uuid, index, varchar, bigint } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Event types enum
export const eventTypes = [
  'click', 'lp_click', 'install', 'open', 'reg', 'deposit', 'sale', 'lead', 'lp_leave'
] as const;

export type EventType = typeof eventTypes[number];

// Device types
export const deviceTypes = ['desktop', 'mobile', 'tablet'] as const;
export type DeviceType = typeof deviceTypes[number];

// Sub2 configuration
export const sub2Config = {
  allowedKeys: [
    'geo', 'dev', 'src', 'adset', 'lang', 'tier', 'risk', 'abtest', 
    'cohort', 'pp', 'fpr', 'anti', 'seg'
  ],
  maxPairs: 8,
  maxLength: 200
};

// Clicks table - stores initial click data
export const clicks = pgTable('clicks', {
  clickid: uuid('clickid').primaryKey().defaultRandom(),
  visitorCode: uuid('visitor_code').notNull(),
  
  // Attribution
  campaignId: text('campaign_id'),
  sourceId: text('source_id'),
  flowId: text('flow_id'),
  offerId: text('offer_id'),
  landingId: text('landing_id'),
  adCampaignId: text('ad_campaign_id'),
  externalId: text('external_id'),
  creativeId: text('creative_id'),
  
  // Marketing/UTM
  referrer: text('referrer'),
  site: text('site'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),
  
  // Subs
  sub1: text('sub1'),
  sub2: text('sub2'), // Raw sub2 string
  sub3: text('sub3'),
  sub4: text('sub4'),
  sub5: text('sub5'),
  sub6: text('sub6'),
  sub7: text('sub7'),
  sub8: text('sub8'),
  sub9: text('sub9'),
  sub10: text('sub10'),
  
  // Sub2 parsed data
  sub2Raw: text('sub2_raw'),
  sub2Map: jsonb('sub2_map'), // Parsed key-value pairs
  
  // Client data
  userAgent: text('user_agent'),
  lang: text('lang'),
  tz: text('tz'),
  screen: text('screen'), // WxH format
  connection: text('connection'), // navigator.connection.effectiveType
  deviceType: text('device_type').$type<DeviceType>(),
  
  // Server enriched data
  ip: text('ip'),
  countryIso: text('country_iso'),
  region: text('region'),
  city: text('city'),
  isp: text('isp'),
  operator: text('operator'),
  isProxy: boolean('is_proxy').default(false),
  
  // UA parsing
  browserName: text('browser_name'),
  browserVersion: text('browser_version'),
  osName: text('os_name'),
  osVersion: text('os_version'),
  deviceModel: text('device_model'),
  
  // Timestamps
  tsClient: bigint('ts_client', { mode: 'number' }), // Client timestamp in ms
  tsServer: timestamp('ts_server').defaultNow(), // Server timestamp
  
  // Uniqueness flags (computed)
  isUniqueGlobal: boolean('is_unique_global').default(false),
  isUniqueCampaign: boolean('is_unique_campaign').default(false),
  isUniqueFlow: boolean('is_unique_flow').default(false),
}, (table) => ({
  clickidIdx: index('clicks_clickid_idx').on(table.clickid),
  campaignTsIdx: index('clicks_campaign_ts_idx').on(table.campaignId, table.tsServer),
  sub2MapIdx: index('clicks_sub2_map_gin_idx').on(table.sub2Map),
  countryIdx: index('clicks_country_idx').on(table.countryIso),
  sourceTsIdx: index('clicks_source_ts_idx').on(table.sourceId, table.tsServer),
}));

// Events table - stores conversion events
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  clickid: uuid('clickid').notNull().references(() => clicks.clickid),
  
  // Event data
  type: text('type').$type<EventType>().notNull(),
  revenue: decimal('revenue', { precision: 10, scale: 2 }),
  revenueDeposit: decimal('revenue_deposit', { precision: 10, scale: 2 }),
  revenueReg: decimal('revenue_reg', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }), // ISO 4217
  txid: text('txid'), // External transaction ID
  
  // Special fields
  timeOnPageMs: integer('time_on_page_ms'), // For lp_leave events
  
  // Timestamps
  tsClient: bigint('ts_client', { mode: 'number' }),
  tsServer: timestamp('ts_server').defaultNow(),
  
  // Raw data for audit
  raw: jsonb('raw'),
}, (table) => ({
  clickidTypeIdx: index('events_clickid_type_idx').on(table.clickid, table.type),
  typeTsIdx: index('events_type_ts_idx').on(table.type, table.tsServer),
}));

// Validation schemas

// Click event schema (for /click endpoint)
export const clickEventSchema = z.object({
  // Attribution (optional for click)
  campaign_id: z.string().optional(),
  source_id: z.string().optional(),
  flow_id: z.string().optional(),
  offer_id: z.string().optional(),
  landing_id: z.string().optional(),
  ad_campaign_id: z.string().optional(),
  external_id: z.string().optional(),
  creative_id: z.string().optional(),
  
  // Marketing
  referrer: z.string().optional(),
  site: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  // Subs
  sub1: z.string().optional(),
  sub2: z.string().max(sub2Config.maxLength).optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  sub6: z.string().optional(),
  sub7: z.string().optional(),
  sub8: z.string().optional(),
  sub9: z.string().optional(),
  sub10: z.string().optional(),
  
  // Client data
  user_agent: z.string(),
  lang: z.string().optional(),
  tz: z.string().optional(),
  screen: z.string().optional(), // WxH
  connection: z.string().optional(),
  device_type: z.enum(deviceTypes).optional(),
  
  // Visitor tracking
  visitor_code: z.string().uuid().optional(),
  
  // Client timestamp
  ts_client: z.number().optional(),
});

// Conversion event schema (for /event endpoint)
export const conversionEventSchema = z.object({
  // Required
  clickid: z.string().max(64),
  visitor_code: z.string().uuid(),
  type: z.enum(eventTypes),
  
  // Attribution
  campaign_id: z.string().optional(),
  source_id: z.string().optional(),
  flow_id: z.string().optional(),
  offer_id: z.string().optional(),
  landing_id: z.string().optional(),
  ad_campaign_id: z.string().optional(),
  external_id: z.string().optional(),
  creative_id: z.string().optional(),
  
  // Marketing
  referrer: z.string().optional(),
  site: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  // Subs with validation
  sub1: z.string().optional(),
  sub2: z.string().max(sub2Config.maxLength).optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  sub6: z.string().optional(),
  sub7: z.string().optional(),
  sub8: z.string().optional(),
  sub9: z.string().optional(),
  sub10: z.string().optional(),
  
  // Client data
  user_agent: z.string(),
  lang: z.string().optional(),
  tz: z.string().optional(),
  screen: z.string().optional(),
  connection: z.string().optional(),
  device_type: z.enum(deviceTypes).optional(),
  
  // Event specific
  revenue: z.number().min(0).optional(),
  revenue_deposit: z.number().min(0).optional(),
  revenue_reg: z.number().min(0).optional(),
  currency: z.string().length(3).optional(), // ISO 4217
  txid: z.string().optional(),
  time_on_page_ms: z.number().min(0).optional(),
  
  // Client timestamp
  ts_client: z.number(),
});

// Sub2 parsing utilities
export function parseSub2(sub2Raw: string): Record<string, string> {
  if (!sub2Raw) return {};
  
  const pairs: Record<string, string> = {};
  const pairStrings = sub2Raw.split('|');
  
  for (const pairString of pairStrings) {
    const [key, ...valueParts] = pairString.split('-');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('-'); // Rejoin in case value contains dashes
      
      // Validate key format
      if (/^[a-z0-9_]{1,16}$/.test(key) && sub2Config.allowedKeys.includes(key)) {
        pairs[key] = decodeURIComponent(value);
      }
    }
  }
  
  return pairs;
}

export function encodeSub2(pairs: Record<string, string>): string {
  return Object.entries(pairs)
    .filter(([key, value]) => key && value && sub2Config.allowedKeys.includes(key))
    .map(([key, value]) => `${encodeURIComponent(key)}-${encodeURIComponent(value)}`)
    .join('|');
}

// Insert schemas
export const insertClickSchema = createInsertSchema(clicks);
export const insertEventSchema = createInsertSchema(events);

// Select schemas
export const selectClickSchema = createSelectSchema(clicks);
export const selectEventSchema = createSelectSchema(events);

// Types
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type ClickEventData = z.infer<typeof clickEventSchema>;
export type ConversionEventData = z.infer<typeof conversionEventSchema>;