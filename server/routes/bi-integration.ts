import { Router } from 'express';
import { db } from '../db';
import { trackingClicks, users, offers } from '@shared/schema';
import { fraudReports, fraudAlerts, fraudBlocks } from '@shared/antifraud-schema';
import { eq, and, gte, lte, desc, count, sum, avg, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schemas
const biQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'csv', 'powerbi', 'tableau']).default('json'),
  aggregation: z.enum(['daily', 'weekly', 'monthly', 'hourly']).default('daily'),
  metrics: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional()
});

const reportScheduleSchema = z.object({
  name: z.string(),
  query: z.string(),
  schedule: z.enum(['daily', 'weekly', 'monthly']),
  format: z.enum(['csv', 'pdf', 'excel']),
  recipients: z.array(z.string().email()),
  isActive: z.boolean().default(true)
});

// PowerBI compatible endpoints
router.get('/powerbi/fraud-metrics', async (req, res) => {
  try {
    const validation = biQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { startDate, endDate, aggregation } = validation.data;
    
    const dateFilter = buildDateFilter(startDate, endDate);
    const groupBy = getGroupByClause(aggregation);
    
    // Fraud metrics for PowerBI
    const fraudMetrics = await db.select({
      date: sql<string>`${groupBy}`,
      totalClicks: count(trackingClicks.id),
      fraudClicks: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true OR ${trackingClicks.riskScore} > 70 THEN 1 ELSE 0 END)`,
      fraudRate: sql<number>`ROUND((SUM(CASE WHEN ${trackingClicks.isFraud} = true OR ${trackingClicks.riskScore} > 70 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)`,
      avgRiskScore: sql<number>`ROUND(AVG(${trackingClicks.riskScore}), 2)`,
      blockedIps: sql<number>`COUNT(DISTINCT CASE WHEN ${trackingClicks.isFraud} = true THEN ${trackingClicks.ipAddress} END)`,
      topFraudCountry: sql<string>`MODE() WITHIN GROUP (ORDER BY CASE WHEN ${trackingClicks.isFraud} = true THEN ${trackingClicks.country} END)`,
      revenue: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = false THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`,
      fraudRevenueLoss: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`
    })
    .from(trackingClicks)
    .where(dateFilter)
    .groupBy(sql`${groupBy}`)
    .orderBy(sql`${groupBy}`);

    res.json({
      '@odata.context': `${req.protocol}://${req.get('host')}/api/bi/powerbi/$metadata#fraud-metrics`,
      value: fraudMetrics
    });
  } catch (error) {
    console.error('Error fetching PowerBI fraud metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/powerbi/partner-fraud-analysis', async (req, res) => {
  try {
    const validation = biQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { startDate, endDate } = validation.data;
    const dateFilter = buildDateFilter(startDate, endDate);

    // Partner fraud analysis for PowerBI
    const partnerAnalysis = await db.select({
      partnerId: trackingClicks.partnerId,
      partnerName: users.username,
      totalClicks: count(trackingClicks.id),
      fraudClicks: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END)`,
      fraudRate: sql<number>`ROUND((SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)`,
      avgRiskScore: sql<number>`ROUND(AVG(${trackingClicks.riskScore}), 2)`,
      revenue: sql<number>`SUM(COALESCE(${trackingClicks.revenue}, 0))`,
      fraudRevenueLoss: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`,
      riskLevel: sql<string>`CASE 
        WHEN (SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) > 20 THEN 'High'
        WHEN (SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) > 10 THEN 'Medium'
        ELSE 'Low'
      END`,
      topFraudReason: sql<string>`MODE() WITHIN GROUP (ORDER BY CASE WHEN ${trackingClicks.isFraud} = true THEN ${trackingClicks.fraudReason} END)`,
      lastActivityDate: sql<string>`MAX(${trackingClicks.createdAt})`
    })
    .from(trackingClicks)
    .leftJoin(users, eq(trackingClicks.partnerId, users.id))
    .where(dateFilter)
    .groupBy(trackingClicks.partnerId, users.username)
    .having(sql`COUNT(*) > 10`) // Only partners with meaningful activity
    .orderBy(sql`fraud_rate DESC`);

    res.json({
      '@odata.context': `${req.protocol}://${req.get('host')}/api/bi/powerbi/$metadata#partner-fraud-analysis`,
      value: partnerAnalysis
    });
  } catch (error) {
    console.error('Error fetching PowerBI partner analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tableau compatible endpoints
router.get('/tableau/fraud-dashboard', async (req, res) => {
  try {
    const validation = biQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { startDate, endDate, aggregation } = validation.data;
    const dateFilter = buildDateFilter(startDate, endDate);
    const groupBy = getGroupByClause(aggregation);

    // Multi-dimensional fraud data for Tableau
    const fraudDashboardData = await db.select({
      dimension_date: sql<string>`${groupBy}`,
      dimension_country: trackingClicks.country,
      dimension_device: trackingClicks.device,
      dimension_partner: users.username,
      dimension_offer: offers.name,
      measure_total_clicks: count(trackingClicks.id),
      measure_fraud_clicks: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END)`,
      measure_fraud_rate: sql<number>`(SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`,
      measure_avg_risk_score: sql<number>`AVG(${trackingClicks.riskScore})`,
      measure_revenue: sql<number>`SUM(COALESCE(${trackingClicks.revenue}, 0))`,
      measure_fraud_loss: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`,
      attribute_risk_level: sql<string>`CASE 
        WHEN AVG(${trackingClicks.riskScore}) > 70 THEN 'High Risk'
        WHEN AVG(${trackingClicks.riskScore}) > 40 THEN 'Medium Risk'
        ELSE 'Low Risk'
      END`,
      attribute_fraud_type: trackingClicks.fraudReason,
      calculated_fraud_impact: sql<number>`(SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * AVG(COALESCE(${trackingClicks.revenue}, 0)))`
    })
    .from(trackingClicks)
    .leftJoin(users, eq(trackingClicks.partnerId, users.id))
    .leftJoin(offers, eq(trackingClicks.offerId, offers.id))
    .where(dateFilter)
    .groupBy(
      sql`${groupBy}`,
      trackingClicks.country,
      trackingClicks.device,
      users.username,
      offers.name,
      trackingClicks.fraudReason
    )
    .orderBy(sql`${groupBy}`, trackingClicks.country);

    res.json({
      data: fraudDashboardData,
      metadata: {
        dimensions: ['dimension_date', 'dimension_country', 'dimension_device', 'dimension_partner', 'dimension_offer'],
        measures: ['measure_total_clicks', 'measure_fraud_clicks', 'measure_fraud_rate', 'measure_avg_risk_score', 'measure_revenue', 'measure_fraud_loss'],
        attributes: ['attribute_risk_level', 'attribute_fraud_type'],
        calculated: ['calculated_fraud_impact']
      }
    });
  } catch (error) {
    console.error('Error fetching Tableau dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Data Studio compatible endpoints
router.get('/gds/connector', async (req, res) => {
  try {
    // GDS Connector configuration
    const connectorConfig = {
      schema: [
        {
          name: 'date',
          label: 'Date',
          dataType: 'STRING',
          semantics: {
            conceptType: 'DIMENSION',
            semanticType: 'YEAR_MONTH_DAY'
          }
        },
        {
          name: 'total_clicks',
          label: 'Total Clicks',
          dataType: 'NUMBER',
          semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true
          }
        },
        {
          name: 'fraud_clicks',
          label: 'Fraud Clicks',
          dataType: 'NUMBER',
          semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true
          }
        },
        {
          name: 'fraud_rate',
          label: 'Fraud Rate (%)',
          dataType: 'NUMBER',
          semantics: {
            conceptType: 'METRIC',
            isReaggregatable: false
          }
        },
        {
          name: 'country',
          label: 'Country',
          dataType: 'STRING',
          semantics: {
            conceptType: 'DIMENSION'
          }
        },
        {
          name: 'partner',
          label: 'Partner',
          dataType: 'STRING',
          semantics: {
            conceptType: 'DIMENSION'
          }
        },
        {
          name: 'revenue',
          label: 'Revenue',
          dataType: 'NUMBER',
          semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true,
            semanticType: 'CURRENCY_USD'
          }
        },
        {
          name: 'fraud_loss',
          label: 'Fraud Loss',
          dataType: 'NUMBER',
          semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true,
            semanticType: 'CURRENCY_USD'
          }
        }
      ]
    };

    res.json(connectorConfig);
  } catch (error) {
    console.error('Error getting GDS connector config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/gds/data', async (req, res) => {
  try {
    const { fields, dateRange } = req.body;
    
    let startDate, endDate;
    if (dateRange) {
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    const dateFilter = buildDateFilter(startDate, endDate);

    // Build query based on requested fields
    const requestedFields = fields || ['date', 'total_clicks', 'fraud_clicks', 'fraud_rate'];
    
    const gdsData = await db.select({
      date: sql<string>`DATE(${trackingClicks.createdAt})`,
      total_clicks: count(trackingClicks.id),
      fraud_clicks: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END)`,
      fraud_rate: sql<number>`ROUND((SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)`,
      country: trackingClicks.country,
      partner: users.username,
      revenue: sql<number>`SUM(COALESCE(${trackingClicks.revenue}, 0))`,
      fraud_loss: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`
    })
    .from(trackingClicks)
    .leftJoin(users, eq(trackingClicks.partnerId, users.id))
    .where(dateFilter)
    .groupBy(
      sql`DATE(${trackingClicks.createdAt})`,
      trackingClicks.country,
      users.username
    )
    .orderBy(sql`DATE(${trackingClicks.createdAt})`);

    // Format for GDS
    const rows = gdsData.map(row => ({
      values: requestedFields.map(field => row[field as keyof typeof row])
    }));

    res.json({
      schema: requestedFields.map(field => ({ name: field })),
      rows
    });
  } catch (error) {
    console.error('Error fetching GDS data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Report scheduling
router.post('/reports/schedule', async (req, res) => {
  try {
    const validation = reportScheduleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const reportData = validation.data;
    const userId = req.user?.id || 'system';

    // In production, this would save to a scheduled_reports table
    console.log('📊 Scheduling report:', reportData);

    res.json({
      success: true,
      message: 'Report scheduled successfully',
      reportId: `report_${Date.now()}`,
      nextRun: getNextRunTime(reportData.schedule)
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export data in various formats
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const validation = biQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { startDate, endDate, metrics } = validation.data;
    const dateFilter = buildDateFilter(startDate, endDate);

    // Get fraud data
    const exportData = await db.select({
      date: sql<string>`DATE(${trackingClicks.createdAt})`,
      partner_id: trackingClicks.partnerId,
      partner_name: users.username,
      offer_id: trackingClicks.offerId,
      offer_name: offers.name,
      country: trackingClicks.country,
      device: trackingClicks.device,
      total_clicks: count(trackingClicks.id),
      fraud_clicks: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END)`,
      fraud_rate: sql<number>`ROUND((SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)`,
      avg_risk_score: sql<number>`ROUND(AVG(${trackingClicks.riskScore}), 2)`,
      revenue: sql<number>`SUM(COALESCE(${trackingClicks.revenue}, 0))`,
      fraud_loss: sql<number>`SUM(CASE WHEN ${trackingClicks.isFraud} = true THEN COALESCE(${trackingClicks.revenue}, 0) ELSE 0 END)`
    })
    .from(trackingClicks)
    .leftJoin(users, eq(trackingClicks.partnerId, users.id))
    .leftJoin(offers, eq(trackingClicks.offerId, offers.id))
    .where(dateFilter)
    .groupBy(
      sql`DATE(${trackingClicks.createdAt})`,
      trackingClicks.partnerId,
      users.username,
      trackingClicks.offerId,
      offers.name,
      trackingClicks.country,
      trackingClicks.device
    )
    .orderBy(sql`DATE(${trackingClicks.createdAt})`);

    switch (format) {
      case 'csv':
        const csv = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="fraud-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
        break;
        
      case 'json':
        res.json({
          success: true,
          data: exportData,
          exportedAt: new Date().toISOString(),
          recordCount: exportData.length
        });
        break;
        
      case 'powerbi':
        res.json({
          '@odata.context': `${req.protocol}://${req.get('host')}/api/bi/$metadata#fraud-export`,
          '@odata.count': exportData.length,
          value: exportData
        });
        break;
        
      default:
        res.status(400).json({
          error: 'Unsupported format',
          supportedFormats: ['csv', 'json', 'powerbi']
        });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    title: 'AdLinkPro BI API Documentation',
    version: '1.0.0',
    description: 'REST API for Business Intelligence integration with fraud detection data',
    endpoints: {
      powerbi: {
        '/api/bi/powerbi/fraud-metrics': 'Aggregated fraud metrics for PowerBI dashboards',
        '/api/bi/powerbi/partner-fraud-analysis': 'Partner-level fraud analysis for PowerBI'
      },
      tableau: {
        '/api/bi/tableau/fraud-dashboard': 'Multi-dimensional fraud data for Tableau workbooks'
      },
      gds: {
        '/api/bi/gds/connector': 'Google Data Studio connector schema',
        '/api/bi/gds/data': 'Google Data Studio data endpoint'
      },
      export: {
        '/api/bi/export/{format}': 'Export fraud data in various formats (csv, json, powerbi)'
      },
      scheduling: {
        '/api/bi/reports/schedule': 'Schedule automated report generation'
      }
    },
    authentication: 'Bearer token required in Authorization header',
    rateLimit: '1000 requests per hour',
    supportedFormats: ['json', 'csv', 'powerbi', 'tableau'],
    dateFormat: 'ISO 8601 (YYYY-MM-DD)',
    aggregationOptions: ['hourly', 'daily', 'weekly', 'monthly']
  });
});

// Helper functions
function buildDateFilter(startDate?: string, endDate?: string) {
  const conditions = [];
  
  if (startDate) {
    conditions.push(gte(trackingClicks.createdAt, new Date(startDate)));
  }
  
  if (endDate) {
    conditions.push(lte(trackingClicks.createdAt, new Date(endDate)));
  }
  
  return conditions.length > 0 ? and(...conditions) : sql`1=1`;
}

function getGroupByClause(aggregation: string) {
  switch (aggregation) {
    case 'hourly':
      return sql`DATE_TRUNC('hour', ${trackingClicks.createdAt})`;
    case 'daily':
      return sql`DATE(${trackingClicks.createdAt})`;
    case 'weekly':
      return sql`DATE_TRUNC('week', ${trackingClicks.createdAt})`;
    case 'monthly':
      return sql`DATE_TRUNC('month', ${trackingClicks.createdAt})`;
    default:
      return sql`DATE(${trackingClicks.createdAt})`;
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

function getNextRunTime(schedule: string): string {
  const now = new Date();
  const next = new Date(now);
  
  switch (schedule) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0); // 9 AM next day
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay())); // Next Sunday
      next.setHours(9, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1, 1); // 1st of next month
      next.setHours(9, 0, 0, 0);
      break;
  }
  
  return next.toISOString();
}

export default router;