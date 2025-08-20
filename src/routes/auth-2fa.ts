import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import { findUserByEmail, findUserById, checkPassword } from '../services/users'

const router = Router()

router.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  const user = await findUserByEmail(email)
  const ok = user && await checkPassword(user, password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const tempToken = jwt.sign({ sub: user.id, t: '2fa' }, process.env.JWT_SECRET!, { expiresIn: '5m' })
    return res.json({ twoFactorRequired: true, tempToken })
  }
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, username: user.username },
    process.env.JWT_SECRET!, { expiresIn: '7d' }
  )
  return res.json({ token, user: { sub: user.id, email: user.email, role: user.role, username: user.username } })
})

router.post('/api/auth/2fa/verify', async (req: Request, res: Response) => {
  const { tempToken, code } = req.body || {}
  if (!tempToken || !code) return res.status(400).json({ error: 'tempToken and code are required' })
  let payload: any
  try { payload = jwt.verify(tempToken, process.env.JWT_SECRET!) }
  catch { return res.status(401).json({ error: 'Invalid or expired tempToken' }) }
  if (payload.t !== '2fa') return res.status(400).json({ error: 'Wrong token type' })
  const user = await findUserById(payload.sub)
  if (!user || !user.twoFactorSecret) return res.status(400).json({ error: '2FA not enabled' })
  const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: code, window: 1 })
  if (!ok) return res.status(401).json({ error: 'Invalid 2FA code' })
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, username: user.username },
    process.env.JWT_SECRET!, { expiresIn: '7d' }
  )
  return res.json({ token })
})

export default router
