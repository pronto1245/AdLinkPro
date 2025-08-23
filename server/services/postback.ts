import { createHmac, randomBytes } from 'crypto';
import { eq, and, desc, asc, gte } from 'drizzle-orm';
import { db } from '../db';
import { postbacks, postbackLogs, postbackTemplates, trackingClicks, users } from '../../shared/schema';
import { postbackMonitor } from './postbackMonitoring';

// Type imports for fraud service integration
interface FraudCheckResult {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  blockReason?: string;
}

export interface PostbackMacros {
  clickid?: string;
  status?: string;
  offer_id?: string;
  partner_id?: string;
  payout?: string;
  revenue?: string;
  currency?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  sub6?: string;
  sub7?: string;
  sub8?: string;
  sub9?: string;
  sub10?: string;
  sub11?: string;
  sub12?: string;
  sub13?: string;
  sub14?: string;
  sub15?: string;
  sub16?: string;
  country?: string;
  country_iso?: string;
  geo?: string;
  device?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  ip?: string;
  txid?: string;
  amount?: string;
  timestamp?: string;
  datetime?: string;
  user_agent?: string;
  referer?: string;
  campaign_id?: string;
  flow_id?: string;
  landing_id?: string;
  creative_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: any;
}

export interface PostbackEvent {
  type: 'click' | 'lp_click' | 'lead' | 'registration' | 'ftd' | 'deposit' | 'approve' | 'reject' | 'hold' | 'conversion' | 'sale' | 'open' | 'lp_leave';
  clickId: string;
  data: PostbackMacros;
  offerId?: string;
  partnerId?: string;
  advertiserId?: string;
}

export class PostbackService {
  
