import { db } from '../server/lib/db';
import { users } from '../server/schema/users';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await db.insert(users).values({
    email: 'admin@example.com',
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('✅ Админ создан: admin@example.com / admin123');
  process.exit();
}

createAdmin();
