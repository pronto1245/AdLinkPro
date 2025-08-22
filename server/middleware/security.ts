import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification';

// IP Blacklist storage (in production use Redis or database)
const ipBlacklist = new Set<string>([
  // Common suspicious IPs would be added here
]);

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();

// Audit log storage
interface AuditEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: any;
}

// Enhanced audit log storage with rotation and structured logging
interface AuditEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  sessionId?: string;
  method?: string;
  path?: string;
  responseTime?: number;
}

const auditLogs: AuditEntry[] = [];
const MAX_AUDIT_LOGS = 50000; // Increased capacity for better traceability

// Enhanced audit logging with structured data and better traceability
export const auditLog = (req: Request, action: string, resource?: string, success: boolean = true, details?: any) => {
  const entry: AuditEntry = {
    timestamp: new Date(),
    userId: req.user?.id,
    action,
    resource,
    ip: getClientIP(req),
    userAgent: req.get('User-Agent'),
    success,
    details,
    sessionId: req.sessionID || req.get('x-session-id'),
    method: req.method,
    path: req.path,
    responseTime: req.responseTime
  };
  
  auditLogs.push(entry);
  
  // Rotate logs when they exceed maximum capacity
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    // Remove oldest 25% when capacity is exceeded
    const removeCount = Math.floor(MAX_AUDIT_LOGS * 0.25);
    auditLogs.splice(0, removeCount);
  }
  
  // Enhanced structured logging with more context
  const logLevel = success ? 'INFO' : 'WARN';
  const logMessage = {
    level: logLevel,
    timestamp: entry.timestamp.toISOString(),
    action: entry.action,
    userId: entry.userId || 'anonymous',
    ip: entry.ip,
    method: entry.method,
    path: entry.path,
    resource: entry.resource,
    success: entry.success,
    userAgent: entry.userAgent,
    details: entry.details
  };
  
  console.log(`[AUDIT-${logLevel}]`, JSON.stringify(logMessage));
  
  // TODO: In production, consider writing to database or external logging service
  // Example: await writeToDatabase(entry); or await sendToLoggingService(entry);
};

// Helper function to extract client IP with better reliability
function getClientIP(req: Request): string {
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    // Get the first IP from x-forwarded-for header
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

// Export function to get audit logs for monitoring/debugging
export const getAuditLogs = (filters?: {
  userId?: string;
  action?: string;
  success?: boolean;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}): AuditEntry[] => {
  let filteredLogs = [...auditLogs];
  
  if (filters) {
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success);
    }
    if (filters.fromDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.fromDate!);
    }
    if (filters.toDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.toDate!);
    }
  }
  
  // Sort by timestamp descending (newest first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (filters?.limit) {
    filteredLogs = filteredLogs.slice(0, filters.limit);
  }
  
  return filteredLogs;
};

// Get audit log statistics for monitoring
export const getAuditStats = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentLogs = auditLogs.filter(log => log.timestamp >= oneHourAgo);
  const dailyLogs = auditLogs.filter(log => log.timestamp >= oneDayAgo);
  
  return {
    total: auditLogs.length,
    lastHour: {
      total: recentLogs.length,
      failed: recentLogs.filter(log => !log.success).length,
      actions: recentLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    lastDay: {
      total: dailyLogs.length,
      failed: dailyLogs.filter(log => !log.success).length,
      uniqueUsers: new Set(dailyLogs.map(log => log.userId).filter(Boolean)).size
    }
  };
};

export const checkIPBlacklist = (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Skip IP blacklist check for localhost in development
    if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost' || clientIP.startsWith('::ffff:127.')) {
      return next();
    }
    
    if (ipBlacklist.has(clientIP)) {
      auditLog(req, 'BLOCKED_IP_ACCESS', undefined, false, { ip: clientIP });
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  } catch (error) {
    console.error('IP blacklist check error:', error);
    next(); // Continue on error for development
  }
};

