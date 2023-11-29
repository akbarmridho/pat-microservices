import {db} from '../db';
import {bookings} from 'src/database/schema';

export async function addNewBooking(data: {
  ticketBookingId: number | null;
  userId: string;
  status: 'SUCCESS' | 'FAILED' | 'QUEUED' | 'IN_PROCESS';
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
