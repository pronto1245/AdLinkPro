import { db } from '../db';
import bcrypt from 'bcrypt';

export async function findUserByEmail(email: string) {
  const [user] = await db.execute(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]
  );
  return user;
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
