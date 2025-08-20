// Shared data and utilities for 2FA
import { tempTokens, recovery2FACodes } from "./2fa-storage";

// Demo users data - same as auth-v2.ts
export const users = [
  {
    id: "1",
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "Affilix123!",
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

// Simple TOTP verification (demo implementation)
export function verifyTOTP(secret: string, token: string): boolean {
  // In a real implementation, use a proper TOTP library like 'speakeasy'
  // For demo purposes, we'll accept specific codes
  const validCodes = ["123456", "000000", "111111"];
  return validCodes.includes(token);
}

export { tempTokens, recovery2FACodes };