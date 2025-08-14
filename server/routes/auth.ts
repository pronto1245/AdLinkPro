import { Router } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = (req.body || {}) as { username?: string; password?: string };
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const q = `SELECT id, username, password_hash, role
               FROM users
               WHERE username = $1
               LIMIT 1`;
    const { rows } = await pool.query(q, [username]);

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0] as { id: number; username: string; password_hash: string; role: string };
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
