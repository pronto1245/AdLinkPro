import { Request, Response } from 'express';
import { auditLog } from '../middleware/security';

// Standardized error response structure
export interface APIError {
  error: string;
  code?: string;
  details?: any;
  timestamp?: Date;
}

// Common error types
export enum ErrorCodes {
  AUTHENTICATION_REQUIRED = 'AUTH_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SCHEMA_PARSING_ERROR = 'SCHEMA_PARSING_ERROR',
  JWT_VALIDATION_ERROR = 'JWT_VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Centralized error response handler
export function sendErrorResponse(
  req: Request,
  res: Response,
  statusCode: number,
  errorCode: ErrorCodes,
  message: string,
  details?: any,
  auditAction?: string
): void {
  const errorResponse: APIError = {
    error: message,
    code: errorCode,
    timestamp: new Date()
  };

  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = details;
  }

  // Log for audit if action specified
  if (auditAction) {
    auditLog(req, auditAction, undefined, false, { errorCode, message, details });
  }

  res.status(statusCode).json(errorResponse);
}

// Authentication error handlers
export function sendAuthenticationRequired(req: Request, res: Response): void {
  sendErrorResponse(
    req,
    res,
    401,
    ErrorCodes.AUTHENTICATION_REQUIRED,
    'Authentication required',
    undefined,
    'AUTH_FAILED'
  );
}

export function sendInvalidToken(req: Request, res: Response, details?: any): void {
  sendErrorResponse(
    req,
    res,
    403,
    ErrorCodes.INVALID_TOKEN,
    'Invalid or expired token',
    details,
    'INVALID_TOKEN'
  );
}

export function sendInsufficientPermissions(
  req: Request, 
  res: Response, 
  required?: string[], 
  current?: string
): void {
  sendErrorResponse(
    req,
    res,
    403,
    ErrorCodes.INSUFFICIENT_PERMISSIONS,
    'Insufficient permissions',
    { required, current },
    'UNAUTHORIZED_ACCESS'
  );
}

export function sendUserNotFound(req: Request, res: Response): void {
  sendErrorResponse(
    req,
    res,
    404,
    ErrorCodes.USER_NOT_FOUND,
    'User not found',
    undefined,
    'USER_NOT_FOUND'
  );
}

// Validation error handlers
export function sendValidationError(
  req: Request,
  res: Response,
  message: string,
  details?: any
): void {
  sendErrorResponse(
    req,
    res,
    400,
    ErrorCodes.VALIDATION_ERROR,
    message,
    details
  );
}

export function sendSchemaParsingError(
  req: Request,
  res: Response,
  originalError: any,
  fallbackUsed = false
): void {
  sendErrorResponse(
    req,
    res,
    400,
    ErrorCodes.SCHEMA_PARSING_ERROR,
    fallbackUsed 
      ? 'Schema validation failed, using fallback processing'
      : 'Schema validation failed',
    process.env.NODE_ENV !== 'production' ? originalError : undefined
  );
}

// Database error handlers
export function sendDatabaseError(
  req: Request,
  res: Response,
  originalError: any,
  fallbackUsed = false
): void {
  console.error('Database error:', originalError);
  
  sendErrorResponse(
    req,
    res,
    500,
    ErrorCodes.DATABASE_ERROR,
    fallbackUsed 
      ? 'Database operation failed, using fallback'
      : 'Database operation failed',
    process.env.NODE_ENV !== 'production' ? originalError.message : undefined
  );
}

// JWT validation error handlers
export function sendJWTValidationError(
  req: Request,
  res: Response,
  details?: any
): void {
  sendErrorResponse(
    req,
    res,
    400,
    ErrorCodes.JWT_VALIDATION_ERROR,
    'JWT token validation failed',
    details
  );
}

// Internal server error handler
export function sendInternalError(
  req: Request,
  res: Response,
  originalError: any
): void {
  console.error('Internal server error:', originalError);
  
  sendErrorResponse(
    req,
    res,
    500,
    ErrorCodes.INTERNAL_ERROR,
    'Internal server error',
    process.env.NODE_ENV !== 'production' ? originalError.message : undefined
  );
}

// Enhanced JWT validation utility
export function validateJWTFormat(token: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!token) {
    errors.push('Token is missing');
    return { isValid: false, errors };
  }

  if (typeof token !== 'string') {
    errors.push('Token must be a string');
    return { isValid: false, errors };
  }

  // Check JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push('Token must have 3 parts separated by dots');
    return { isValid: false, errors }; // Early return for invalid format
  }

  // Check reasonable length limits first
  if (token.length > 8192) {
    errors.push('Token is too long (max 8192 characters)');
  }
  
  if (token.length < 20) {
    errors.push('Token is too short (min 20 characters)');
  }

  // Check if each part is base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  
  if (!base64UrlRegex.test(parts[0])) {
    errors.push('Token header is not valid base64url');
  }
  
  if (!base64UrlRegex.test(parts[1])) {
    errors.push('Token payload is not valid base64url');
  }
  
  if (!base64UrlRegex.test(parts[2])) {
    errors.push('Token signature is not valid base64url');
  }

  return { isValid: errors.length === 0, errors };
}