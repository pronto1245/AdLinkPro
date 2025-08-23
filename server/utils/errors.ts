/**
 * Custom Error Classes for AdLinkPro
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, _field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Too many requests', retryAfter?: number) {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', _service?: string) {
    super(message, 503, true, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

// Type guard to check if error is operational
export function isOperationalError(error: Error): error is AppError {
  return error instanceof AppError && error.isOperational;
}

// Helper function to create standardized error response
export function createErrorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      ...(error instanceof RateLimitError && error.retryAfter
        ? { retryAfter: error.retryAfter }
        : {}),
    };
  }

  // For unknown errors, don't expose internal details in production
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    error: isProduction ? 'Internal server error' : error.message,
    statusCode: 500,
    errorCode: 'INTERNAL_ERROR',
  };
}
