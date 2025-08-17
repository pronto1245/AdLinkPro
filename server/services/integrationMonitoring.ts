// Integration Monitoring and Error Tracking Service
import { EventEmitter } from 'events';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { config } from '../config/environment';

export interface MonitoringAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IntegrationHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  uptime: number;
  errorRate: number;
  lastCheck: Date;
  details?: Record<string, any>;
}

export interface MetricData {
  timestamp: Date;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

export class IntegrationMonitoringService extends EventEmitter {
  private alerts: MonitoringAlert[] = [];
  private healthChecks: Map<string, IntegrationHealth> = new Map();
  private metrics: MetricData[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startMonitoring();
  }

  private startMonitoring() {
    // Run health checks every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);

    console.log('[Monitoring] Started integration monitoring service');
  }

  // Create and store an alert
  createAlert(
    type: MonitoringAlert['type'],
    source: string,
    message: string,
    severity: MonitoringAlert['severity'] = 'medium',
    details?: Record<string, any>
  ): MonitoringAlert {
    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      source,
      message,
      details,
      timestamp: new Date(),
      resolved: false,
      severity
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    // Log critical alerts immediately
    if (severity === 'critical') {
      console.error(`[Monitoring] CRITICAL ALERT: ${source} - ${message}`, details);
      this.sendCriticalAlert(alert);
    } else {
      console.log(`[Monitoring] ${severity.toUpperCase()} Alert: ${source} - ${message}`);
    }

    return alert;
  }

  // Send critical alerts via configured channels
  private async sendCriticalAlert(alert: MonitoringAlert) {
    try {
      // Send to Telegram if configured
      if (config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID) {
        const telegramMessage = `🚨 CRITICAL ALERT\n\n` +
          `Source: ${alert.source}\n` +
          `Message: ${alert.message}\n` +
          `Time: ${alert.timestamp.toISOString()}\n` +
          `Details: ${JSON.stringify(alert.details, null, 2)}`;

        await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        }).catch(error => console.error('[Monitoring] Failed to send Telegram alert:', error));
      }

