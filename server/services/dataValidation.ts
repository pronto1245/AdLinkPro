// Data Format Validation and Conversion Service
import { z } from 'zod';
import { db } from '../db';
import { trackingClicks, offers, users } from '@shared/schema';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: any;
  validationTime: Date;
}

export interface DataFormatConfig {
  advertiserFormat: 'standard' | 'custom';
  requiredFields: string[];
  optionalFields: string[];
  dataTypes: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>;
  transformations: Record<string, (value: any) => any>;
  validationRules: Record<string, (value: any) => boolean>;
}

// Standard advertiser data schema
export const advertiserDataSchema = z.object({
  clickId: z.string().min(1, 'Click ID is required'),
  advertiserId: z.string().uuid('Invalid advertiser ID format'),
  partnerId: z.string().uuid('Invalid partner ID format').optional(),
  offerId: z.string().uuid('Invalid offer ID format').optional(),
  timestamp: z.date().or(z.string().transform(str => new Date(str))),
  country: z.string().length(2, 'Country must be 2-letter ISO code').optional(),
  device: z.enum(['mobile', 'desktop', 'tablet', 'unknown']).optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  ip: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().optional(),
  referrer: z.string().url('Invalid referrer URL').or(z.literal('')).optional(),
  sub1: z.string().max(255).optional(),
  sub2: z.string().max(255).optional(),
  sub3: z.string().max(255).optional(),
  sub4: z.string().max(255).optional(),
  sub5: z.string().max(255).optional(),
  isUnique: z.boolean().optional(),
  isFraud: z.boolean().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  fraudReason: z.string().optional(),
  revenue: z.number().min(0).optional(),
  payout: z.number().min(0).optional(),
  currency: z.string().length(3, 'Currency must be 3-letter code').optional(),
  conversionType: z.enum(['lead', 'registration', 'deposit', 'sale']).optional(),
  conversionValue: z.number().min(0).optional(),
  customParams: z.record(z.any()).optional()
});

// BI system data schemas
export const biDataSchemas = {
  looker: z.object({
    dimension_id: z.string(),
    measure_value: z.number(),
    timestamp: z.string(),
    filters: z.record(z.any()).optional()
  }),
  
  metabase: z.object({
    table_id: z.number(),
    column_mappings: z.record(z.string()),
    data_rows: z.array(z.array(z.any())),
    metadata: z.record(z.any()).optional()
  }),
  
  powerbi: z.object({
    dataset_id: z.string(),
    table_name: z.string(),
    rows: z.array(z.record(z.any())),
    refresh_policy: z.string().optional()
  })
};

