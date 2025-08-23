import { Queue, Worker, Job } from 'bullmq';
import { cacheService } from './cacheService';

// Fraud detection data interface
interface FraudData {
  rapidClicks?: boolean;
  suspiciousUA?: boolean;
  proxyIP?: boolean;
  deviceSpoofing?: boolean;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  timestamp?: number;
}

// Redis connection for queues
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Queue definitions
export const queues = {
  analytics: new Queue('analytics', { connection: redisConnection }),
  notifications: new Queue('notifications', { connection: redisConnection }),
  fraud: new Queue('fraud-detection', { connection: redisConnection }),
  cleanup: new Queue('cleanup', { connection: redisConnection }),
  postbacks: new Queue('postbacks', { connection: redisConnection }),
};

// Job types and interfaces
export interface AnalyticsJobData {
  type: 'click' | 'conversion' | 'impression';
  userId?: string;
  offerId?: string;
  partnerId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface NotificationJobData {
  type: 'email' | 'push' | 'sms';
  recipient: string;
  template: string;
  data: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
}

export interface FraudDetectionJobData {
  clickId?: string;
  conversionId?: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  partnerId: string;
  offerId: string;
  data: Record<string, unknown>;
}

export interface CleanupJobData {
  type: 'logs' | 'cache' | 'sessions' | 'temp_files';
  olderThan?: Date;
  pattern?: string;
}

export interface PostbackJobData {
  conversionId: string;
  partnerId: string;
  postbackUrl: string;
  parameters: Record<string, unknown>;
  retryCount?: number;
}

// Queue service class
export class QueueService {
  private workers: Worker[] = [];

  async start() {
    console.log('🚀 Starting queue workers...');

    // Analytics worker
    const analyticsWorker = new Worker('analytics', this.processAnalyticsJob, {
      connection: redisConnection,
      concurrency: 5,
    });
    this.workers.push(analyticsWorker);

    // Notifications worker
    const notificationsWorker = new Worker('notifications', this.processNotificationJob, {
      connection: redisConnection,
      concurrency: 3,
    });
    this.workers.push(notificationsWorker);

    // Fraud detection worker
    const fraudWorker = new Worker('fraud-detection', this.processFraudDetectionJob, {
      connection: redisConnection,
      concurrency: 2,
    });
    this.workers.push(fraudWorker);

    // Cleanup worker
    const cleanupWorker = new Worker('cleanup', this.processCleanupJob, {
      connection: redisConnection,
      concurrency: 1,
    });
    this.workers.push(cleanupWorker);

    // Postbacks worker
    const postbacksWorker = new Worker('postbacks', this.processPostbackJob, {
      connection: redisConnection,
      concurrency: 10,
    });
    this.workers.push(postbacksWorker);

    // Set up error handling for all workers
    this.workers.forEach((worker, index) => {
      const queueNames = ['analytics', 'notifications', 'fraud-detection', 'cleanup', 'postbacks'];
      
      worker.on('completed', (job: Job) => {
        console.log(`✅ ${queueNames[index]} job ${job.id} completed`);
      });

      worker.on('failed', (job: Job | undefined, err: Error) => {
        console.error(`❌ ${queueNames[index]} job ${job?.id} failed:`, err.message);
      });
    });

    // Schedule recurring cleanup jobs
    await this.scheduleCleanupJobs();

    console.log('✅ All queue workers started successfully');
  }

  async stop() {
    console.log('🛑 Stopping queue workers...');
    await Promise.all(this.workers.map(worker => worker.close()));
    console.log('✅ All queue workers stopped');
  }

  // Job processors
  private async processAnalyticsJob(job: Job<AnalyticsJobData>) {
    const { type, userId, offerId, partnerId, data, timestamp } = job.data;

    try {
      // Process analytics data asynchronously
      switch (type) {
        case 'click':
          await this.processClickAnalytics(data, userId, offerId, partnerId, timestamp);
          break;
        case 'conversion':
          await this.processConversionAnalytics(data, userId, offerId, partnerId, timestamp);
          break;
        case 'impression':
          await this.processImpressionAnalytics(data, userId, offerId, partnerId, timestamp);
          break;
      }

      // Update real-time statistics cache
      await this.updateRealTimeStats(type, data);

    } catch (error) {
      console.error('Analytics job processing error:', error);
      throw error; // Will trigger retry
    }
  }

