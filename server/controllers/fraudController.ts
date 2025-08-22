import { Request, Response } from 'express';
import { db } from '../db';
import { fraudAlerts, fraudBlocks, ipAnalysis, users, conversionData } from '@shared/schema';
import { trackingClicks } from '@shared/tracking-schema';
import { eq, desc, and, or, gte, lte, sql, count, sum } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { applyOwnerIdFilter } from '../middleware/authorization';
import { EnhancedFraudService } from '../services/enhancedFraudService';

export class FraudController {
  /**
   * Get fraud alerts with filtering
   */
  static async getFraudAlerts(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        page = 1,
        limit = 20,
        severity,
        status,
        fromDate,
        toDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build base query
      let query = db
        .select({
          id: fraudAlerts.id,
          type: fraudAlerts.type,
          severity: fraudAlerts.severity,
          description: fraudAlerts.description,
          data: fraudAlerts.data,
          status: fraudAlerts.status,
          resolution: fraudAlerts.resolution,
          createdAt: fraudAlerts.createdAt,
          resolvedAt: fraudAlerts.resolvedAt,
          resolvedBy: fraudAlerts.resolvedBy
        })
        .from(fraudAlerts);

      // Apply ownership filtering
      query = applyOwnerIdFilter(query, currentUser, fraudAlerts);

      // Apply filters
      const conditions = [];
      
      if (severity) {
        conditions.push(eq(fraudAlerts.severity, severity as string));
      }
      
      if (status) {
        conditions.push(eq(fraudAlerts.status, status as string));
      }
      
      if (fromDate) {
        conditions.push(gte(fraudAlerts.createdAt, new Date(fromDate as string)));
      }
      
      if (toDate) {
        conditions.push(lte(fraudAlerts.createdAt, new Date(toDate as string)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      const sortField = fraudAlerts[sortBy as keyof typeof fraudAlerts] || fraudAlerts.createdAt;
      query = query.orderBy(
        sortOrder === 'asc' ? sortField : desc(sortField)
      );

      // Apply pagination
      query = query.limit(Number(limit)).offset(offset);

      const results = await query;

      // Get total count
      const [countResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(fraudAlerts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / Number(limit));

      auditLog(req, 'GET_FRAUD_ALERTS', 'fraud_alerts');

      res.json({
        alerts: results,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Run fraud analysis on a specific click or conversion
   */
  static async runFraudAnalysis(req: Request, res: Response) {
    try {
      const { id, type } = req.params; // type: 'click' or 'conversion'
      const currentUser = (req as any).user;

      let analysisResult;

      if (type === 'click') {
        // Get click data
        const [clickData] = await db
          .select()
          .from(trackingClicks)
          .where(eq(trackingClicks.id, id))
          .limit(1);

        if (!clickData) {
          return res.status(404).json({ error: 'Click not found' });
        }

        // Run fraud analysis
        analysisResult = await EnhancedFraudService.analyzeClick({
          ip: clickData.ip || '',
          userAgent: clickData.userAgent || '',
          partnerId: clickData.partnerId,
          offerId: clickData.offerId,
          clickId: clickData.clickId,
          timestamp: clickData.createdAt
        });

      } else if (type === 'conversion') {
        // Get conversion data
        const [conversionResult] = await db
          .select()
          .from(conversionData)
          .where(eq(conversionData.id, id))
          .limit(1);

        if (!conversionResult) {
          return res.status(404).json({ error: 'Conversion not found' });
        }

        // Get associated click data
        const [clickData] = await db
          .select()
          .from(trackingClicks)
          .where(eq(trackingClicks.clickId, conversionResult.clickId))
          .limit(1);

        // Run fraud analysis
        analysisResult = await EnhancedFraudService.analyzeConversion({
          conversionId: conversionResult.id,
          clickId: conversionResult.clickId,
          ip: clickData?.ip || '',
          userAgent: clickData?.userAgent || '',
          partnerId: conversionResult.partnerId,
          offerId: conversionResult.offerId,
          revenue: Number(conversionResult.revenue),
          timestamp: conversionResult.createdAt
        });

      } else {
        return res.status(400).json({ error: 'Invalid analysis type. Use "click" or "conversion"' });
      }

      auditLog(req, 'RUN_FRAUD_ANALYSIS', `${type}s`, true, {
        analysisId: id,
        type,
        fraudScore: analysisResult.fraudScore
      });

      res.json({
        analysisResult,
        message: 'Fraud analysis completed'
      });

    } catch (error) {
      console.error('Run fraud analysis error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get fraud statistics and summary
   */
  static async getFraudStats(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { period = '30d' } = req.query;

      // Calculate date range
      let startDate = new Date();
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Get fraud alerts summary
      const [alertsStats] = await db
        .select({
          totalAlerts: count(fraudAlerts.id).mapWith(Number),
          highSeverityAlerts: sql<number>`COUNT(CASE WHEN severity = 'high' THEN 1 END)`,
          mediumSeverityAlerts: sql<number>`COUNT(CASE WHEN severity = 'medium' THEN 1 END)`,
          lowSeverityAlerts: sql<number>`COUNT(CASE WHEN severity = 'low' THEN 1 END)`,
          pendingAlerts: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
          resolvedAlerts: sql<number>`COUNT(CASE WHEN status = 'resolved' THEN 1 END)`
        })
        .from(fraudAlerts)
        .where(gte(fraudAlerts.createdAt, startDate));

      // Get blocked IPs
      const [blockedIPs] = await db
        .select({
          totalBlockedIPs: count(fraudBlocks.id).mapWith(Number),
          activeBlocks: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`,
          expiredBlocks: sql<number>`COUNT(CASE WHEN is_active = false THEN 1 END)`
        })
        .from(fraudBlocks)
        .where(
          and(
            eq(fraudBlocks.type, 'ip'),
            gte(fraudBlocks.createdAt, startDate)
          )
        );

      // Get fraud analysis results (from tracking clicks with high fraud scores)
      const [fraudClicks] = await db
        .select({
          totalClicks: count(trackingClicks.id).mapWith(Number),
          fraudulentClicks: sql<number>`COUNT(CASE WHEN fraud_score > 60 THEN 1 END)`,
          suspiciousClicks: sql<number>`COUNT(CASE WHEN fraud_score BETWEEN 30 AND 60 THEN 1 END)`,
          cleanClicks: sql<number>`COUNT(CASE WHEN fraud_score < 30 THEN 1 END)`,
          avgFraudScore: sql<number>`AVG(fraud_score)`,
          botClicks: sql<number>`COUNT(CASE WHEN is_bot = true THEN 1 END)`,
          vpnClicks: sql<number>`COUNT(CASE WHEN vpn_detected = true THEN 1 END)`
        })
        .from(trackingClicks)
        .where(gte(trackingClicks.createdAt, startDate));

      // Calculate fraud rate
      const fraudRate = fraudClicks.totalClicks > 0 
        ? (fraudClicks.fraudulentClicks / fraudClicks.totalClicks * 100).toFixed(2)
        : '0.00';

      // Get most blocked countries/IPs
      const topBlockedCountries = await db
        .select({
          country: ipAnalysis.country,
          blockCount: count(fraudBlocks.id).mapWith(Number)
        })
        .from(fraudBlocks)
        .leftJoin(ipAnalysis, eq(fraudBlocks.value, ipAnalysis.ip))
        .where(
          and(
            eq(fraudBlocks.type, 'ip'),
            eq(fraudBlocks.isActive, true),
            gte(fraudBlocks.createdAt, startDate)
          )
        )
        .groupBy(ipAnalysis.country)
        .orderBy(desc(count(fraudBlocks.id)))
        .limit(10);

      const stats = {
        period: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        },
        alerts: alertsStats,
        blocks: blockedIPs,
        clicks: fraudClicks,
        fraudRate: Number(fraudRate),
        topBlockedCountries
      };

      auditLog(req, 'GET_FRAUD_STATS', 'fraud_analytics');

      res.json({ stats });
    } catch (error) {
      console.error('Get fraud stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Block IP address
   */
  static async blockIP(req: Request, res: Response) {
    try {
      const { ip, reason, duration } = req.body;
      const currentUser = (req as any).user;

      if (!ip) {
        return res.status(400).json({ error: 'IP address required' });
      }

      // Calculate expiration date
      let expiresAt: Date | null = null;
      if (duration && duration > 0) {
        expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // duration in days
      }

      // Insert fraud block
      const [fraudBlock] = await db
        .insert(fraudBlocks)
        .values({
          type: 'ip',
          value: ip,
          reason: reason || 'Manual block',
          isActive: true,
          createdBy: currentUser.id,
          expiresAt,
          createdAt: new Date()
        })
        .returning();

      auditLog(req, 'BLOCK_IP', 'fraud_blocks', true, {
        ip,
        reason,
        duration,
        blockId: fraudBlock.id
      });

      res.json({
        block: fraudBlock,
        message: 'IP address blocked successfully'
      });
    } catch (error) {
      console.error('Block IP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Unblock IP address
   */
  static async unblockIP(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const [fraudBlock] = await db
        .update(fraudBlocks)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(fraudBlocks.id, id))
        .returning();

      if (!fraudBlock) {
        return res.status(404).json({ error: 'Block not found' });
      }

      auditLog(req, 'UNBLOCK_IP', 'fraud_blocks', true, {
        blockId: id,
        ip: fraudBlock.value
      });

      res.json({
        block: fraudBlock,
        message: 'IP address unblocked successfully'
      });
    } catch (error) {
      console.error('Unblock IP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update fraud alert status
   */
  static async updateAlertStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      const currentUser = (req as any).user;

      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = currentUser.id;
        if (resolution) {
          updateData.resolution = resolution;
        }
      }

      const [fraudAlert] = await db
        .update(fraudAlerts)
        .set(updateData)
        .where(eq(fraudAlerts.id, id))
        .returning();

      if (!fraudAlert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      auditLog(req, 'UPDATE_FRAUD_ALERT', 'fraud_alerts', true, {
        alertId: id,
        oldStatus: fraudAlert.status,
        newStatus: status
      });

      res.json({
        alert: fraudAlert,
        message: 'Alert status updated successfully'
      });
    } catch (error) {
      console.error('Update alert status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get fraud configuration
   */
  static async getFraudConfig(req: Request, res: Response) {
    try {
      // This would typically come from a database table or config file
      const config = {
        autoBlocking: {
          enabled: true,
          ipClickThreshold: 100,
          conversionRateThreshold: 15.0,
          botScoreThreshold: 70,
          geoAnomalyThreshold: 80
        },
        riskThresholds: {
          low: 30,
          medium: 60,
          high: 80
        },
        blockDurations: {
          temporary: 24, // hours
          standard: 168, // hours (7 days)
          permanent: null // never expires
        },
        enabledChecks: {
          ipAnalysis: true,
          userAgentAnalysis: true,
          geoValidation: true,
          vpnDetection: true,
          botDetection: true
        }
      };

      auditLog(req, 'GET_FRAUD_CONFIG', 'fraud_config');

      res.json({ config });
    } catch (error) {
      console.error('Get fraud config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update fraud configuration
   */
  static async updateFraudConfig(req: Request, res: Response) {
    try {
      const { config } = req.body;
      const currentUser = (req as any).user;

      // In a real implementation, this would update a database table or config file
      // For now, we'll just validate and return the config

      if (!config) {
        return res.status(400).json({ error: 'Configuration required' });
      }

      auditLog(req, 'UPDATE_FRAUD_CONFIG', 'fraud_config', true, {
        config
      });

      res.json({
        config,
        message: 'Fraud configuration updated successfully'
      });
    } catch (error) {
      console.error('Update fraud config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}