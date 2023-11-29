import createHttpError from 'http-errors';
import {env} from 'src/config/env';
import {Booking} from 'src/database/schema';
import {CancelBookingResponse, TicketBooking} from 'src/types/booking';
import {updateBookingStatus} from 'src/database/repos/booking';

export async function createBookingRequest(seatId: number) {
  const endpoint = `${env.BASE_TICKET_SERVICE_URL}/bookings`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({id: seatId}),
    });

    if (!response.ok) {
      return null;
    }

    return (
      (await response.json()) as {
        data: TicketBooking;
      }
    ).data;
  } catch {
    return null;
  }
}

export async function cancelBookingRequest(ticketBookingId: number) {
  const endpoint = `${env.BASE_TICKET_SERVICE_URL}/bookings/cancel`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({id: ticketBookingId}),
    });

    if (!response.ok) {
      return null;
    }

    return (
      (await response.json()) as {
        data: CancelBookingResponse;
      }
    ).data;
  } catch {
    return null;
  }
}

export async function getBookingInfoRequest(ticketBookingId: number) {
  const endpoint = `${env.BASE_TICKET_SERVICE_URL}/bookings/${ticketBookingId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return (
      (await response.json()) as {
        data: TicketBooking;
      }
    ).data;
  } catch {
    return null;
  }
}

export function getPdfBookingUrl(ticketBookingId: number) {
  return `${env.BASE_TICKET_SERVICE_URL}/bookings/${ticketBookingId}/print`;
}

export async function getBatchTicketBooking(ticketBookingIds: number[]) {
  const searchParams = new URLSearchParams();
  if (ticketBookingIds.length === 0) {
    return [];
  }

  for (const id of ticketBookingIds) {
    searchParams.append('ids', id.toString());
  }
  const response = await fetch(
    `${env.BASE_TICKET_SERVICE_URL}/bookings?${searchParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw createHttpError(500, 'failed to fetch from service');
  }

  return (
    (await response.json()) as {
      data: TicketBooking[];
    }
  ).data;
}

export async function updateNeededBookings(bookings: Booking[]) {
  const processedBookings = bookings.filter(
    booking =>
      (booking.status === 'INPROCESS' || booking.status === 'QUEUED') &&
      booking.ticketBookingId
  );
  const ticketBookingIds = processedBookings.map(
    booking => booking.ticketBookingId!
  );

  if (ticketBookingIds.length) {
    const bookingsFromTicketing = await getBatchTicketBooking(ticketBookingIds);

    const promises: Promise<any>[] = [];

    for (const booking of processedBookings) {
      const fromRequest = bookingsFromTicketing.find(b => b.id === booking.id)!;
      if (booking.status !== fromRequest.status) {
        booking.status = fromRequest.status.toUpperCase() as Booking['status'];
        promises.push(updateBookingStatus(booking.id, booking.status));
      }
    }
    if (promises.length) {
      await Promise.all(promises);
    }
  }
}
