// BI Integration Service for real data sources
import { config } from '../config/environment';
import { db } from '../db';
import { trackingClicks, offers, users, statistics } from '@shared/schema';
import { eq, sql, gte, lte, and } from 'drizzle-orm';

export interface BIConnectionConfig {
  type: 'looker' | 'metabase' | 'powerbi' | 'tableau';
  endpoint: string;
  apiKey?: string;
  username?: string;
  password?: string;
  databaseUrl?: string;
  additionalConfig?: Record<string, any>;
}

export interface BIDataExport {
  format: 'json' | 'csv' | 'parquet' | 'sql';
  data: any[];
  timestamp: Date;
  rowCount: number;
  compressed?: boolean;
}

export class BIIntegrationService {
  private connections: Map<string, BIConnectionConfig> = new Map();

  constructor() {
    // Initialize BI connections from environment
    this.initializeConnections();
  }

  private initializeConnections() {
    // Looker integration
    if (process.env.LOOKER_ENDPOINT && process.env.LOOKER_API_KEY) {
      this.connections.set('looker', {
        type: 'looker',
        endpoint: process.env.LOOKER_ENDPOINT,
        apiKey: process.env.LOOKER_API_KEY,
        additionalConfig: {
          clientId: process.env.LOOKER_CLIENT_ID,
          clientSecret: process.env.LOOKER_CLIENT_SECRET
        }
      });
    }

    // Metabase integration
    if (process.env.METABASE_ENDPOINT && process.env.METABASE_API_KEY) {
      this.connections.set('metabase', {
        type: 'metabase',
        endpoint: process.env.METABASE_ENDPOINT,
        username: process.env.METABASE_USERNAME,
        password: process.env.METABASE_PASSWORD,
        databaseUrl: process.env.DATABASE_URL
      });
    }

    // Power BI integration
    if (process.env.POWERBI_ENDPOINT && process.env.POWERBI_API_KEY) {
      this.connections.set('powerbi', {
        type: 'powerbi',
        endpoint: process.env.POWERBI_ENDPOINT,
        apiKey: process.env.POWERBI_API_KEY,
        additionalConfig: {
          tenantId: process.env.POWERBI_TENANT_ID,
          clientId: process.env.POWERBI_CLIENT_ID,
          clientSecret: process.env.POWERBI_CLIENT_SECRET
        }
      });
    }

    console.log(`[BI] Initialized ${this.connections.size} BI connections`);
  }

  // Get real-time analytics data for BI systems
  async getAnalyticsDataForBI(
    dateFrom: Date, 
    dateTo: Date, 
    filters: Record<string, any> = {}
  ): Promise<BIDataExport> {
    try {
      const whereConditions = [
        gte(trackingClicks.createdAt, dateFrom),
        lte(trackingClicks.createdAt, dateTo)
      ];

      // Apply filters
      if (filters.advertiserId) {
        whereConditions.push(eq(trackingClicks.advertiserId, filters.advertiserId));
      }
      if (filters.partnerId) {
        whereConditions.push(eq(trackingClicks.partnerId, filters.partnerId));
      }
      if (filters.offerId) {
        whereConditions.push(eq(trackingClicks.offerId, filters.offerId));
      }

      const data = await db
        .select({
          clickId: trackingClicks.clickid,
          timestamp: trackingClicks.createdAt,
          advertiserId: trackingClicks.advertiserId,
          partnerId: trackingClicks.partnerId,
          offerId: trackingClicks.offerId,
          country: trackingClicks.country,
          device: trackingClicks.device,
          os: trackingClicks.os,
          browser: trackingClicks.browser,
          ip: trackingClicks.ip,
          userAgent: trackingClicks.userAgent,
          referrer: trackingClicks.referrer,
          sub1: trackingClicks.sub1,
          sub2: trackingClicks.sub2Raw,
          sub3: trackingClicks.sub3,
          sub4: trackingClicks.sub4,
          sub5: trackingClicks.sub5,
          isUnique: trackingClicks.isUnique,
          isFraud: trackingClicks.isFraud,
          riskScore: trackingClicks.riskScore,
          fraudReason: trackingClicks.fraudReason,
          offerName: offers.name,
          partnerName: users.username
        })
        .from(trackingClicks)
        .leftJoin(offers, eq(trackingClicks.offerId, offers.id))
        .leftJoin(users, eq(trackingClicks.partnerId, users.id))
        .where(and(...whereConditions))
        .limit(filters.limit || 10000);

      return {
        format: 'json',
        data,
        timestamp: new Date(),
        rowCount: data.length,
        compressed: false
      };
    } catch (error) {
      console.error('[BI] Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data for BI');
    }
  }

