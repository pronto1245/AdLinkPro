// Queue system for postback delivery
import { Status } from '../domain/status';

export interface ConversionRow {
  id: string;
  advertiserId: string;
  partnerId: string;
  campaignId?: string;
  offerId?: string;
  flowId?: string;
  clickid: string;
  type: 'reg' | 'purchase';
  txid: string;
  currency: string;
  revenue: string;
  conversionStatus: Status;
  details: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Enqueues postback tasks for conversion events
 */
export async function enqueuePostbacks(conversion: ConversionRow): Promise<void> {
  try {
    console.log('📤 Enqueuing postbacks for conversion:', {
      id: conversion.id,
      type: conversion.type,
      status: conversion.conversionStatus,
      txid: conversion.txid,
      advertiserId: conversion.advertiserId
    });

    // In production, this would use a real queue system like BullMQ
    // For now, we simulate the queue behavior
    
    // Filter postbacks based on status and type
    const shouldSendPostback = shouldTriggerPostback(conversion);
    
    if (!shouldSendPostback) {
      console.log('⏭️ Skipping postback - status/type does not trigger delivery');
      return;
    }

    // Simulate postback delivery to external trackers
    await simulatePostbackDelivery(conversion);
    
    console.log('✅ Postback enqueued successfully');
    
  } catch (error) {
    console.error('❌ Failed to enqueue postbacks:', error);
    throw error;
  }
}

/**
 * Determines if a conversion should trigger postback delivery
 */
function shouldTriggerPostback(conversion: ConversionRow): boolean {
  // Only send postbacks for meaningful status changes
  const triggerStatuses: Status[] = ['approved', 'declined', 'refunded', 'chargeback'];
  
  if (!triggerStatuses.includes(conversion.conversionStatus)) {
    return false;
  }
  
  // Always send for final statuses
  return true;
}

/**
 * Simulates postback delivery to external trackers
 */
async function simulatePostbackDelivery(conversion: ConversionRow): Promise<void> {
  // In production, this would:
  // 1. Fetch postback profiles for the advertiser/campaign
  // 2. Build postback URLs with macro replacement
  // 3. Send HTTP requests to tracker endpoints
  // 4. Handle retries and failure cases
  // 5. Update delivery status in database
  
  const postbackUrl = buildPostbackUrl(conversion);
  
  console.log('🔗 Simulated postback delivery:', {
    url: postbackUrl,
    method: 'GET',
    conversion: {
      clickid: conversion.clickid,
      status: conversion.conversionStatus,
      revenue: conversion.revenue
    }
  });
  
  // Simulate HTTP request delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Builds postback URL with macro replacement
 */
function buildPostbackUrl(conversion: ConversionRow): string {
  // Template postback URL (in production, this comes from postback profiles)
  const template = 'https://tracker.example.com/postback?subid={clickid}&status={status}&payout={revenue}';
  
  return template
    .replace('{clickid}', conversion.clickid)
    .replace('{status}', mapStatusForTracker(conversion.conversionStatus, conversion.type))
    .replace('{revenue}', conversion.revenue);
}

/**
 * Maps internal status to tracker-specific status
 */
function mapStatusForTracker(status: Status, type: 'reg' | 'purchase'): string {
  // For Keitaro format
  if (type === 'reg') {
    return status === 'approved' ? 'lead' : 'trash';
  }
  
  if (type === 'purchase') {
    return status === 'approved' ? 'sale' : 'trash';
  }
  
  return 'trash';
}