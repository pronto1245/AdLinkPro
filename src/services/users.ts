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

// Mock users for development when database is unavailable
// Using hashSync here because these are initialization values - the hashes are compatible with async bcrypt.compare()
const mockUsers = [
  {
    id: 1,
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    username: "owner",
    role: "OWNER",
    passwordHash: bcrypt.hashSync(process.env.OWNER_PASSWORD || "Affilix123!", 12),
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
  {
    id: 2,
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    username: "advertiser", 
    role: "ADVERTISER",
    passwordHash: bcrypt.hashSync(process.env.ADVERTISER_PASSWORD || "adv123", 12),
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
  {
    id: 3,
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    username: "partner",
    role: "PARTNER", 
    passwordHash: bcrypt.hashSync(process.env.PARTNER_PASSWORD || "partner123", 12),
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
];

function mapRow(r: any) {
  return {
    id: r.id,
    email: r.email,
    username: r.username,
    role: r.role,
    passwordHash: r.password_hash,
    firstName: r.first_name,
    phone: r.phone,
    company: r.company,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    twoFactorEnabled: r.two_factor_enabled ?? false,
    twoFactorSecret: r.two_factor_secret ?? null,
  };
}

export async function findUserByEmail(email: string) {
  try {
    const { rows } = await getPool().query(
      `SELECT id,email,username,role,password_hash,created_at,updated_at,
              COALESCE(two_factor_enabled,false) AS two_factor_enabled,
              NULL::text AS two_factor_secret
         FROM users
        WHERE LOWER(email)=LOWER($1) OR LOWER(username)=LOWER($1)
        LIMIT 1`,
      [email]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  } catch (error) {
    console.log('Database unavailable, falling back to mock users for development');
    // Fallback to mock users when database is unavailable
    const mockUser = mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() ||
      u.username.toLowerCase() === email.toLowerCase()
    );
    return mockUser || null;
  }
}

export async function findUserById(id: number) {
  try {
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
  } catch (error) {
    console.log('Database unavailable, falling back to mock users for development');
    // Fallback to mock users when database is unavailable  
    const mockUser = mockUsers.find(u => u.id === id);
    return mockUser || null;
  }
}

export async function checkPassword(user: { passwordHash: string }, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: string;
  username?: string;
}) {
  const { name, email, password, phone, company, role = 'affiliate', username } = userData;
  
  // Generate username from email if not provided
  const finalUsername = username || email.split('@')[0];
  
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);
  
  try {
    console.log('🔐 [USER_SERVICE] Creating user in database:', email);
    
    const { rows } = await getPool().query(
      `INSERT INTO users (username, email, password, role, first_name, phone, company, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, username, email, role, first_name, phone, company, created_at, updated_at, 
                 password as password_hash,
                 COALESCE(two_factor_enabled, false) AS two_factor_enabled`,
      [finalUsername, email.toLowerCase(), passwordHash, role.toLowerCase(), name, phone, company]
    );
    
    const newUser = rows[0] ? mapRow(rows[0]) : null;
    console.log('✅ [USER_SERVICE] User created successfully:', newUser?.id);
    return newUser;
    
  } catch (error) {
    console.error('❌ [USER_SERVICE] Database error creating user:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint?.includes('email')) {
        throw new Error('EMAIL_EXISTS');
      }
      if (error.constraint?.includes('username')) {
        throw new Error('USERNAME_EXISTS');
      }
      throw new Error('USER_EXISTS');
    }
    
    throw error;
  }
}
