import {createId} from '@paralleldrive/cuid2';
import {InferSelectModel, relations} from 'drizzle-orm';
import {integer, pgTable, serial, text, timestamp} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').$defaultFn(createId).primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
});

export const usersRelation = relations(users, ({many}) => ({
  bookings: many(bookings),
}));

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  seatId: integer('seat_id').notNull(),
  ticketBookingId: integer('ticket_booking_id'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  status: text('status', {
    enum: ['SUCCESS', 'FAILED', 'INPROCESS', 'QUEUED', 'CANCELLED'],
  }).notNull(),
});

export type Booking = InferSelectModel<typeof bookings>;

export const bookingsRelation = relations(bookings, ({one}) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));
