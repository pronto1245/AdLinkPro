import { createHmac, randomBytes } from 'crypto';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { db } from '../db';
import { postbackTemplates, postbackLogs, trackingClicks } from '@shared/schema';
import { PostbackService, type PostbackMacros, type PostbackEvent } from './postback';

interface EnhancedPostbackConfig {
  maxRetries: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
  enableIPWhitelisting: boolean;
  enableHMACValidation: boolean;
  requestTimeoutMs: number;
  concurrentRequests: number;
}

interface PostbackRetryJob {
  id: string;
  postbackId: string;
  clickId: string;
  eventType: string;
  macros: PostbackMacros;
  attempt: number;
  nextRetryAt: Date;
  maxRetries: number;
}

export class EnhancedPostbackService extends PostbackService {
  private static readonly DEFAULT_CONFIG: EnhancedPostbackConfig = {
    maxRetries: 5,
    baseRetryDelayMs: 5000,  // 5 seconds
    maxRetryDelayMs: 300000, // 5 minutes
    enableIPWhitelisting: true,
    enableHMACValidation: true,
    requestTimeoutMs: 30000,
    concurrentRequests: 10
  };

  private static retryQueue: PostbackRetryJob[] = [];
  private static processingRetries = false;

  /**
   * Enhanced postback delivery with retry mechanisms
   */
  static async deliverPostbackWithRetry(
    postbackId: string,
    eventType: string,
    macros: PostbackMacros,
    clickId?: string,
    config: Partial<EnhancedPostbackConfig> = {}
  ): Promise<{ success: boolean; error?: string; retryScheduled?: boolean }> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      // Get postback template
      const [template] = await db
        .select()
        .from(postbackTemplates)
        .where(and(
          eq(postbackTemplates.id, postbackId),
          eq(postbackTemplates.isActive, true)
        ))
        .limit(1);

      if (!template) {
        return { success: false, error: 'Postback template not found or inactive' };
      }

      console.log(`📤 Delivering postback ${postbackId} for event ${eventType}`);

