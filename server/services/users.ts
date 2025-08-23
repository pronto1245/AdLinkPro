import { db } from '../db';
import { users } from '@shared/schema';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function findUserByEmail(email: string) {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      password_hash: users.password_hash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] || null;
}

export async function checkPassword(user: any, password: string) {
  if (!user?.password_hash) {return false;}
  return await bcrypt.compare(password, user.password_hash);
}
