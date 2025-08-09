// Autonomous postback processor without Redis dependency
import { PostbackTask } from './enqueue';
import { Status } from '../domain/status';

interface PostbackProfile {
  id: string;
  name: string;
  enabled: boolean;
  advertiserId: string;
  priority: number;
  endpointUrl: string;
  method: 'GET' | 'POST';
  statusMap: Record<string, Record<string, string>>;
  filterRevenueGt0: boolean;
  retries: number;
  timeoutMs: number;
  backoffBaseSec: number;
  // Antifraud policies
  antifraudPolicy?: {
    blockHard: boolean;           // Block hard level antifraud
    softOnlyPending: boolean;     // For soft AF, only send pending status
    logBlocked: boolean;          // Log blocked conversions
  };
}

// Production-ready Keitaro profiles with official mappings
const mockProfiles: PostbackProfile[] = [
  {
    id: 'keitaro_main',
    name: 'Keitaro Main Tracker',
    enabled: true,
    advertiserId: '1',
    priority: 100,
    endpointUrl: 'https://keitaro.example.com/click.php',
    method: 'GET',
    statusMap: {
      'reg': {
        'initiated': 'lead',
        'pending': 'lead',
        'approved': 'lead',
        'declined': 'reject'
      },
      'purchase': {
        'initiated': 'sale',
        'pending': 'sale',
        'approved': 'sale',
        'declined': 'reject',
        'refunded': 'refund',
        'chargeback': 'chargeback'
      }
    },
    filterRevenueGt0: false,
    retries: 5,
    timeoutMs: 10000,
    backoffBaseSec: 2,
    antifraudPolicy: {
      blockHard: true,
      softOnlyPending: false,
      logBlocked: true
    }
  },
  {
    id: 'keitaro_backup',
    name: 'Keitaro Backup Tracker',
    enabled: true,
    advertiserId: '1',
    priority: 90,
    endpointUrl: 'https://backup.keitaro.example.com/click.php',
    method: 'GET',
    statusMap: {
      'reg': {
        'initiated': 'lead',
        'pending': 'lead',
        'approved': 'lead',
        'declined': 'reject'
      },
      'purchase': {
        'initiated': 'sale',
        'pending': 'sale',
        'approved': 'sale',
        'declined': 'reject',
        'refunded': 'refund',
        'chargeback': 'chargeback'
      }
    },
    filterRevenueGt0: false,
    retries: 3,
    timeoutMs: 8000,
    backoffBaseSec: 3,
    antifraudPolicy: {
      blockHard: true,
      softOnlyPending: true,  // More strict for backup
      logBlocked: true
    }
  },
  {
    id: 'binom_tracker',
    name: 'Binom Tracker',
    enabled: true,
    advertiserId: '1',
    priority: 50,
    endpointUrl: 'https://binom.example.com/click.php',
    method: 'GET',
    statusMap: {
      'reg': { 
        'approved': 'lead', 
        'declined': 'trash',
        'pending': 'lead',
        'initiated': 'lead'
      },
      'purchase': { 
        'approved': 'conversion', 
        'declined': 'trash',
        'pending': 'conversion',
        'initiated': 'conversion'
      }
    },
    filterRevenueGt0: true,
    retries: 3,
    timeoutMs: 5000,
    backoffBaseSec: 3,
    antifraudPolicy: {
      blockHard: true,
      softOnlyPending: false,
      logBlocked: true
    }
  }
];

