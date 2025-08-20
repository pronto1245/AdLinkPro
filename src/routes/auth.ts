import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    console.log('LOGIN start', email);

    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await findUserByEmail(email);
    console.log('LOGIN user?', !!user, user?.id, user?.twoFactorEnabled);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await checkPassword(user, password);
    console.log('LOGIN pw-ok?', ok);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { sub: user.id, email: user.email, role: user.role, username: user.username } });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'internal error' });
  }
});

export default router;