  // Generate unique click ID
  static generateClickId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(6).toString('hex');
    return `${timestamp}_${random}`;
  }

  // Replace macros in URL
  static replaceMacros(url: string, macros: PostbackMacros): string {
    let processedUrl = url;
    
    // Standard macros
    Object.entries(macros).forEach(([key, value]) => {
      const macroPattern = new RegExp(`\\{${key}\\}`, 'g');
      processedUrl = processedUrl.replace(macroPattern, encodeURIComponent(String(value || '')));
    });

    return processedUrl;
  }

  // Generate HMAC signature for security
  static generateSignature(url: string, payload: any, secretKey: string): string {
    const data = url + JSON.stringify(payload);
    return createHmac('sha256', secretKey).update(data).digest('hex');
  }

  // Validate IP whitelist
  static isIpWhitelisted(ip: string, whitelist: string): boolean {
    if (!whitelist.trim()) {return true;} // No whitelist = allow all
    
    const allowedIps = whitelist.split(',').map(ip => ip.trim());
    return allowedIps.includes(ip) || allowedIps.includes('*');
  }

  // Check for duplicate events (anti-deduplication)
  static async isDuplicateEvent(clickId: string, eventType: string, postbackId: string): Promise<boolean> {
    const existingLog = await db.select()
      .from(postbackLogs)
      .where(and(
        eq(postbackLogs.clickId, clickId),
        eq(postbackLogs.eventType, eventType),
        eq(postbackLogs.postbackId, postbackId),
        eq(postbackLogs.status, 'sent')  // Fixed: changed from 'success' to 'sent'
      ))
      .limit(1);
    
    return existingLog.length > 0;
  }

  // Store click for tracking
  static async storeClick(clickData: {
    partnerId: string;
    offerId: string;
    trackingLinkId?: string;
    ip?: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    device?: string;
    browser?: string;
    os?: string;
    subId1?: string;
    subId2?: string;
    subId3?: string;
    subId4?: string;
    subId5?: string;
    landingUrl?: string;
  }) {
    const clickId = this.generateClickId();
    
    const [click] = await db.insert(trackingClicks).values({
      clickId,
      ...clickData,
    }).returning();

    return click;
  }

  // Send postback to URL
  static async sendPostback(
    postbackId: string,
    eventType: string,
    macros: PostbackMacros,
    clickId?: string
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      // Get postback template configuration
      const [postback] = await db.select()
        .from(postbackTemplates)
        .where(eq(postbackTemplates.id, postbackId));

      if (!postback || !postback.isActive) {
        throw new Error('Postback not found or inactive');
      }

      // Check if event is enabled for this postback
      const events = Array.isArray(postback.events) ? postback.events : [];
      console.log(`Postback ${postback.id} events:`, events, `checking for:`, eventType);
      if (!events.includes(eventType)) {
        console.log(`Skipping postback ${postback.id} - event ${eventType} not in configured events`);
        return { success: true }; // Skip if event not configured
      }

      // Check for duplicate events (anti-deduplication)
      if (clickId && await this.isDuplicateEvent(clickId, eventType, postbackId)) {
        console.log(`Duplicate event detected: ${eventType} for click ${clickId}`);
        return { success: true }; // Skip duplicate
      }

      // Replace macros in URL  
      console.log(`Original URL template: ${postback.url}`);
      console.log(`Macros to replace:`, macros);
      const processedUrl = this.replaceMacros(postback.url, macros);
      console.log(`Processed URL: ${processedUrl}`);
      
      // Prepare request options
      const requestOptions: any = {
        method: postback.method || 'GET',
        timeout: (postback.timeout || 30) * 1000,
        headers: {
          'User-Agent': 'Affiliate-Platform-Postback/1.0',
          'Content-Type': 'application/json',
        },
      };

      // Add signature if secret key is configured (disabled for now as template doesn't have this field)
      const signature = '';
      // if (postback.signatureKey) {
      //   signature = this.generateSignature(processedUrl, macros, postback.signatureKey);
      //   requestOptions.headers['X-Signature'] = signature;
      //   requestOptions.headers['X-Timestamp'] = Date.now().toString();
      // }

      // Add payload for POST requests (defaulting to GET for templates)
      const method = 'GET'; // postback templates use GET by default
      requestOptions.method = method;
      if (method === 'POST') {
        requestOptions.body = JSON.stringify(macros);
      }

      // Send request
      console.log(`Sending postback request to: ${processedUrl}`);
      const startTime = Date.now();
      const response = await fetch(processedUrl, requestOptions);
      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();
      console.log(`Postback response: ${response.status} ${response.statusText}`);

      // Log the attempt
      const logStatus = response.ok ? 'sent' : 'failed';
      console.log(`Postback ${postbackId} completed with status: ${logStatus} (HTTP ${response.status})`);
      
      await db.insert(postbackLogs).values({
        postbackId,
        clickId,
        eventType,
        url: processedUrl,
        method: method,
        headers: requestOptions.headers,
        payload: method === 'POST' ? macros : null,
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit response body size
        responseTime,
        retryCount: 0,
        status: logStatus,
        signature,
        sentAt: new Date(),
      });

      // Record monitoring metrics for successful postback
      postbackMonitor.recordPostbackAttempt(
        response.ok,
        responseTime,
        response.ok ? undefined : `HTTP ${response.status}`
      );

      return {
        success: response.ok,
        response: {
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          responseTime,
        },
      };

    } catch (error: any) {
      console.error('Postback sending failed:', error);
      // Log failed attempt
      await db.insert(postbackLogs).values({
        postbackId,
        clickId,
        eventType,
        url: macros.clickid ? `Failed to process URL for click ${macros.clickid}` : 'Failed to process URL',
        method: 'GET',
        retryCount: 0,
        status: 'failed',
        errorMessage: error.message,
      });

      // Record monitoring metrics for failed postback
      postbackMonitor.recordPostbackAttempt(
        false,
        0,
        error.name || 'Error'
      );

      // Trigger failure alert for monitoring
      postbackMonitor.recordPostbackFailure({
        templateId: postbackId,
        clickId: clickId || 'unknown',
        partnerId: 'unknown', // TODO: Extract from context
        url: macros.clickid ? `Click ${macros.clickid}` : 'Unknown URL',
        error: error.message,
        retryAttempt: 1,
        maxRetries: 3
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Build comprehensive macros from click data
  static buildMacrosFromClick(clickData: any, event: PostbackEvent): PostbackMacros {
    const macros: PostbackMacros = {
      // Core tracking data
      clickid: event.clickId,
      status: event.type,
      offer_id: clickData?.offerId || event.offerId,
      partner_id: clickData?.partnerId || event.partnerId,
      
      // Revenue and payout
      revenue: event.data.revenue || '0.00',
      payout: event.data.payout || '0.00', 
      amount: event.data.amount || event.data.revenue || '0.00',
      currency: event.data.currency || 'USD',
      txid: event.data.txid || '',
      
      // Sub parameters (all 16)
      sub1: clickData?.subId1 || event.data.sub1 || '',
      sub2: clickData?.subId2 || event.data.sub2 || '',
      sub3: clickData?.subId3 || event.data.sub3 || '',
      sub4: clickData?.subId4 || event.data.sub4 || '',
      sub5: clickData?.subId5 || event.data.sub5 || '',
      sub6: clickData?.subId6 || event.data.sub6 || '',
      sub7: clickData?.subId7 || event.data.sub7 || '',
      sub8: clickData?.subId8 || event.data.sub8 || '',
      sub9: clickData?.subId9 || event.data.sub9 || '',
      sub10: clickData?.subId10 || event.data.sub10 || '',
      sub11: clickData?.subId11 || event.data.sub11 || '',
      sub12: clickData?.subId12 || event.data.sub12 || '',
      sub13: clickData?.subId13 || event.data.sub13 || '',
      sub14: clickData?.subId14 || event.data.sub14 || '',
      sub15: clickData?.subId15 || event.data.sub15 || '',
      sub16: clickData?.subId16 || event.data.sub16 || '',
      
      // Geo data
      country: clickData?.country || event.data.country || '',
      country_iso: clickData?.country || event.data.country_iso || '',
      geo: clickData?.country || event.data.geo || '',
      
      // Device data  
      device: clickData?.device || event.data.device || '',
      device_type: clickData?.device || event.data.device_type || '',
      os: clickData?.os || event.data.os || '',
      browser: clickData?.browser || event.data.browser || '',
      
      // Technical data
      ip: clickData?.ip || event.data.ip || '',
      user_agent: clickData?.userAgent || event.data.user_agent || '',
      referer: clickData?.referer || event.data.referer || '',
      
      // Campaign data
      campaign_id: event.data.campaign_id || '',
      flow_id: event.data.flow_id || '',
      landing_id: event.data.landing_id || '',
      creative_id: event.data.creative_id || '',
      
      // UTM parameters
      utm_source: event.data.utm_source || '',
      utm_medium: event.data.utm_medium || '',
      utm_campaign: event.data.utm_campaign || '',
      utm_term: event.data.utm_term || '',
      utm_content: event.data.utm_content || '',
      
      // Timestamps
      timestamp: Math.floor(Date.now() / 1000).toString(),
      datetime: new Date().toISOString(),
    };
    
    return macros;
  }

  // Enhanced postback for external trackers (Keitaro, Binom, etc.)
  static async sendExternalTrackerPostback(
    trackerUrl: string, 
    event: PostbackEvent,
    clickData: any,
    options: {
      method?: 'GET' | 'POST';
      auth?: { type: 'query' | 'header'; key: string; value: string };
      hmac?: { secret: string; param: string };
      timeout?: number;
    } = {}
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      // Build comprehensive macros
      const macros = this.buildMacrosFromClick(clickData, event);
      
      // Replace macros in URL
      let processedUrl = this.replaceMacros(trackerUrl, macros);
      console.log(`Sending to external tracker: ${processedUrl}`);
      
      // Prepare request
      const requestOptions: any = {
        method: options.method || 'GET',
        timeout: (options.timeout || 30) * 1000,
        headers: {
          'User-Agent': 'AffiliateNetwork-Postback/2.0',
          'Content-Type': 'application/json',
        },
      };

      // Add authentication
      if (options.auth) {
        if (options.auth.type === 'header') {
          requestOptions.headers[options.auth.key] = options.auth.value;
        } else if (options.auth.type === 'query') {
          const url = new URL(processedUrl);
          url.searchParams.set(options.auth.key, options.auth.value);
          processedUrl = url.toString();
        }
      }

      // Add HMAC signature if configured
      if (options.hmac) {
        const signature = this.generateSignature(processedUrl, macros, options.hmac.secret);
        if (options.method === 'POST') {
          requestOptions.headers['X-Signature'] = signature;
        } else {
          const url = new URL(processedUrl);
          url.searchParams.set(options.hmac.param, signature);
          processedUrl = url.toString();
        }
      }

      // Add payload for POST requests
      if (requestOptions.method === 'POST') {
        requestOptions.body = JSON.stringify(macros);
      }

      // Send request
      const startTime = Date.now();
      const response = await fetch(processedUrl, requestOptions);
      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();
      
      console.log(`External tracker response: ${response.status} in ${responseTime}ms`);

      return {
        success: response.ok,
        response: {
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          responseTime,
        },
      };

    } catch (error: any) {
      console.error('External tracker postback failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Anti-fraud validation for postbacks
  static async performAntiFraudCheck(clickData: any, event: PostbackEvent): Promise<FraudCheckResult> {
    try {
      // Basic fraud indicators
      const reasons: string[] = [];
      let riskScore = 0;

      // Check for suspicious IP patterns (basic implementation)
      if (clickData?.ip) {
        const ip = clickData.ip;
        // Check for common VPN/proxy IP ranges (simplified)
        const suspiciousRanges = ['10.', '192.168.', '172.'];
        if (suspiciousRanges.some(range => ip.startsWith(range))) {
          riskScore += 30;
          reasons.push('Private/internal IP address');
        }
      }

      // Check for suspicious user agent patterns
      if (clickData?.userAgent) {
        const ua = clickData.userAgent.toLowerCase();
        const botPatterns = ['bot', 'crawler', 'spider', 'curl', 'wget'];
        if (botPatterns.some(pattern => ua.includes(pattern))) {
          riskScore += 40;
          reasons.push('Bot-like user agent');
        }
      }

      // Check for rapid successive conversions from same IP
      if (clickData?.ip && event.type === 'conversion') {
        const recentConversions = await db.select()
          .from(trackingClicks)
          .where(and(
            eq(trackingClicks.ip, clickData.ip),
            gte(trackingClicks.createdAt, new Date(Date.now() - 60 * 60 * 1000)) // last hour
          ));

        if (recentConversions.length > 3) {
          riskScore += 50;
          reasons.push('Multiple conversions from same IP');
        }
      }

      // Check for missing referrer (potential bot traffic)
      if (!clickData?.referer || clickData.referer === '') {
        riskScore += 20;
        reasons.push('Missing referrer information');
      }

      // Check for suspicious country/device combinations
      if (clickData?.country && clickData?.device) {
        const suspiciousCountries = ['XX', '--', '', null];
        if (suspiciousCountries.includes(clickData.country)) {
          riskScore += 25;
          reasons.push('Invalid or missing country data');
        }
      }

      const isFraudulent = riskScore >= 60; // Threshold for blocking
      
      return {
        isFraudulent,
        riskScore,
        reasons,
        blockReason: isFraudulent ? reasons.join(', ') : undefined
      };
      
    } catch (error) {
      console.error('Anti-fraud check error:', error);
      // Return safe defaults if check fails
      return {
        isFraudulent: false,
        riskScore: 0,
        reasons: ['Fraud check failed'],
      };
    }
  }

  // Trigger postbacks for an event (enhanced version with anti-fraud)
  static async triggerPostbacks(event: PostbackEvent, options: {
    skipAntiFraud?: boolean;
    fraudThreshold?: number;
  } = {}) {
    try {
      console.log(`Triggering postbacks for event: ${event.type}, clickId: ${event.clickId}`);
      
      // Get click data with all fields
      let clickData = null;
      if (event.clickId) {
        const [click] = await db.select()
          .from(trackingClicks)
          .where(eq(trackingClicks.clickId, event.clickId));
        clickData = click;
        console.log(`Found click data:`, clickData ? 'yes' : 'no');
      }

      // Perform anti-fraud checks unless explicitly skipped
      if (!options.skipAntiFraud && clickData) {
        const fraudCheck = await this.performAntiFraudCheck(clickData, event);
        
        if (fraudCheck.isFraudulent) {
          console.log(`🚫 Blocking postback due to fraud detection: ${fraudCheck.blockReason}`);
          
          // Log the blocked postback for monitoring
          await db.insert(postbackLogs).values({
            postbackId: 'fraud-blocked',
            clickId: event.clickId,
            eventType: event.type,
            url: 'BLOCKED - Fraud detected',
            method: 'BLOCKED',
            retryCount: 0,
            status: 'failed',
            errorMessage: `Fraud detected: ${fraudCheck.blockReason} (Risk Score: ${fraudCheck.riskScore})`,
            responseTime: 0,
            sentAt: new Date(),
          });
          
          return [{
            status: 'rejected' as const,
            reason: { 
              fraud: true, 
              riskScore: fraudCheck.riskScore,
              reasons: fraudCheck.reasons 
            }
          }];
        }
        
        if (fraudCheck.riskScore > 30) {
          console.log(`⚠️ High risk postback (Score: ${fraudCheck.riskScore}): ${fraudCheck.reasons.join(', ')}`);
        }
      }

      // Find all active postback templates for this event
      const relevantPostbacks = await db.select()
        .from(postbackTemplates)
        .leftJoin(users, eq(postbackTemplates.advertiserId, users.id))
        .where(eq(postbackTemplates.isActive, true));

      console.log(`Found ${relevantPostbacks.length} active postback templates`);
      
      if (relevantPostbacks.length === 0) {
        console.log('No active postback templates found');
        return [];
      }

      // Send postbacks concurrently with enhanced data
      const results = await Promise.allSettled(
        relevantPostbacks.map(({ postback_templates: pb }) => {
          console.log(`Triggering postback ${pb.id} for event ${event.type}`);
          // Build enhanced macros for this postback
          const enhancedMacros = this.buildMacrosFromClick(clickData, event);
          return this.sendPostback(pb.id, event.type, enhancedMacros, event.clickId);
        })
      );

      console.log(`Postback results:`, results.map(r => r.status));
      return results;
    } catch (error) {
      console.error('Error triggering postbacks:', error);
      throw error;
    }
  }

  // Retry failed postbacks with configurable parameters
  static async retryFailedPostbacks(config: {
    maxRetryAttempts?: number;
    baseRetryDelay?: number; // seconds
    maxRetryDelay?: number; // seconds
    exponentialBackoff?: boolean;
  } = {}) {
    try {
      const defaultConfig = {
        maxRetryAttempts: 3,
        baseRetryDelay: 60, // 60 seconds
        maxRetryDelay: 3600, // 1 hour max
        exponentialBackoff: true
      };
      
      const finalConfig = { ...defaultConfig, ...config };
      
      // Get failed postbacks that need retry
      const failedLogs = await db.select()
        .from(postbackLogs)
        .leftJoin(postbackTemplates, eq(postbackLogs.postbackId, postbackTemplates.id))
        .where(
          and(
            eq(postbackLogs.status, 'failed'),
            eq(postbackTemplates.isActive, true)
          )
        )
        .orderBy(asc(postbackLogs.createdAt));

      console.log(`Found ${failedLogs.length} failed postback logs to process`);

      const retryPromises = failedLogs
        .filter(({ postback_logs: logs, postback_templates: pb }) => {
          const maxAttempts = pb?.retryAttempts || finalConfig.maxRetryAttempts;
          const canRetry = (logs.retryCount || 0) < maxAttempts;
          
          if (!canRetry) {
            console.log(`Postback ${logs.id} exceeded max retry attempts (${maxAttempts})`);
          }
          
          return canRetry;
        })
        .map(async ({ postback_logs: logs, postback_templates: pb }) => {
          if (!pb) {return;}

          // Calculate retry delay with configurable exponential backoff
          let retryDelay = finalConfig.baseRetryDelay;
          if (finalConfig.exponentialBackoff) {
            retryDelay = Math.min(
              finalConfig.baseRetryDelay * Math.pow(2, logs.retryCount || 0),
              finalConfig.maxRetryDelay
            );
          }
          
          const shouldRetry = !logs.nextRetryAt || 
            new Date() >= logs.nextRetryAt;

          if (!shouldRetry) {
            const nextRetryTime = logs.nextRetryAt?.toISOString();
            console.log(`Postback ${logs.id} not ready for retry until ${nextRetryTime}`);
            return;
          }

          console.log(`Retrying postback ${logs.id}, attempt ${(logs.retryCount || 0) + 1}`);

          // Reconstruct macros from payload
          const macros = logs.payload as PostbackMacros || {};
          
          // Retry the postback
          const result = await this.sendPostback(
            pb.id,
            logs.eventType,
            macros,
            logs.clickId || undefined
          );

          // Update retry count and next retry time
          if (!result.success) {
            await db.update(postbackLogs)
              .set({
                retryCount: (logs.retryCount || 0) + 1,
                nextRetryAt: new Date(Date.now() + retryDelay * 1000),
                errorMessage: result.error,
                updatedAt: new Date(),
              })
              .where(eq(postbackLogs.id, logs.id));
              
            console.log(`Postback ${logs.id} retry failed, next attempt in ${retryDelay} seconds`);
          } else {
            // Success - update status to sent
            await db.update(postbackLogs)
              .set({
                status: 'sent',
                retryCount: (logs.retryCount || 0) + 1,
                nextRetryAt: null,
                errorMessage: null,
                updatedAt: new Date(),
              })
              .where(eq(postbackLogs.id, logs.id));
              
            console.log(`Postback ${logs.id} retry succeeded on attempt ${(logs.retryCount || 0) + 1}`);
          }

          return result;
        });

      const results = await Promise.allSettled(retryPromises);
      const successfulRetries = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failedRetries = results.filter(r => r.status === 'fulfilled' && !r.value?.success).length;
      
      console.log(`Retry batch completed: ${successfulRetries} successful, ${failedRetries} failed`);
      
      return {
        processed: failedLogs.length,
        successful: successfulRetries,
        failed: failedRetries
      };
    } catch (error) {
      console.error('Error retrying failed postbacks:', error);
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get postback logs with filtering
  static async getPostbackLogs(filters: {
    postbackId?: string;
    eventType?: string;
    status?: string;
    clickId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    const query = db.select({
      id: postbackLogs.id,
      postbackId: postbackLogs.postbackId,
      clickId: postbackLogs.clickId,
      eventType: postbackLogs.eventType,
      url: postbackLogs.url,
      method: postbackLogs.method,
      responseStatus: postbackLogs.responseStatus,
      responseTime: postbackLogs.responseTime,
      retryCount: postbackLogs.retryCount,
      status: postbackLogs.status,
      errorMessage: postbackLogs.errorMessage,
      sentAt: postbackLogs.sentAt,
      createdAt: postbackLogs.createdAt,
      postbackName: postbacks.name,
    })
    .from(postbackLogs)
    .leftJoin(postbacks, eq(postbackLogs.postbackId, postbacks.id))
    .orderBy(desc(postbackLogs.createdAt));

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    return await query.limit(limit).offset(offset);
  }

  // Generate tracking URL with click ID
  static generateTrackingUrl(
    baseUrl: string,
    partnerId: string,
    offerId: string,
    subIds: {
      sub1?: string;
      sub2?: string;
      sub3?: string;
      sub4?: string;
      sub5?: string;
    } = {}
  ): string {
    const clickId = this.generateClickId();
    const params = new URLSearchParams({
      partner_id: partnerId,
      offer_id: offerId,
      clickid: clickId,
      ...Object.fromEntries(
        Object.entries(subIds).filter(([_, value]) => value !== undefined)
      ),
    });

    return `${baseUrl}/click?${params.toString()}`;
  }
}

// Initialize retry scheduler (runs every 5 minutes)
// TEMPORARILY DISABLED due to database timeout issues
// TODO: Re-enable when database stability issues are resolved
// if (typeof setInterval !== 'undefined') {
//   setInterval(() => {
//     PostbackService.retryFailedPostbacks().catch(console.error);
//   }, 5 * 60 * 1000); // 5 minutes
// }

export default PostbackService;