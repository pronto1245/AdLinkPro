import express from 'express';
import { storage } from '../../storage';
import { db } from '../../db';
import { 
  fraudAlerts, 
  fraudReports, 
  fraudBlocks, 
  fraudRules, 
  users, 
  offers,
  type InsertFraudReport,
  type InsertFraudRule,
  type FraudReport,
  type FraudBlock,
  type FraudRule
} from '@shared/schema';
import { eq, count, and, gte, lte, desc, or, isNull, sql } from 'drizzle-orm';
import { FraudService } from '../../services/fraudService';
import { EnhancedFraudService } from '../../services/enhancedFraudService';

const router = express.Router();

/**
 * GET /api/admin/fraud-alerts
 * Get all fraud alerts with filtering and pagination
 */
router.get('/fraud-alerts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      severity, 
      status, 
      type, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Build query conditions
    let whereConditions = [];
    
    if (severity && severity !== 'all') {
      whereConditions.push(eq(fraudAlerts.severity, severity as string));
    }
    
    if (status && status !== 'all') {
      if (status === 'resolved') {
        whereConditions.push(eq(fraudAlerts.isResolved, true));
      } else if (status === 'pending') {
        whereConditions.push(eq(fraudAlerts.isResolved, false));
      }
    }
    
    if (type && type !== 'all') {
      whereConditions.push(eq(fraudAlerts.type, type as string));
    }
    
    if (dateFrom) {
      whereConditions.push(gte(fraudAlerts.createdAt, new Date(dateFrom as string)));
    }
    
    if (dateTo) {
      whereConditions.push(lte(fraudAlerts.createdAt, new Date(dateTo as string)));
    }

    // Get alerts with user and offer details
    const alertsQuery = db
      .select({
        id: fraudAlerts.id,
        type: fraudAlerts.type,
        severity: fraudAlerts.severity,
        description: fraudAlerts.description,
        data: fraudAlerts.data,
        isResolved: fraudAlerts.isResolved,
        createdAt: fraudAlerts.createdAt,
        resolvedAt: fraudAlerts.resolvedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        },
        offer: {
          id: offers.id,
          name: offers.name,
          category: offers.category
        }
      })
      .from(fraudAlerts)
      .leftJoin(users, eq(fraudAlerts.userId, users.id))
      .leftJoin(offers, eq(fraudAlerts.offerId, offers.id));

    if (whereConditions.length > 0) {
      alertsQuery.where(and(...whereConditions));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      alertsQuery.where(
        or(
          sql`${fraudAlerts.description} ILIKE ${searchTerm}`,
          sql`${users.username} ILIKE ${searchTerm}`,
          sql`${users.email} ILIKE ${searchTerm}`,
          sql`${offers.name} ILIKE ${searchTerm}`
        )
      );
    }

    const alerts = await alertsQuery
      .orderBy(desc(fraudAlerts.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(fraudAlerts)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    res.json({
      data: alerts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error getting fraud alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/fraud-alerts/:id
 * Get specific fraud alert details
 */
router.get('/fraud-alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await db
      .select({
        id: fraudAlerts.id,
        type: fraudAlerts.type,
        severity: fraudAlerts.severity,
        description: fraudAlerts.description,
        data: fraudAlerts.data,
        isResolved: fraudAlerts.isResolved,
        createdAt: fraudAlerts.createdAt,
        resolvedAt: fraudAlerts.resolvedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        },
        offer: {
          id: offers.id,
          name: offers.name,
          category: offers.category,
          description: offers.description
        }
      })
      .from(fraudAlerts)
      .leftJoin(users, eq(fraudAlerts.userId, users.id))
      .leftJoin(offers, eq(fraudAlerts.offerId, offers.id))
      .where(eq(fraudAlerts.id, id))
      .limit(1);

    if (alert.length === 0) {
      return res.status(404).json({ error: 'Fraud alert not found' });
    }

    res.json(alert[0]);

  } catch (error) {
    console.error('Error getting fraud alert details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/fraud-alerts/:id
 * Update fraud alert status (resolve/unresolve)
 */
router.patch('/fraud-alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved, resolvedBy, notes } = req.body;

    const updateData: any = {
      isResolved: isResolved,
      updatedAt: new Date()
    };

    if (isResolved) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = resolvedBy;
    } else {
      updateData.resolvedAt = null;
      updateData.resolvedBy = null;
    }

    if (notes) {
      updateData.resolvedNotes = notes;
    }

    const [updatedAlert] = await db
      .update(fraudAlerts)
      .set(updateData)
      .where(eq(fraudAlerts.id, id))
      .returning();

    if (!updatedAlert) {
      return res.status(404).json({ error: 'Fraud alert not found' });
    }

    res.json(updatedAlert);

  } catch (error) {
    console.error('Error updating fraud alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/fraud-metrics
 * Get fraud detection metrics and statistics
 */
router.get('/fraud-metrics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let dateFrom: Date;
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
      default:
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get active alerts count
    const [activeAlertsResult] = await db
      .select({ count: count() })
      .from(fraudAlerts)
      .where(and(
        eq(fraudAlerts.isResolved, false),
        gte(fraudAlerts.createdAt, dateFrom)
      ));

    // Get fraud rate from storage
    const fraudStats = await storage.getFraudStats({ dateFrom, dateTo: now });

    // Get blocked revenue (estimated)
    const [blockedRevenueResult] = await db
      .select({ count: count() })
      .from(fraudBlocks)
      .where(and(
        eq(fraudBlocks.isActive, true),
        gte(fraudBlocks.createdAt, dateFrom)
      ));

    // Calculate blocked revenue estimate (mock calculation)
    const blockedRevenue = blockedRevenueResult.count * 150; // Avg $150 per blocked fraud

    // Get resolved today count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [resolvedTodayResult] = await db
      .select({ count: count() })
      .from(fraudAlerts)
      .where(and(
        eq(fraudAlerts.isResolved, true),
        gte(fraudAlerts.resolvedAt, todayStart)
      ));

    const metrics = {
      activeAlerts: activeAlertsResult.count,
      fraudRate: fraudStats.fraudRate || 0,
      blockedRevenue: blockedRevenue,
      resolvedToday: resolvedTodayResult.count,
      period: period,
      totalReports: fraudStats.totalReports || 0,
      blockedTransactions: fraudStats.blockedAmount || 0,
      savedAmount: fraudStats.savedAmount || 0
    };

    res.json(metrics);

  } catch (error) {
    console.error('Error getting fraud metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/fraud-stats
 * Get comprehensive fraud statistics (real data from storage)
 */
router.get('/fraud-stats', async (req, res) => {
  try {
    const filters = req.query;
    const fraudStats = await storage.getFraudStats(filters);
    res.json(fraudStats);
  } catch (error) {
    console.error('Error getting fraud stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/smart-alerts
 * Get dynamic smart alerts based on fraud patterns
 */
router.get('/smart-alerts', async (req, res) => {
  try {
    // Get real-time fraud statistics from EnhancedFraudService
    const realtimeStats = await EnhancedFraudService.getRealTimeFraudStats();
    
    const smartAlerts = [];

    // High fraud rate alert
    if (realtimeStats.fraudRate > 5) {
      smartAlerts.push({
        id: 'high-fraud-rate',
        type: 'warning',
        severity: 'high',
        title: 'High Fraud Rate Detected',
        message: `Current fraud rate is ${realtimeStats.fraudRate}% - above normal threshold`,
        action: 'Review recent traffic patterns',
        data: { currentRate: realtimeStats.fraudRate }
      });
    }

    // High bot traffic alert
    if (realtimeStats.botRate > 15) {
      smartAlerts.push({
        id: 'high-bot-traffic',
        type: 'warning', 
        severity: 'medium',
        title: 'High Bot Traffic',
        message: `Bot traffic is ${realtimeStats.botRate}% - consider tightening filters`,
        action: 'Review bot detection rules',
        data: { botRate: realtimeStats.botRate }
      });
    }

    // Blocked IPs threshold alert
    if (realtimeStats.blockedIPs > 100) {
      smartAlerts.push({
        id: 'blocked-ips-high',
        type: 'info',
        severity: 'low',
        title: 'High Number of Blocked IPs',
        message: `${realtimeStats.blockedIPs} IPs currently blocked`,
        action: 'Review IP blocking policies',
        data: { blockedIPs: realtimeStats.blockedIPs }
      });
    }

    // Pending reports alert
    if (realtimeStats.pendingReports > 10) {
      smartAlerts.push({
        id: 'pending-reports',
        type: 'action_required',
        severity: 'medium', 
        title: 'Pending Fraud Reports',
        message: `${realtimeStats.pendingReports} fraud reports require review`,
        action: 'Review pending reports',
        data: { pendingReports: realtimeStats.pendingReports }
      });
    }

    res.json(smartAlerts);

  } catch (error) {
    console.error('Error getting smart alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/fraud-blocks
 * Create new fraud block (IP, user, etc.)
 */
router.post('/fraud-blocks', async (req, res) => {
  try {
    const { type, targetId, reason, duration, autoBlocked = false } = req.body;

    if (!type || !targetId || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, targetId, reason' 
      });
    }

    // Calculate expiration date if duration provided
    let expiresAt: Date | null = null;
    if (duration && duration > 0) {
      expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000); // duration in hours
    }

    const [newBlock] = await db.insert(fraudBlocks).values({
      type,
      targetId,
      reason,
      isActive: true,
      autoBlocked,
      expiresAt,
      blockedBy: req.user?.id || 'system',
      createdAt: new Date()
    }).returning();

    // Log the audit event
    console.log(`Fraud block created: ${type} ${targetId} - ${reason}`);

    res.status(201).json(newBlock);

  } catch (error) {
    console.error('Error creating fraud block:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/fraud-reports
 * Get fraud reports with filtering and search
 */
router.get('/fraud-reports', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      severity,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let whereConditions = [];
    
    if (status && status !== 'all') {
      whereConditions.push(eq(fraudReports.status, status as string));
    }
    
    if (type && type !== 'all') {
      whereConditions.push(eq(fraudReports.type, type as string));
    }
    
    if (severity && severity !== 'all') {
      whereConditions.push(eq(fraudReports.severity, severity as string));
    }
    
    if (dateFrom) {
      whereConditions.push(gte(fraudReports.createdAt, new Date(dateFrom as string)));
    }
    
    if (dateTo) {
      whereConditions.push(lte(fraudReports.createdAt, new Date(dateTo as string)));
    }

    let query = db
      .select({
        id: fraudReports.id,
        type: fraudReports.type,
        severity: fraudReports.severity,
        description: fraudReports.description,
        status: fraudReports.status,
        ip: fraudReports.ip,
        riskScore: fraudReports.riskScore,
        data: fraudReports.data,
        createdAt: fraudReports.createdAt,
        updatedAt: fraudReports.updatedAt,
        reportedBy: fraudReports.reportedBy
      })
      .from(fraudReports);

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          sql`${fraudReports.description} ILIKE ${searchTerm}`,
          sql`${fraudReports.ip} ILIKE ${searchTerm}`,
          sql`${fraudReports.reportedBy} ILIKE ${searchTerm}`
        )
      );
    }

    const reports = await query
      .orderBy(desc(fraudReports.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(fraudReports)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    res.json({
      data: reports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error getting fraud reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/fraud-rules/:id
 * Delete fraud rule with dependency check
 */
router.delete('/fraud-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use storage method which includes dependency checking
    await storage.deleteFraudRule(id);
    
    res.json({ success: true, message: 'Fraud rule deleted successfully' });

  } catch (error) {
    console.error('Error deleting fraud rule:', error);
    
    if (error.message?.includes('Cannot delete rule')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;