  private async processNotificationJob(job: Job<NotificationJobData>) {
    const { type, recipient, template, data } = job.data;

    try {
      switch (type) {
        case 'email':
          await this.sendEmailNotification(recipient, template, data);
          break;
        case 'push':
          await this.sendPushNotification(recipient, template, data);
          break;
        case 'sms':
          await this.sendSMSNotification(recipient, template, data);
          break;
      }

      console.log(`📧 ${type} notification sent to ${recipient}`);
    } catch (error) {
      console.error('Notification job processing error:', error);
      throw error;
    }
  }

  private async processFraudDetectionJob(job: Job<FraudDetectionJobData>) {
    const { clickId, conversionId, ipAddress, userAgent, deviceFingerprint, partnerId, offerId, data } = job.data;

    try {
      // Run fraud detection algorithms
      const fraudScore = await this.calculateFraudScore({
        ipAddress,
        userAgent,
        deviceFingerprint,
        partnerId,
        offerId,
        ...data
      });

      // If fraud score is high, create fraud report
      if (fraudScore > 70) {
        await this.createFraudReport({
          clickId,
          conversionId,
          partnerId,
          offerId,
          fraudScore,
          indicators: await this.identifyFraudIndicators(data),
        });
      }

      // Update fraud statistics
      await cacheService.setStats('fraud', { 
        score: fraudScore, 
        timestamp: new Date() 
      }, partnerId);

    } catch (error) {
      console.error('Fraud detection job processing error:', error);
      throw error;
    }
  }

