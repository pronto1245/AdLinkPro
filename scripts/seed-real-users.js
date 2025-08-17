// Скрипт для создания реальных пользователей с нужными ролями
// Запуск: node scripts/seed-real-users.js

const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Данные пользователей
  const users = [
    {
      email: '9791207@gmail.com',
      username: 'owner',
      password: '77GeoDav=',
      role: 'super_admin',
    },
    {
      email: '6484488@gmail.com', // Fixed typo: was .co, now .com
      username: 'requester',
      password: '7787877As',
      role: 'advertiser',
    },
    {
      email: 'pablota096@gmail.com',
      username: 'partner',
      password: '7787877As',
      role: 'affiliate',
    },
  ];

  for (const user of users) {
    // Проверка, есть ли уже такой пользователь
    const exists = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (exists) {
      console.log(`Пользователь ${user.email} уже существует, обновляем данные.`);
      // Обновляем существующего пользователя с новым хэшем пароля
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      await prisma.user.update({
        where: { email: user.email },
        data: {
          username: user.username,
          password: hashedPassword,
          role: user.role,
        },
      });
      console.log(`Обновлен пользователь: ${user.email} (${user.role})`);
    } else {
      // Создание пользователя с хэшированным паролем
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      await prisma.user.create({
        data: {
          email: user.email,
          username: user.username,
          password: hashedPassword, // Теперь используем хэш!
          role: user.role,
        },
      });
      console.log(`Создан пользователь: ${user.email} (${user.role})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  };