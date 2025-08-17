// Enhanced API routes for real data integration
import { Router } from 'express';
import { z } from 'zod';
import { requireRole, requireAuth } from '../middleware/auth';
import { biIntegrationService } from '../services/biIntegration';
import { dataValidationService } from '../services/dataValidation';
import { integrationMonitoring } from '../services/integrationMonitoring';
import { db } from '../db';
import { trackingClicks, offers, users, statistics } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

const router = Router();

// Schema for integration requests
const integrationRequestSchema = z.object({
  dateFrom: z.string().transform(str => new Date(str)),
  dateTo: z.string().transform(str => new Date(str)),
  advertiserId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  offerId: z.string().uuid().optional(),
  format: z.enum(['json', 'csv', 'parquet']).default('json'),
  includeMetadata: z.boolean().default(true),
  filters: z.record(z.any()).optional()
});

// Enhanced advertiser data endpoint
router.get('/advertiser/real-data', requireAuth, requireRole(['advertiser', 'super_admin']), async (req, res) => {
  try {
    const user = req.user!;
    const filters = integrationRequestSchema.parse(req.query);
    
    // If not super admin, restrict to user's data
    if (user.role === 'advertiser') {
      filters.advertiserId = user.id;
    }

    const startTime = Date.now();
    
    // Get real data from BI integration service
    const dataExport = await biIntegrationService.getAnalyticsDataForBI(
      filters.dateFrom,
      filters.dateTo,
      {
        advertiserId: filters.advertiserId,
        partnerId: filters.partnerId,
        offerId: filters.offerId,
        limit: 10000,
        ...filters.filters
      }
    );

    // Validate the data
    const validationResults = await Promise.all(
      dataExport.data.slice(0, 100).map(record => // Validate sample
        dataValidationService.validateAdvertiserData(record)
      )
    );

    const validRecords = validationResults.filter(r => r.isValid).length;
    const invalidRecords = validationResults.length - validRecords;

    // Record monitoring metrics
    integrationMonitoring.recordMetric('api_response_time', Date.now() - startTime, {
      endpoint: '/advertiser/real-data',
      user_role: user.role
    });

    integrationMonitoring.recordMetric('data_validation_rate', (validRecords / validationResults.length) * 100);

    res.json({
      success: true,
      data: dataExport.data,
      metadata: {
        totalRecords: dataExport.rowCount,
        validRecords,
        invalidRecords,
        validationRate: (validRecords / validationResults.length) * 100,
        dateRange: {
          from: filters.dateFrom,
          to: filters.dateTo
        },
        filters: filters.filters,
        generated: dataExport.timestamp,
        format: filters.format
      },
      integration: {
        biSystemsConnected: (await biIntegrationService.healthCheck()),
        dataValidation: true,
        realTimeMonitoring: true
      }
    });

  } catch (error) {
    console.error('[API] Real data endpoint error:', error);
    
    integrationMonitoring.createAlert(
      'error',
      'api_real_data',
      `Real data API failed: ${error.message}`,
      'high',
      { endpoint: '/advertiser/real-data', error: error.message }
    );

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch real data',
      message: error.message
    });
  }
});

// BI system integration endpoint
router.post('/integration/bi-export', requireAuth, requireRole(['advertiser', 'super_admin']), async (req, res) => {
  try {
    const user = req.user!;
    const requestBody = z.object({
      biSystem: z.enum(['looker', 'metabase', 'powerbi']),
      dateFrom: z.string().transform(str => new Date(str)),
      dateTo: z.string().transform(str => new Date(str)),
      advertiserId: z.string().uuid().optional(),
      schedule: z.string().optional(), // Cron format for scheduling
      filters: z.record(z.any()).optional()
    }).parse(req.body);

    // Restrict to user's data if not super admin
    if (user.role === 'advertiser') {
      requestBody.advertiserId = user.id;
    }

    const startTime = Date.now();

    // Get data for export
    const dataExport = await biIntegrationService.getAnalyticsDataForBI(
      requestBody.dateFrom,
      requestBody.dateTo,
      {
        advertiserId: requestBody.advertiserId,
        ...requestBody.filters
      }
    );

    // Validate data for BI system
    const biValidation = await dataValidationService.validateBIData(
      {
        dataset_id: 'adlinkpro_tracking',
        table_name: 'tracking_data',
        rows: dataExport.data
      },
      requestBody.biSystem === 'powerbi' ? 'powerbi' : 'metabase' // Map to available schemas
    );

    if (!biValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Data validation failed for BI system',
        details: biValidation.errors
      });
    }

    // Export to BI system
    const exportResult = await biIntegrationService.exportToBI(requestBody.biSystem, dataExport);

    // Monitor the export
    await integrationMonitoring.monitorBIExport(requestBody.biSystem, dataExport.rowCount, exportResult);

    // Schedule if requested
    let scheduleResult = null;
    if (requestBody.schedule) {
      scheduleResult = await biIntegrationService.scheduleExport(
        requestBody.biSystem,
        requestBody.schedule,
        requestBody.filters || {}
      );
    }

    integrationMonitoring.recordMetric('bi_export_response_time', Date.now() - startTime, {
      bi_system: requestBody.biSystem,
      record_count: dataExport.rowCount.toString()
    });

    res.json({
      success: true,
      export: exportResult,
      schedule: scheduleResult,
      metadata: {
        recordsExported: dataExport.rowCount,
        biSystem: requestBody.biSystem,
        exportTime: new Date(),
        validationPassed: biValidation.isValid,
        responseTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('[API] BI export error:', error);
    
    integrationMonitoring.createAlert(
      'error',
      'bi_export_api',
      `BI export API failed: ${error.message}`,
      'high',
      { error: error.message }
    );

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'BI export failed',
      message: error.message
    });
  }
});

