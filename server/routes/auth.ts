import { sql } from "drizzle-orm";
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const [{ match }] = await db.execute(
    sql`SELECT crypt(${password}, ${user.password_hash}) = ${user.password_hash} as match`
  );

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!user) {return res.status(401).json({ error: 'Invalid credentials' });}

  if (!match) {return res.status(401).json({ error: 'Invalid credentials' });}

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
});

export default router;
