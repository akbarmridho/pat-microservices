import {db} from '../db';
import {Booking, bookings} from 'src/database/schema';
import {eq, and, inArray} from 'drizzle-orm';
import {firstSure} from '../helper';

export async function addNewBooking(data: {
  ticketBookingId: number | null;
  seatId: number;
  userId: string;
  status: Booking['status'];
}) {
  return await db.insert(bookings).values(data).returning().then(firstSure);
}

export async function updateBookingStatus(
  id: number,
  status: Booking['status']
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

export async function getBookingById(id: number) {
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .then(firstSure);
}

export async function getBookingsBySeats(userId: string, seatIds: number[]) {
  if (!seatIds.length) {
    return [];
  }
  return await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.userId, userId), inArray(bookings.seatId, seatIds)));
}
