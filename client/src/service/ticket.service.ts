import {CancelBookingResponse, TicketBooking} from 'src/types/booking';

const BASE_TICKET_SERVICE_URL = 'http://localhost:8000';

export async function createBookingRequest(seatId: number) {
  const endpoint = `${BASE_TICKET_SERVICE_URL}/bookings`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({id: seatId}),
    });

    return (await response.json()) as TicketBooking;
  } catch {
    return null;
  }
}

export async function cancelBookingRequest(ticketBookingId: number) {
  const endpoint = `${BASE_TICKET_SERVICE_URL}/bookings/cancel`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({id: ticketBookingId}),
    });

    return (await response.json()) as CancelBookingResponse;
  } catch {
    return null;
  }
}

export async function getBookingInfoRequest(ticketBookingId: number) {
  const endpoint = `${BASE_TICKET_SERVICE_URL}/bookings/${ticketBookingId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return (await response.json()) as TicketBooking;
  } catch {
    return null;
  }
}

export function getPdfBookingUrl(ticketBookingId: number) {
  return `${BASE_TICKET_SERVICE_URL}/bookings/${ticketBookingId}/print`;
}
