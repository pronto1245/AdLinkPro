import { Router } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const DATABASE_URL = process.env.DATABASE_URL!;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

const pool = new Pool({ connectionString: DATABASE_URL });

// preflight для /api/*
router.options('*', (_req, res) => res.sendStatus(204));

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: String(user.id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (e: any) {
    console.error('login error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
