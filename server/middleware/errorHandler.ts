import type { Request, Response, NextFunction } from 'express';
import { AppError, createErrorResponse, isOperationalError } from '../utils/errors';

/**
 * Centralized error handling middleware
 * Should be placed after all routes and other middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging
  console.error(`[ERROR] ${error.name}: ${error.message}`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Handle the error and send response
  const errorResponse = createErrorResponse(error);

  // Set response status
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper for async route handlers
 * Usage: app.get('/route', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 error handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(
    `Route ${req.method} ${req.url} not found`,
    404,
    true,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}

/**
 * Global uncaught exception handler
 */
export function setupGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...', {
      reason,
      promise,
    });
    process.exit(1);
  });
}
