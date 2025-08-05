import { db } from "../db";
import { trackingClicks, fraudAlerts } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface FraudAnalysisResult {
  fraudScore: number;
  isBot: boolean;
  vpnDetected: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export interface ClickData {
  ip: string;
  userAgent: string;
  country: string;
  device: string;
  browser: string;
  referer?: string;
  clickId: string;
}

export class FraudService {
  private static readonly FRAUD_SCORE_THRESHOLD_HIGH = 70;
  private static readonly FRAUD_SCORE_THRESHOLD_MEDIUM = 40;
  
  // Known bot user agents patterns
  private static readonly BOT_PATTERNS = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /python/i, /curl/i, /wget/i, /http/i,
    /facebook/i, /twitter/i, /linkedin/i,
    /googlebot/i, /bingbot/i, /yandexbot/i
  ];

  // Suspicious IP ranges (simplified)
  private static readonly SUSPICIOUS_IP_RANGES = [
    /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^127\./, /^0\./, /^169\.254\./
  ];

  /**
   * Analyze click for fraud indicators
   */
  static async analyzeFraud(clickData: ClickData): Promise<FraudAnalysisResult> {
    const reasons: string[] = [];
    let fraudScore = 0;
    let isBot = false;
    let vpnDetected = false;

    // Bot detection
    if (this.detectBot(clickData.userAgent)) {
      isBot = true;
      fraudScore += 50;
      reasons.push('Bot user agent detected');
    }

    // VPN/Proxy detection (simplified)
    if (this.detectVPN(clickData.ip)) {
      vpnDetected = true;
      fraudScore += 30;
      reasons.push('VPN/Proxy IP detected');
    }

    // Suspicious patterns
    if (this.detectSuspiciousPatterns(clickData)) {
      fraudScore += 25;
      reasons.push('Suspicious traffic patterns');
    }

    // Geographic inconsistencies
    if (this.detectGeoInconsistency(clickData)) {
      fraudScore += 20;
      reasons.push('Geographic inconsistency');
    }

    // Device/Browser inconsistencies
    if (this.detectDeviceInconsistency(clickData)) {
      fraudScore += 15;
      reasons.push('Device/Browser inconsistency');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (fraudScore >= this.FRAUD_SCORE_THRESHOLD_HIGH) {
      riskLevel = 'high';
    } else if (fraudScore >= this.FRAUD_SCORE_THRESHOLD_MEDIUM) {
      riskLevel = 'medium';
    }

    return {
      fraudScore: Math.min(fraudScore, 100),
      isBot,
      vpnDetected,
      riskLevel,
      reasons
    };
  }

  /**
   * Detect bot user agents
   */
  private static detectBot(userAgent: string): boolean {
    if (!userAgent) return true;
    
    return this.BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  }

  /**
   * Detect VPN/Proxy IPs (simplified implementation)
   */
  private static detectVPN(ip: string): boolean {
    if (!ip) return false;
    
    // Check for private/local IPs
    if (this.SUSPICIOUS_IP_RANGES.some(range => range.test(ip))) {
      return true;
    }

    // In production, integrate with IP intelligence services like:
    // - MaxMind GeoIP2
    // - IP2Location
    // - IPQualityScore
    // - Fraud.net
    
    return false;
  }

  /**
   * Detect suspicious traffic patterns
   */
  private static detectSuspiciousPatterns(clickData: ClickData): boolean {
    // No referer (direct traffic can be suspicious)
    if (!clickData.referer) {
      return true;
    }

    // Very old or unusual browsers
    const userAgent = clickData.userAgent?.toLowerCase() || '';
    if (userAgent.includes('msie') || userAgent.includes('netscape')) {
      return true;
    }

    return false;
  }

  /**
   * Detect geographic inconsistencies
   */
  private static detectGeoInconsistency(clickData: ClickData): boolean {
    // Simplified: check if country matches IP geolocation
    // In production, use proper IP geolocation services
    
    const suspiciousCountries = ['XX', 'ZZ', '--'];
    return suspiciousCountries.includes(clickData.country);
  }

  /**
   * Detect device/browser inconsistencies
   */
  private static detectDeviceInconsistency(clickData: ClickData): boolean {
    const userAgent = clickData.userAgent?.toLowerCase() || '';
    const device = clickData.device?.toLowerCase() || '';
    const browser = clickData.browser?.toLowerCase() || '';

    // Mobile device but desktop browser
    if (device.includes('mobile') && userAgent.includes('windows')) {
      return true;
    }

    // iOS device but Android browser
    if (device.includes('iphone') && userAgent.includes('android')) {
      return true;
    }

    return false;
  }

  /**
   * Update click with fraud analysis results
   */
  static async updateClickFraudData(clickId: string, result: FraudAnalysisResult): Promise<void> {
    try {
      await db
        .update(trackingClicks)
        .set({
          fraudScore: result.fraudScore,
          isBot: result.isBot,
          vpnDetected: result.vpnDetected,
          riskLevel: result.riskLevel
        })
        .where(eq(trackingClicks.clickId, clickId));

      // Create fraud alert if high risk
      if (result.riskLevel === 'high') {
        await db.insert(fraudAlerts).values({
          type: 'high_risk_click',
          description: `High risk click detected: ${result.reasons.join(', ')}`,
          data: { clickId, fraudScore: result.fraudScore, reasons: result.reasons },
          severity: 'high',
          isResolved: false
        });
      }
    } catch (error) {
      console.error('Error updating click fraud data:', error);
    }
  }

  /**
   * Get fraud statistics for analytics
   */
  static async getFraudStats(filters: any = {}) {
    try {
      const query = db.select().from(trackingClicks);
      
      // Apply date filters if provided
      if (filters.dateFrom && filters.dateTo) {
        // Add date filtering logic here
      }

      const clicks = await query;
      
      const totalClicks = clicks.length;
      const fraudClicks = clicks.filter(c => c.fraudScore && c.fraudScore > 50).length;
      const botClicks = clicks.filter(c => c.isBot).length;
      const vpnClicks = clicks.filter(c => c.vpnDetected).length;
      
      return {
        totalClicks,
        fraudClicks,
        botClicks,
        vpnClicks,
        fraudRate: totalClicks > 0 ? (fraudClicks / totalClicks) * 100 : 0,
        botRate: totalClicks > 0 ? (botClicks / totalClicks) * 100 : 0,
        vpnRate: totalClicks > 0 ? (vpnClicks / totalClicks) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting fraud stats:', error);
      return {
        totalClicks: 0,
        fraudClicks: 0,
        botClicks: 0,
        vpnClicks: 0,
        fraudRate: 0,
        botRate: 0,
        vpnRate: 0
      };
    }
  }

  /**
   * Integrate with third-party fraud detection services
   */
  static async checkThirdPartyServices(clickData: ClickData): Promise<Partial<FraudAnalysisResult>> {
    // Placeholder for third-party integrations:
    // - FraudScore API
    // - Forensiq
    // - Anura
    // - Botbox
    
    try {
      // Example integration (disabled by default)
      // const fraudScoreResult = await this.checkFraudScore(clickData.ip);
      // const anuranResult = await this.checkAnura(clickData);
      
      return {
        fraudScore: 0,
        reasons: ['Third-party services not configured']
      };
    } catch (error) {
      console.error('Third-party fraud check failed:', error);
      return {
        fraudScore: 0,
        reasons: ['Third-party check failed']
      };
    }
  }

  /**
   * Example FraudScore API integration (placeholder)
   */
  private static async checkFraudScore(ip: string): Promise<number> {
    // Integrate with FraudScore API
    // const response = await fetch(`https://api.fraudscore.com/check?ip=${ip}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.FRAUDSCORE_API_KEY}` }
    // });
    // const data = await response.json();
    // return data.fraud_score;
    
    return 0;
  }

  /**
   * Example Anura API integration (placeholder)
   */
  private static async checkAnura(clickData: ClickData): Promise<any> {
    // Integrate with Anura API
    // const response = await fetch('https://api.anura.io/direct/check', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.ANURA_API_KEY}` },
    //   body: JSON.stringify({
    //     ip: clickData.ip,
    //     user_agent: clickData.userAgent,
    //     referer: clickData.referer
    //   })
    // });
    // return await response.json();
    
    return {};
  }
}