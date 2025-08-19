import { db } from "../db";
import { fraudReports, trackingClicks, fraudBlocks } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { EnhancedFraudService } from './enhancedFraudService';

interface OptimisticLockError extends Error {
  name: 'OptimisticLockError';
  currentVersion: number;
  attemptedVersion: number;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers: Record<string, string>;
  events: string[];
  isActive: boolean;
}

interface ProductionConfig {
  enabled: boolean;
  autoTriggersEnabled: boolean;
  realTimeAnalysis: boolean;
  autoBlockingEnabled: boolean;
  ipClickThreshold: number;
  botScoreThreshold: number;
  conversionRateThreshold: number;
  externalServicesEnabled: boolean;
  webhookNotificationsEnabled: boolean;
}

export class ProductionFraudService extends EnhancedFraudService {
  private static productionConfig: ProductionConfig | null = null;

  /**
   * Get production configuration from database
   */
  private static async getProductionConfig(): Promise<ProductionConfig> {
    if (this.productionConfig) {
      return this.productionConfig;
    }

    try {
      const [config] = await db
        .select()
        .from(sql`antifraud_config`)
        .where(sql`id = 'default'`)
        .limit(1);

      if (config) {
        this.productionConfig = {
          enabled: config.enabled,
          autoTriggersEnabled: config.auto_triggers_enabled,
          realTimeAnalysis: config.real_time_analysis,
          autoBlockingEnabled: config.auto_blocking_enabled,
          ipClickThreshold: config.ip_click_threshold,
          botScoreThreshold: config.bot_score_threshold,
          conversionRateThreshold: config.conversion_rate_threshold,
          externalServicesEnabled: config.external_services_enabled,
          webhookNotificationsEnabled: config.webhook_notifications_enabled
        };
      } else {
        // Default configuration if not found
        this.productionConfig = {
          enabled: true,
          autoTriggersEnabled: false, // Disabled by default for safety
          realTimeAnalysis: true,
          autoBlockingEnabled: false, // Disabled by default for safety
          ipClickThreshold: 50,
          botScoreThreshold: 70,
          conversionRateThreshold: 0.005,
          externalServicesEnabled: false,
          webhookNotificationsEnabled: false
        };
      }

      return this.productionConfig;
    } catch (error) {
      console.error('Failed to load production config:', error);
      // Return safe defaults
      return {
        enabled: true,
        autoTriggersEnabled: false,
        realTimeAnalysis: true,
        autoBlockingEnabled: false,
        ipClickThreshold: 50,
        botScoreThreshold: 70,
        conversionRateThreshold: 0.005,
        externalServicesEnabled: false,
        webhookNotificationsEnabled: false
      };
    }
  }

  /**
   * Production-safe fraud detection trigger
   */
  static async triggerProductionFraudDetection(clickData: any): Promise<void> {
    const config = await this.getProductionConfig();

    if (!config.enabled) {
      console.log('🔒 Anti-fraud system is disabled in production');
      return;
    }

    if (!config.autoTriggersEnabled) {
      console.log('🔒 Auto-triggers are disabled in production - manual review required');
      return;
    }

    try {
      // Use enhanced service with production config
      await this.triggerAutoFraudDetection(clickData, {
        ipClickThreshold: config.ipClickThreshold,
        botScoreThreshold: config.botScoreThreshold,
        conversionRateThreshold: config.conversionRateThreshold,
        enableAutoBlocking: config.autoBlockingEnabled,
        enableRealTimeAnalysis: config.realTimeAnalysis
      });

      console.log(`✅ Production fraud detection completed for click: ${clickData.clickId}`);

    } catch (error) {
      console.error('❌ Production fraud detection failed:', error);
      // In production, log error but don't throw to avoid breaking click processing
    }
  }

