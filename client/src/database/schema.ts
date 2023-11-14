import {createId} from '@paralleldrive/cuid2';
import {pgTable, text, timestamp} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').$defaultFn(createId).primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
});