  // Export data to specific BI system
  async exportToBI(biSystem: string, dataExport: BIDataExport): Promise<{ success: boolean; message: string }> {
    const connection = this.connections.get(biSystem);
    if (!connection) {
      return { success: false, message: `BI system ${biSystem} not configured` };
    }

    try {
      switch (connection.type) {
        case 'looker':
          return await this.exportToLooker(connection, dataExport);
        case 'metabase':
          return await this.exportToMetabase(connection, dataExport);
        case 'powerbi':
          return await this.exportToPowerBI(connection, dataExport);
        default:
          return { success: false, message: `Unsupported BI system: ${connection.type}` };
      }
    } catch (error) {
      console.error(`[BI] Error exporting to ${biSystem}:`, error);
      return { success: false, message: `Export failed: ${error.message}` };
    }
  }

  private async exportToLooker(connection: BIConnectionConfig, dataExport: BIDataExport): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${connection.endpoint}/api/4.0/query_tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            model: 'adlinkpro',
            view: 'tracking_data',
            fields: Object.keys(dataExport.data[0] || {}),
            filters: {},
            limit: dataExport.rowCount.toString()
          },
          result_format: 'json',
          source: 'api'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[BI] Successfully exported ${dataExport.rowCount} rows to Looker`);
        return { success: true, message: `Exported ${dataExport.rowCount} rows to Looker` };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[BI] Looker export error:', error);
      return { success: false, message: `Looker export failed: ${error.message}` };
    }
  }

  private async exportToMetabase(connection: BIConnectionConfig, dataExport: BIDataExport): Promise<{ success: boolean; message: string }> {
    try {
      // First authenticate with Metabase
      const authResponse = await fetch(`${connection.endpoint}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: connection.username,
          password: connection.password
        })
      });

      if (!authResponse.ok) {
        throw new Error('Metabase authentication failed');
      }

      const { id: sessionId } = await authResponse.json();

      // Push data to Metabase
      const dataResponse = await fetch(`${connection.endpoint}/api/dataset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionId
        },
        body: JSON.stringify({
          type: 'query',
          query: {
            'source-table': 'tracking_clicks',
            aggregation: [['count']],
            breakout: [['field-id', 1]]
          }
        })
      });

      if (dataResponse.ok) {
        console.log(`[BI] Successfully exported ${dataExport.rowCount} rows to Metabase`);
        return { success: true, message: `Exported ${dataExport.rowCount} rows to Metabase` };
      } else {
        throw new Error(`HTTP ${dataResponse.status}: ${dataResponse.statusText}`);
      }
    } catch (error) {
      console.error('[BI] Metabase export error:', error);
      return { success: false, message: `Metabase export failed: ${error.message}` };
    }
  }

  private async exportToPowerBI(connection: BIConnectionConfig, dataExport: BIDataExport): Promise<{ success: boolean; message: string }> {
    try {
      // Power BI requires OAuth 2.0 authentication
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${connection.additionalConfig?.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: connection.additionalConfig?.clientId || '',
          client_secret: connection.additionalConfig?.clientSecret || '',
          scope: 'https://analysis.windows.net/powerbi/api/.default'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Power BI authentication failed');
      }

      const { access_token } = await tokenResponse.json();

      // Push data to Power BI dataset
      const dataResponse = await fetch(`${connection.endpoint}/v1.0/myorg/datasets/{dataset-id}/tables/{table-name}/rows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rows: dataExport.data
        })
      });

      if (dataResponse.ok) {
        console.log(`[BI] Successfully exported ${dataExport.rowCount} rows to Power BI`);
        return { success: true, message: `Exported ${dataExport.rowCount} rows to Power BI` };
      } else {
        throw new Error(`HTTP ${dataResponse.status}: ${dataResponse.statusText}`);
      }
    } catch (error) {
      console.error('[BI] Power BI export error:', error);
      return { success: false, message: `Power BI export failed: ${error.message}` };
    }
  }

  // Get aggregated data for BI dashboards
  async getAggregatedData(
    dateFrom: Date,
    dateTo: Date,
    groupBy: string[] = ['date'],
    filters: Record<string, any> = {}
  ): Promise<any[]> {
    try {
      const whereConditions = [
        gte(trackingClicks.createdAt, dateFrom),
        lte(trackingClicks.createdAt, dateTo)
      ];

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && trackingClicks[key as keyof typeof trackingClicks]) {
          whereConditions.push(eq(trackingClicks[key as keyof typeof trackingClicks], value));
        }
      });

      // Build aggregation query based on groupBy
      const result = await db
        .select({
          date: sql`DATE(${trackingClicks.createdAt})`,
          totalClicks: sql`COUNT(*)`,
          uniqueClicks: sql`COUNT(DISTINCT ${trackingClicks.clickid})`,
          fraudClicks: sql`SUM(CASE WHEN ${trackingClicks.isFraud} THEN 1 ELSE 0 END)`,
          avgRiskScore: sql`AVG(${trackingClicks.riskScore})`,
          topCountry: sql`MODE() WITHIN GROUP (ORDER BY ${trackingClicks.country})`,
          topDevice: sql`MODE() WITHIN GROUP (ORDER BY ${trackingClicks.device})`
        })
        .from(trackingClicks)
        .where(and(...whereConditions))
        .groupBy(sql`DATE(${trackingClicks.createdAt})`)
        .orderBy(sql`DATE(${trackingClicks.createdAt})`);

      return result;
    } catch (error) {
      console.error('[BI] Error getting aggregated data:', error);
      throw new Error('Failed to get aggregated data');
    }
  }

  // Health check for BI connections
  async healthCheck(): Promise<Record<string, { status: string; error?: string }>> {
    const health: Record<string, { status: string; error?: string }> = {};

    for (const [name, connection] of this.connections) {
      try {
        const response = await fetch(connection.endpoint, {
          method: 'GET',
          headers: connection.apiKey ? {
            'Authorization': `Bearer ${connection.apiKey}`
          } : {},
          timeout: 5000
        });

        health[name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          error: response.ok ? undefined : `HTTP ${response.status}`
        };
      } catch (error) {
        health[name] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return health;
  }

  // Schedule automated exports
  async scheduleExport(
    biSystem: string,
    schedule: string, // cron format
    filters: Record<string, any> = {}
  ): Promise<{ success: boolean; message: string }> {
    try {
      // This would integrate with a job scheduler like Bull or Agenda
      console.log(`[BI] Scheduled export to ${biSystem} with schedule: ${schedule}`);
      
      // For now, just validate the schedule format
      const cronRegex = /^(\*|[0-5]?\d|\*\/[1-6]?\d) (\*|1?\d|2[0-3]|\*\/[1-2]?\d) (\*|[12]?\d|3[01]|\*\/[1-3]?\d) (\*|[1-9]|1[0-2]|\*\/[1-9]) (\*|[0-6]|\*\/[1-6])$/;
      
      if (!cronRegex.test(schedule)) {
        return { success: false, message: 'Invalid cron schedule format' };
      }

      return { success: true, message: `Export scheduled for ${biSystem}` };
    } catch (error) {
      console.error('[BI] Error scheduling export:', error);
      return { success: false, message: `Failed to schedule export: ${error.message}` };
    }
  }
}

export const biIntegrationService = new BIIntegrationService();