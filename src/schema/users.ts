import { pgTable, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
});

