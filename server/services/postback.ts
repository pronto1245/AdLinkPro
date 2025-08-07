import { createHmac, randomBytes } from 'crypto';
import { eq, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { postbacks, postbackLogs, postbackTemplates, trackingClicks, users, offers } from '../../shared/schema';

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
  country?: string;
  device?: string;
  ip?: string;
  txid?: string;
  amount?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface PostbackEvent {
  type: 'click' | 'lead' | 'ftd' | 'deposit' | 'approve' | 'reject' | 'hold' | 'conversion';
  clickId: string;
  data: PostbackMacros;
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
    if (!whitelist.trim()) return true; // No whitelist = allow all
    
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
      let signature = '';
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

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Trigger postbacks for an event
  static async triggerPostbacks(event: PostbackEvent) {
    try {
      console.log(`Triggering postbacks for event: ${event.type}, clickId: ${event.clickId}`);
      
      // Get click data if available
      let clickData = null;
      if (event.clickId) {
        const [click] = await db.select()
          .from(trackingClicks)
          .where(eq(trackingClicks.clickId, event.clickId));
        clickData = click;
        console.log(`Found click data:`, clickData ? 'yes' : 'no');
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

      // Send postbacks concurrently
      const results = await Promise.allSettled(
        relevantPostbacks.map(({ postback_templates: pb }) => {
          console.log(`Triggering postback ${pb.id} for event ${event.type}`);
          return this.sendPostback(pb.id, event.type, event.data, event.clickId);
        })
      );

      console.log(`Postback results:`, results.map(r => r.status));
      return results;
    } catch (error) {
      console.error('Error triggering postbacks:', error);
      throw error;
    }
  }

  // Retry failed postbacks
  static async retryFailedPostbacks() {
    try {
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

      const retryPromises = failedLogs
        .filter(({ postback_logs: logs, postback_templates: pb }) => 
          (logs.retryCount || 0) < (pb?.retryAttempts || 3)
        )
        .map(async ({ postback_logs: logs, postback_templates: pb }) => {
          if (!pb) return;

          // Calculate retry delay with exponential backoff (60 seconds default)
          const retryDelay = 60 * Math.pow(2, logs.retryCount || 0);
          const shouldRetry = !logs.nextRetryAt || 
            new Date() >= logs.nextRetryAt;

          if (!shouldRetry) return;

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
              })
              .where(eq(postbackLogs.id, logs.id));
          }

          return result;
        });

      await Promise.allSettled(retryPromises);
    } catch (error) {
      console.error('Error retrying failed postbacks:', error);
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

    // Apply filters (simplified for now)
    let filteredQuery = query;

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
if (false && typeof setInterval !== 'undefined') {
  setInterval(() => {
    PostbackService.retryFailedPostbacks().catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes
}

export default PostbackService;