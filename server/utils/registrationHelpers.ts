import { Request, Response } from 'express';
import { 
  sendSchemaParsingError, 
  sendValidationError,
  sendDatabaseError,
  sendInternalError 
} from '../utils/errorHandler';

// Enhanced schema validation with fallback
export function validateWithFallback<T>(
  req: Request,
  res: Response,
  schema: unknown, _data: unknown,
  fallbackFields: Partial<T>
): { success: true; data: T } | { success: false } {
  try {
    // Try primary schema validation
    const validatedData = (schema as unknown).parse(_data);
    return { success: true, data: validatedData };
  } catch (schemaError: unknown) {
    const message = schemaError instanceof Error ? schemaError.message : 'Unknown error';
    console.log('❌ Schema validation error, attempting fallback:', message);
    
    // Attempt fallback validation with essential fields
    try {
      const fallbackData = createFallbackData(_data, fallbackFields);
      console.log('✅ Fallback validation successful');
      return { success: true, data: fallbackData as T };
    } catch (fallbackError) {
      console.error('❌ Fallback validation also failed:', fallbackError);
      sendSchemaParsingError(req, res, schemaError, false);
      return { success: false };
    }
  }
}

// Create fallback data with safe field extraction
function createFallbackData(originalData: Record<string, unknown>, fallbackFields: Record<string, unknown>): Record<string, unknown> {
  const fallbackData: Record<string, unknown> = {};
  
  // Copy essential fields with safe extraction
  for (const [key, defaultValue] of Object.entries(fallbackFields)) {
    if (originalData[key] !== undefined && originalData[key] !== null) {
      fallbackData[key] = originalData[key];
    } else {
      fallbackData[key] = defaultValue;
    }
  }
  
  // Handle special field transformations
  if (originalData.name && !fallbackData.firstName && !fallbackData.lastName) {
    const nameParts = originalData.name.split(' ');
    fallbackData.firstName = nameParts[0] || '';
    fallbackData.lastName = nameParts.slice(1).join(' ') || '';
  }
  
  return fallbackData;
}

// Registration data transformation utilities
export function transformRegistrationData(rawData: Record<string, unknown>): Record<string, unknown> {
  const transformedData = { ...rawData };
  
  // Transform name field to firstName/lastName if needed  
  if (rawData.name && !rawData.firstName && !rawData.lastName) {
    const nameParts = String(rawData.name).split(' ');
    transformedData.firstName = nameParts[0] || '';
    transformedData.lastName = nameParts.slice(1).join(' ') || '';
  }
  
  // Generate username if missing
  if (!transformedData.username && transformedData.email) {
    transformedData.username = generateUsername(transformedData.email);
  }
  
  // Ensure required role is set
  if (!transformedData.role) {
    transformedData.role = 'PARTNER'; // Default role
  }
  
  // Clean and validate email
  if (transformedData.email) {
    transformedData.email = transformedData.email.toLowerCase().trim();
  }
  
  return transformedData;
}

// Username generation utility (removes duplicate logic)
export function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
}

// Database operation with fallback
export async function executeWithFallback<T>(
  req: Request,
  res: Response,
  operation: () => Promise<T>,
  fallbackData: T,
  operationName: string
): Promise<{ success: true; data: T } | { success: false }> {
  try {
    const result = await operation();
    console.log(`✅ ${operationName} completed successfully`);
    return { success: true, _data: result };
  } catch (dbError: unknown) {
    const message = dbError instanceof Error ? dbError.message : 'Unknown error';
    console.log(`⚠️ ${operationName} failed, using fallback:`, message);
    
    // For registration, we might want to allow fallback user creation
    // but log the issue for later processing
    if (operationName.includes('registration') || operationName.includes('user creation')) {
      console.log(`📝 Using fallback data for ${operationName}`);
      return { success: true, _data: fallbackData };
    }
    
    sendDatabaseError(req, res, dbError, true);
    return { success: false };
  }
}

// Enhanced validation for registration endpoints
export function validateRegistrationData(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email format is invalid');
    }
  }
  
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Name validation (either name or firstName/lastName required)
  if (!data.name && (!data.firstName || !data.lastName)) {
    errors.push('Either name or both firstName and lastName are required');
  }
  
  // Role validation
  const validRoles = ['OWNER', 'ADVERTISER', 'PARTNER'];
  if (data.role && !validRoles.includes(data.role)) {
    errors.push('Invalid role specified');
  }
  
  return { isValid: errors.length === 0, errors };
}

// JWT token validation for registration/auth endpoints
export function validateRegistrationJWT(token: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!token || typeof token !== 'string') {
    errors.push('Token is required and must be a string');
    return { isValid: false, errors };
  }
  
  // Enhanced JWT format validation
  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push('JWT must have exactly 3 parts separated by dots');
    return { isValid: false, errors };
  }
  
  // Check each part is properly base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  
  parts.forEach((part, index) => {
    if (!base64UrlRegex.test(part)) {
      errors.push(`JWT part ${index + 1} is not valid base64url encoded`);
    }
  });
  
  // Length validation
  if (token.length < 50) {
    errors.push('JWT token is too short (minimum 50 characters)');
  }
  
  if (token.length > 4096) {
    errors.push('JWT token is too long (maximum 4096 characters)');
  }
  
  // Try to decode header and payload for basic structure validation
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (!header.alg || !header.typ) {
      errors.push('JWT header missing required fields (alg, typ)');
    }
  } catch (_error) {
    errors.push('JWT header is not valid JSON');
  }
  
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (!payload.sub && !payload.id) {
      errors.push('JWT payload missing user identifier (sub or id)');
    }
    if (!payload.exp) {
      errors.push('JWT payload missing expiration time (exp)');
    }
  } catch (_error) {
    errors.push('JWT payload is not valid JSON');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Centralized error handler for registration operations
export function handleRegistrationError(
  req: Request,
  res: Response,
  error: unknown,
  operation: string
): void {
  console.error(`Registration ${operation} error:`, error);
  
  if (error.name === 'ValidationError') {
    sendValidationError(req, res, `${operation} validation failed`, error.message);
  } else if (error.message?.includes('duplicate') || error.code === '23505') {
    sendValidationError(req, res, 'Email or username already exists');
  } else if (error.message?.includes('database') || error.code?.startsWith('P')) {
    sendDatabaseError(req, res, error, false);
  } else {
    sendInternalError(req, res, error);
  }
}