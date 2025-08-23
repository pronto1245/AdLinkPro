import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { tempTokens, verifyTOTP } from '../shared/2fa-utils';

export const twoFARouter = Router();
twoFARouter.use(express.json());

// New 2FA verification endpoint as requested: /api/auth/2fa/verify
twoFARouter.post('/verify', (req, res) => {
  try {
    const { tempToken, code } = req.body || {};

    if (!tempToken || !code) {
      return res.status(400).json({ error: 'tempToken and code are required' });
    }

    const tokenData = tempTokens.get(tempToken);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid or expired temporary token' });
    }

    // Check if temp token is expired (5 minutes)
    if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
      tempTokens.delete(tempToken);
      return res.status(401).json({ error: 'Temporary token expired' });
    }

    const user = tokenData.user;

    // Verify 2FA code
    if (!verifyTOTP(user.twoFactorSecret, code)) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    // Clean up temp token
    tempTokens.delete(tempToken);

    // Generate actual JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {return res.status(500).json({ error: 'JWT_SECRET missing' });}

    const authToken = jwt.sign(
      { sub: user.sub, role: user.role, email: user.email, username: user.username },
      secret,
      { expiresIn: '7d' }
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
    console.error('2FA verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default twoFARouter;
