// Enhanced queue system with BullMQ integration
import { Queue } from "bullmq";
import { config } from "../config/environment.js";
import { Status } from '../domain/status';

export type PostbackTask = {
  conversionId: string;
  advertiserId: string;
  partnerId?: string | null;
  campaignId?: string | null;
  offerId?: string | null;
  flowId?: string | null;
  clickid: string;
  type: "reg" | "purchase";
  txid: string;
  status: Status;            // наш статус (approved/declined/...)
  revenue?: string | null;
  currency?: string | null;
  antifraudLevel?: "ok" | "soft" | "hard" | null;
  details?: any;
};

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
  antifraudLevel?: "ok" | "soft" | "hard" | null;
}

// Redis availability tracking
let redisAvailable = false;
let pbQueue: Queue<PostbackTask> | null = null;

// Check Redis availability
async function checkRedisAvailability(): Promise<boolean> {
  try {
    const redis = new (await import('ioredis')).default(config.REDIS_URL);
    await redis.ping();
    await redis.disconnect();
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize BullMQ queue only if Redis is available
async function initializeQueue(): Promise<Queue<PostbackTask> | null> {
  if (pbQueue) return pbQueue;
  
  const isRedisAvailable = await checkRedisAvailability();
  
  if (isRedisAvailable) {
    console.log('✅ Redis is available, initializing BullMQ queue');
    redisAvailable = true;
    pbQueue = new Queue<PostbackTask>("postbacks", { 
      connection: { 
        url: config.REDIS_URL,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true
      },
      defaultJobOptions: {
        removeOnComplete: 5000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    });
    return pbQueue;
  } else {
    console.log('⚠️ Redis unavailable, will use autonomous processing');
    redisAvailable = false;
    return null;
  }
}

/**
 * Enqueues postback tasks for conversion events using BullMQ
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

    // Filter postbacks based on status and type
    const shouldSendPostback = shouldTriggerPostback(conversion);
    
    if (!shouldSendPostback) {
      console.log('⏭️ Skipping postback - status/type does not trigger delivery');
      return;
    }

    // Create postback task for BullMQ
    const task: PostbackTask = {
      conversionId: conversion.id,
      advertiserId: conversion.advertiserId,
      partnerId: conversion.partnerId,
      campaignId: conversion.campaignId,
      offerId: conversion.offerId,
      flowId: conversion.flowId,
      clickid: conversion.clickid,
      type: conversion.type,
      txid: conversion.txid,
      status: conversion.conversionStatus,
      revenue: conversion.revenue,
      currency: conversion.currency,
      antifraudLevel: conversion.antifraudLevel ?? "ok",
      details: conversion.details
    };

    // Try to initialize and use BullMQ queue
    const queue = await initializeQueue();
    
    if (queue) {
      try {
        const job = await queue.add("deliver", task, {
          jobId: `postback_${conversion.id}_${Date.now()}`,
          removeOnComplete: 5000,
          removeOnFail: 5000,
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          delay: getPostbackDelay(conversion.conversionStatus)
        });
        
        console.log('✅ Postback task enqueued with BullMQ ID:', job.id);
        return;
        
      } catch (redisError) {
        console.log('🔄 BullMQ connection lost, falling back to direct processing');
        redisAvailable = false;
        pbQueue = null;
      }
    } else {
      console.log('🔄 Using autonomous processing (Redis unavailable)');
    }
    
    // Fallback: Use autonomous processor
    const { processPostbackTask, updateStats } = await import('./processor.js');
    const processorTask: PostbackTask = {
      conversionId: conversion.id,
      advertiserId: conversion.advertiserId,
      partnerId: conversion.partnerId,
      campaignId: conversion.campaignId,
      offerId: conversion.offerId,
      flowId: conversion.flowId,
      clickid: conversion.clickid,
      type: conversion.type,
      txid: conversion.txid,
      status: conversion.conversionStatus,
      revenue: conversion.revenue,
      currency: conversion.currency,
      antifraudLevel: conversion.antifraudLevel ?? "ok",
      details: conversion.details
    };
    
    const results = await processPostbackTask(processorTask);
    updateStats(results);
    
    console.log('✅ Autonomous postback processing completed');
    
  } catch (error) {
    console.error('❌ Failed to process postbacks:', error);
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

/**
 * Determines delay before postback delivery based on status
 */
function getPostbackDelay(status: Status): number {
  // Immediate delivery for critical status changes
  if (status === 'approved' || status === 'declined') {
    return 0;
  }
  
  // Slight delay for refunds/chargebacks to allow for processing
  if (status === 'refunded' || status === 'chargeback') {
    return 30000; // 30 seconds
  }
  
  // Default delay for other statuses
  return 5000; // 5 seconds
}

/**
 * Gets queue statistics for monitoring
 */
export async function getQueueStats() {
  try {
    const queue = await initializeQueue();
    
    if (!queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0,
        error: 'Redis unavailable'
      };
    }
    
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      total: 0,
      error: 'Redis connection failed'
    };
  }
}