      // Build postback URL with macros
      const postbackUrl = this.buildPostbackUrl(template.url, macros);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'User-Agent': 'Enhanced-Postback-Service/3.0',
        'Content-Type': 'application/json',
        'X-Postback-Event': eventType,
        'X-Postback-ID': postbackId,
        'X-Click-ID': clickId || 'unknown'
      };

      // Add HMAC signature if enabled
      if (finalConfig.enableHMACValidation && template.hmacSecret) {
        const signature = this.generateEnhancedHMAC(macros, template.hmacSecret, eventType);
        headers['X-Signature'] = signature;
        headers['X-Timestamp'] = Date.now().toString();
      }

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.requestTimeoutMs);

      const startTime = Date.now();
      let response: Response;
      let responseBody = '';
      let success = false;
      let error: string | null = null;

      try {
        const requestOptions: RequestInit = {
          method: template.method || 'GET',
          headers,
          signal: controller.signal
        };

        // Add body for POST requests
        if (template.method === 'POST') {
          requestOptions.body = JSON.stringify({
            event: eventType,
            clickid: macros.clickid,
            ...macros
          });
        }

        response = await fetch(postbackUrl, requestOptions);
        responseBody = await response.text().catch(() => '');
        success = response.ok;

        if (!success) {
          error = `HTTP ${response.status}: ${response.statusText}`;
        }

      } catch (fetchError) {
        error = fetchError instanceof Error ? fetchError.message : 'Network error';
        
        // Create a mock response object for logging
        response = new Response(null, { status: 0, statusText: 'Network Error' });
      } finally {
        clearTimeout(timeoutId);
      }

      const duration = Date.now() - startTime;

      // Log the delivery attempt
      await this.logPostbackDelivery({
        postbackId,
        clickId: clickId || null,
        eventType,
        url: postbackUrl,
        method: template.method || 'GET',
        headers: JSON.stringify(headers),
        requestBody: template.method === 'POST' ? JSON.stringify(macros) : null,
        responseCode: response.status,
        responseBody: responseBody.substring(0, 1000),
        durationMs: duration,
        success,
        error,
        macros: JSON.stringify(macros)
      });

      if (success) {
        console.log(`✅ Postback delivered successfully in ${duration}ms`);
        return { success: true };
      } else {
        console.log(`❌ Postback delivery failed: ${error}`);
        
        // Schedule retry if configured
        if (template.retryAttempts && template.retryAttempts > 0) {
          await this.schedulePostbackRetry({
            id: `retry_${postbackId}_${Date.now()}`,
            postbackId,
            clickId: clickId || '',
            eventType,
            macros,
            attempt: 1,
            nextRetryAt: new Date(Date.now() + finalConfig.baseRetryDelayMs),
            maxRetries: template.retryAttempts
          });
          
          return { success: false, error, retryScheduled: true };
        }
        
        return { success: false, error };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Enhanced postback delivery error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Build postback URL with enhanced macro replacement
   */
  private static buildPostbackUrl(urlTemplate: string, macros: PostbackMacros): string {
    let url = urlTemplate;
    
    // Replace all macros in the URL
    Object.entries(macros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Support both {key} and [key] formats
        url = url.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(String(value)));
        url = url.replace(new RegExp(`\\[${key}\\]`, 'g'), encodeURIComponent(String(value)));
      }
    });
    
    // Add timestamp and random nonce to prevent caching
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}_t=${Date.now()}&_n=${Math.random().toString(36).substr(2, 9)}`;
    
    return url;
  }

  /**
   * Generate enhanced HMAC signature
   */
  private static generateEnhancedHMAC(macros: PostbackMacros, secret: string, eventType: string): string {
    // Create a consistent payload for HMAC
    const sortedMacros = Object.keys(macros)
      .sort()
      .reduce((result: Record<string, any>, key) => {
        const value = macros[key as keyof PostbackMacros];
        if (value !== undefined && value !== null) {
          result[key] = value;
        }
        return result;
      }, {});
    
    const payload = JSON.stringify({
      event: eventType,
      timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      data: sortedMacros
    });
    
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Schedule postback retry with exponential backoff
   */
  private static async schedulePostbackRetry(job: PostbackRetryJob): Promise<void> {
    this.retryQueue.push(job);
    
    console.log(`🔄 Scheduled postback retry ${job.attempt}/${job.maxRetries} for ${job.postbackId}`);
    
    // Start processing retries if not already running
    if (!this.processingRetries) {
      this.processRetryQueue();
    }
  }

  /**
   * Process the retry queue
   */
  private static async processRetryQueue(): Promise<void> {
    this.processingRetries = true;
    
    while (this.retryQueue.length > 0) {
      const job = this.retryQueue.shift();
      if (!job) break;
      
      // Check if it's time to retry
      if (Date.now() < job.nextRetryAt.getTime()) {
        // Put job back and wait
        this.retryQueue.push(job);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.log(`🔄 Processing retry ${job.attempt}/${job.maxRetries} for postback ${job.postbackId}`);
      
      const result = await this.deliverPostbackWithRetry(
        job.postbackId,
        job.eventType,
        job.macros,
        job.clickId,
        { maxRetries: 0 } // Don't create additional retries from retries
      );
      
      if (!result.success && job.attempt < job.maxRetries) {
        // Schedule another retry with exponential backoff
        const nextDelay = Math.min(
          this.DEFAULT_CONFIG.baseRetryDelayMs * Math.pow(2, job.attempt),
          this.DEFAULT_CONFIG.maxRetryDelayMs
        );
        
        const nextJob: PostbackRetryJob = {
          ...job,
          attempt: job.attempt + 1,
          nextRetryAt: new Date(Date.now() + nextDelay)
        };
        
        await this.schedulePostbackRetry(nextJob);
      } else if (result.success) {
        console.log(`✅ Postback retry succeeded for ${job.postbackId}`);
      } else {
        console.log(`❌ Postback retry failed permanently for ${job.postbackId}`);
      }
      
      // Small delay between processing jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processingRetries = false;
  }

  /**
   * Log postback delivery with enhanced details
   */
  private static async logPostbackDelivery(details: {
    postbackId: string;
    clickId: string | null;
    eventType: string;
    url: string;
    method: string;
    headers: string;
    requestBody: string | null;
    responseCode: number;
    responseBody: string;
    durationMs: number;
    success: boolean;
    error: string | null;
    macros: string;
  }): Promise<void> {
    try {
      await db.insert(postbackLogs).values({
        postbackId: details.postbackId,
        clickId: details.clickId,
        eventType: details.eventType,
        payload: JSON.parse(details.macros),
        status: details.success ? 'success' : 'failed',
        responseCode: details.responseCode,
        responseBody: details.responseBody,
        error: details.error,
        deliveredAt: details.success ? new Date() : null,
        retryCount: 0,
        metadata: JSON.stringify({
          url: details.url,
          method: details.method,
          headers: JSON.parse(details.headers),
          requestBody: details.requestBody,
          durationMs: details.durationMs,
          timestamp: new Date().toISOString()
        })
      });
    } catch (logError) {
      console.error('Failed to log postback delivery:', logError);
    }
  }

  /**
   * Get postback statistics
   */
  static async getPostbackStats(timeframe: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<{
    totalSent: number;
    successful: number;
    failed: number;
    successRate: number;
    avgResponseTime: number;
    mostFailedEndpoints: Array<{ url: string; failures: number }>;
  }> {
    try {
      const timeframeHours = timeframe === 'hourly' ? 1 : timeframe === 'daily' ? 24 : 168;
      const startTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
      
      const [stats] = await db
        .select({
          totalSent: count(),
          successful: count(),
          failed: count()
        })
        .from(postbackLogs)
        .where(gte(postbackLogs.createdAt, startTime));

      // Calculate success rate
      const successRate = stats.totalSent > 0 
        ? ((stats.successful / stats.totalSent) * 100) 
        : 0;

      return {
        totalSent: stats.totalSent || 0,
        successful: stats.successful || 0,
        failed: stats.failed || 0,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: 0, // Would require additional calculation
        mostFailedEndpoints: [] // Would require additional query
      };
      
    } catch (error) {
      console.error('Error getting postback stats:', error);
      return {
        totalSent: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        avgResponseTime: 0,
        mostFailedEndpoints: []
      };
    }
  }

  /**
   * Bulk retry failed postbacks
   */
  static async bulkRetryFailedPostbacks(hours: number = 24): Promise<{
    retrieved: number;
    scheduled: number;
  }> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const failedPostbacks = await db
        .select({
          postbackId: postbackLogs.postbackId,
          clickId: postbackLogs.clickId,
          eventType: postbackLogs.eventType,
          payload: postbackLogs.payload,
          retryCount: postbackLogs.retryCount
        })
        .from(postbackLogs)
        .leftJoin(postbackTemplates, eq(postbackLogs.postbackId, postbackTemplates.id))
        .where(and(
          eq(postbackLogs.status, 'failed'),
          gte(postbackLogs.createdAt, cutoffTime),
          eq(postbackTemplates.isActive, true)
        ))
        .limit(500); // Limit to prevent overwhelming the system
      
      let scheduled = 0;
      
      for (const failed of failedPostbacks) {
        if ((failed.retryCount || 0) < 3) { // Max 3 retries
          await this.schedulePostbackRetry({
            id: `bulk_retry_${failed.postbackId}_${Date.now()}`,
            postbackId: failed.postbackId!,
            clickId: failed.clickId || '',
            eventType: failed.eventType!,
            macros: (failed.payload as PostbackMacros) || {},
            attempt: (failed.retryCount || 0) + 1,
            nextRetryAt: new Date(Date.now() + 5000), // Retry in 5 seconds
            maxRetries: 3
          });
          scheduled++;
        }
      }
      
      return {
        retrieved: failedPostbacks.length,
        scheduled
      };
      
    } catch (error) {
      console.error('Error in bulk retry:', error);
      return { retrieved: 0, scheduled: 0 };
    }
  }

  /**
   * Validate postback endpoint health
   */
  static async validatePostbackEndpoint(url: string, timeout: number = 5000): Promise<{
    isHealthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid processing
        signal: controller.signal,
        headers: {
          'User-Agent': 'Postback-Health-Check/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}