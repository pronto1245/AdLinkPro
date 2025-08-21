import express, { Router } from "express";
import jwt from "jsonwebtoken";
import { findUserByEmail, checkPassword } from "../src/services/users";

export const devLoginRouter = Router();
devLoginRouter.use(express.json());

// Get JWT secret safely
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return secret;
}

// FIXED: Now uses database authentication with bcrypt
devLoginRouter.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const email = (body.email || body.username || "").toLowerCase();
    const password = body.password || "";
    
    console.log(`🔐 [DEV-LOGIN] Database login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ error: "email/username and password are required" });
    }
    
    // First try database authentication
    console.log(`🔍 [DEV-LOGIN] Looking up user in database: ${email}`);
    let user = await findUserByEmail(email);
    
    if (user) {
      console.log(`✅ [DEV-LOGIN] User found in database: ${user.email}`);
      
      // Use bcrypt to verify password
      const passwordValid = await checkPassword(user, password);
      
      if (!passwordValid) {
        console.log(`❌ [DEV-LOGIN] Invalid password for database user: ${user.email}`);
        return res.status(401).json({ error: "invalid credentials" });
      }
      
      console.log(`✅ [DEV-LOGIN] Password valid for database user: ${user.email}`);
      
      const secret = getJWTSecret();
      const token = jwt.sign(
        { sub: user.id, role: user.role, email: user.email, username: user.username },
        secret,
        { expiresIn: "7d" }
      );
      
      console.log(`✅ [DEV-LOGIN] JWT token generated for database user: ${user.email}`);
      return res.json({ token });
    }
    
    // Fallback to hardcoded users for development
    console.log(`⚠️ [DEV-LOGIN] User not found in database, trying hardcoded users`);
    const hardcodedUsers = [
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
    
    const hardcodedUser = hardcodedUsers.find(u => u.email.toLowerCase() === email);
    if (!hardcodedUser || hardcodedUser.password !== password) {
      console.log(`❌ [DEV-LOGIN] Invalid credentials for hardcoded users`);
      return res.status(401).json({ error: "invalid credentials" });
    }
    
    console.log(`⚠️ [DEV-LOGIN] Using hardcoded user authentication: ${hardcodedUser.email}`);
    
    const secret = getJWTSecret();
    const token = jwt.sign(
      { sub: hardcodedUser.sub, role: hardcodedUser.role, email: hardcodedUser.email, username: hardcodedUser.username },
      secret,
      { expiresIn: "7d" }
    );
    
    return res.json({ token });
    
  } catch (error) {
    console.error(`💥 [DEV-LOGIN] Login error:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
