import { db } from './db';
import { users } from './db/schema';
import { hash } from 'bcryptjs';

async function main() {
  console.log('🔐 Хешируем пароли...');

  const passwordOwner = await hash('Owner@123', 10);
  const passwordAdv = await hash('Adv@123', 10);
  const passwordPartner = await hash('Partner@123', 10);

  console.log('🗑️ Удаляем всех пользователей...');
  await db.delete(users);

  console.log('➕ Добавляем новых пользователей...');
  await db.insert(users).values([
    {
      email: 'owner@site.com',
      username: 'owner',
      role: 'OWNER',
      password_hash: passwordOwner,
    },
    {
      email: 'adv@site.com',
      username: 'advertiser',
      role: 'ADVERTISER',
      password_hash: passwordAdv,
    },
    {
      email: 'partner@site.com',
      username: 'partner',
      role: 'PARTNER',
      password_hash: passwordPartner,
    },
  ]);

  console.log('✅ Готово.');
}

main().catch((e) => {
  console.error('❌ Ошибка:', e);
});
