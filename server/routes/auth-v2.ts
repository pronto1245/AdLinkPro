import express, { Router } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export const authV2Router = Router();
authV2Router.use(express.json());

// Temporary storage for 2FA codes and temp tokens (in production, use Redis)
const tempTokens = new Map();
const recovery2FACodes = new Map();

const users = [
  {
    id: "1",
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "owner123",
    role: "OWNER",
    sub: "owner-1",
    username: "owner",
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
  {
    id: "2", 
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "adv123",
    role: "ADVERTISER",
    sub: "adv-1",
    username: "advertiser",
    twoFactorEnabled: true,
    twoFactorSecret: "JBSWY3DPEHPK3PXP", // Demo secret for testing
  },
  {
    id: "3",
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    password: process.env.PARTNER_PASSWORD || "partner123",
    role: "PARTNER",
    sub: "partner-1",
    username: "partner",
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
];

// Enhanced login endpoint with 2FA support
authV2Router.post("/login", (req, res) => {
  try {
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
      const tempToken = crypto.randomBytes(32).toString('hex');
      tempTokens.set(tempToken, {
        userId: user.id,
        timestamp: Date.now(),
        user: user
      });

      // Clean up expired temp tokens (5 minutes)
      setTimeout(() => {
        tempTokens.delete(tempToken);
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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Simple TOTP verification (demo implementation)
function verifyTOTP(secret: string, token: string): boolean {
  // In a real implementation, use a proper TOTP library like 'speakeasy'
  // For demo purposes, we'll accept specific codes
  const validCodes = ["123456", "000000", "111111"];
  return validCodes.includes(token);
}

// 2FA verification endpoint
authV2Router.post("/verify-2fa", (req, res) => {
  try {
    const { token: tempToken, code } = req.body || {};
    
    if (!tempToken || !code) {
      return res.status(400).json({ error: "Temporary token and 2FA code are required" });
    }

    const tokenData = tempTokens.get(tempToken);
    if (!tokenData) {
      return res.status(401).json({ error: "Invalid or expired temporary token" });
    }

    // Check if temp token is expired (5 minutes)
    if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
      tempTokens.delete(tempToken);
      return res.status(401).json({ error: "Temporary token expired" });
    }

    const user = tokenData.user;
    
    // Verify 2FA code
    if (!verifyTOTP(user.twoFactorSecret, code)) {
      return res.status(401).json({ error: "Invalid 2FA code" });
    }

    // Clean up temp token
    tempTokens.delete(tempToken);

    // Generate actual JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

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

// Password recovery endpoint
authV2Router.post("/reset-password", (req, res) => {
  try {
    const { email } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Always return success to prevent email enumeration
    // In a real implementation, send an actual email with reset link
    console.log(`Password reset requested for email: ${email}`);
    
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      console.log(`Generated reset token for ${user.username}: ${resetToken}`);
      
      // Store reset token with expiration (would use database in production)
      // For demo, just log it
    }

    return res.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Password recovery error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 2FA toggle endpoint for user profile
authV2Router.post("/2fa/toggle", (req, res) => {
  try {
    // In a real implementation, verify JWT token and get user ID
    const { enabled } = req.body || {};
    
    // Demo response - in production, update user in database
    return res.json({
      success: true,
      message: enabled ? "2FA enabled" : "2FA disabled",
      twoFactorEnabled: enabled
    });

  } catch (error) {
    console.error("2FA toggle error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default authV2Router;