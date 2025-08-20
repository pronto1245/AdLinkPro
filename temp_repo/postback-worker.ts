// Enhanced postback worker with retries, HMAC, and monitoring
import { createHash, createHmac } from 'crypto';
import { setTimeout } from 'timers/promises';

interface PostbackJob {
  id: string;
  profileId: number;
  conversionId: number;
  clickid: string;
  type: string;
  txid: string;
  revenue: string;
  currency: string;
  status: string;
  attempt: number;
  maxAttempts: number;
  profile: {
    endpointUrl: string;
    method: 'GET' | 'POST';
    idParam: 'subid' | 'clickid';
    authQueryKey?: string;
    authQueryVal?: string;
    authHeaderName?: string;
    authHeaderVal?: string;
    paramsTemplate: Record<string, string>;
    statusMap: Record<string, Record<string, string>>;
    hmacEnabled: boolean;
    hmacSecret?: string;
    hmacPayloadTpl?: string;
    hmacParamName?: string;
    timeoutMs: number;
    backoffBaseSec: number;
  };
}

class PostbackWorker {
  private queue: PostbackJob[] = [];
  private processing = false;
  private readonly maxConcurrent = 10;
  private activeJobs = 0;

  async addJob(job: PostbackJob) {
    this.queue.push(job);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      if (job) {
        this.activeJobs++;
        this.processJob(job).finally(() => {
          this.activeJobs--;
        });
      }
    }
    
    if (this.queue.length === 0 && this.activeJobs === 0) {
      this.processing = false;
    }
  }

  private async processJob(job: PostbackJob): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Build URL with parameter replacements
      const url = this.buildPostbackUrl(job);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'User-Agent': 'Enhanced-Postback-Worker/2.0',
        'Content-Type': 'application/json',
      };
      
      if (job.profile.authHeaderName && job.profile.authHeaderVal) {
        headers[job.profile.authHeaderName] = job.profile.authHeaderVal;
      }
      
      // Prepare request options
      const options: RequestInit = {
        method: job.profile.method,
        headers,
        signal: AbortSignal.timeout(job.profile.timeoutMs),
      };
      
      // Add HMAC signature if enabled
      if (job.profile.hmacEnabled && job.profile.hmacSecret) {
        const signature = this.generateHmacSignature(job);
        if (job.profile.hmacParamName) {
          // Add signature to URL params
          const urlObj = new URL(url);
          urlObj.searchParams.set(job.profile.hmacParamName, signature);
          headers['X-Signature'] = signature;
        }
      }
      
      // For POST requests, add body
      if (job.profile.method === 'POST') {
        options.body = JSON.stringify({
          clickid: job.clickid,
          type: job.type,
          txid: job.txid,
          revenue: job.revenue,
          currency: job.currency,
          status: job.status,
        });
      }
      
      console.log(`📤 Sending postback attempt ${job.attempt}/${job.maxAttempts} to: ${url}`);
      
      // Make the request
      const response = await fetch(url, options);
      const responseBody = await response.text().catch(() => '');
      const durationMs = Date.now() - startTime;
      
      // Log delivery result
      await this.logDelivery({
        ...job,
        requestMethod: job.profile.method,
        requestUrl: url,
        requestBody: options.body as string,
        requestHeaders: headers,
        responseCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit response body size
        error: null,
        durationMs,
      });
      
      if (response.ok) {
        console.log(`✅ Postback delivered successfully: ${response.status} in ${durationMs}ms`);
      } else {
        console.log(`❌ Postback failed with status: ${response.status}`);
        await this.scheduleRetry(job, `HTTP ${response.status}: ${responseBody.substring(0, 200)}`);
      }
      
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Postback error:`, errorMessage);
      
      // Log failed delivery
      await this.logDelivery({
        ...job,
        requestMethod: job.profile.method,
        requestUrl: this.buildPostbackUrl(job),
        requestBody: null,
        requestHeaders: {},
        responseCode: null,
        responseBody: null,
        error: errorMessage,
        durationMs,
      });
      
      await this.scheduleRetry(job, errorMessage);
    }
  }
  
  private buildPostbackUrl(job: PostbackJob): string {
    let url = job.profile.endpointUrl;
    
    // Replace standard parameters
    url = url.replace(/{clickid}/g, job.clickid);
    url = url.replace(/{client_id}/g, job.clickid);
    url = url.replace(/{subid}/g, job.clickid);
    url = url.replace(/{external_id}/g, job.clickid);
    url = url.replace(/{txid}/g, job.txid);
    url = url.replace(/{type}/g, job.type);
    url = url.replace(/{revenue}/g, job.revenue);
    url = url.replace(/{payout}/g, job.revenue);
    url = url.replace(/{currency}/g, job.currency);
    
    // Apply status mapping
    let mappedStatus = job.status;
    if (job.profile.statusMap[job.type]?.[job.status]) {
      mappedStatus = job.profile.statusMap[job.type][job.status];
    }
    url = url.replace(/{status}/g, mappedStatus);
    url = url.replace(/{lead}/g, 'lead');
    url = url.replace(/{sale}/g, 'sale');
    
    // Apply custom parameter template
    for (const [key, value] of Object.entries(job.profile.paramsTemplate)) {
      url = url.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    // Add auth query parameters
    if (job.profile.authQueryKey && job.profile.authQueryVal) {
      const urlObj = new URL(url);
      urlObj.searchParams.set(job.profile.authQueryKey, job.profile.authQueryVal);
      url = urlObj.toString();
    }
    
    return url;
  }
  
  private generateHmacSignature(job: PostbackJob): string {
    if (!job.profile.hmacSecret) return '';
    
    let payload = job.profile.hmacPayloadTpl || '{clickid}{type}{revenue}';
    
    // Replace parameters in HMAC payload
    payload = payload.replace(/{clickid}/g, job.clickid);
    payload = payload.replace(/{type}/g, job.type);
    payload = payload.replace(/{txid}/g, job.txid);
    payload = payload.replace(/{revenue}/g, job.revenue);
    payload = payload.replace(/{status}/g, job.status);
    payload = payload.replace(/{currency}/g, job.currency);
    
    return createHmac('sha256', job.profile.hmacSecret)
      .update(payload)
      .digest('hex');
  }
  
  private async scheduleRetry(job: PostbackJob, error: string): Promise<void> {
    if (job.attempt >= job.maxAttempts) {
      console.log(`❌ Maximum retry attempts reached for job ${job.id}`);
      return;
    }
    
    const delay = Math.pow(job.profile.backoffBaseSec, job.attempt) * 1000;
    console.log(`🔄 Scheduling retry ${job.attempt + 1}/${job.maxAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      await this.addJob({
        ...job,
        attempt: job.attempt + 1,
      });
    }, delay);
  }
  
  private async logDelivery(delivery: any): Promise<void> {
    // In a real implementation, this would save to the postback_deliveries table
    // For now, we'll just log to console
    console.log('📋 Delivery logged:', {
      profileId: delivery.profileId,
      clickid: delivery.clickid,
      attempt: delivery.attempt,
      responseCode: delivery.responseCode,
      error: delivery.error,
      durationMs: delivery.durationMs,
    });
    
    // TODO: Implement database logging
    // await db.insert(postbackDeliveries).values(delivery);
  }
  
  // Health check method
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      processing: this.processing,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Singleton instance
export const postbackWorker = new PostbackWorker();

// Auto-start processing
postbackWorker.addJob = postbackWorker.addJob.bind(postbackWorker);