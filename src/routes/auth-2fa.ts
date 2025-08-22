import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
// REMOVED: import speakeasy from 'speakeasy' - no longer needed as 2FA is disabled
// REMOVED: import { users } from "../schema" - unused import
// REMOVED: import { createToken } from "../utils/jwt" - unused import  
// REMOVED: import { verifyPassword } from "../utils/password" - unused import
import { findUserByEmail, checkPassword } from '../services/users'

const router = Router()

// DISABLED: All 2FA routes have been completely disabled
// 2FA functionality has been removed as per requirements

// LEGACY: This route is kept for documentation purposes but marked as disabled
router.post('/api/auth/login-DISABLED', async (req: Request, res: Response) => {
  return res.status(404).json({ error: 'This endpoint has been disabled. Use /api/auth/login instead.' })
})

// LEGACY: 2FA verify endpoint is now disabled 
router.post('/api/auth/2fa/verify', async (req: Request, res: Response) => {
  return res.status(404).json({ error: '2FA has been disabled. Use regular login at /api/auth/login instead.' })
})

// LEGACY: 2FA setup endpoint is now disabled
router.post('/api/auth/2fa/setup', async (req: Request, res: Response) => {
  return res.status(404).json({ error: '2FA has been disabled.' })
})

export default router