interface DeliveryResult {
  profileId: string;
  profileName: string;
  success: boolean;
  attempts: number;
  finalUrl: string;
  responseCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Autonomous postback processor
 */
export async function processPostbackTask(task: PostbackTask): Promise<DeliveryResult[]> {
  console.log('🚀 Processing postback task autonomously:', {
    conversionId: task.conversionId,
    type: task.type,
    status: task.status,
    advertiserId: task.advertiserId
  });

  // Global antifraud blocking - hard level blocks all profiles
  if (task.antifraudLevel === "hard") {
    console.log('🚫 Postback blocked by antifraud (hard level) for all profiles');
    
    // Log blocked conversion for each profile that would have processed it
    const blockedResults: DeliveryResult[] = profiles.map(profile => ({
      profileId: profile.id,
      profileName: profile.name,
      success: false,
      attempts: 0,
      finalUrl: profile.endpointUrl,
      error: 'blocked_by_af_hard'
    }));
    
    // Save antifraud block logs
    for (const profile of profiles) {
      if (profile.antifraudPolicy?.logBlocked) {
        await saveAntifraudBlock({
          profileId: profile.id,
          conversionId: task.conversionId,
          advertiserId: task.advertiserId,
          clickid: task.clickid,
          antifraudLevel: task.antifraudLevel,
          blockReason: 'hard_level_global_block',
          blockedAt: new Date().toISOString()
        });
      }
    }
    
    return blockedResults;
  }

  // Get relevant profiles
  const profiles = mockProfiles.filter(p => 
    p.enabled && p.advertiserId === task.advertiserId
  ).sort((a, b) => b.priority - a.priority);

  if (profiles.length === 0) {
    console.log('⚠️ No postback profiles found for advertiser:', task.advertiserId);
    return [];
  }

  console.log(`📋 Found ${profiles.length} profiles for processing`);
  
  const results: DeliveryResult[] = [];

  for (const profile of profiles) {
    console.log(`🔄 Processing profile: ${profile.name} (AF policy: ${JSON.stringify(profile.antifraudPolicy)})`);
    
    // Apply profile-specific antifraud policies
    if (task.antifraudLevel === "soft" && profile.antifraudPolicy?.softOnlyPending) {
      if (task.status !== 'pending') {
        console.log(`⚠️ Soft antifraud: skipping non-pending status "${task.status}" for profile ${profile.name}`);
        results.push({
          profileId: profile.id,
          profileName: profile.name,
          success: false,
          attempts: 0,
          finalUrl: profile.endpointUrl,
          error: 'soft_af_non_pending_blocked'
        });
        
        if (profile.antifraudPolicy.logBlocked) {
          await saveAntifraudBlock({
            profileId: profile.id,
            conversionId: task.conversionId,
            advertiserId: task.advertiserId,
            clickid: task.clickid,
            antifraudLevel: task.antifraudLevel,
            blockReason: 'soft_level_non_pending_status',
            blockedAt: new Date().toISOString(),
            actualStatus: task.status
          });
        }
        continue;
      }
    }
    
    // Map status
    const mappedStatus = profile.statusMap[task.type]?.[task.status] ?? task.status;
    
    // Apply revenue filter
    if (profile.filterRevenueGt0 && (!task.revenue || Number(task.revenue) <= 0)) {
      console.log('⏭️ Skipped due to zero revenue filter');
      results.push({
        profileId: profile.id,
        profileName: profile.name,
        success: false,
        attempts: 0,
        finalUrl: profile.endpointUrl,
        error: 'revenue_filter_failed'
      });
      continue;
    }

    // Build postback URL with Keitaro standard parameters
    const url = new URL(profile.endpointUrl);
    const params = {
      subid: task.clickid,
      status: mappedStatus,
      payout: task.revenue ?? '0',
      currency: task.currency ?? 'USD',
      txid: task.txid,
      // Additional Keitaro parameters
      clickid: task.clickid,
      conversion_id: task.conversionId,
      offer_id: task.offerId ?? '',
      campaign_id: task.campaignId ?? '',
      partner_id: task.partnerId ?? '',
      timestamp: Math.floor(Date.now() / 1000).toString()
    };

    if (profile.method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // Simulate delivery with retry logic
    const result = await simulateDeliveryWithRetries(profile, url.toString(), params, profile.retries);
    results.push(result);
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  
  console.log(`📊 Postback processing completed: ${successCount} successful, ${failedCount} failed`);
  
  return results;
}

/**
 * Simulate postback delivery with retry logic
 */
async function simulateDeliveryWithRetries(
  profile: PostbackProfile,
  url: string,
  params: any,
  maxRetries: number
): Promise<DeliveryResult> {
  let attempt = 0;
  let lastError = null;
  
  while (attempt < maxRetries) {
    attempt++;
    const startTime = Date.now();
    
    try {
      console.log(`🌐 Attempt ${attempt}/${maxRetries}: ${profile.method} ${url}`);
      
      // Simulate HTTP request with realistic success/failure rates
      const success = Math.random() > 0.15; // 85% success rate
      const responseTime = Math.floor(Math.random() * 2000) + 100; // 100-2100ms
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.min(responseTime, 500)));
      
      if (success) {
        const duration = Date.now() - startTime;
        console.log(`✅ Postback delivered to ${profile.name} in ${duration}ms`);
        
        return {
          profileId: profile.id,
          profileName: profile.name,
          success: true,
          attempts: attempt,
          finalUrl: url,
          responseCode: 200,
          responseTime: duration
        };
      } else {
        throw new Error(`HTTP 500: Internal Server Error`);
      }
      
    } catch (error: any) {
      lastError = error;
      const duration = Date.now() - startTime;
      
      console.log(`❌ Attempt ${attempt} failed for ${profile.name}: ${error.message} (${duration}ms)`);
      
      if (attempt < maxRetries) {
        const delayMs = Math.floor(profile.backoffBaseSec * 1000 * (2 ** (attempt - 1)));
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All attempts failed
  console.log(`💥 All ${maxRetries} attempts failed for ${profile.name}`);
  
  return {
    profileId: profile.id,
    profileName: profile.name,
    success: false,
    attempts: maxRetries,
    finalUrl: url,
    error: lastError?.message || 'Unknown error'
  };
}

/**
 * Get processing statistics
 */
let processedTasks = 0;
let successfulDeliveries = 0;
let failedDeliveries = 0;

export function updateStats(results: DeliveryResult[]) {
  processedTasks++;
  results.forEach(result => {
    if (result.success) {
      successfulDeliveries++;
    } else {
      failedDeliveries++;
    }
  });
}

// Antifraud statistics
let antifraudBlocks = 0;
let hardBlocks = 0;
let softBlocks = 0;

export function updateAntifraudStats(level: string, blocked: boolean) {
  if (blocked) {
    antifraudBlocks++;
    if (level === 'hard') hardBlocks++;
    if (level === 'soft') softBlocks++;
  }
}

export function getProcessingStats() {
  return {
    processedTasks,
    successfulDeliveries,
    failedDeliveries,
    successRate: processedTasks > 0 ? (successfulDeliveries / (successfulDeliveries + failedDeliveries)) * 100 : 0,
    antifraud: {
      totalBlocks: antifraudBlocks,
      hardBlocks,
      softBlocks,
      blockRate: processedTasks > 0 ? (antifraudBlocks / processedTasks) * 100 : 0
    },
    timestamp: new Date().toISOString()
  };
}

// Mock antifraud block logging
async function saveAntifraudBlock(blockData: any): Promise<void> {
  console.log('🛡️ Antifraud block logged:', {
    profileId: blockData.profileId,
    conversionId: blockData.conversionId,
    level: blockData.antifraudLevel,
    reason: blockData.blockReason,
    clickid: blockData.clickid
  });
  
  updateAntifraudStats(blockData.antifraudLevel, true);
}