import {env} from 'src/config/env';
import {CancelBookingResponse, TicketBooking} from 'src/types/booking';

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

    return (await response.json()) as TicketBooking;
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

    return (await response.json()) as CancelBookingResponse;
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

    return (await response.json()) as TicketBooking;
  } catch {
    return null;
  }
}

export function getPdfBookingUrl(ticketBookingId: number) {
  return `${env.BASE_TICKET_SERVICE_URL}/bookings/${ticketBookingId}/print`;
}
