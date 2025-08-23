/**
 * Postback Monitoring Service
 * Monitors postback delivery metrics and triggers alerts for failures
 */

import { NotificationService } from './notification';

export interface PostbackMetrics {
  totalPostbacks: number;
  successfulPostbacks: number;
  failedPostbacks: number;
  successRate: number;
  averageResponseTime: number;
  errorTypes: { [type: string]: number };
}

export interface AlertThresholds {
  successRateThreshold: number; // Minimum success rate (default: 90%)
  errorRateThreshold: number;   // Maximum error rate (default: 15%)
  responseTimeThreshold: number; // Maximum response time (default: 5000ms)
  periodHours: number;          // Monitoring period (default: 1 hour)
}

export class PostbackMonitoringService {
  private static instance: PostbackMonitoringService;
  private notificationService: NotificationService;
  private metrics: PostbackMetrics;
  private thresholds: AlertThresholds;
  private lastAlertTime: { [key: string]: number } = {};
  private alertCooldown = 15 * 60 * 1000; // 15 minutes cooldown between alerts

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.metrics = {
      totalPostbacks: 0,
      successfulPostbacks: 0,
      failedPostbacks: 0,
      successRate: 100,
      averageResponseTime: 0,
      errorTypes: {}
    };
    this.thresholds = {
      successRateThreshold: 90,
      errorRateThreshold: 15,
      responseTimeThreshold: 5000,
      periodHours: 1
    };
  }

  static getInstance(): PostbackMonitoringService {
    if (!PostbackMonitoringService.instance) {
      PostbackMonitoringService.instance = new PostbackMonitoringService();
    }
    return PostbackMonitoringService.instance;
  }

  // Update metrics after postback attempt
  recordPostbackAttempt(success: boolean, responseTime: number, errorType?: string): void {
    this.metrics.totalPostbacks++;
    
    if (success) {
      this.metrics.successfulPostbacks++;
    } else {
      this.metrics.failedPostbacks++;
      if (errorType) {
        this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
      }
    }

    // Update success rate
    this.metrics.successRate = (this.metrics.successfulPostbacks / this.metrics.totalPostbacks) * 100;
    
    // Update average response time (simple moving average)
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;

    // Check for alert conditions
    this.checkAlertConditions();
  }

  // Check if metrics exceed alert thresholds
  private checkAlertConditions(): void {
    const now = Date.now();

    // Check success rate
    if (this.metrics.successRate < this.thresholds.successRateThreshold && 
        this.metrics.totalPostbacks >= 10) { // Only alert if we have enough samples
      
      if (!this.isInCooldown('low_success_rate', now)) {
        this.triggerLowSuccessRateAlert();
        this.lastAlertTime['low_success_rate'] = now;
      }
    }

    // Check error rate
    const errorRate = (this.metrics.failedPostbacks / this.metrics.totalPostbacks) * 100;
    if (errorRate > this.thresholds.errorRateThreshold && 
        this.metrics.totalPostbacks >= 10) {

      if (!this.isInCooldown('high_error_rate', now)) {
        this.triggerHighErrorRateAlert(errorRate);
        this.lastAlertTime['high_error_rate'] = now;
      }
    }

    // Check response time
    if (this.metrics.averageResponseTime > this.thresholds.responseTimeThreshold) {
      if (!this.isInCooldown('slow_response', now)) {
        console.warn(`⚠️ Postback average response time high: ${this.metrics.averageResponseTime}ms`);
        this.lastAlertTime['slow_response'] = now;
      }
    }
  }

  // Check if alert is in cooldown period
  private isInCooldown(alertType: string, now: number): boolean {
    const lastAlert = this.lastAlertTime[alertType];
    return lastAlert && (now - lastAlert) < this.alertCooldown;
  }

  // Trigger low success rate alert
  private async triggerLowSuccessRateAlert(): Promise<void> {
    try {
      const mostCommonError = this.getMostCommonError();
      
      await this.notificationService.sendNotification({
        type: 'postback_success_rate_low',
        userId: 'system', _data: {
          successRate: Math.round(this.metrics.successRate * 100) / 100,
          threshold: this.thresholds.successRateThreshold,
          periodHours: this.thresholds.periodHours,
          totalPostbacks: this.metrics.totalPostbacks,
          failedPostbacks: this.metrics.failedPostbacks,
          mostCommonError
        },
        timestamp: new Date()
      });
      
      console.log(`🚨 Low success rate alert triggered: ${this.metrics.successRate}%`);
    } catch (error) {
      console.error('Failed to send low success rate alert:', error);
    }
  }

  // Trigger high error rate alert  
  private async triggerHighErrorRateAlert(errorRate: number): Promise<void> {
    try {
      const primaryErrorType = this.getMostCommonError();
      
      await this.notificationService.sendNotification({
        type: 'postback_high_error_rate',
        userId: 'system', _data: {
          errorRate: Math.round(errorRate * 100) / 100,
          errorCount: this.metrics.failedPostbacks,
          periodMinutes: this.thresholds.periodHours * 60,
          primaryErrorType,
          affectedPartners: 'Multiple', // TODO: Track per partner
          affectedTemplates: 'Multiple'  // TODO: Track per template
        },
        timestamp: new Date()
      });
      
      console.log(`🚨 High error rate alert triggered: ${errorRate}%`);
    } catch (error) {
      console.error('Failed to send high error rate alert:', error);
    }
  }

  // Trigger individual postback failure alert
  async recordPostbackFailure(data: {
    templateId: string;
    clickId: string;
    partnerId: string;
    partnerName?: string;
    url: string;
    error: string;
    retryAttempt: number;
    maxRetries: number;
  }): Promise<void> {
    try {
      // Only send alert for final failures (max retries exceeded)
      if (data.retryAttempt >= data.maxRetries) {
        await this.notificationService.sendNotification({
          type: 'postback_failed',
          userId: 'system', _data: {
            ...data,
            timestamp: Date.now()
          },
          timestamp: new Date()
        });
        
        console.log(`🚨 Postback failure alert sent for ${data.clickId}`);
      }
    } catch (error) {
      console.error('Failed to send postback failure alert:', error);
    }
  }

  // Get most common error type
  private getMostCommonError(): string {
    const errorTypes = this.metrics.errorTypes;
    let maxCount = 0;
    let mostCommonError = 'Unknown';
    
    for (const [errorType, count] of Object.entries(errorTypes)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonError = errorType;
      }
    }
    
    return mostCommonError;
  }

  // Get current metrics
  getMetrics(): PostbackMetrics {
    return { ...this.metrics };
  }

  // Update alert thresholds
  updateThresholds(newThresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Postback monitoring thresholds updated:', this.thresholds);
  }

  // Reset metrics (useful for periodic resets)
  resetMetrics(): void {
    this.metrics = {
      totalPostbacks: 0,
      successfulPostbacks: 0,
      failedPostbacks: 0,
      successRate: 100,
      averageResponseTime: 0,
      errorTypes: {}
    };
    console.log('🔄 Postback metrics reset');
  }

  // Get monitoring status
  getMonitoringStatus(): {
    isHealthy: boolean;
    metrics: PostbackMetrics;
    thresholds: AlertThresholds;
    lastAlerts: { [key: string]: number };
  } {
    const isHealthy = 
      this.metrics.successRate >= this.thresholds.successRateThreshold &&
      this.metrics.averageResponseTime <= this.thresholds.responseTimeThreshold;

    return {
      isHealthy,
      metrics: this.metrics,
      thresholds: this.thresholds,
      lastAlerts: { ...this.lastAlertTime }
    };
  }
}

// Export singleton instance
export const postbackMonitor = PostbackMonitoringService.getInstance();