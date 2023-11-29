import createHttpError from 'http-errors';
import {addNewBooking} from 'src/database/repos/booking';
import {authReqEndpointsFactory} from 'src/factories/auth';
import {
  cancelBookingRequest,
  createBookingRequest,
  getBookingInfoRequest,
  getPdfBookingUrl,
} from 'src/service/ticket.service';
import {BookingRequest, CancelBookingRequest} from 'src/types/booking';
import {z} from 'zod';

export const bookingEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'post',
  input: BookingRequest,
  output: z.object({
    id: z.number(),
    ticketBookingId: z.number().nullable(),
    userId: z.string(),
    createdAt: z.date(),
    status: z.enum(['SUCCESS', 'FAILED', 'QUEUED', 'IN_PROCESS']),
    ticketBooking: z
      .object({
        id: z.number(),
        seat: z.object({
          id: z.number(),
          seatNumber: z.number(),
          status: z.string(),
          eventId: z.number(),
        }),
        status: z.string(),
        failReason: z.string().nullable(),
        invoiceId: z.string().nullable(),
        paymentUrl: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .nullable(),
  }),
  async handler({input, options: {user}}) {
    const userId = user.id;
    const ticketBooking = await createBookingRequest(input.seatId);

    if (ticketBooking === null) {
      const result = await addNewBooking({
        ticketBookingId: null,
        userId,
        status: 'FAILED',
      });

      return {
        ...result,
        ticketBooking: null,
      };
    } else {
      const result = await addNewBooking({
        ticketBookingId: ticketBooking.id,
        userId,
        status: 'QUEUED',
      });

      return {
        ...result,
        ticketBooking,
      };
    }
  },
});

export const cancelBookingEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'post',
  input: CancelBookingRequest,
  output: z.object({
    message: z.string(),
  }),
  async handler({input}) {
    const CancelBookingResponse = await cancelBookingRequest(input.id);

    if (CancelBookingResponse === null) {
      return {
        message: 'Something went wrong',
      };
    }

    if (CancelBookingResponse.message === 'Ok') {
      return {
        message: 'Booking cancelled',
      };
    } else {
      return {
        message: CancelBookingResponse.message,
      };
    }
  },
});

export const getBookingInfoEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'get',
  input: z.object({
    id: z.string().transform(id => parseInt(id, 10)),
  }),
  output: z.object({
    id: z.number(),
    seat: z.object({
      id: z.number(),
      seatNumber: z.number(),
      status: z.string(),
      eventId: z.number(),
    }),
    status: z.string(),
    failReason: z.string().nullable(),
    invoiceId: z.string().nullable(),
    paymentUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pdfUrl: z.string().nullable(),
  }),
  async handler({input}) {
    const ticketBooking = await getBookingInfoRequest(input.id);
    const pdfUrl = getPdfBookingUrl(input.id);

    if (!ticketBooking) {
      throw createHttpError(404, 'Booking not found');
    } else {
      return {
        ...ticketBooking,
        pdfUrl: pdfUrl,
      };
    }
  },
});
