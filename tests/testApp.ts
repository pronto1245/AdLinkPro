import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

// Create test app instance
export function createTestApp() {
  const app = express();
  
  // Shared storage for test
  const tempTokensMap = new Map();
  
  // Basic middleware
  app.use(express.json());
  app.use(cors());

  // Health endpoint
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // /api/me endpoint (from server/index.ts)
  app.get('/api/me', (req, res) => {
    try {
      const h = String(req.headers['authorization'] || '');
      const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
      if (!raw) return res.status(401).json({ error: 'no token' });
      const p = jwt.verify(raw, process.env.JWT_SECRET!) as any;
      const role = String(p.role || '').toLowerCase();
      const map: any = { 
        partner: 'partner', 
        advertiser: 'advertiser', 
        owner: 'owner', 
        super_admin: 'super_admin', 
        'super admin': 'super_admin',
        affiliate: 'affiliate'
      };
      const norm = map[role] || role;
      res.json({ 
        id: p.sub || p.id || null, 
        username: p.username || null, 
        email: p.email || null, 
        role: norm 
      });
    } catch(e) {
      res.status(401).json({ error: 'invalid token' });
    }
  });

  // User passwords store for dynamic updates
  let userPasswords: any = {
    'test-partner@example.com': 'partner123',
    'partner': 'partner123'
  };

  // Main auth login endpoint (from server/index.ts)
  app.post("/api/auth/login", (req, res) => {
    try {
      const users = [
        { 
          email: process.env.OWNER_EMAIL || "test-owner@example.com", 
          password: process.env.OWNER_PASSWORD || "owner123", 
          role: "OWNER", 
          sub: "owner-1", 
          username: "owner" 
        },
        { 
          email: process.env.ADVERTISER_EMAIL || "test-advertiser@example.com", 
          password: process.env.ADVERTISER_PASSWORD || "adv123", 
          role: "ADVERTISER", 
          sub: "adv-1", 
          username: "advertiser" 
        },
        { 
          email: process.env.PARTNER_EMAIL || "test-partner@example.com", 
          password: userPasswords['test-partner@example.com'] || process.env.PARTNER_PASSWORD || "partner123", 
          role: "PARTNER", 
          sub: "partner-1", 
          username: "partner" 
        },
        { 
          email: process.env.SUPER_ADMIN_EMAIL || "test-superadmin@example.com", 
          password: process.env.SUPER_ADMIN_PASSWORD || "admin123", 
          role: "SUPER_ADMIN", 
          sub: "super-admin-1", 
          username: "super_admin" 
        },
        { 
          email: process.env.AFFILIATE_EMAIL || "test-affiliate@example.com", 
          password: process.env.AFFILIATE_PASSWORD || "affiliate123", 
          role: "AFFILIATE", 
          sub: "affiliate-1", 
          username: "affiliate" 
        },
      ];

      const b = req.body || {};
      const ident = String((b.email || b.username || "")).toLowerCase();
      const pass = String(b.password || "");
      
      if (!ident || !pass) {
        return res.status(400).json({ error: "email/username and password are required" });
      }

      const u = users.find(x => x.email.toLowerCase() === ident || x.username.toLowerCase() === ident);
      if (!u || u.password !== pass) {
        return res.status(401).json({ error: "invalid credentials" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

      const token = jwt.sign(
        { sub: u.sub, role: u.role, email: u.email, username: u.username }, 
        secret, 
        { expiresIn: "7d" }
      );
      
      return res.json({ 
        token,
        user: {
          email: u.email,
          role: u.role,
          username: u.username,
          sub: u.sub
        }
      });
    } catch(e) {
      console.error("auth login error:", e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  // 2FA Login endpoint - simplified version for testing
  app.post("/api/auth/v2/login", (req, res) => {
    try {
      const users = [
        { 
          id: "1",
          email: process.env.OWNER_EMAIL || "test-owner@example.com", 
          password: process.env.OWNER_PASSWORD || "owner123", 
          role: "OWNER", 
          sub: "owner-1", 
          username: "owner",
          twoFactorEnabled: false,
          twoFactorSecret: null
        },
        { 
          id: "2",
          email: process.env.ADVERTISER_EMAIL || "test-advertiser@example.com", 
          password: process.env.ADVERTISER_PASSWORD || "adv123", 
          role: "ADVERTISER", 
          sub: "adv-1", 
          username: "advertiser",
          twoFactorEnabled: false,  // 2FA disabled for all users
          twoFactorSecret: null
        },
        { 
          id: "3",
          email: process.env.PARTNER_EMAIL || "test-partner@example.com", 
          password: process.env.PARTNER_PASSWORD || "partner123", 
          role: "PARTNER", 
          sub: "partner-1", 
          username: "partner",
          twoFactorEnabled: false,
          twoFactorSecret: null
        }
      ];

      const { username, password } = req.body || {};
      
      if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
      }

      const user = users.find(u => 
        u.email.toLowerCase() === username.toLowerCase() || 
        u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "invalid credentials" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

      // Always perform direct login (2FA disabled for all users)
      const token = jwt.sign(
        { sub: user.sub, role: user.role, email: user.email, username: user.username },
        secret,
        { expiresIn: "7d" }
      );

      return res.json({ 
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          twoFactorEnabled: false // Always false - 2FA disabled
        }
      });
    } catch(e) {
      console.error("auth v2 login error:", e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  // 2FA Verification endpoint (old endpoint - expects tempToken directly in tests)
  app.post("/api/auth/v2/verify-2fa", (req, res) => {
    try {
      const { tempToken, code } = req.body || {};
      
      if (!tempToken || !code) {
        return res.status(400).json({ error: "tempToken and code are required" });
      }

      const tokenData = tempTokensMap.get(tempToken);
      if (!tokenData) {
        return res.status(401).json({ error: "Invalid or expired temporary token" });
      }

      // Check if temp token is expired (5 minutes)
      if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
        tempTokensMap.delete(tempToken);
        return res.status(401).json({ error: "Temporary token expired" });
      }

      // Demo TOTP verification - only 123456 is valid for tests
      const validCodes = ["123456"]; // Only 123456 is valid, 000000 should be invalid
      if (!validCodes.includes(code)) {
        return res.status(401).json({ error: "Invalid 2FA code" });
      }

      // Clean up temp token
      tempTokensMap.delete(tempToken);

      // Generate actual JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

      const user = tokenData.user;
      const authToken = jwt.sign(
        { sub: user.sub, role: user.role, email: user.email, username: user.username },
        secret,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        token: authToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });

    } catch (error) {
      console.error("2FA verification error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2FA Verification endpoint (new endpoint - direct parameters)
  app.post("/api/auth/2fa/verify", (req, res) => {
    try {
      const { tempToken, code } = req.body || {};
      
      if (!tempToken || !code) {
        return res.status(400).json({ error: "tempToken and code are required" });
      }

      const tokenData = tempTokensMap.get(tempToken);
      if (!tokenData) {
        return res.status(401).json({ error: "Invalid or expired temporary token" });
      }

      // Check if temp token is expired (5 minutes)
      if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
        tempTokensMap.delete(tempToken);
        return res.status(401).json({ error: "Temporary token expired" });
      }

      // Demo TOTP verification - accept specific codes
      const validCodes = ["123456", "000000", "111111"];
      if (!validCodes.includes(code)) {
        return res.status(401).json({ error: "Invalid 2FA code" });
      }

      // Clean up temp token
      tempTokensMap.delete(tempToken);

      // Generate actual JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

      const user = tokenData.user;
      const authToken = jwt.sign(
        { sub: user.sub, role: user.role, email: user.email, username: user.username },
        secret,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        token: authToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });

    } catch (error) {
      console.error("2FA verification error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add dashboard API endpoints for testing
  
  // Mock authentication middleware for dashboard endpoints
  const authenticateToken = (req: express.Request, res: express.Response, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
      }
      
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Mock role-based middleware
  const requireRole = (roles: string[]) => {
    return (req: express.Request, res: express.Response, next: any) => {
      const user = (req as any).user;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  };

  // Owner Dashboard APIs
  app.get('/api/owner/metrics', authenticateToken, requireRole(['OWNER']), (req, res) => {
    res.json({
      total_revenue: 125000.50,
      active_advertisers: 45,
      active_partners: 123,
      platform_growth: 15.2,
      period: req.query.period || '30d'
    });
  });

  app.get('/api/owner/business-overview', authenticateToken, requireRole(['OWNER']), (req, res) => {
    res.json({
      total_offers: 234,
      active_campaigns: 87,
      monthly_revenue: 45000.75,
      growth_rate: 12.5,
      top_performers: [
        { id: 1, name: 'Campaign A', revenue: 15000 },
        { id: 2, name: 'Campaign B', revenue: 12000 }
      ]
    });
  });

  // Advertiser Dashboard API
  app.get('/api/advertiser/dashboard', authenticateToken, requireRole(['ADVERTISER']), (req, res) => {
    res.json({
      metrics: {
        total_clicks: 15420,
        total_conversions: 876,
        total_revenue: 32450.75,
        conversion_rate: 5.68,
        active_offers: 12,
        pending_offers: 3
      },
      charts: {
        revenue_trend: [
          { date: '2024-01-01', revenue: 1200 },
          { date: '2024-01-02', revenue: 1450 }
        ],
        conversion_metrics: [
          { offer: 'Offer A', conversions: 45 },
          { offer: 'Offer B', conversions: 32 }
        ]
      }
    });
  });

  // Affiliate/Partner Dashboard API
  app.get('/api/affiliate/dashboard', authenticateToken, requireRole(['PARTNER', 'AFFILIATE']), (req, res) => {
    res.json({
      metrics: {
        clicks: 8750,
        conversions: 234,
        revenue: 4567.89,
        conversion_rate: 2.67,
        approved_offers: 15,
        pending_offers: 2
      },
      charts: {
        performance_trend: [
          { date: '2024-01-01', clicks: 450, conversions: 12 },
          { date: '2024-01-02', clicks: 523, conversions: 15 }
        ]
      }
    });
  });

  // Admin Dashboard APIs
  app.get('/api/admin/metrics', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
    res.json({
      total_users: 1234,
      total_offers: 567,
      total_revenue: 234567.89,
      fraud_alerts: 12,
      system_health: 98.5,
      period: req.query.period || '30d'
    });
  });

  app.get('/api/admin/system-stats', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
    res.json({
      cpu_usage: 45.2,
      memory_usage: 67.8,
      disk_usage: 34.1,
      active_connections: 156,
      uptime: 98.9,
      server_health: 'healthy'
    });
  });

  // Simple auth middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.sendStatus(401);
      }

      jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    } catch (error) {
      return res.sendStatus(401);
    }
  };

  // Role checking middleware
  const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      const userRole = req.user?.role?.toLowerCase();
      const allowedRoles = roles.map(role => role.toLowerCase());
      
      if (!allowedRoles.includes('affiliate') && !allowedRoles.includes('partner')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (userRole !== 'partner' && userRole !== 'affiliate') {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    };
  };

  // Mock user data store
  let mockUsers: any = {
    'partner-1': {
      id: 'partner-1',
      email: 'test-partner@example.com',
      role: 'AFFILIATE',
      username: 'partner',
      firstName: 'Test',
      lastName: 'Partner',
      company: '',
      country: '',
      timezone: 'UTC',
      currency: 'USD',
      telegram: '',
      phone: '',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPJSfncq6' // 'partner123'
    }
  };

  // Partner profile endpoints
  app.get('/api/partner/profile', authenticateToken, requireRole(['affiliate']), (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.id;
      const user = mockUsers[userId];
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return profile without sensitive data
      const { passwordHash, ...profileData } = user;
      res.json(profileData);
    } catch (error) {
      console.error('Get partner profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/partner/profile', authenticateToken, requireRole(['affiliate']), (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.id;
      const user = mockUsers[userId];
      const updateData = req.body;
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validation
      if (updateData.firstName && updateData.firstName.trim().length === 0) {
        return res.status(400).json({ error: 'First name cannot be whitespace only' });
      }
      if (updateData.lastName && updateData.lastName.trim().length === 0) {
        return res.status(400).json({ error: 'Last name cannot be whitespace only' });
      }
      
      // Validate Telegram if provided
      if (updateData.telegram !== undefined) {
        const trimmed = updateData.telegram.trim();
        if (trimmed) {
          const telegramValue = trimmed.replace(/^@+/, '');
          const telegramRegex = /^[a-zA-Z0-9_]+$/;
          if (!telegramRegex.test(telegramValue)) {
            return res.status(400).json({ 
              error: 'Invalid Telegram username format. Only letters, digits, and underscores allowed' 
            });
          }
          updateData.telegram = '@' + telegramValue;
        } else {
          updateData.telegram = '';
        }
      }

      // Update user data
      mockUsers[userId] = { ...user, ...updateData };
      const { passwordHash, ...profileData } = mockUsers[userId];
      
      res.json(profileData);
    } catch (error) {
      console.error('Update partner profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/partner/profile/change-password', authenticateToken, requireRole(['affiliate']), (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.id;
      const user = mockUsers[userId];
      const { currentPassword, newPassword } = req.body;
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      
      // Check current password (simplified check - in real app use bcrypt)
      if (currentPassword !== userPasswords['test-partner@example.com'] && currentPassword !== userPasswords['partner']) {
        return res.status(400).json({ error: 'Invalid current password' });
      }
      
      // Update password in both user store and login credentials
      mockUsers[userId].passwordHash = 'hashed_' + newPassword;
      userPasswords['test-partner@example.com'] = newPassword;
      userPasswords['partner'] = newPassword;
      
      res.json({ success: true });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}