  private async processCleanupJob(job: Job<CleanupJobData>) {
    const { type, olderThan, pattern } = job.data;

    try {
      switch (type) {
        case 'logs':
          await this.cleanupOldLogs(olderThan || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days
          break;
        case 'cache':
          await this.cleanupExpiredCache(pattern);
          break;
        case 'sessions':
          await this.cleanupExpiredSessions();
          break;
        case 'temp_files':
          await this.cleanupTempFiles(olderThan || new Date(Date.now() - 24 * 60 * 60 * 1000)); // 1 day
          break;
      }

      console.log(`🧹 Cleanup completed for: ${type}`);
    } catch (error) {
      console.error('Cleanup job processing error:', error);
      throw error;
    }
  }

  private async processPostbackJob(job: Job<PostbackJobData>) {
    const { conversionId, partnerId, postbackUrl, parameters, retryCount = 0 } = job.data;

    try {
      // Send postback to partner
      const response = await fetch(postbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters),
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Postback failed with status: ${response.status}`);
      }

      console.log(`📤 Postback sent successfully for conversion ${conversionId}`);
      
      // Log successful postback
      await this.logPostbackDelivery(conversionId, partnerId, 'success', response.status);

    } catch (error) {
      console.error(`Postback delivery failed for conversion ${conversionId}:`, error);
      
      // Log failed postback
      await this.logPostbackDelivery(conversionId, partnerId, 'failed', 0, error.message);
      
      // Retry logic
      if (retryCount < 3) {
        await queues.postbacks.add(
          `retry-postback-${conversionId}`,
          { ...job.data, retryCount: retryCount + 1 },
          { delay: Math.pow(2, retryCount) * 60000 } // Exponential backoff
        );
      }
      
      throw error;
    }
  }

  // Public methods for adding jobs
  async addAnalyticsJob(data: AnalyticsJobData, priority: number = 0) {
    return queues.analytics.add('process-analytics', data, { priority });
  }

  async addNotificationJob(data: NotificationJobData) {
    const priority = data.priority === 'high' ? 10 : data.priority === 'low' ? -10 : 0;
    return queues.notifications.add('send-notification', data, { priority });
  }

  async addFraudDetectionJob(data: FraudDetectionJobData) {
    return queues.fraud.add('detect-fraud', data, { priority: 5 });
  }

  async addPostbackJob(data: PostbackJobData) {
    return queues.postbacks.add('send-postback', data, { 
      priority: 10,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute
      }
    });
  }

  // Helper methods (would be implemented based on actual services)
  private async processClickAnalytics(data: unknown, userId?: string, offerId?: string, partnerId?: string, timestamp?: Date) {
    // Implement click analytics processing
    console.log('Processing click analytics:', { userId, offerId, partnerId, timestamp });
  }

  private async processConversionAnalytics(data: unknown, userId?: string, offerId?: string, partnerId?: string, timestamp?: Date) {
    // Implement conversion analytics processing
    console.log('Processing conversion analytics:', { userId, offerId, partnerId, timestamp });
  }

  private async processImpressionAnalytics(data: unknown, userId?: string, offerId?: string, partnerId?: string, timestamp?: Date) {
    // Implement impression analytics processing
    console.log('Processing impression analytics:', { userId, offerId, partnerId, timestamp });
  }

  private async updateRealTimeStats(type: string, _data: unknown) {
    // Update real-time statistics in cache
    const key = `stats:realtime:${type}`;
    const current = await cacheService.get(key) || { count: 0 };
    current.count += 1;
    current.lastUpdate = new Date();
    await cacheService.set(key, current, 300); // 5 minutes
  }

  private async sendEmailNotification(recipient: string, template: string, _data: unknown) {
    // Implement email notification sending
    console.log('Sending email notification:', { recipient, template });
  }

  private async sendPushNotification(recipient: string, template: string, _data: unknown) {
    // Implement push notification sending
    console.log('Sending push notification:', { recipient, template });
  }

  private async sendSMSNotification(recipient: string, template: string, _data: unknown) {
    // Implement SMS notification sending
    console.log('Sending SMS notification:', { recipient, template });
  }

  private async calculateFraudScore(data: FraudData): Promise<number> {
    // Implement fraud score calculation algorithm
    let score = 0;
    
    // Basic fraud indicators
    if (data.rapidClicks) {score += 30;}
    if (data.suspiciousUA) {score += 20;}
    if (data.proxyIP) {score += 40;}
    if (data.deviceSpoofing) {score += 35;}
    
    return Math.min(score, 100);
  }

  private async identifyFraudIndicators(data: FraudData): Promise<string[]> {
    const indicators: string[] = [];
    
    if (data.rapidClicks) {indicators.push('rapid_clicks');}
    if (data.suspiciousUA) {indicators.push('suspicious_user_agent');}
    if (data.proxyIP) {indicators.push('proxy_ip');}
    if (data.deviceSpoofing) {indicators.push('device_spoofing');}
    
    return indicators;
  }

  private async createFraudReport(data: FraudData) {
    // Create fraud report in database
    console.log('Creating fraud report:', data);
  }

  private async cleanupOldLogs(olderThan: Date) {
    console.log('Cleaning up logs older than:', olderThan);
  }

  private async cleanupExpiredCache(pattern?: string) {
    console.log('Cleaning up expired cache:', pattern);
  }

  private async cleanupExpiredSessions() {
    console.log('Cleaning up expired sessions');
  }

  private async cleanupTempFiles(olderThan: Date) {
    console.log('Cleaning up temp files older than:', olderThan);
  }

  private async logPostbackDelivery(conversionId: string, partnerId: string, status: string, responseCode: number, errorMessage?: string) {
    console.log('Logging postback delivery:', { conversionId, partnerId, status, responseCode, errorMessage });
  }

  private async scheduleCleanupJobs() {
    // Schedule daily cleanup at 2 AM
    await queues.cleanup.add(
      'daily-log-cleanup',
      { type: 'logs' },
      { 
        repeat: { pattern: '0 2 * * *' }, // Cron: Every day at 2 AM
        jobId: 'daily-log-cleanup'
      }
    );

    // Schedule hourly cache cleanup
    await queues.cleanup.add(
      'hourly-cache-cleanup',
      { type: 'cache' },
      { 
        repeat: { pattern: '0 * * * *' }, // Cron: Every hour
        jobId: 'hourly-cache-cleanup'
      }
    );

    // Schedule session cleanup every 6 hours
    await queues.cleanup.add(
      'session-cleanup',
      { type: 'sessions' },
      { 
        repeat: { pattern: '0 */6 * * *' }, // Cron: Every 6 hours
        jobId: 'session-cleanup'
      }
    );

    console.log('✅ Scheduled recurring cleanup jobs');
  }

  // Queue monitoring
  async getQueueStats() {
    const stats = {};
    
    for (const [name, queue] of Object.entries(queues)) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();
      
      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    }
    
    return stats;
  }
}

// Export singleton instance
export const queueService = new QueueService();