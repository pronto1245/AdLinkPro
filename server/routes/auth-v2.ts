import express, { Router } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { Pool } from "pg";
import { DatabasePasswordResetService, InMemoryPasswordResetService, PasswordResetService } from "../services/password-reset";

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

// Initialize password reset service
let passwordResetService: PasswordResetService;

// Initialize with database service (will be set up when pool is available)
export function initPasswordResetService(pool: Pool) {
  passwordResetService = new DatabasePasswordResetService(pool);
}

// Fallback to in-memory service if no database
if (!passwordResetService) {
  passwordResetService = new InMemoryPasswordResetService(users);
}

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
authV2Router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Request password reset
    const result = await passwordResetService.requestPasswordReset(email);

    console.log(`[AUTH] Password reset requested for: ${email}`);
    
    return res.json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error("Password recovery error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "Произошла ошибка при обработке запроса"
    });
  }
});

// Validate reset token endpoint
authV2Router.post("/validate-reset-token", async (req, res) => {
  try {
    const { token } = req.body || {};
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const validation = await passwordResetService.validateResetToken(token);
    
    return res.json({
      valid: validation.valid,
      message: validation.valid ? "Token is valid" : "Invalid or expired token"
    });

  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Complete password reset endpoint
authV2Router.post("/complete-password-reset", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Basic password validation
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: "Password too short",
        message: "Пароль должен содержать минимум 8 символов"
      });
    }

    const result = await passwordResetService.resetPassword(token, newPassword);
    
    if (result.success) {
      console.log(`[AUTH] Password reset completed successfully`);
      return res.json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error("Password reset completion error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "Произошла ошибка при сбросе пароля"
    });
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