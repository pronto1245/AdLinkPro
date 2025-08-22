import { db } from "../db";
import { fraudAlerts, fraudReports, ipAnalysis, fraudBlocks } from "@shared/schema";
import { trackingClicks } from "@shared/tracking-schema";
import { eq, count, and, gte, lte, sql } from "drizzle-orm";
import { FraudService, type ClickData, type FraudAnalysisResult } from './fraudService';

interface AutoFraudTriggerConfig {
  ipClickThreshold: number; // Max clicks from same IP per hour
  conversionRateThreshold: number; // Min CR threshold to flag
  botScoreThreshold: number; // Bot detection score threshold  
  geoAnomalyThreshold: number; // Geographic inconsistency threshold
  enableAutoBlocking: boolean; // Auto-block suspicious IPs
  enableRealTimeAnalysis: boolean; // Real-time fraud detection
}

export class EnhancedFraudService extends FraudService {
  private static readonly DEFAULT_CONFIG: AutoFraudTriggerConfig = {
    ipClickThreshold: 50,
    conversionRateThreshold: 0.5,
    botScoreThreshold: 70,
    geoAnomalyThreshold: 80,
    enableAutoBlocking: true,
    enableRealTimeAnalysis: true
  };

  /**
   * Automatic fraud detection trigger - analyzes clicks in real-time
   */
  static async triggerAutoFraudDetection(clickData: ClickData, config: Partial<AutoFraudTriggerConfig> = {}): Promise<void> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      console.log('🔍 Auto fraud detection triggered for click:', clickData.clickId);
      
      // 1. Basic fraud analysis
      const fraudResult = await this.analyzeFraud(clickData);
      
      // 2. IP-based analysis
      const ipAnalysisResult = await this.analyzeIPBehavior(clickData.ip, finalConfig);
      
      // 3. Pattern analysis
      const patternResult = await this.analyzeTrafficPatterns(clickData, finalConfig);
      
      // 4. Update click with fraud data
      await this.updateClickFraudData(clickData.clickId, {
        ...fraudResult,
        fraudScore: Math.max(fraudResult.fraudScore, ipAnalysisResult.riskScore, patternResult.riskScore),
        reasons: [...fraudResult.reasons, ...ipAnalysisResult.reasons, ...patternResult.reasons]
      });
      
      // 5. Auto-blocking if configured
      if (finalConfig.enableAutoBlocking && fraudResult.fraudScore > finalConfig.botScoreThreshold) {
        await this.autoBlockSuspiciousIP(clickData.ip, fraudResult);
      }
      
      // 6. Create fraud report if high risk
      if (fraudResult.riskLevel === 'high') {
        await this.createAutoFraudReport(clickData, fraudResult);
      }
      
