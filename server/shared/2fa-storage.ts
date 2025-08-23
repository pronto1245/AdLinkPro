// Shared storage for 2FA temporary tokens
// In production, use Redis or another distributed cache

export const tempTokens = new Map();
export const recovery2FACodes = new Map();
