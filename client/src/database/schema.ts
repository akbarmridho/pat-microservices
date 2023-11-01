import {pgTable, serial, timestamp, unique, varchar} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 255}).notNull(),
    name: varchar('name', {length: 255}).notNull(),
    password: varchar('password', {length: 255}).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
  },
  users => ({
    usernameUniqueIdx: unique('username_unique_idx').on(users.username),
  })
);
