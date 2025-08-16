// Re-export authentication functions from middleware
export { authenticateToken, getAuthenticatedUser, requireRole, AuthenticatedRequest } from './middleware/auth.js';