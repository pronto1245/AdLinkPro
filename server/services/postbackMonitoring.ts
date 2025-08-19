import { db } from '../db';
import { postbackLogs, postbackTemplates, users } from '../../shared/schema';
import { eq, and, gte, lt, count, desc } from 'drizzle-orm';
import { notificationService } from './notification';

interface PostbackFailureAlert {
  postbackId: string;
  postbackName: string;
  advertiserId: string;
  failureCount: number;
  timeWindow: number; // minutes
  errors: string[];
}

export class PostbackMonitoringService {
  private static alertThresholds = {
    failureCount: 5,          // Alert after 5 failures
    timeWindow: 30,           // Within 30 minutes
    criticalFailureRate: 80,  // Alert if failure rate > 80%
  };

  // Check for postback failures and send alerts
  static async checkFailures(): Promise<void> {
    try {
      const timeWindow = this.alertThresholds.timeWindow;
      const since = new Date(Date.now() - timeWindow * 60 * 1000);
      
      // Get postbacks with high failure rates
      const failureStats = await db.select({
        postbackId: postbackLogs.postbackId,
        postbackName: postbackTemplates.name,
        advertiserId: postbackTemplates.advertiserId,
        totalAttempts: count(),
        failures: count(postbackLogs.status) // Count where status = 'failed'
      })
      .from(postbackLogs)
      .innerJoin(postbackTemplates, eq(postbackLogs.postbackId, postbackTemplates.id))
      .where(and(
        gte(postbackLogs.createdAt, since),
        eq(postbackTemplates.isActive, true)
      ))
      .groupBy(
        postbackLogs.postbackId, 
        postbackTemplates.name, 
        postbackTemplates.advertiserId
      )
      .having(count(postbackLogs.status) >= this.alertThresholds.failureCount);

      for (const stat of failureStats) {
        const failureRate = (stat.failures / stat.totalAttempts) * 100;
        
        if (failureRate >= this.alertThresholds.criticalFailureRate) {
          await this.sendFailureAlert({
            postbackId: stat.postbackId,
            postbackName: stat.postbackName,
            advertiserId: stat.advertiserId,
            failureCount: stat.failures,
            timeWindow,
            errors: await this.getRecentErrors(stat.postbackId, since)
          });
        }
      }

      console.log(`✅ Postback monitoring check completed: ${failureStats.length} postbacks with failures`);
    } catch (error) {
      console.error('❌ Postback monitoring failed:', error);
    }
  }

  // Get recent error messages for a postback
  private static async getRecentErrors(postbackId: string, since: Date): Promise<string[]> {
    try {
      const errors = await db.select({
        errorMessage: postbackLogs.errorMessage
      })
      .from(postbackLogs)
      .where(and(
        eq(postbackLogs.postbackId, postbackId),
        eq(postbackLogs.status, 'failed'),
        gte(postbackLogs.createdAt, since)
      ))
      .orderBy(desc(postbackLogs.createdAt))
      .limit(5);

      return errors
        .map(e => e.errorMessage)
        .filter(Boolean)
        .filter((error, index, arr) => arr.indexOf(error) === index); // Remove duplicates
    } catch (error) {
      console.error('Error fetching recent errors:', error);
      return [];
    }
  }

  // Send failure alert notification
  private static async sendFailureAlert(alert: PostbackFailureAlert): Promise<void> {
    try {
      // Get advertiser details
      const [advertiser] = await db.select()
        .from(users)
        .where(eq(users.id, alert.advertiserId))
        .limit(1);

      if (!advertiser) {
        console.error('Advertiser not found for postback alert:', alert.advertiserId);
        return;
      }

      // Send notification to advertiser
      await notificationService.sendNotification({
        type: 'postback_failure',
        userId: advertiser.id,
        data: {
          postbackName: alert.postbackName,
          failureCount: alert.failureCount,
          timeWindow: alert.timeWindow,
          errors: alert.errors,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      });

      // Also send email notification if configured
      try {
        const emailData = {
          to: advertiser.email,
          subject: `🚨 Postback Failure Alert: ${alert.postbackName}`,
          html: `
            <h2>Postback Failure Alert</h2>
            <p>Your postback "<strong>${alert.postbackName}</strong>" has experienced ${alert.failureCount} failures in the last ${alert.timeWindow} minutes.</p>
            
            <h3>Recent Errors:</h3>
            <ul>
              ${alert.errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
            
            <p>Please check your postback configuration and endpoint URL.</p>
            <p><a href="/dashboard/postbacks">View Postback Settings</a></p>
          `
        };

        // Send email (implementation depends on your email service)
        console.log('📧 Would send failure alert email to:', emailData.to);
      } catch (emailError) {
        console.error('Failed to send failure alert email:', emailError);
      }

      console.log(`🚨 Postback failure alert sent for ${alert.postbackName} (${alert.failureCount} failures)`);
    } catch (error) {
      console.error('Failed to send postback failure alert:', error);
    }
  }

  // Check for postback delivery issues
  static async checkDeliveryHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    metrics: {
      totalPostbacks: number;
      successRate: number;
      avgResponseTime: number;
    };
  }> {
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const [healthMetrics] = await db.select({
        total: count(),
        successful: count(postbackLogs.status) // Count successful deliveries
      })
      .from(postbackLogs)
      .where(gte(postbackLogs.createdAt, last24h));

      const totalPostbacks = Number(healthMetrics.total);
      const successfulPostbacks = Number(healthMetrics.successful);
      const successRate = totalPostbacks > 0 ? (successfulPostbacks / totalPostbacks) * 100 : 100;

      const issues: string[] = [];
      let healthy = true;

      if (successRate < 90) {
        healthy = false;
        issues.push(`Low success rate: ${successRate.toFixed(1)}%`);
      }

      if (totalPostbacks === 0) {
        issues.push('No postback activity in the last 24 hours');
      }

      return {
        healthy,
        issues,
        metrics: {
          totalPostbacks,
          successRate: Math.round(successRate * 100) / 100,
          avgResponseTime: 0 // TODO: Calculate from logs
        }
      };
    } catch (error) {
      console.error('Error checking postback health:', error);
      return {
        healthy: false,
        issues: ['Health check failed'],
        metrics: { totalPostbacks: 0, successRate: 0, avgResponseTime: 0 }
      };
    }
  }

  // Start monitoring service (runs periodically)
  static startMonitoring(intervalMinutes: number = 15): void {
    console.log(`🔍 Starting postback monitoring service (checking every ${intervalMinutes} minutes)`);
    
    // Run initial check
    this.checkFailures().catch(console.error);
    
    // Set up periodic monitoring
    setInterval(() => {
      this.checkFailures().catch(console.error);
    }, intervalMinutes * 60 * 1000);
  }
}

// Export singleton instance
export const postbackMonitoring = PostbackMonitoringService;