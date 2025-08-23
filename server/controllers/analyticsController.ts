import { Request, Response } from 'express';
import { db, queryCache } from '../db';
import { 
  users, offers, partnerOffers, trackingClicks, conversionData, 
  analyticsData, statistics, transactions 
} from '@shared/schema';
import { eq, desc, and, gte, lte, sql, sum, count, avg } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { applyOwnerIdFilter } from '../middleware/authorization';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
}

export class AnalyticsController {
  /**
   * Get commission data with filtering and caching
   */
  static async getCommissionData(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      const {
        period = '30d',
        partnerId,
        offerId,
        fromDate,
        toDate,
        groupBy = 'day'
      } = req.query;

      // Create cache key
      const cacheKey = `commission_data_${currentUser.id}_${period}_${partnerId || 'all'}_${offerId || 'all'}_${groupBy}`;

      // Try to get from cache (5 minutes)
      const cached = queryCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Calculate date range
      let startDate = new Date();
      let endDate = new Date();

      if (fromDate && toDate) {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      } else {
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
          case '1y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
      }

      // Base query for conversion data
      let query = db
        .select({
          date: sql<string>`DATE_TRUNC('${sql.raw(groupBy)}', ${conversionData.createdAt}) as date`,
          revenue: sum(conversionData.revenue).mapWith(Number),
          payout: sum(conversionData.payout).mapWith(Number),
          commission: sql<number>`SUM(${conversionData.revenue} - ${conversionData.payout})`,
          conversions: count(conversionData.id).mapWith(Number),
          clicks: count(trackingClicks.id).mapWith(Number),
          partnerId: conversionData.partnerId,
          offerId: conversionData.offerId
        })
        .from(conversionData)
        .leftJoin(trackingClicks, eq(conversionData.clickId, trackingClicks.clickId))
        .where(
          and(
            gte(conversionData.createdAt, startDate),
            lte(conversionData.createdAt, endDate)
          )
        );

      // Apply ownership filtering
      query = applyOwnerIdFilter(query, currentUser, conversionData);

      // Apply additional filters
      if (partnerId) {
        query = query.where(eq(conversionData.partnerId, partnerId as string));
      }

      if (offerId) {
        query = query.where(eq(conversionData.offerId, offerId as string));
      }

      // Group by date and other fields
      query = query.groupBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${conversionData.createdAt})`,
        conversionData.partnerId,
        conversionData.offerId
      );

      const results = await query;

      // Calculate totals
      const totals = results.reduce((acc, row) => {
        acc.totalRevenue += row.revenue || 0;
        acc.totalPayout += row.payout || 0;
        acc.totalCommission += row.commission || 0;
        acc.totalConversions += row.conversions || 0;
        acc.totalClicks += row.clicks || 0;
        return acc;
      }, {
        totalRevenue: 0,
        totalPayout: 0,
        totalCommission: 0,
        totalConversions: 0,
        totalClicks: 0
      });

      const responseData = {
        data: results,
        totals,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy
        }
      };

      // Cache for 5 minutes (300000ms)
      queryCache.set(cacheKey, responseData, 300000);

      auditLog(req, 'GET_COMMISSION_DATA', 'analytics');

      res.json(responseData);
    } catch (error) {
      console.error('Get commission data error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get financial chart data
   */
  static async getFinancialChart(req: AuthenticatedRequest, res: Response) {
    try {
      const { period } = req.params;
      const currentUser = req.user;
      const {
        partnerId,
        offerId,
        fromDate,
        toDate,
        metric = 'revenue' // 'revenue', 'payout', 'commission', 'netflow'
      } = req.query;

      // Create cache key
      const cacheKey = `financial_chart_${currentUser.id}_${period}_${metric}_${partnerId || 'all'}_${offerId || 'all'}`;

      // Try to get from cache (10 minutes)
      const cached = queryCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Calculate date range and grouping
      let startDate = new Date();
      let endDate = new Date();
      let groupBy = 'day';

      if (fromDate && toDate) {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      } else {
        switch (period) {
          case 'day':
            startDate.setDate(startDate.getDate() - 1);
            groupBy = 'hour';
            break;
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            groupBy = 'day';
            break;
          case 'month':
            startDate.setDate(startDate.getDate() - 30);
            groupBy = 'day';
            break;
          case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3);
            groupBy = 'week';
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            groupBy = 'month';
            break;
          default:
            startDate.setDate(startDate.getDate() - 30);
            groupBy = 'day';
        }
      }

      // Build query based on metric
      let query;

      if (metric === 'netflow') {
        // Net flow includes deposits - payouts
        const [depositData] = await db
          .select({
            totalDeposits: sum(sql`CASE WHEN ${transactions.type} = 'deposit' THEN ${transactions.amount} ELSE 0 END`).mapWith(Number),
            totalPayouts: sum(sql`CASE WHEN ${transactions.type} = 'payout' THEN ${transactions.amount} ELSE 0 END`).mapWith(Number)
          })
          .from(transactions)
          .where(
            and(
              gte(transactions.createdAt, startDate),
              lte(transactions.createdAt, endDate)
            )
          );

        const netFlow = (depositData?.totalDeposits || 0) - (depositData?.totalPayouts || 0);

        const responseData = {
          data: [{
            date: new Date().toISOString(),
            value: netFlow
          }],
          metric,
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            groupBy
          }
        };

        queryCache.set(cacheKey, responseData, 600000); // 10 minutes
        return res.json(responseData);
      }

      // Standard metrics from conversion data
      query = db
        .select({
          date: sql<string>`DATE_TRUNC('${sql.raw(groupBy)}', ${conversionData.createdAt}) as date`,
          value: sql<number>`
            CASE 
              WHEN '${sql.raw(metric)}' = 'revenue' THEN SUM(${conversionData.revenue})
              WHEN '${sql.raw(metric)}' = 'payout' THEN SUM(${conversionData.payout})
              WHEN '${sql.raw(metric)}' = 'commission' THEN SUM(${conversionData.revenue} - ${conversionData.payout})
              ELSE SUM(${conversionData.revenue})
            END
          `
        })
        .from(conversionData)
        .where(
          and(
            gte(conversionData.createdAt, startDate),
            lte(conversionData.createdAt, endDate)
          )
        );

      // Apply ownership filtering
      query = applyOwnerIdFilter(query, currentUser, conversionData);

      // Apply additional filters
      if (partnerId) {
        query = query.where(eq(conversionData.partnerId, partnerId as string));
      }

      if (offerId) {
        query = query.where(eq(conversionData.offerId, offerId as string));
      }

      // Group by date
      query = query.groupBy(sql`DATE_TRUNC('${sql.raw(groupBy)}', ${conversionData.createdAt})`)
        .orderBy(sql`DATE_TRUNC('${sql.raw(groupBy)}', ${conversionData.createdAt})`);

      const results = await query;

      const responseData = {
        data: results,
        metric,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy
        }
      };

      // Cache for 10 minutes (600000ms)
      queryCache.set(cacheKey, responseData, 600000);

      auditLog(req, 'GET_FINANCIAL_CHART', 'analytics');

      res.json(responseData);
    } catch (error) {
      console.error('Get financial chart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get analytics summary
   */
  static async getAnalyticsSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      const { period = '30d', partnerId, offerId } = req.query;

      // Create cache key
      const cacheKey = `analytics_summary_${currentUser.id}_${period}_${partnerId || 'all'}_${offerId || 'all'}`;

      // Try to get from cache (15 minutes)
      const cached = queryCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Calculate date range
      const startDate = new Date();
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

      // Get conversion data summary
      let conversionQuery = db
        .select({
          totalRevenue: sum(conversionData.revenue).mapWith(Number),
          totalPayout: sum(conversionData.payout).mapWith(Number),
          totalCommission: sql<number>`SUM(${conversionData.revenue} - ${conversionData.payout})`,
          totalConversions: count(conversionData.id).mapWith(Number),
          avgRevenue: avg(conversionData.revenue).mapWith(Number),
          avgPayout: avg(conversionData.payout).mapWith(Number)
        })
        .from(conversionData)
        .where(gte(conversionData.createdAt, startDate));

      // Apply ownership filtering
      conversionQuery = applyOwnerIdFilter(conversionQuery, currentUser, conversionData);

      if (partnerId) {
        conversionQuery = conversionQuery.where(eq(conversionData.partnerId, partnerId as string));
      }

      if (offerId) {
        conversionQuery = conversionQuery.where(eq(conversionData.offerId, offerId as string));
      }

      const [conversionSummary] = await conversionQuery;

      // Get clicks data summary
      let clicksQuery = db
        .select({
          totalClicks: count(trackingClicks.id).mapWith(Number),
          uniqueClicks: sql<number>`COUNT(DISTINCT ${trackingClicks.ip})`,
          conversionRate: sql<number>`
            CASE 
              WHEN COUNT(${trackingClicks.id}) > 0 
              THEN (SELECT COUNT(*) FROM conversion_data WHERE created_at >= ${startDate}) * 100.0 / COUNT(${trackingClicks.id})
              ELSE 0 
            END
          `
        })
        .from(trackingClicks)
        .where(gte(trackingClicks.createdAt, startDate));

      // Apply ownership filtering
      clicksQuery = applyOwnerIdFilter(clicksQuery, currentUser, trackingClicks);

      if (partnerId) {
        clicksQuery = clicksQuery.where(eq(trackingClicks.partnerId, partnerId as string));
      }

      const [clicksSummary] = await clicksQuery;

      // Get top performing offers and partners
      let topOffersQuery = db
        .select({
          offerId: conversionData.offerId,
          offerName: offers.name,
          revenue: sum(conversionData.revenue).mapWith(Number),
          conversions: count(conversionData.id).mapWith(Number)
        })
        .from(conversionData)
        .leftJoin(offers, eq(conversionData.offerId, offers.id))
        .where(gte(conversionData.createdAt, startDate))
        .groupBy(conversionData.offerId, offers.name)
        .orderBy(desc(sum(conversionData.revenue)))
        .limit(5);

      topOffersQuery = applyOwnerIdFilter(topOffersQuery, currentUser, conversionData);
      const topOffers = await topOffersQuery;

      let topPartnersQuery = db
        .select({
          partnerId: conversionData.partnerId,
          partnerName: users.username,
          revenue: sum(conversionData.revenue).mapWith(Number),
          conversions: count(conversionData.id).mapWith(Number)
        })
        .from(conversionData)
        .leftJoin(users, eq(conversionData.partnerId, users.id))
        .where(gte(conversionData.createdAt, startDate))
        .groupBy(conversionData.partnerId, users.username)
        .orderBy(desc(sum(conversionData.revenue)))
        .limit(5);

      topPartnersQuery = applyOwnerIdFilter(topPartnersQuery, currentUser, conversionData);
      const topPartners = await topPartnersQuery;

      const responseData = {
        summary: {
          ...conversionSummary,
          ...clicksSummary,
          netProfit: (conversionSummary?.totalRevenue || 0) - (conversionSummary?.totalPayout || 0)
        },
        topOffers,
        topPartners,
        period: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      };

      // Cache for 15 minutes (900000ms)
      queryCache.set(cacheKey, responseData, 900000);

      auditLog(req, 'GET_ANALYTICS_SUMMARY', 'analytics');

      res.json(responseData);
    } catch (error) {
      console.error('Get analytics summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get partner analytics (for partners to view their own data)
   */
  static async getPartnerAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;

      // Ensure partner can only see their own data
      if (currentUser.role !== 'super_admin' && currentUser.role !== 'advertiser') {
        // Partners can only see their own data
        req.query.partnerId = currentUser.id;
      }

      // Reuse the analytics summary logic
      return AnalyticsController.getAnalyticsSummary(req, res);
    } catch (error) {
      console.error('Get partner analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Clear analytics cache
   */
  static async clearCache(req: Request, res: Response) {
    try {
      queryCache.clear();

      auditLog(req, 'CLEAR_ANALYTICS_CACHE', 'analytics');

      res.json({ message: 'Analytics cache cleared successfully' });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
