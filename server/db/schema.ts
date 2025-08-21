import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username'),
  role: text('role'),
  password_hash: text('password_hash'),
});
