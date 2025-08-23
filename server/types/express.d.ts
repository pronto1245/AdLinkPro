import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sub?: string;
        email: string;
        username: string;
        role: 'OWNER' | 'ADVERTISER' | 'PARTNER' | 'ADMIN';
        iat?: number;
        exp?: number;
      };
      sessionId?: string;
      clientIP?: string;
      riskScore?: number;
      rateLimitInfo?: {
        remaining: number;
        resetTime: number;
        total: number;
      };
    }

    interface Response {
      locals: {
        user?: Express.Request['user'];
        startTime?: number;
        requestId?: string;
      };
    }
  }
}

// Additional type definitions for the application
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'OWNER' | 'ADVERTISER' | 'PARTNER' | 'ADMIN';
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  two_factor_enabled: boolean;
}

export interface AuthPayload {
  sub: string;
  email: string;
  username: string;
  role: User['role'];
  iat?: number;
  exp?: number;
}

export interface EventData {
  clickId: string;
  eventType: string;
  status?: string;
  payout?: number;
  currency?: string;
  transactionId?: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipIf?: (req: Express.Request) => boolean;
}

export interface AuditLogEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  origin?: string;
  referer?: string;
  sessionId?: string;
  riskScore?: number;
}

// Export types for use in other modules
export type * from 'express';
