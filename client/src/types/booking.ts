import {z} from 'zod';
import {Seat} from './seat';

export const BookingRequest = z.object({
  seatId: z.number().int().gt(0),
});

export const CancelBookingRequest = z.object({
  id: z.number().int().gt(0),
});

export interface TicketBooking {
  id: number;
  seat: Seat;
  status: string;
  failReason: null | string;
  invoiceId: null | string;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CancelBookingResponse {
  message: string;
}
