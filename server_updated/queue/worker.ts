// BullMQ worker for postback delivery
import { Worker } from "bullmq";
import { pbQueue, PostbackTask } from "./enqueue";
import { config } from "../config/environment.js";
import crypto from "crypto";

// Mock database interface - in production, use real Drizzle
interface MockConversion {
  id: string;
  advertiserId: string;
  partnerId?: string | null;
  clickid: string;
  type: 'reg' | 'purchase';
  txid: string;
  conversionStatus: string;
  revenue: string;
  currency: string;
  antifraudLevel?: string;
}

interface MockPostbackProfile {
  id: string;
  name: string;
  enabled: boolean;
  ownerScope: 'advertiser' | 'partner' | 'global';
  ownerId: string;
  priority: number;
  endpointUrl: string;
  method: 'GET' | 'POST';
  paramsTemplate: Record<string, string>;
  statusMap?: Record<string, Record<string, string>>;
  filterRevenueGt0?: boolean;
  retries?: number;
  timeoutMs?: number;
  backoffBaseSec?: number;
  hmacEnabled?: boolean;
  hmacSecret?: string;
  hmacPayloadTpl?: string;
  hmacParamName?: string;
  authQueryKey?: string;
  authQueryVal?: string;
  authHeaderName?: string;
  authHeaderVal?: string;
  antifraudPolicy?: {
    blockHard: boolean;
    softOnlyPending: boolean;
    logBlocked: boolean;
  };
}

// Mock data for development
const mockConversions: MockConversion[] = [];
const mockPostbackProfiles: MockPostbackProfile[] = [
  {
    id: 'profile_keitaro_main',
    name: 'Keitaro Main Tracker',
    enabled: true,
    ownerScope: 'advertiser',
    ownerId: '1',
    priority: 100,
    endpointUrl: 'https://keitaro.example.com/click.php',
    method: 'GET',
    paramsTemplate: {
      'subid': '{{clickid}}',
      'status': '{{status_mapped}}',
      'payout': '{{revenue}}',
      'currency': '{{currency}}',
      'txid': '{{txid}}'
    },
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
    id: 'profile_keitaro_backup',
    name: 'Keitaro Backup Tracker',
    enabled: true,
    ownerScope: 'advertiser',
    ownerId: '1',
    priority: 90,
    endpointUrl: 'https://backup.keitaro.example.com/click.php',
    method: 'GET',
    paramsTemplate: {
      'subid': '{{clickid}}',
      'status': '{{status_mapped}}',
      'payout': '{{revenue}}',
      'currency': '{{currency}}',
      'txid': '{{txid}}'
    },
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
      softOnlyPending: true,
      logBlocked: true
    }
  },
  {
    id: 'profile_binom_tracker',
    name: 'Binom Tracker',
    enabled: true,
    ownerScope: 'advertiser',
    ownerId: '1',
    priority: 50,
    endpointUrl: 'https://binom.example.com/click.php',
    method: 'GET',
    paramsTemplate: {
      'cnv_id': '{{clickid}}',
      'cnv_status': '{{status_mapped}}',
      'payout': '{{revenue}}'
    },
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

// Template rendering function
function render(tpl: Record<string, string>, ctx: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tpl)) {
    out[k] = v.replace(/\{\{(\w+)\}\}/g, (_, key) => String(ctx[key] ?? ""));
  }
  return out;
}

// Status mapping function
function mapStatus(map: any, type: string, status: string): string {
  return map?.[type]?.[status] ?? status;
}

// Jitter function for retry delays
function jitter(ms: number): number {
  const j = ms * 0.2;
  return ms + Math.floor((Math.random() * 2 - 1) * j);
}

// Mock database functions
async function findConversion(id: string): Promise<MockConversion | null> {
  return mockConversions.find(c => c.id === id) || null;
}

async function findPostbackProfiles(advertiserId: string): Promise<MockPostbackProfile[]> {
  return mockPostbackProfiles
    .filter(p => p.enabled && p.ownerId === advertiserId)
    .sort((a, b) => b.priority - a.priority);
}

async function savePostbackDelivery(delivery: any): Promise<void> {
  console.log('📝 Postback delivery saved:', {
    profileId: delivery.profileId,
    conversionId: delivery.conversionId,
    attempt: delivery.attempt,
    success: !delivery.error,
    url: delivery.requestUrl
  });
}

