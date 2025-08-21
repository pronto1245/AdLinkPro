import { db } from '../server/lib/db'; // путь к твоей базе
import { users } from '../server/schema/users'; // путь к users-таблице
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
