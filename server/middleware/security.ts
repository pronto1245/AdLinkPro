import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification';

// IP Blacklist storage (in production use Redis or database)
const ipBlacklist = new Set<string>([
  // Common suspicious IPs would be added here
]);

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();

// Enhanced Audit log storage with more detailed tracking
interface AuditEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  // Enhanced fields for better tracking
  origin?: string; // CORS origin
  referer?: string;
  geolocation?: string; // If IP geolocation service is available
  sessionId?: string;
  deviceFingerprint?: string;
  riskScore?: number;
}

const auditLogs: AuditEntry[] = [];

// Enhanced audit logging with CORS and IP-level tracking
export const auditLog = (req: Request, action: string, resource?: string, success: boolean = true, details?: any) => {
  const entry: AuditEntry = {
    timestamp: new Date(),
    userId: req.user?.id || req.user?.sub,
    action,
    resource,
    ip: getClientIP(req),
    userAgent: req.get('User-Agent'),
    success,
    details,
    // Enhanced tracking fields
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    sessionId: req.sessionID || req.get('x-session-id'),
    // Basic risk scoring based on request patterns
    riskScore: calculateRiskScore(req, action, success)
  };
  
  auditLogs.push(entry);
  
  // Keep only last 10000 entries (in production, should use database or log service)
  if (auditLogs.length > 10000) {
    auditLogs.splice(0, auditLogs.length - 10000);
  }
  
  // Enhanced logging with more context
  const logMessage = `AUDIT: ${action} by ${entry.userId || 'anonymous'} from ${entry.ip} (${entry.origin || 'no-origin'}) - ${success ? 'SUCCESS' : 'FAILED'}${entry.riskScore ? ` [Risk: ${entry.riskScore}]` : ''}`;
  console.log(logMessage);
  
  // Alert on high-risk activities
  if (entry.riskScore && entry.riskScore > 7) {
    console.warn(`🚨 HIGH RISK ACTIVITY DETECTED: ${logMessage}`, entry);
  }
  
  // Store suspicious activities for further analysis
  if (!success && entry.riskScore && entry.riskScore > 5) {
    storeSuspiciousActivity(entry);
  }
};

// Get client IP with proxy support
function getClientIP(req: Request): string {
  return (
    req.get('CF-Connecting-IP') || // Cloudflare
    req.get('True-Client-IP') ||   // Akamai/Cloudflare
    req.get('X-Real-IP') ||        // Nginx proxy
    req.get('X-Forwarded-For')?.split(',')[0]?.trim() || // Load balancer/proxy
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Calculate risk score based on various factors
function calculateRiskScore(req: Request, action: string, success: boolean): number {
  let score = 0;
  
  // Base score for failed attempts
  if (!success) score += 2;
  
  // High-risk actions
  const highRiskActions = ['INVALID_TOKEN', 'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED', 'OWNERSHIP_VIOLATION'];
  if (highRiskActions.includes(action)) score += 3;
  
  // Suspicious user agents
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.toLowerCase().includes('bot') || userAgent.length < 20) score += 2;
  
  // Missing or suspicious origins
  const origin = req.get('Origin');
  if (!origin && req.method === 'POST') score += 1;
  
  // Rate limiting violations
  const ip = getClientIP(req);
  const recentAttempts = auditLogs.filter(
    log => log.ip === ip && 
           Date.now() - log.timestamp.getTime() < 60000 // Last minute
  );
  if (recentAttempts.length > 10) score += 3;
  
  // Known suspicious IPs
  if (ipBlacklist.has(ip)) score += 5;
  
  return Math.min(score, 10); // Cap at 10
}

// Store suspicious activities for analysis
const suspiciousActivities: AuditEntry[] = [];

function storeSuspiciousActivity(entry: AuditEntry) {
  suspiciousActivities.push(entry);
  
  // Keep only last 1000 suspicious entries
  if (suspiciousActivities.length > 1000) {
    suspiciousActivities.splice(0, suspiciousActivities.length - 1000);
  }
}

// Get audit logs with filtering
export const getAuditLogs = (filters: {
  userId?: string;
  action?: string;
  ip?: string;
  success?: boolean;
  timeFrom?: Date;
  timeTo?: Date;
  limit?: number;
} = {}) => {
  let filtered = auditLogs;
  
  if (filters.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  
  if (filters.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }
  
  if (filters.ip) {
    filtered = filtered.filter(log => log.ip === filters.ip);
  }
  
  if (filters.success !== undefined) {
    filtered = filtered.filter(log => log.success === filters.success);
  }
  
  if (filters.timeFrom) {
    filtered = filtered.filter(log => log.timestamp >= filters.timeFrom!);
  }
  
  if (filters.timeTo) {
    filtered = filtered.filter(log => log.timestamp <= filters.timeTo!);
  }
  
  // Sort by timestamp (most recent first)
  filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply limit
  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
};

// Get suspicious activities
export const getSuspiciousActivities = () => {
  return suspiciousActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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

// The enhanced getAuditLogs function is already defined above

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