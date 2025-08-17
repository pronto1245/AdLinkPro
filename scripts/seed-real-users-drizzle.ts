// Скрипт для создания реальных пользователей с нужными ролями
// Запуск: npx tsx scripts/seed-real-users-drizzle.ts

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Создаем подключение к БД с использованием pg Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('🌱 Запуск сидирования реальных пользователей...');

  // Данные пользователей
  const users = [
    {
      email: '9791207@gmail.com',
      password: '77GeoDav=',
      role: 'super_admin' as const,
    },
    {
      email: '6484488@gmail.co',
      password: '7787877As',
      role: 'advertiser' as const,
    },
    {
      email: 'pablota096@gmail.com',
      password: '7787877As',
      role: 'affiliate' as const,
    },
  ];

  for (const user of users) {
    try {
      // Проверка, есть ли уже такой пользователь
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`❌ Пользователь ${user.email} уже существует, пропускаем.`);
        continue;
      }

      // Создание пользователя
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: user.email,
          username: user.email.split('@')[0], // Используем часть email как username
          password: user.password, // В продакшене обязательно использовать хеш!
          role: user.role,
          isActive: true,
          status: 'active',
          userType: user.role === 'super_admin' ? 'admin' : user.role,
        })
        .returning({ id: schema.users.id, email: schema.users.email });

      console.log(`✅ Создан пользователь: ${newUser.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Ошибка при создании пользователя ${user.email}:`, error);
    }
  }

  console.log('🎉 Сидирование завершено!');
}

main()
  .catch((error) => {
    console.error('❌ Ошибка выполнения сидирования:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    console.log('🔌 Соединение с БД закрыто.');
  });