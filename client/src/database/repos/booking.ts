import {db} from '../db';
import {bookings} from 'src/database/schema';
import {eq} from 'drizzle-orm';
import {firstSure} from '../helper';

export async function addNewBooking(data: {
  ticketBookingId: number | null;
  userId: string;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSED' | 'CANCELLED';
}) {
  return (
    await db
      .insert(bookings)
      .values({
        ticketBookingId: data.ticketBookingId,
        userId: data.userId,
        status: data.status,
      })
      .returning()
  )[0];
}

export async function updateBookingStatus(
  id: number,
  status: 'SUCCESS' | 'FAILED' | 'PROCESSED' | 'CANCELLED'
) {
  return await db
    .update(bookings)
    .set({
      status,
    })
    .where(eq(bookings.id, id));
}

export async function getTicketBookingId(id: number) {
  return await db
    .select({ticketBookingId: bookings.ticketBookingId})
    .from(bookings)
    .where(eq(bookings.id, id))
    .then(firstSure)
    .then(booking => booking.ticketBookingId);
}
