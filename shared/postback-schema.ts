// This file provides additional schemas for postback-related functionality
// The actual table definitions are in schema.ts to avoid circular dependencies
import { z } from 'zod';
import { 
  postbackProfiles as postbackProfilesTable, 
  postbackDeliveries as postbackDeliveriesTable,
  trackingClicks as trackingClicksTable,
  events as eventsTable
} from './schema';

// Re-export tables that are being imported by server files
export const trackingClicks = trackingClicksTable;
export const trackingEvents = eventsTable; // trackingEvents is an alias for events
export const postbackProfiles = postbackProfilesTable;
export const postbackDeliveries = postbackDeliveriesTable;

// Temporary schemas to avoid import errors
export const deliveryQueue = postbackDeliveriesTable; // deliveryQueue is an alias

export const clickEventSchema = z.object({
  clickid: z.string(),
  advertiserId: z.string(),
  partnerId: z.string().optional(),
  type: z.literal('click'),
});

export const conversionEventSchema = z.object({
  clickid: z.string(),
  advertiserId: z.string(),
  partnerId: z.string().optional(),
  type: z.string(),
  revenue: z.number().optional(),
  txid: z.string().optional(),
});

export const createPostbackProfileSchema = z.object({
  ownerScope: z.string(),
  ownerId: z.number(),
  scopeType: z.string(),
  name: z.string(),
  endpointUrl: z.string(),
  method: z.string().default("GET"),
});

export const updatePostbackProfileSchema = createPostbackProfileSchema.partial();

// Additional exports needed by server files
export const sub2Config = {
  delimiter: "|", // Delimiter used in sub2 parameter parsing
  kvSeparator: "-", // Key-value separator in sub2
};

// Note: To avoid circular dependency, table definitions are imported directly where needed
// The main postback table definitions are in schema.ts