export class DataValidationService {
  private formatConfigs: Map<string, DataFormatConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    // Standard format configuration
    this.formatConfigs.set('standard', {
      advertiserFormat: 'standard',
      requiredFields: ['clickId', 'advertiserId', 'timestamp'],
      optionalFields: ['partnerId', 'offerId', 'country', 'device', 'ip'],
      dataTypes: {
        clickId: 'string',
        advertiserId: 'string',
        partnerId: 'string',
        offerId: 'string',
        timestamp: 'date',
        country: 'string',
        device: 'string',
        ip: 'string',
        revenue: 'number',
        isUnique: 'boolean',
        isFraud: 'boolean',
        riskScore: 'number'
      },
      transformations: {
        country: (value: string) => value?.toUpperCase(),
        device: (value: string) => value?.toLowerCase(),
        timestamp: (value: any) => value instanceof Date ? value : new Date(value)
      },
      validationRules: {
        clickId: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value),
        country: (value: string) => /^[A-Z]{2}$/.test(value),
        ip: (value: string) => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value),
        riskScore: (value: number) => value >= 0 && value <= 100
      }
    });

    console.log('[DataValidation] Initialized default format configurations');
  }

  // Validate advertiser data
  async validateAdvertiserData(data: any, formatType: string = 'standard'): Promise<DataValidationResult> {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      validationTime: new Date()
    };

    try {
      // Use Zod schema validation
      const validatedData = advertiserDataSchema.parse(data);
      
      // Apply format-specific validations
      const config = this.formatConfigs.get(formatType);
      if (config) {
        const formatValidation = await this.validateWithConfig(validatedData, config);
        result.errors.push(...formatValidation.errors);
        result.warnings.push(...formatValidation.warnings);
        result.correctedData = formatValidation.correctedData;
      }

      // Check data integrity
      const integrityValidation = await this.validateDataIntegrity(validatedData);
      result.errors.push(...integrityValidation.errors);
      result.warnings.push(...integrityValidation.warnings);

      result.isValid = result.errors.length === 0;
      
      console.log(`[DataValidation] Validated data: ${result.isValid ? 'VALID' : 'INVALID'} (${result.errors.length} errors, ${result.warnings.length} warnings)`);
      
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      } else {
        result.isValid = false;
        result.errors.push(`Validation error: ${error.message}`);
      }
      
      console.error('[DataValidation] Validation failed:', error);
      return result;
    }
  }

  private async validateWithConfig(data: any, config: DataFormatConfig): Promise<Partial<DataValidationResult>> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const correctedData: any = { ...data };

    // Check required fields
    for (const field of config.requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Required field missing: ${field}`);
      }
    }

    // Apply transformations and validations
    for (const [field, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;

      // Apply transformation
      if (config.transformations[field]) {
        try {
          correctedData[field] = config.transformations[field](value);
        } catch (error) {
          warnings.push(`Failed to transform field ${field}: ${error.message}`);
        }
      }

      // Apply validation rule
      if (config.validationRules[field]) {
        try {
          const isValid = config.validationRules[field](correctedData[field] || value);
          if (!isValid) {
            errors.push(`Field ${field} failed validation`);
          }
        } catch (error) {
          warnings.push(`Validation rule error for field ${field}: ${error.message}`);
        }
      }

      // Check data type
      const expectedType = config.dataTypes[field];
      if (expectedType) {
        const actualType = this.getDataType(correctedData[field] || value);
        if (actualType !== expectedType) {
          warnings.push(`Field ${field} type mismatch: expected ${expectedType}, got ${actualType}`);
        }
      }
    }

    return { errors, warnings, correctedData };
  }

  private getDataType(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') return 'json';
    return typeof value;
  }

  // Validate data integrity with database
  private async validateDataIntegrity(data: any): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if advertiser exists
      if (data.advertiserId) {
        const advertiser = await db.select().from(users).where(eq(users.id, data.advertiserId)).limit(1);
        if (advertiser.length === 0) {
          errors.push(`Advertiser not found: ${data.advertiserId}`);
        } else if (advertiser[0].role !== 'advertiser') {
          errors.push(`User ${data.advertiserId} is not an advertiser`);
        }
      }

      // Check if partner exists
      if (data.partnerId) {
        const partner = await db.select().from(users).where(eq(users.id, data.partnerId)).limit(1);
        if (partner.length === 0) {
          warnings.push(`Partner not found: ${data.partnerId}`);
        } else if (partner[0].role !== 'affiliate') {
          warnings.push(`User ${data.partnerId} is not a partner`);
        }
      }

      // Check if offer exists
      if (data.offerId) {
        const offer = await db.select().from(offers).where(eq(offers.id, data.offerId)).limit(1);
        if (offer.length === 0) {
          warnings.push(`Offer not found: ${data.offerId}`);
        } else if (offer[0].status !== 'active') {
          warnings.push(`Offer ${data.offerId} is not active`);
        }
      }

      // Check for duplicate click ID
      if (data.clickId) {
        const existing = await db.select().from(trackingClicks).where(eq(trackingClicks.clickid, data.clickId)).limit(1);
        if (existing.length > 0) {
          warnings.push(`Duplicate click ID: ${data.clickId}`);
        }
      }

    } catch (error) {
      console.error('[DataValidation] Integrity check error:', error);
      errors.push(`Database validation error: ${error.message}`);
    }

    return { errors, warnings };
  }

  // Validate BI export data
  async validateBIData(data: any, biSystem: 'looker' | 'metabase' | 'powerbi'): Promise<DataValidationResult> {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      validationTime: new Date()
    };

    try {
      const schema = biDataSchemas[biSystem];
      if (!schema) {
        result.isValid = false;
        result.errors.push(`Unsupported BI system: ${biSystem}`);
        return result;
      }

      const validatedData = schema.parse(data);
      result.correctedData = validatedData;
      
      console.log(`[DataValidation] BI data validated for ${biSystem}: VALID`);
      
    } catch (error) {
      result.isValid = false;
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      } else {
        result.errors.push(`BI validation error: ${error.message}`);
      }
      
      console.error(`[DataValidation] BI validation failed for ${biSystem}:`, error);
    }

    return result;
  }

  // Convert data between formats
  async convertDataFormat(
    data: any,
    fromFormat: string,
    toFormat: string
  ): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const fromConfig = this.formatConfigs.get(fromFormat);
      const toConfig = this.formatConfigs.get(toFormat);

      if (!fromConfig || !toConfig) {
        return {
          success: false,
          errors: [`Unknown format: ${!fromConfig ? fromFormat : toFormat}`]
        };
      }

      // First validate source data
      const validation = await this.validateAdvertiserData(data, fromFormat);
      if (!validation.isValid) {
        return {
          success: false,
          errors: [`Source data validation failed: ${validation.errors.join(', ')}`]
        };
      }

      const convertedData: any = {};

      // Map fields from source to target format
      for (const targetField of [...toConfig.requiredFields, ...toConfig.optionalFields]) {
        if (validation.correctedData && targetField in validation.correctedData) {
          convertedData[targetField] = validation.correctedData[targetField];
        } else if (targetField in data) {
          convertedData[targetField] = data[targetField];
        }
      }

      // Apply target format transformations
      for (const [field, transformer] of Object.entries(toConfig.transformations)) {
        if (field in convertedData) {
          try {
            convertedData[field] = transformer(convertedData[field]);
          } catch (error) {
            console.warn(`[DataValidation] Transform error for ${field}:`, error);
          }
        }
      }

      console.log(`[DataValidation] Converted data from ${fromFormat} to ${toFormat}`);
      
      return {
        success: true,
        data: convertedData,
        errors: []
      };

    } catch (error) {
      console.error('[DataValidation] Format conversion error:', error);
      return {
        success: false,
        errors: [`Conversion error: ${error.message}`]
      };
    }
  }

  // Add custom format configuration
  addFormatConfig(name: string, config: DataFormatConfig): void {
    this.formatConfigs.set(name, config);
    console.log(`[DataValidation] Added custom format: ${name}`);
  }

  // Get validation statistics
  async getValidationStats(
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    validationRate: number;
    topErrors: Array<{ error: string; count: number }>;
  }> {
    try {
      // This would typically come from a validation log table
      // For now, we'll provide mock statistics based on tracking data
      const totalRecords = await db.select({ count: sql`COUNT(*)` })
        .from(trackingClicks)
        .where(and(
          gte(trackingClicks.createdAt, dateFrom),
          lte(trackingClicks.createdAt, dateTo)
        ));

      const validRecords = await db.select({ count: sql`COUNT(*)` })
        .from(trackingClicks)
        .where(and(
          gte(trackingClicks.createdAt, dateFrom),
          lte(trackingClicks.createdAt, dateTo),
          eq(trackingClicks.isFraud, false)
        ));

      const total = totalRecords[0]?.count || 0;
      const valid = validRecords[0]?.count || 0;
      const invalid = total - valid;
      const validationRate = total > 0 ? (valid / total) * 100 : 100;

      return {
        totalRecords: total,
        validRecords: valid,
        invalidRecords: invalid,
        validationRate: Math.round(validationRate * 100) / 100,
        topErrors: [
          { error: 'Invalid IP address', count: Math.floor(invalid * 0.3) },
          { error: 'Missing country code', count: Math.floor(invalid * 0.25) },
          { error: 'Invalid timestamp', count: Math.floor(invalid * 0.2) },
          { error: 'Duplicate click ID', count: Math.floor(invalid * 0.15) },
          { error: 'Invalid user agent', count: Math.floor(invalid * 0.1) }
        ]
      };

    } catch (error) {
      console.error('[DataValidation] Error getting validation stats:', error);
      throw new Error('Failed to get validation statistics');
    }
  }
}

export const dataValidationService = new DataValidationService();