// Shared data and utilities for 2FA
import { tempTokens, recovery2FACodes } from "./2fa-storage";
import { should2FABeSkipped } from "./2fa-config";

// Demo users data - same as auth-v2.ts
// 2FA is disabled for all users per system configuration
export const users = [
  {
    id: "1",
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "Affilix123!",
    role: "OWNER",
    sub: "owner-1",
    username: "owner",
    twoFactorEnabled: false, // System-wide disabled
    twoFactorSecret: null,
  },
  {
    id: "2", 
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "adv123",
    role: "ADVERTISER",
    sub: "adv-1",
    username: "advertiser",
    twoFactorEnabled: false, // System-wide disabled
    twoFactorSecret: null,
  },
  {
    id: "3",
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    password: process.env.PARTNER_PASSWORD || "partner123",
    role: "PARTNER",
    sub: "partner-1",
    username: "partner",
    twoFactorEnabled: false, // System-wide disabled
    twoFactorSecret: null,
  },
];

// Simple TOTP verification (demo implementation)
// Always returns true when 2FA is system-wide disabled
export function verifyTOTP(secret: string, token: string): boolean {
  // If 2FA is disabled system-wide, always return true to bypass verification
  if (should2FABeSkipped()) {
    return true;
  }
  
  // In a real implementation, use a proper TOTP library like 'speakeasy'
  // For demo purposes, we'll accept specific codes
  const validCodes = ["123456", "000000", "111111"];
  return validCodes.includes(token);
}

export { tempTokens, recovery2FACodes };