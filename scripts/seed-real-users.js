// Скрипт для создания реальных пользователей с нужными ролями
// Запуск: node scripts/seed-real-users.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Данные пользователей
  const users = [
    {
      email: '9791207@gmail.com',
      password: '77GeoDav=',
      role: 'super_admin',
    },
    {
      email: '6484488@gmail.co',
      password: '7787877As',
      role: 'advertiser',
    },
    {
      email: 'pablota096@gmail.com',
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
      console.log(`Пользователь ${user.email} уже существует, пропускаем.`);
      continue;
    }
    // Создание пользователя
    await prisma.user.create({
      data: {
        email: user.email,
        password: user.password, // В бою обязательно использовать хэш!
        role: user.role,
      },
    });
    console.log(`Создан пользователь: ${user.email} (${user.role})`);
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