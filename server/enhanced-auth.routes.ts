import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginRateLimiter, recordFailedLogin } from "./middleware/security";
import { nanoid } from "nanoid";

export const enhancedAuthRouter = Router();
enhancedAuthRouter.use(express.json());

// In-memory refresh token store (in production, use Redis or database)
const refreshTokenStore = new Map<string, {
  userId: string;
  email: string;
  role: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
}>();

const users = [
  {
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "owner123",
    role: "OWNER",
    sub: "owner-1",
    username: "owner",
  },
  {
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "adv123",
    role: "ADVERTISER",
    sub: "adv-1",
    username: "advertiser",
  },
  {
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    password: process.env.PARTNER_PASSWORD || "partner123",
    role: "PARTNER",
    sub: "partner-1",
    username: "partner",
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // Short-lived access tokens
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function generateTokens(user: any): AuthTokens {
  const accessTokenPayload = {
    sub: user.sub,
    role: user.role,
    email: user.email,
    username: user.username,
    type: 'access'
  };

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

  // Generate unique refresh token
  const refreshTokenId = nanoid(32);
  const issuedAt = Date.now();
  const expiresAt = issuedAt + REFRESH_TOKEN_EXPIRES_IN;

  // Store refresh token metadata
  refreshTokenStore.set(refreshTokenId, {
    userId: user.sub,
    email: user.email,
    role: user.role,
    username: user.username,
    issuedAt,
    expiresAt
  });

  const refreshToken = jwt.sign(
    { 
      jti: refreshTokenId,
      sub: user.sub,
      type: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  };
}

// Enhanced login endpoint with improved error messages and refresh tokens
enhancedAuthRouter.post("/login", loginRateLimiter, (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const identifier = (body.email || body.username || "").toLowerCase().trim();
    const password = body.password || "";

    // Enhanced input validation with specific error messages
    if (!identifier && !password) {
      return res.status(400).json({ 
        error: "Authentication credentials required",
        message: "Please provide both email/username and password",
        code: "MISSING_CREDENTIALS"
      });
    }

    if (!identifier) {
      return res.status(400).json({ 
        error: "Email or username required",
        message: "Please provide your email address or username",
        code: "MISSING_IDENTIFIER"
      });
    }

    if (!password) {
      return res.status(400).json({ 
        error: "Password required",
        message: "Please provide your password",
        code: "MISSING_PASSWORD"
      });
    }

    if (identifier.length < 3) {
      return res.status(400).json({ 
        error: "Invalid email or username format",
        message: "Email or username must be at least 3 characters long",
        code: "INVALID_IDENTIFIER_LENGTH"
      });
    }

    if (password.length < 3) {
      return res.status(400).json({ 
        error: "Invalid password format",
        message: "Password must be at least 3 characters long",
        code: "INVALID_PASSWORD_LENGTH"
      });
    }

    // Find user by email or username
    const user = users.find(u => 
      u.email.toLowerCase() === identifier || 
      u.username.toLowerCase() === identifier
    );

    if (!user || user.password !== password) {
      // Record failed login attempt for security monitoring
      recordFailedLogin(req);
      
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "The email/username or password you entered is incorrect. Please check your credentials and try again.",
        code: "INVALID_CREDENTIALS"
      });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ 
        error: "Service configuration error",
        message: "Authentication service is temporarily unavailable. Please try again later.",
        code: "CONFIG_ERROR"
      });
    }

    // Generate access and refresh tokens
    const tokens = generateTokens(user);

    // Return successful response with tokens
    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      ...tokens,
      user: {
        id: user.sub,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "An unexpected error occurred during authentication. Please try again later.",
      code: "INTERNAL_ERROR"
    });
  }
});

// New refresh token endpoint
enhancedAuthRouter.post("/refresh", (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token required",
        message: "Please provide a valid refresh token",
        code: "MISSING_REFRESH_TOKEN"
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: "Refresh token expired",
          message: "Your session has expired. Please log in again.",
          code: "REFRESH_TOKEN_EXPIRED"
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: "Invalid refresh token",
          message: "The provided refresh token is invalid. Please log in again.",
          code: "INVALID_REFRESH_TOKEN"
        });
      }
      throw error;
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: "Invalid token type",
        message: "The provided token is not a refresh token",
        code: "INVALID_TOKEN_TYPE"
      });
    }

    // Check if refresh token exists in store
    const tokenData = refreshTokenStore.get(decoded.jti);
    if (!tokenData) {
      return res.status(401).json({
        error: "Refresh token revoked",
        message: "This refresh token has been revoked. Please log in again.",
        code: "REFRESH_TOKEN_REVOKED"
      });
    }

    // Check if refresh token is expired
    if (Date.now() > tokenData.expiresAt) {
      // Clean up expired token
      refreshTokenStore.delete(decoded.jti);
      return res.status(401).json({
        error: "Refresh token expired",
        message: "Your session has expired. Please log in again.",
        code: "REFRESH_TOKEN_EXPIRED"
      });
    }

    // Find the user (in a real app, you'd query the database)
    const user = users.find(u => u.sub === tokenData.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "The user associated with this token no longer exists",
        code: "USER_NOT_FOUND"
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Remove the old refresh token
    refreshTokenStore.delete(decoded.jti);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      ...tokens
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while refreshing your token. Please try again later.",
      code: "INTERNAL_ERROR"
    });
  }
});

// Logout endpoint to revoke refresh token
enhancedAuthRouter.post("/logout", (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
        if (decoded.jti) {
          refreshTokenStore.delete(decoded.jti);
        }
      } catch (error) {
        // Token might be invalid, but we still want to return success
        console.log("Invalid refresh token during logout:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred during logout",
      code: "INTERNAL_ERROR"
    });
  }
});

// Token validation endpoint for backward compatibility
enhancedAuthRouter.get("/me", (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: "Authorization header missing",
        message: "Please provide a valid authorization token",
        code: "MISSING_AUTH_HEADER"
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Return user info from token
      return res.status(200).json({
        success: true,
        user: {
          id: decoded.sub,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role
        }
      });

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: "Access token expired",
          message: "Your access token has expired. Please refresh your token or log in again.",
          code: "ACCESS_TOKEN_EXPIRED"
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: "Invalid access token",
          message: "The provided access token is invalid",
          code: "INVALID_ACCESS_TOKEN"
        });
      }
      throw error;
    }

  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while validating your token",
      code: "INTERNAL_ERROR"
    });
  }
});

export default enhancedAuthRouter;