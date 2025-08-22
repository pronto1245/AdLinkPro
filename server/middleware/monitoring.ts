import { Request, Response, NextFunction } from 'express';
import logger, { auditLogger, performanceLogger } from '../config/logger';

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  // Log request start
  logger.info('Request started', {
    method,
    url,
    ip: ip || req.connection.remoteAddress,
    userAgent: headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('Request completed', {
      method,
      url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length') || 0,
    });

    // Log performance metrics
    performanceLogger.info('Response time', {
      method,
      url,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Security event logger
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  req?: Request
) {
  auditLogger.warn('Security event', {
    event,
    ...details,
    ip: req?.ip || req?.connection.remoteAddress,
    userAgent: req?.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });
}

// Authentication event logger
export function logAuthEvent(
  event: 'login_attempt' | 'login_success' | 'login_failure' | 'logout',
  userId?: string,
  details?: Record<string, any>,
  req?: Request
) {
  auditLogger.info('Authentication event', {
    event,
    userId,
    ...details,
    ip: req?.ip || req?.connection.remoteAddress,
    userAgent: req?.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });
}

// Error logging middleware
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined,
    },
    timestamp: new Date().toISOString(),
  });

  next(err);
}

// Health check endpoint
export function healthCheck(req: Request, res: Response) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    node_version: process.version,
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
  };

  logger.info('Health check requested', healthStatus);
  res.status(200).json(healthStatus);
}