// Data validation endpoint
router.post('/integration/validate-data', requireAuth, requireRole(['advertiser', 'super_admin']), async (req, res) => {
  try {
    const user = req.user!;
    const requestBody = z.object({
      data: z.array(z.any()),
      format: z.string().default('standard'),
      strictMode: z.boolean().default(false)
    }).parse(req.body);

    const startTime = Date.now();
    const validationResults = [];

    for (const record of requestBody.data) {
      const validation = await dataValidationService.validateAdvertiserData(record, requestBody.format);
      validationResults.push({
        recordId: record.clickId || `record_${validationResults.length}`,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        correctedData: validation.correctedData
      });
    }

    const validCount = validationResults.filter(r => r.isValid).length;
    const invalidCount = validationResults.length - validCount;

    // Monitor validation results
    await integrationMonitoring.monitorDataIntegration(
      'api_validation',
      requestBody.data.length,
      {
        isValid: invalidCount === 0,
        errors: validationResults.flatMap(r => r.errors),
        warnings: validationResults.flatMap(r => r.warnings)
      }
    );

    integrationMonitoring.recordMetric('data_validation_response_time', Date.now() - startTime, {
      record_count: requestBody.data.length.toString(),
      format: requestBody.format
    });

    res.json({
      success: true,
      validationResults,
      summary: {
        totalRecords: requestBody.data.length,
        validRecords: validCount,
        invalidRecords: invalidCount,
        validationRate: (validCount / requestBody.data.length) * 100,
        format: requestBody.format,
        strictMode: requestBody.strictMode,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('[API] Data validation error:', error);
    
    integrationMonitoring.createAlert(
      'error',
      'data_validation_api',
      `Data validation API failed: ${error.message}`,
      'medium',
      { error: error.message }
    );

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Data validation failed',
      message: error.message
    });
  }
});

// Integration health monitoring endpoint
router.get('/integration/health', requireAuth, requireRole(['advertiser', 'super_admin']), async (req, res) => {
  try {
    const healthSummary = integrationMonitoring.getHealthSummary();
    const biHealth = await biIntegrationService.healthCheck();
    const recentAlerts = integrationMonitoring.getRecentAlerts(10);

    // Get validation statistics for the last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const validationStats = await dataValidationService.getValidationStats(last24h, new Date());

    // Get key metrics
    const responseTimeMetrics = integrationMonitoring.getAggregatedMetrics('api_response_time', last24h);
    const validationMetrics = integrationMonitoring.getAggregatedMetrics('data_validation_rate', last24h);

    res.json({
      success: true,
      health: {
        overall: healthSummary.overallStatus,
        services: healthSummary.services,
        biSystems: biHealth,
        database: healthSummary.services.find(s => s.service === 'database')?.status || 'unknown'
      },
      monitoring: {
        activeAlerts: healthSummary.activeAlerts,
        criticalAlerts: healthSummary.criticalAlerts,
        recentAlerts: recentAlerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          source: alert.source,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.timestamp,
          resolved: alert.resolved
        }))
      },
      metrics: {
        responseTime: responseTimeMetrics,
        validationRate: validationMetrics,
        validationStats
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('[API] Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

// Integration statistics endpoint
router.get('/integration/statistics', requireAuth, requireRole(['advertiser', 'super_admin']), async (req, res) => {
  try {
    const user = req.user!;
    const filters = z.object({
      dateFrom: z.string().transform(str => new Date(str)).default(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      dateTo: z.string().transform(str => new Date(str)).default(new Date().toISOString()),
      advertiserId: z.string().uuid().optional()
    }).parse(req.query);

    // Restrict to user's data if not super admin
    if (user.role === 'advertiser') {
      filters.advertiserId = user.id;
    }

    // Get aggregated data for the period
    const aggregatedData = await biIntegrationService.getAggregatedData(
      filters.dateFrom,
      filters.dateTo,
      ['date'],
      { advertiserId: filters.advertiserId }
    );

    // Get validation statistics
    const validationStats = await dataValidationService.getValidationStats(
      filters.dateFrom,
      filters.dateTo
    );

    // Get recent integration metrics
    const integrationMetrics = {
      apiCalls: integrationMonitoring.getAggregatedMetrics('api_response_time', filters.dateFrom),
      biExports: integrationMonitoring.getAggregatedMetrics('bi_export_success', filters.dateFrom),
      validationRate: integrationMonitoring.getAggregatedMetrics('data_validation_rate', filters.dateFrom)
    };

    res.json({
      success: true,
      period: {
        from: filters.dateFrom,
        to: filters.dateTo
      },
      statistics: {
        dataFlow: aggregatedData,
        validation: validationStats,
        integration: integrationMetrics
      },
      summary: {
        totalRecordsProcessed: aggregatedData.reduce((sum, day) => sum + (day.totalClicks || 0), 0),
        averageValidationRate: validationStats.validationRate,
        integrationUptime: integrationMetrics.apiCalls.count > 0 ? 
          ((integrationMetrics.apiCalls.count - (integrationMetrics.apiCalls.max || 0)) / integrationMetrics.apiCalls.count) * 100 : 100
      },
      generated: new Date()
    });

  } catch (error) {
    console.error('[API] Integration statistics error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get integration statistics',
      message: error.message
    });
  }
});

// Resolve monitoring alert endpoint
router.post('/integration/resolve-alert/:alertId', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const { alertId } = req.params;
    const resolved = integrationMonitoring.resolveAlert(alertId);

    if (resolved) {
      res.json({
        success: true,
        message: 'Alert resolved successfully',
        alertId
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert not found',
        alertId
      });
    }

  } catch (error) {
    console.error('[API] Resolve alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      message: error.message
    });
  }
});

export default router;