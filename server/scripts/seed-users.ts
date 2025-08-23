import { db } from '../db';
import { users } from '@shared/schema';
import { hash } from 'bcryptjs';

async function seed() {
  await db.delete(users);

  await db.insert(users).values([
    {
      email: 'admin@example.com',
      password_hash: await hash('Affilix123!', 10),
      role: 'OWNER',
      username: 'owner',
    },
    {
      email: '12345@gmail.com',
      password_hash: await hash('adv123', 10),
      role: 'ADVERTISER',
      username: 'advertiser',
    },
    {
      email: '4321@gmail.com',
      password_hash: await hash('partner123', 10),
      role: 'PARTNER',
      username: 'partner',
    },
  ]);

  console.log('✅ Users seeded');
  process.exit();
}

seed();
