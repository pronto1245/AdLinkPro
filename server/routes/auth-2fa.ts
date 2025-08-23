import { Router } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const router = Router();

router.post('/generate', async (req, res) => {
  const { email } = req.body;
  if (!email) {return res.status(400).json({ error: 'Email is required' });}

  const secret = speakeasy.generateSecret({ name: `Affilix (${email})` });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

  await db.update(users).set({
    twofa_secret: secret.base32,
    twofa_enabled: 'true',
  }).where(eq(users.email, email));

  res.json({ qrCode });
});

router.post('/verify', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {return res.status(400).json({ error: 'Email and token required' });}

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const secret = user[0]?.twofa_secret;
  if (!secret) {return res.status(400).json({ error: '2FA not configured' });}

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });

  if (!verified) {return res.status(401).json({ error: 'Invalid 2FA token' });}

  res.json({ success: true });
});

export default router;
