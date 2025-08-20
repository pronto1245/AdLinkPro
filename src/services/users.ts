import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://a1@localhost:5432/adlinkpro_db',
    });
  }
  return pool;
}

function mapRow(r: any) {
  return {
    id: r.id,
    email: r.email,
    username: r.username,
    role: r.role,
    passwordHash: r.password_hash,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    twoFactorEnabled: r.two_factor_enabled ?? false,
    twoFactorSecret: r.two_factor_secret ?? null,
  };
}

export async function findUserByEmail(email: string) {
  const { rows } = await getPool().query(
    `SELECT id,email,username,role,password_hash,created_at,updated_at,
            COALESCE(two_factor_enabled,false) AS two_factor_enabled,
            NULL::text AS two_factor_secret
       FROM users
      WHERE LOWER(email)=LOWER($1)
      LIMIT 1`,
    [email]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function findUserById(id: number) {
  const { rows } = await getPool().query(
    `SELECT id,email,username,role,password_hash,created_at,updated_at,
            COALESCE(two_factor_enabled,false) AS two_factor_enabled,
            NULL::text AS two_factor_secret
       FROM users
      WHERE id=$1
      LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function checkPassword(user: { passwordHash: string }, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}