      // Send email if SendGrid is configured
      if (config.SENDGRID_API_KEY) {
        const emailService = await import('./email');
        await emailService.sendEmail({
          to: 'admin@platform.com',
          subject: `Critical Alert: ${alert.source}`,
          html: `
            <h2>Critical Integration Alert</h2>
            <p><strong>Source:</strong> ${alert.source}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
            <p><strong>Details:</strong></p>
            <pre>${JSON.stringify(alert.details, null, 2)}</pre>
          `
        }).catch(error => console.error('[Monitoring] Failed to send email alert:', error));
      }

    } catch (error) {
      console.error('[Monitoring] Error sending critical alert:', error);
    }
  }

  // Record a metric
  recordMetric(metric: string, value: number, tags?: Record<string, string>) {
    const metricData: MetricData = {
      timestamp: new Date(),
      metric,
      value,
      tags
    };

    this.metrics.push(metricData);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.emit('metric', metricData);
  }

  // Update service health
  updateHealth(
    service: string,
    status: IntegrationHealth['status'],
    responseTime: number,
    details?: Record<string, any>
  ) {
    const now = new Date();
    const existing = this.healthChecks.get(service);
    
    const health: IntegrationHealth = {
      service,
      status,
      responseTime,
      uptime: existing ? existing.uptime + 1 : 1,
      errorRate: this.calculateErrorRate(service, status),
      lastCheck: now,
      details
    };

    this.healthChecks.set(service, health);

    // Create alert if service becomes unhealthy
    if (status === 'unhealthy' || status === 'degraded') {
      const severity = status === 'unhealthy' ? 'high' : 'medium';
      this.createAlert(
        'warning',
        service,
        `Service status changed to ${status}`,
        severity,
        { responseTime, details }
      );
    }

    this.emit('health_update', health);
  }

  private calculateErrorRate(service: string, currentStatus: IntegrationHealth['status']): number {
    // Simple error rate calculation - in production this would be more sophisticated
    const recentChecks = 10; // Last 10 checks
    let errorCount = currentStatus === 'unhealthy' ? 1 : 0;
    
    // This is a simplified version - in production you'd track actual error rates
    return (errorCount / recentChecks) * 100;
  }

  // Perform health checks for all integrated services
  private async performHealthChecks() {
    const services = [
      'database',
      'postback_service',
      'fraud_detection',
      'bi_integration',
      'data_validation'
    ];

    for (const service of services) {
      await this.checkServiceHealth(service);
    }
  }

  private async checkServiceHealth(service: string) {
    const startTime = Date.now();
    
    try {
      switch (service) {
        case 'database':
          await this.checkDatabaseHealth();
          break;
        case 'postback_service':
          await this.checkPostbackHealth();
          break;
        case 'fraud_detection':
          await this.checkFraudDetectionHealth();
          break;
        case 'bi_integration':
          await this.checkBIIntegrationHealth();
          break;
        case 'data_validation':
          await this.checkDataValidationHealth();
          break;
      }

      const responseTime = Date.now() - startTime;
      this.updateHealth(service, 'healthy', responseTime);
      this.recordMetric(`${service}_response_time`, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateHealth(service, 'unhealthy', responseTime, { error: error.message });
      this.recordMetric(`${service}_error`, 1);
      console.error(`[Monitoring] Health check failed for ${service}:`, error);
    }
  }

  private async checkDatabaseHealth() {
    try {
      const result = await db.execute(sql`SELECT 1 as health_check`);
      if (!result) throw new Error('No response from database');
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  private async checkPostbackHealth() {
    try {
      const postbackService = await import('./postback');
      // Check if postback service can be instantiated
      if (!postbackService.PostbackService) {
        throw new Error('Postback service not available');
      }
    } catch (error) {
      throw new Error(`Postback service health check failed: ${error.message}`);
    }
  }

  private async checkFraudDetectionHealth() {
    try {
      const fraudService = await import('./fraudService');
      // Basic check - ensure fraud service methods are available
      if (!fraudService) {
        throw new Error('Fraud service not available');
      }
    } catch (error) {
      throw new Error(`Fraud detection health check failed: ${error.message}`);
    }
  }

  private async checkBIIntegrationHealth() {
    try {
      const biService = await import('./biIntegration');
      // Check if BI service can perform health check
      const healthCheck = await biService.biIntegrationService.healthCheck();
      
      // If any BI system is unhealthy, mark as degraded
      const hasUnhealthy = Object.values(healthCheck).some(status => status.status !== 'healthy');
      if (hasUnhealthy) {
        throw new Error('One or more BI integrations are unhealthy');
      }
    } catch (error) {
      throw new Error(`BI integration health check failed: ${error.message}`);
    }
  }

  private async checkDataValidationHealth() {
    try {
      const dataValidation = await import('./dataValidation');
      // Basic check - ensure data validation service is available
      if (!dataValidation.dataValidationService) {
        throw new Error('Data validation service not available');
      }
    } catch (error) {
      throw new Error(`Data validation health check failed: ${error.message}`);
    }
  }

  // Get current system health summary
  getHealthSummary(): {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    services: IntegrationHealth[];
    activeAlerts: number;
    criticalAlerts: number;
  } {
    const services = Array.from(this.healthChecks.values());
    const activeAlerts = this.alerts.filter(alert => !alert.resolved);
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (services.some(s => s.status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (services.some(s => s.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    return {
      overallStatus,
      services,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length
    };
  }

  // Get recent alerts
  getRecentAlerts(limit: number = 50): MonitoringAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Resolve an alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert_resolved', alert);
      console.log(`[Monitoring] Resolved alert: ${alertId}`);
      return true;
    }
    return false;
  }

  // Get metrics for a specific metric name
  getMetrics(metricName: string, since?: Date): MetricData[] {
    const sinceTime = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    return this.metrics.filter(m => 
      m.metric === metricName && m.timestamp >= sinceTime
    );
  }

  // Get aggregated metrics
  getAggregatedMetrics(metricName: string, since?: Date): {
    avg: number;
    min: number;
    max: number;
    count: number;
    sum: number;
  } {
    const metrics = this.getMetrics(metricName, since);
    
    if (metrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, sum: 0 };
    }

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      sum
    };
  }

  // Clean up old data to prevent memory issues
  private cleanupOldData() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Remove old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > oneDayAgo);
    
    // Remove resolved alerts older than 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => 
      !a.resolved || a.timestamp > oneWeekAgo
    );

    console.log(`[Monitoring] Cleaned up old data: ${this.metrics.length} metrics, ${this.alerts.length} alerts`);
  }

  // Integration-specific monitoring methods
  async monitorDataIntegration(
    source: string,
    recordCount: number,
    validationResult: { isValid: boolean; errors: string[]; warnings: string[] }
  ) {
    this.recordMetric(`integration_${source}_records`, recordCount);
    
    if (!validationResult.isValid) {
      this.createAlert(
        'error',
        `data_integration_${source}`,
        `Data validation failed: ${validationResult.errors.join(', ')}`,
        'high',
        { recordCount, errors: validationResult.errors, warnings: validationResult.warnings }
      );
    } else if (validationResult.warnings.length > 0) {
      this.createAlert(
        'warning',
        `data_integration_${source}`,
        `Data validation warnings: ${validationResult.warnings.length} warnings`,
        'medium',
        { recordCount, warnings: validationResult.warnings }
      );
    }

    this.recordMetric(`integration_${source}_validation_rate`, validationResult.isValid ? 100 : 0);
  }

  async monitorBIExport(biSystem: string, recordCount: number, exportResult: { success: boolean; message: string }) {
    this.recordMetric(`bi_export_${biSystem}_records`, recordCount);
    
    if (!exportResult.success) {
      this.createAlert(
        'error',
        `bi_export_${biSystem}`,
        `BI export failed: ${exportResult.message}`,
        'high',
        { recordCount, message: exportResult.message }
      );
    }

    this.recordMetric(`bi_export_${biSystem}_success`, exportResult.success ? 1 : 0);
  }

  // Stop monitoring service
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('[Monitoring] Stopped integration monitoring service');
  }
}

export const integrationMonitoring = new IntegrationMonitoringService();