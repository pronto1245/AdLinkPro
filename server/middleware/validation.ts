import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Generic validation middleware factory
 */
export function validateRequest(schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        const bodyResult = schema.body.safeParse(req.body);
        if (!bodyResult.success) {
          const validationError = fromZodError(bodyResult.error);
          return res.status(400).json({
            error: 'Invalid request body',
            details: validationError.message,
            issues: bodyResult.error.issues
          });
        }
        req.body = bodyResult.data;
      }

      // Validate query parameters
      if (schema.query) {
        const queryResult = schema.query.safeParse(req.query);
        if (!queryResult.success) {
          const validationError = fromZodError(queryResult.error);
          return res.status(400).json({
            error: 'Invalid query parameters',
            details: validationError.message,
            issues: queryResult.error.issues
          });
        }
        req.query = queryResult.data;
      }

      // Validate route parameters
      if (schema.params) {
        const paramsResult = schema.params.safeParse(req.params);
        if (!paramsResult.success) {
          const validationError = fromZodError(paramsResult.error);
          return res.status(400).json({
            error: 'Invalid route parameters',
            details: validationError.message,
            issues: paramsResult.error.issues
          });
        }
        req.params = paramsResult.data;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  }),

  // Date range
  dateRange: z.object({
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    period: z.enum(['7d', '30d', '90d', '1y']).optional()
  }),

  // UUID parameter
  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format')
  }),

  // User creation
  createUser: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['super_admin', 'advertiser', 'affiliate', 'staff']),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    company: z.string().max(200).optional(),
    phone: z.string().max(50).optional(),
    permissions: z.record(z.boolean()).optional(),
    restrictions: z.object({
      ipWhitelist: z.array(z.string().ip()).optional(),
      geoRestrictions: z.array(z.string()).optional(),
      timeRestrictions: z.object({
        enabled: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        timezone: z.string().optional(),
        workingDays: z.array(z.number().min(0).max(6)).optional()
      }).optional()
    }).optional()
  }),

  // Update user profile
  updateProfile: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    company: z.string().max(200).optional(),
    phone: z.string().max(50).optional(),
    country: z.string().max(2).optional(),
    language: z.string().max(5).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().max(3).optional()
  }),

  // Change password
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  }),

  // Financial transaction
  updateTransaction: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'completed']),
    notes: z.string().max(500).optional(),
    rejectionReason: z.string().max(500).optional()
  }),

  // Payout action
  payoutAction: z.object({
    reason: z.string().max(500).optional(),
    notes: z.string().max(500).optional()
  }),

  // Create invoice
  createInvoice: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().max(3).default('USD'),
    description: z.string().max(500).optional(),
    dueDate: z.string().datetime().optional(),
    paymentMethod: z.string().max(50).optional()
  }),

  // Mark invoice paid
  markInvoicePaid: z.object({
    transactionId: z.string().max(100).optional(),
    notes: z.string().max(500).optional()
  }),

  // Team invitation
  teamInvitation: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['advertiser', 'affiliate', 'staff']),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    message: z.string().max(500).optional(),
    expiresInDays: z.number().min(1).max(30).default(7)
  }),

  // Accept invitation
  acceptInvitation: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(8, 'Password must be at least 8 characters')
  }),

  // Update team member
  updateTeamMember: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    company: z.string().max(200).optional(),
    phone: z.string().max(50).optional(),
    permissions: z.record(z.boolean()).optional(),
    restrictions: z.object({
      ipWhitelist: z.array(z.string().ip()).optional(),
      geoRestrictions: z.array(z.string()).optional(),
      timeRestrictions: z.object({
        enabled: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        timezone: z.string().optional(),
        workingDays: z.array(z.number().min(0).max(6)).optional()
      }).optional()
    }).optional(),
    isActive: z.boolean().optional()
  }),

  // Fraud management
  blockIP: z.object({
    ip: z.string().ip('Invalid IP address'),
    reason: z.string().max(500).optional(),
    duration: z.number().positive().optional() // days
  }),

  // Update fraud alert
  updateFraudAlert: z.object({
    status: z.enum(['pending', 'investigating', 'resolved', 'false_positive']),
    resolution: z.string().max(500).optional()
  }),

  // Fraud configuration
  updateFraudConfig: z.object({
    config: z.object({
      autoBlocking: z.object({
        enabled: z.boolean(),
        ipClickThreshold: z.number().positive(),
        conversionRateThreshold: z.number().min(0).max(100),
        botScoreThreshold: z.number().min(0).max(100),
        geoAnomalyThreshold: z.number().min(0).max(100)
      }).optional(),
      riskThresholds: z.object({
        low: z.number().min(0).max(100),
        medium: z.number().min(0).max(100),
        high: z.number().min(0).max(100)
      }).optional(),
      enabledChecks: z.object({
        ipAnalysis: z.boolean(),
        userAgentAnalysis: z.boolean(),
        geoValidation: z.boolean(),
        vpnDetection: z.boolean(),
        botDetection: z.boolean()
      }).optional()
    })
  })
};

// Helper function to create validation middleware for common patterns
export const validate = {
  pagination: () => validateRequest({ query: commonSchemas.pagination }),
  dateRange: () => validateRequest({ query: commonSchemas.dateRange }),
  uuid: () => validateRequest({ params: commonSchemas.uuidParam }),
  createUser: () => validateRequest({ body: commonSchemas.createUser }),
  updateProfile: () => validateRequest({ body: commonSchemas.updateProfile }),
  changePassword: () => validateRequest({ body: commonSchemas.changePassword }),
  updateTransaction: () => validateRequest({ body: commonSchemas.updateTransaction }),
  payoutAction: () => validateRequest({ body: commonSchemas.payoutAction }),
  createInvoice: () => validateRequest({ body: commonSchemas.createInvoice }),
  markInvoicePaid: () => validateRequest({ body: commonSchemas.markInvoicePaid }),
  teamInvitation: () => validateRequest({ body: commonSchemas.teamInvitation }),
  acceptInvitation: () => validateRequest({ body: commonSchemas.acceptInvitation }),
  updateTeamMember: () => validateRequest({ body: commonSchemas.updateTeamMember }),
  blockIP: () => validateRequest({ body: commonSchemas.blockIP }),
  updateFraudAlert: () => validateRequest({ body: commonSchemas.updateFraudAlert }),
  updateFraudConfig: () => validateRequest({ body: commonSchemas.updateFraudConfig })
};
