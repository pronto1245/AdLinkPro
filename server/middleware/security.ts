import { Request, Response, NextFunction } from 'express';

// IP blacklist - in production, store in database
const blacklistedIPs = new Set<string>();

// Rate limiting tracker
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

// Failed login attempts tracker
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const checkIPBlacklist = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (blacklistedIPs.has(clientIP)) {
    console.log(`Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({ 
      error: 'Access denied. Your IP address has been blocked.' 
    });
  }
  
  next();
};

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!rateLimitTracker.has(clientIP)) {
      rateLimitTracker.set(clientIP, { count: 1, resetTime: now + windowMs });
    } else {
      const tracker = rateLimitTracker.get(clientIP)!;
      
      if (now > tracker.resetTime) {
        tracker.count = 1;
        tracker.resetTime = now + windowMs;
      } else {
        tracker.count++;
        
        if (tracker.count > maxRequests) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((tracker.resetTime - now) / 1000)
          });
        }
      }
    }
    
    next();
  };
};

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();
  
  const attempts = failedLoginAttempts.get(clientIP);
  
  if (attempts) {
    const timeDiff = now.getTime() - attempts.lastAttempt.getTime();
    const resetTime = 15 * 60 * 1000; // 15 minutes
    
    if (timeDiff < resetTime && attempts.count >= 5) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again in 15 minutes.',
        retryAfter: Math.ceil((resetTime - timeDiff) / 1000)
      });
    }
    
    if (timeDiff >= resetTime) {
      failedLoginAttempts.delete(clientIP);
    }
  }
  
  next();
};

export const recordFailedLogin = (ip: string) => {
  const attempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
  attempts.count++;
  attempts.lastAttempt = new Date();
  failedLoginAttempts.set(ip, attempts);
  
  // Auto-blacklist after 10 failed attempts
  if (attempts.count >= 10) {
    blacklistedIPs.add(ip);
    console.log(`Auto-blacklisted IP after 10 failed login attempts: ${ip}`);
  }
};

export const addToBlacklist = (ip: string, reason?: string) => {
  blacklistedIPs.add(ip);
  console.log(`IP ${ip} added to blacklist. Reason: ${reason || 'Manual'}`);
};

export const removeFromBlacklist = (ip: string) => {
  blacklistedIPs.delete(ip);
  console.log(`IP ${ip} removed from blacklist`);
};

export const getBlacklistedIPs = () => {
  return Array.from(blacklistedIPs);
};

export const auditLog = (action: string, userId?: string, resourceType?: string, resourceId?: string, ipAddress?: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    resourceType,
    resourceId,
    ipAddress,
    details
  };
  
  // In production, save to database
  console.log('AUDIT LOG:', JSON.stringify(logEntry));
  
  return logEntry;
};