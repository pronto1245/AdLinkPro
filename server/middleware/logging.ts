import { createLogger, format, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';

// Create winston logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'adlinkpro-api' },
  transports: [
    // Write to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // Write to file
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: format.json()
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      format: format.json()
    })
  ],
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: (req as any).user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Intercept response to log completion
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      user: (req as any).user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, body);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: (req as any).user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Send error response
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }
};

// Success operation logger
export const logSuccess = (operation: string, details?: any) => {
  logger.info('Operation completed successfully', {
    operation,
    details,
    timestamp: new Date().toISOString()
  });
};

// Business logic logger
export const logBusiness = (event: string, _data: any) => {
  logger.info('Business event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Security event logger
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high', details: any) => {
  const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  
  logger[level]('Security event', {
    event,
    severity,
    details,
    timestamp: new Date().toISOString()
  });
};

// Performance logger
export const logPerformance = (operation: string, duration: number, details?: any) => {
  const level = duration > 5000 ? 'warn' : 'info'; // Warn if operation takes more than 5 seconds
  
  logger[level]('Performance metric', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString()
  });
};

// Database operation logger
export const logDatabase = (operation: string, table: string, duration: number, rowsAffected?: number) => {
  logger.info('Database operation', {
    operation,
    table,
    duration: `${duration}ms`,
    rowsAffected,
    timestamp: new Date().toISOString()
  });
};

export { logger };