// BullMQ Worker
export const worker = new Worker<PostbackTask>("postbacks", async (job) => {
  const task = job.data;
  
  console.log('🚀 Processing postback task:', {
    jobId: job.id,
    conversionId: task.conversionId,
    type: task.type,
    status: task.status
  });

  // 1) Load conversion data
  const conv = await findConversion(task.conversionId);
  if (!conv) {
    console.log('❌ Conversion not found:', task.conversionId);
    return { success: false, error: 'Conversion not found' };
  }

  // 2) Global antifraud policy check
  if (task.antifraudLevel === "hard") {
    // Log hard block for all profiles
    for (const profile of profiles) {
      if (profile.antifraudPolicy?.logBlocked) {
        await savePostbackDelivery({
          profileId: profile.id,
          conversionId: conv.id,
          advertiserId: conv.advertiserId,
          partnerId: conv.partnerId ?? null,
          clickid: conv.clickid,
          type: conv.type,
          txid: conv.txid,
          statusMapped: "blocked_by_af_hard",
          attempt: 0,
          maxAttempts: 0,
          requestMethod: "SKIP",
          requestUrl: profile.endpointUrl,
          durationMs: 0,
          error: "blocked_by_af_hard"
        });
      }
    }
    
    console.log('🚫 All postbacks blocked by antifraud (hard level)');
    return { success: true, message: `Blocked by antifraud: ${profiles.length} profiles affected` };
  }

  // 3) Load relevant postback profiles
  const profiles = await findPostbackProfiles(task.advertiserId);
  
  if (profiles.length === 0) {
    console.log('⚠️ No postback profiles found for advertiser:', task.advertiserId);
    return { success: true, message: 'No profiles configured' };
  }

  console.log(`📋 Found ${profiles.length} postback profiles for processing`);
  
  let successCount = 0;
  let errorCount = 0;

  // 4) Process each profile with antifraud policies
  for (const profile of profiles) {
    console.log(`🔄 Processing profile: ${profile.name} (AF: ${JSON.stringify(profile.antifraudPolicy)})`);
    
    // Apply profile-specific soft antifraud policy
    if (task.antifraudLevel === "soft" && profile.antifraudPolicy?.softOnlyPending) {
      if (task.status !== 'pending') {
        await savePostbackDelivery({
          profileId: profile.id,
          conversionId: conv.id,
          advertiserId: conv.advertiserId,
          partnerId: conv.partnerId ?? null,
          clickid: conv.clickid,
          type: conv.type,
          txid: conv.txid,
          statusMapped: "blocked_by_af_soft_policy",
          attempt: 0,
          maxAttempts: 0,
          requestMethod: "SKIP",
          requestUrl: profile.endpointUrl,
          error: `soft_af_non_pending_blocked (status: ${task.status})`
        });
        
        console.log(`⚠️ Soft AF policy: blocked non-pending status "${task.status}" for ${profile.name}`);
        continue;
      }
    }
    
    // Map status according to profile configuration
    const mappedStatus = mapStatus(profile.statusMap, task.type, task.status);
    
    // Apply revenue filter if enabled
    if (profile.filterRevenueGt0 && (!task.revenue || Number(task.revenue) <= 0)) {
      await savePostbackDelivery({
        profileId: profile.id,
        conversionId: conv.id,
        advertiserId: conv.advertiserId,
        partnerId: conv.partnerId ?? null,
        clickid: conv.clickid,
        type: conv.type,
        txid: conv.txid,
        statusMapped: mappedStatus,
        attempt: 0,
        maxAttempts: profile.retries || 3,
        requestMethod: "SKIP",
        requestUrl: profile.endpointUrl,
        error: "payout_le_zero"
      });
      
      console.log('⏭️ Skipped profile due to zero revenue filter');
      continue;
    }

    // Prepare template context
    const ctx = {
      clickid: conv.clickid,
      status_mapped: mappedStatus,
      revenue: task.revenue ?? "0",
      currency: task.currency ?? "",
      txid: conv.txid,
      conversion_id: conv.id,
      advertiser_id: conv.advertiserId,
      partner_id: conv.partnerId ?? ""
    };
    
    // Render parameters from template
    const params = render(profile.paramsTemplate, ctx);

    // Generate HMAC signature if enabled
    if (profile.hmacEnabled && profile.hmacSecret && profile.hmacPayloadTpl && profile.hmacParamName) {
      const payloadString = profile.hmacPayloadTpl.replace(/\{\{(\w+)\}\}/g, (_, k) => String(ctx[k] ?? ""));
      const sig = crypto.createHmac("sha256", profile.hmacSecret).update(payloadString).digest("hex");
      params[profile.hmacParamName] = sig;
      
      console.log('🔐 HMAC signature generated for profile:', profile.name);
    }

    // Prepare request
    const url = new URL(profile.endpointUrl);
    let body: string | undefined;
    const headers: Record<string, string> = {};
    
    // Add authentication
    if (profile.authQueryKey && profile.authQueryVal) {
      url.searchParams.set(profile.authQueryKey, profile.authQueryVal);
    }
    if (profile.authHeaderName && profile.authHeaderVal) {
      headers[profile.authHeaderName] = profile.authHeaderVal;
    }

    // Set request method and body
    if (profile.method === "GET") {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(params);
    }

    // Retry logic
    const maxAttempts = profile.retries ?? 5;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxAttempts) {
      attempt++;
      const started = Date.now();
      
      try {
        console.log(`🌐 Sending ${profile.method} request to ${url.toString()} (attempt ${attempt}/${maxAttempts})`);
        
        // Simulate HTTP request (in production, use real fetch)
        const success = Math.random() > 0.1; // 90% success rate for simulation
        const responseCode = success ? 200 : 500;
        const responseBody = success ? 'OK' : 'Internal Server Error';
        const duration = Date.now() - started;
        
        await savePostbackDelivery({
          profileId: profile.id,
          conversionId: conv.id,
          advertiserId: conv.advertiserId,
          partnerId: conv.partnerId ?? null,
          clickid: conv.clickid,
          type: conv.type,
          txid: conv.txid,
          statusMapped: mappedStatus,
          attempt,
          maxAttempts,
          requestMethod: profile.method,
          requestUrl: url.toString(),
          requestBody: body,
          requestHeaders: headers,
          responseCode,
          responseBody,
          durationMs: duration
        });

        if (success) {
          console.log(`✅ Postback delivered successfully to ${profile.name}`);
          successCount++;
          break;
        } else {
          throw new Error(`HTTP ${responseCode}: ${responseBody}`);
        }
        
      } catch (error: any) {
        lastError = error;
        const duration = Date.now() - started;
        
        await savePostbackDelivery({
          profileId: profile.id,
          conversionId: conv.id,
          advertiserId: conv.advertiserId,
          partnerId: conv.partnerId ?? null,
          clickid: conv.clickid,
          type: conv.type,
          txid: conv.txid,
          statusMapped: mappedStatus,
          attempt,
          maxAttempts,
          requestMethod: profile.method,
          requestUrl: url.toString(),
          requestBody: body,
          requestHeaders: headers,
          error: String(error),
          durationMs: duration
        });
        
        console.log(`❌ Postback attempt ${attempt} failed for ${profile.name}:`, error.message);
        
        if (attempt < maxAttempts) {
          const delayMs = jitter((profile.backoffBaseSec ?? 2) * 1000 * (2 ** (attempt - 1)));
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    if (attempt >= maxAttempts && lastError) {
      errorCount++;
      console.log(`💥 All retry attempts failed for profile ${profile.name}`);
    }
  }

  const result = {
    success: errorCount === 0,
    profilesProcessed: profiles.length,
    successfulDeliveries: successCount,
    failedDeliveries: errorCount,
    message: `Processed ${profiles.length} profiles: ${successCount} successful, ${errorCount} failed`
  };
  
  console.log('📊 Postback task completed:', result);
  return result;
  
}, { 
  connection: { 
    url: config.REDIS_URL,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true
  },
  concurrency: 10,
  removeOnComplete: 100,
  removeOnFail: 50
});

// Worker event handlers
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('🚨 Worker error:', err);
});

console.log('🎯 Postback worker initialized and ready for processing');