export const rateLimiter = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
      
      // Skip rate limiting for localhost in development
      if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost' || clientIP.startsWith('::ffff:127.')) {
        return next();
      }
      
      const now = Date.now();
      const key = `${clientIP}_general`;
      
      let entry = rateLimitStore.get(key);
      
      if (!entry || now > entry.resetTime) {
        entry = { count: 1, resetTime: now + windowMs };
        rateLimitStore.set(key, entry);
        return next();
      }
      
      if (entry.count >= maxRequests) {
        auditLog(req, 'RATE_LIMIT_EXCEEDED', undefined, false, { ip: clientIP, count: entry.count });
        return res.status(429).json({ 
          error: 'Too many requests', 
          retryAfter: Math.ceil((entry.resetTime - now) / 1000) 
        });
      }
      
      entry.count++;
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Continue on error for development
    }
  };
};

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Skip login rate limiting for localhost in development
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost' || clientIP.startsWith('::ffff:127.')) {
    return next();
  }
  
  const now = Date.now();
  const key = `${clientIP}_login`;
  
  let entry = loginAttempts.get(key);
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Increased from 5 to 10
  
  if (!entry) {
    entry = { count: 0, lastAttempt: now, blocked: false };
    loginAttempts.set(key, entry);
  }
  
  // Reset counter if window expired
  if (now - entry.lastAttempt > windowMs) {
    entry.count = 0;
    entry.blocked = false;
  }
  
  if (entry.blocked) {
    auditLog(req, 'LOGIN_ATTEMPT_BLOCKED', undefined, false, { ip: clientIP, reason: 'IP temporarily blocked' });
    return res.status(429).json({ 
      error: 'Too many failed login attempts. Try again later.',
      retryAfter: Math.ceil((entry.lastAttempt + windowMs - now) / 1000)
    });
  }
  
  next();
};

export const recordFailedLogin = (req: Request) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const key = `${clientIP}_login`;
  
  let entry = loginAttempts.get(key) || { count: 0, lastAttempt: now, blocked: false };
  
  entry.count++;
  entry.lastAttempt = now;
  
  if (entry.count >= 5) {
    entry.blocked = true;
    
    // Send notification for suspicious activity
    notificationService.sendNotification({
      type: 'fraud_detected',
      userId: 'system',
      data: {
        fraudType: 'Multiple failed login attempts',
        description: `${entry.count} failed login attempts from IP ${clientIP}`,
        ip: clientIP,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date()
    });
  }
  
  loginAttempts.set(key, entry);
  auditLog(req, 'FAILED_LOGIN', undefined, false, { ip: clientIP, attempts: entry.count });
};

// Device tracking for new device notifications
const knownDevices = new Map<string, Set<string>>(); // userId -> set of device fingerprints

export const trackDevice = async (req: Request, userId: string) => {
  const deviceFingerprint = `${req.ip}_${req.get('User-Agent')}`;
  const userDevices = knownDevices.get(userId) || new Set();
  
  if (!userDevices.has(deviceFingerprint)) {
    userDevices.add(deviceFingerprint);
    knownDevices.set(userId, userDevices);
    
    // If user has other devices, this is a new device
    if (userDevices.size > 1) {
      await notificationService.sendNotification({
        type: 'new_device_login',
        userId,
        data: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          email: req.user?.email
        },
        timestamp: new Date()
      });
    }
  }
};

// Fraud detection patterns
export const detectFraud = (req: Request, action: string, details: any) => {
  const clientIP = req.ip || req.connection.remoteAddress || '';
  const patterns = [];
  
  // Pattern 1: Multiple different emails from same IP
  if (action === 'registration' && details.email) {
    // This would be implemented with proper storage in production
    patterns.push('multiple_registrations_same_ip');
  }
  
  // Pattern 2: Suspicious user agent
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.length < 10) {
    patterns.push('suspicious_user_agent');
  }
  
  // Pattern 3: Known VPN/Proxy IPs (simplified check)
  if (clientIP.startsWith('10.') || clientIP.startsWith('192.168.') || clientIP === '127.0.0.1') {
    // This is just an example - in production you'd use a proper VPN detection service
    patterns.push('potential_vpn');
  }
  
  if (patterns.length > 0) {
    notificationService.sendNotification({
      type: 'fraud_detected',
      userId: req.user?.id || 'anonymous',
      data: {
        fraudType: patterns.join(', '),
        description: `Detected patterns: ${patterns.join(', ')}`,
        ip: clientIP,
        userAgent,
        action,
        details
      },
      timestamp: new Date()
    });
  }
};

// Helper functions for getting audit logs
export const getAuditLogs = (filters?: {
  userId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}) => {
  let filtered = [...auditLogs];
  
  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  
  if (filters?.action) {
    filtered = filtered.filter(log => log.action.includes(filters.action || ''));
  }
  
  if (filters?.fromDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.fromDate!);
  }
  
  if (filters?.toDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.toDate!);
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
};

export const addToBlacklist = (ip: string) => {
  ipBlacklist.add(ip);
  console.log(`IP ${ip} added to blacklist`);
};

export const removeFromBlacklist = (ip: string) => {
  ipBlacklist.delete(ip);
  console.log(`IP ${ip} removed from blacklist`);
};

export const getBlacklistedIPs = () => {
  return Array.from(ipBlacklist);
};