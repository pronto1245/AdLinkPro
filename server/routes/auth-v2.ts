import express, { Router } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { Pool } from "pg";
import { DatabasePasswordResetService, InMemoryPasswordResetService, PasswordResetService } from "../services/password-reset";
import { tempTokens, recovery2FACodes, users, verifyTOTP } from "../shared/2fa-utils";

export const authV2Router = Router();
authV2Router.use(express.json());

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

// Enhanced login endpoint without 2FA requirement
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

    // Always perform direct login (bypassing 2FA for simplified flow)
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
        twoFactorEnabled: false // Always false for simplified login
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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