  /**
   * Update fraud report with optimistic locking
   */
  static async updateFraudReportWithLocking(
    reportId: string,
    updates: Partial<any>,
    expectedVersion: number
  ): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
        version: expectedVersion + 1
      };

      const [updated] = await db
        .update(fraudReports)
        .set(updateData)
        .where(and(
          eq(fraudReports.id, reportId),
          eq(sql`version`, expectedVersion)
        ))
        .returning();

      if (!updated) {
        // Check current version to provide better error info
        const [current] = await db
          .select({ version: sql`version` })
          .from(fraudReports)
          .where(eq(fraudReports.id, reportId))
          .limit(1);

        const error: OptimisticLockError = new Error(
          `Optimistic lock failed: expected version ${expectedVersion}, current version is ${current?.version || 'unknown'}`
        ) as OptimisticLockError;
        error.name = 'OptimisticLockError';
        error.currentVersion = current?.version || -1;
        error.attemptedVersion = expectedVersion;
        throw error;
      }

      console.log(`✅ Updated fraud report ${reportId} with optimistic locking`);
      return updated;

    } catch (error) {
      if ((error as OptimisticLockError).name === 'OptimisticLockError') {
        console.error('🔒 Optimistic lock conflict:', error.message);
        throw error;
      }
      console.error('❌ Failed to update fraud report:', error);
      throw error;
    }
  }

  /**
   * Trigger webhooks for fraud events
   */
  static async triggerWebhooks(eventType: string, eventData: any): Promise<void> {
    const config = await this.getProductionConfig();
    
    if (!config.webhookNotificationsEnabled) {
      return;
    }

    try {
      const webhooks = await db
        .select()
        .from(sql`fraud_webhooks`)
        .where(and(
          eq(sql`is_active`, true),
          sql`${eventType} = ANY(events)`
        ));

      const promises = webhooks.map(webhook => this.sendWebhook(webhook, eventType, eventData));
      await Promise.allSettled(promises);

    } catch (error) {
      console.error('❌ Failed to trigger webhooks:', error);
    }
  }

  /**
   * Send individual webhook
   */
  private static async sendWebhook(webhook: any, eventType: string, eventData: any): Promise<void> {
    try {
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: eventData
      };

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'AdLinkPro-Antifraud/1.0',
        ...webhook.headers
      };

      const requestConfig: RequestInit = {
        method: webhook.method,
        headers,
        signal: AbortSignal.timeout(webhook.timeout_seconds * 1000 || 30000)
      };

      if (webhook.method !== 'GET') {
        requestConfig.body = JSON.stringify(payload);
      }

      const response = await fetch(webhook.url, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Webhook ${webhook.name} sent successfully`);

    } catch (error) {
      console.error(`❌ Webhook ${webhook.name} failed:`, error);
      // Log webhook failure for retry logic
      await this.logWebhookFailure(webhook.id, eventType, error.message);
    }
  }

  /**
   * Log webhook failures for retry
   */
  private static async logWebhookFailure(webhookId: string, eventType: string, errorMessage: string): Promise<void> {
    try {
      // In a production system, you would log this to a dedicated webhook_logs table
      console.log(`📝 Logged webhook failure: ${webhookId}, event: ${eventType}, error: ${errorMessage}`);
    } catch (error) {
      console.error('Failed to log webhook failure:', error);
    }
  }

  /**
   * Enable production auto-triggers (admin only)
   */
  static async enableProductionAutoTriggers(adminUserId: string, enabled: boolean): Promise<void> {
    try {
      await db
        .update(sql`antifraud_config`)
        .set({
          auto_triggers_enabled: enabled,
          updated_by: adminUserId,
          updated_at: new Date()
        })
        .where(eq(sql`id`, 'default'));

      // Clear cache
      this.productionConfig = null;

      console.log(`${enabled ? '✅ Enabled' : '🔒 Disabled'} production auto-triggers by admin: ${adminUserId}`);

      // Trigger audit log
      await this.auditConfigChange(adminUserId, 'auto_triggers_enabled', enabled);

    } catch (error) {
      console.error('❌ Failed to update auto-triggers setting:', error);
      throw error;
    }
  }

  /**
   * Configure auto-blocking (admin only)
   */
  static async configureAutoBlocking(adminUserId: string, enabled: boolean, threshold: number): Promise<void> {
    try {
      await db
        .update(sql`antifraud_config`)
        .set({
          auto_blocking_enabled: enabled,
          bot_score_threshold: threshold,
          updated_by: adminUserId,
          updated_at: new Date()
        })
        .where(eq(sql`id`, 'default'));

      // Clear cache
      this.productionConfig = null;

      console.log(`${enabled ? '✅ Enabled' : '🔒 Disabled'} auto-blocking (threshold: ${threshold}) by admin: ${adminUserId}`);

      await this.auditConfigChange(adminUserId, 'auto_blocking_config', { enabled, threshold });

    } catch (error) {
      console.error('❌ Failed to update auto-blocking configuration:', error);
      throw error;
    }
  }

  /**
   * Get production statistics
   */
  static async getProductionStats(): Promise<any> {
    try {
      const config = await this.getProductionConfig();
      const realtimeStats = await this.getRealTimeFraudStats();

      return {
        ...realtimeStats,
        configuration: {
          enabled: config.enabled,
          autoTriggersEnabled: config.autoTriggersEnabled,
          autoBlockingEnabled: config.autoBlockingEnabled,
          realTimeAnalysis: config.realTimeAnalysis,
          externalServicesEnabled: config.externalServicesEnabled
        },
        systemStatus: {
          healthy: true,
          lastCheck: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Failed to get production stats:', error);
      return {
        error: 'Failed to get production statistics',
        systemStatus: {
          healthy: false,
          lastCheck: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }

  /**
   * Audit configuration changes
   */
  private static async auditConfigChange(adminUserId: string, setting: string, value: any): Promise<void> {
    try {
      // In a real system, this would use the audit logging system
      console.log(`📋 Audit: Admin ${adminUserId} changed ${setting} to ${JSON.stringify(value)}`);
    } catch (error) {
      console.error('Failed to audit config change:', error);
    }
  }

  /**
   * Health check for production system
   */
  static async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const config = await this.getProductionConfig();
      const stats = await this.getRealTimeFraudStats();

      return {
        healthy: true,
        details: {
          configLoaded: !!config,
          statsAvailable: !!stats,
          systemEnabled: config.enabled,
          autoTriggersEnabled: config.autoTriggersEnabled,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}