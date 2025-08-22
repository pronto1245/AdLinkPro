import { postbacks, receivedOffers } from './schema';
import { createInsertSchema } from 'drizzle-zod';

export const insertPostbackSchema = createInsertSchema(postbacks);
export const insertReceivedOfferSchema = createInsertSchema(receivedOffers);

