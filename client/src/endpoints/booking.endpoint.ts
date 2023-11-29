import createHttpError from 'http-errors';
import {addNewBooking, updateBookingStatus} from 'src/database/repos/booking';
import {getAllUserBookings} from 'src/database/repos/user';
import {authReqEndpointsFactory} from 'src/factories/auth';
import {
  cancelBookingRequest,
  createBookingRequest,
  getBookingInfoRequest,
  getPdfBookingUrl,
} from 'src/service/ticket.service';
import {
  BookingRequest,
  CancelBookingRequest,
  TicketBooking,
} from 'src/types/booking';
import {z} from 'zod';

export const addNewBookingEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'post',
  input: BookingRequest,
  output: z.object({
    id: z.number(),
    ticketBookingId: z.number().nullable(),
    userId: z.string(),
    createdAt: z.date(),
    status: z.enum(['SUCCESS', 'FAILED', 'PROCESSED', 'CANCELLED']),
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
        status: 'PROCESSED',
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
      updateBookingStatus(input.id, 'CANCELLED');
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

export const getAllUserBookingsEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'get',
  input: z.object({}),
  output: z.object({
    bookings: z.array(
      z.object({
        id: z.number(),
        ticketBookingId: z.number().nullable(),
        userId: z.string(),
        createdAt: z.date(),
        status: z.enum(['SUCCESS', 'FAILED', 'PROCESSED', 'CANCELLED']),
      })
    ),
  }),
  async handler({options: {user}}) {
    const bookings = await getAllUserBookings(user.id);
    if (!bookings) {
      throw createHttpError(404, 'Booking not found');
    }

    for (let i = 0; i < bookings.length; i++) {
      const ticketBookingId = bookings[i].ticketBookingId;
      if (ticketBookingId === null) {
        bookings[i].status = 'FAILED';
      } else {
        const ticketBooking = await getBookingInfoRequest(ticketBookingId);
        if (!ticketBooking) {
          bookings[i].status = 'FAILED';
        } else {
          const status = ticketBooking.status;
          if (status === 'Success') {
            bookings[i].status = 'SUCCESS';
          } else if (status === 'Failed') {
            bookings[i].status = 'FAILED';
          } else {
            bookings[i].status = 'PROCESSED';
          }
          updateBookingStatus(bookings[i].id, bookings[i].status);
        }
      }
    }

    return {
      bookings,
    };
  },
});
