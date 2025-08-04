import { createHmac, randomBytes } from 'crypto';
import { eq, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { postbacks, postbackLogs, trackingClicks, users, offers } from '../../shared/schema';

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
      // Get postback configuration
      const [postback] = await db.select()
        .from(postbacks)
        .where(eq(postbacks.id, postbackId));

      if (!postback || !postback.isActive) {
        throw new Error('Postback not found or inactive');
      }

      // Check if event is enabled for this postback
      const events = postback.events as string[];
      if (!events.includes(eventType)) {
        return { success: true }; // Skip if event not configured
      }

      // Replace macros in URL
      const processedUrl = this.replaceMacros(postback.url, macros);
      
      // Prepare request options
      const requestOptions: any = {
        method: postback.method || 'GET',
        timeout: (postback.timeout || 30) * 1000,
        headers: {
          'User-Agent': 'Affiliate-Platform-Postback/1.0',
          'Content-Type': 'application/json',
        },
      };

      // Add signature if secret key is configured
      let signature = '';
      if (postback.signatureKey) {
        signature = this.generateSignature(processedUrl, macros, postback.signatureKey);
        requestOptions.headers['X-Signature'] = signature;
      }

      // Add payload for POST requests
      if (postback.method === 'POST') {
        requestOptions.body = JSON.stringify(macros);
      }

      // Send request
      const startTime = Date.now();
      const response = await fetch(processedUrl, requestOptions);
      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();

      // Log the attempt
      await db.insert(postbackLogs).values({
        postbackId,
        clickId,
        eventType,
        url: processedUrl,
        method: postback.method || 'GET',
        headers: requestOptions.headers,
        payload: postback.method === 'POST' ? macros : null,
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit response body size
        responseTime,
        retryCount: 0,
        status: response.ok ? 'sent' : 'failed',
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
      // Get click data if available
      let clickData = null;
      if (event.clickId) {
        const [click] = await db.select()
          .from(trackingClicks)
          .where(eq(trackingClicks.clickId, event.clickId));
        clickData = click;
      }

      // Find all active postbacks for this event
      const relevantPostbacks = await db.select()
        .from(postbacks)
        .leftJoin(users, eq(postbacks.userId, users.id))
        .where(eq(postbacks.isActive, true));

      // Send postbacks concurrently
      const results = await Promise.allSettled(
        relevantPostbacks.map(({ postbacks: pb }) =>
          this.sendPostback(pb.id, event.type, event.data, event.clickId)
        )
      );

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
        .leftJoin(postbacks, eq(postbackLogs.postbackId, postbacks.id))
        .where(
          and(
            eq(postbackLogs.status, 'failed'),
            eq(postbacks.retryEnabled, true)
          )
        )
        .orderBy(asc(postbackLogs.createdAt));

      const retryPromises = failedLogs
        .filter(({ postback_logs: logs, postbacks: pb }) => 
          (logs.retryCount || 0) < (pb?.maxRetries || 3)
        )
        .map(async ({ postback_logs: logs, postbacks: pb }) => {
          if (!pb) return;

          // Calculate retry delay with exponential backoff
          const retryDelay = (pb.retryDelay || 60) * Math.pow(2, logs.retryCount || 0);
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
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    PostbackService.retryFailedPostbacks().catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes
}

export default PostbackService;