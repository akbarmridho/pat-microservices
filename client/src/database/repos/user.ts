import {eq} from 'drizzle-orm';
import {db} from '../db';
import {bookings} from '../schema';

export async function getAllUserBookings(userId: string) {
  return await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
  });
}