      console.log('✅ Auto fraud detection completed for click:', clickData.clickId);
      
    } catch (error) {
      console.error('❌ Auto fraud detection failed:', error);
    }
  }
  
  /**
   * Analyze IP behavior patterns
   */
  private static async analyzeIPBehavior(ip: string, config: AutoFraudTriggerConfig): Promise<{
    riskScore: number;
    reasons: string[];
    isBlocked: boolean;
  }> {
    const reasons: string[] = [];
    let riskScore = 0;
    
    try {
      // Check click frequency from this IP in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [recentClicks] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(and(
          eq(trackingClicks.ip, ip),
          gte(trackingClicks.createdAt, oneHourAgo)
        ));
      
      if (recentClicks.count > config.ipClickThreshold) {
        riskScore += 40;
        reasons.push(`High frequency clicks: ${recentClicks.count} clicks in 1 hour`);
      }
      
      // Check if IP is already blocked
      const [blockedIP] = await db
        .select({ count: count() })
        .from(fraudBlocks)
        .where(and(
          eq(fraudBlocks.ip, ip),
          eq(fraudBlocks.isActive, true)
        ));
      
      const isBlocked = blockedIP.count > 0;
      if (isBlocked) {
        riskScore += 60;
        reasons.push('IP is already blocked');
      }
      
      // Check IP analysis history
      try {
        const [ipHistory] = await db
          .select()
          .from(ipAnalysis)
          .where(eq(ipAnalysis.ip, ip))
          .limit(1);
        
        if (ipHistory && ipHistory.riskScore > 70) {
          riskScore += 30;
          reasons.push(`Historical high risk IP: ${ipHistory.riskScore}/100`);
        }
      } catch (error) {
        console.log('No IP history found for:', ip);
      }
      
      return { riskScore, reasons, isBlocked };
      
    } catch (error) {
      console.error('Error analyzing IP behavior:', error);
      return { riskScore: 0, reasons: [], isBlocked: false };
    }
  }
  
  /**
   * Analyze traffic patterns for anomalies
   */
  private static async analyzeTrafficPatterns(clickData: ClickData, config: AutoFraudTriggerConfig): Promise<{
    riskScore: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let riskScore = 0;
    
    try {
      // Analyze click-to-conversion patterns
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [totalClicks] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(gte(trackingClicks.createdAt, last24Hours));
      
      const [conversions] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(and(
          gte(trackingClicks.createdAt, last24Hours),
          eq(trackingClicks.status, 'converted')
        ));
      
      const conversionRate = totalClicks.count > 0 ? conversions.count / totalClicks.count : 0;
      
      if (conversionRate < config.conversionRateThreshold && totalClicks.count > 100) {
        riskScore += 25;
        reasons.push(`Low conversion rate: ${(conversionRate * 100).toFixed(2)}%`);
      }
      
      // Check for geographic anomalies
      if (clickData.country === 'XX' || clickData.country === '--' || !clickData.country) {
        riskScore += 20;
        reasons.push('Geographic data anomaly');
      }
      
      // Check for suspicious user agent patterns
      if (this.isSuspiciousUserAgent(clickData.userAgent)) {
        riskScore += 15;
        reasons.push('Suspicious user agent pattern');
      }
      
      return { riskScore, reasons };
      
    } catch (error) {
      console.error('Error analyzing traffic patterns:', error);
      return { riskScore: 0, reasons: [] };
    }
  }
  
  /**
   * Auto-block suspicious IPs
   */
  private static async autoBlockSuspiciousIP(ip: string, fraudResult: FraudAnalysisResult): Promise<void> {
    try {
      // Check if IP is already blocked
      const [existing] = await db
        .select()
        .from(fraudBlocks)
        .where(and(
          eq(fraudBlocks.ip, ip),
          eq(fraudBlocks.isActive, true)
        ))
        .limit(1);
      
      if (existing) {
        console.log(`IP ${ip} already blocked`);
        return;
      }
      
      // Create new fraud block
      await db.insert(fraudBlocks).values({
        type: 'ip',
        value: ip,
        reason: `Auto-blocked: ${fraudResult.reasons.join(', ')}`,
        riskScore: fraudResult.fraudScore,
        isActive: true,
        createdBy: 'system_auto',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      console.log(`🚫 Auto-blocked suspicious IP: ${ip} (score: ${fraudResult.fraudScore})`);
      
    } catch (error) {
      console.error('Error auto-blocking IP:', error);
    }
  }
  
  /**
   * Create automatic fraud report
   */
  private static async createAutoFraudReport(clickData: ClickData, fraudResult: FraudAnalysisResult): Promise<void> {
    try {
      await db.insert(fraudReports).values({
        type: 'auto_detection',
        ip: clickData.ip,
        clickId: clickData.clickId,
        description: `Auto-detected high risk activity: ${fraudResult.reasons.join(', ')}`,
        riskScore: fraudResult.fraudScore,
        data: JSON.stringify({
          clickData,
          fraudResult,
          timestamp: new Date().toISOString(),
          source: 'auto_fraud_detection'
        }),
        status: 'pending',
        severity: fraudResult.riskLevel === 'high' ? 'high' : 'medium',
        reportedBy: 'system_auto'
      });
      
      console.log(`📊 Created auto fraud report for click: ${clickData.clickId}`);
      
    } catch (error) {
      console.error('Error creating auto fraud report:', error);
    }
  }
  
  /**
   * Check for suspicious user agent patterns
   */
  private static isSuspiciousUserAgent(userAgent: string): boolean {
    if (!userAgent) return true;
    
    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i,
      /perl/i,
      /ruby/i,
      /httpclient/i,
      /postman/i,
      /insomnia/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
  
  /**
   * Get real-time fraud statistics
   */
  static async getRealTimeFraudStats(): Promise<any> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const [totalClicks] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(gte(trackingClicks.createdAt, last24Hours));
      
      const [botClicks] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(and(
          gte(trackingClicks.createdAt, last24Hours),
          eq(trackingClicks.isBot, true)
        ));
      
      const [fraudClicks] = await db
        .select({ count: count() })
        .from(trackingClicks)
        .where(and(
          gte(trackingClicks.createdAt, last24Hours),
          gte(trackingClicks.fraudScore, 70)
        ));
      
      const [blockedIPs] = await db
        .select({ count: count() })
        .from(fraudBlocks)
        .where(eq(fraudBlocks.isActive, true));
      
      const [pendingReports] = await db
        .select({ count: count() })
        .from(fraudReports)
        .where(eq(fraudReports.status, 'pending'));
      
      const botRate = totalClicks.count > 0 ? (botClicks.count / totalClicks.count) * 100 : 0;
      const fraudRate = totalClicks.count > 0 ? (fraudClicks.count / totalClicks.count) * 100 : 0;
      
      return {
        totalClicks: totalClicks.count,
        botClicks: botClicks.count,
        fraudClicks: fraudClicks.count,
        blockedIPs: blockedIPs.count,
        pendingReports: pendingReports.count,
        botRate: Math.round(botRate * 100) / 100,
        fraudRate: Math.round(fraudRate * 100) / 100,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error getting real-time fraud stats:', error);
      return {
        totalClicks: 0,
        botClicks: 0,
        fraudClicks: 0,
        blockedIPs: 0,
        pendingReports: 0,
        botRate: 0,
        fraudRate: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}