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
          password: process.env.PARTNER_PASSWORD || "partner123", 
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
          twoFactorEnabled: true,  // Advertiser has 2FA enabled
          twoFactorSecret: "JBSWY3DPEHPK3PXP" // Demo secret
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

      // Check if user has 2FA enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const crypto = require('crypto');
        const tempToken = crypto.randomBytes(32).toString('hex');
        
        // Store temp token with user data
        tempTokensMap.set(tempToken, {
          userId: user.id,
          timestamp: Date.now(),
          user: user
        });
        
        // Clean up expired temp tokens (5 minutes)
        setTimeout(() => {
          tempTokensMap.delete(tempToken);
        }, 5 * 60 * 1000);
        
        return res.json({
          requires2FA: true,
          tempToken: tempToken,
          message: "Please provide 2FA code"
        });
      }

      // Normal login without 2FA
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
          twoFactorEnabled: user.twoFactorEnabled
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

  return app;
}