import createHttpError from 'http-errors';
import {db} from 'src/database/db';
import {
  addNewBooking,
  getBookingById,
  getTicketBookingId,
  updateBookingStatus,
} from 'src/database/repos/booking';
import {getAllUserBookings} from 'src/database/repos/user';
import {Booking} from 'src/database/schema';
import {authReqEndpointsFactory} from 'src/factories/auth';
import {
  cancelBookingRequest,
  createBookingRequest,
  getBookingInfoRequest,
  getPdfBookingUrl,
  getBatchTicketBooking,
  updateNeededBookings,
} from 'src/service/ticket.service';
import {BookingRequest, CancelBookingRequest} from 'src/types/booking';
import {z} from 'zod';
import {ez} from 'express-zod-api';

const StatusEnum = z.enum([
  'SUCCESS',
  'FAILED',
  'INPROCESS',
  'QUEUED',
  'CANCELLED',
]);

export const addNewBookingEndpoint = authReqEndpointsFactory.build({
  tag: 'booking',
  method: 'post',
  input: BookingRequest,
  output: z.object({
    id: z.number(),
    ticketBookingId: z.number().nullable(),
    userId: z.string(),
    createdAt: ez.dateOut(),
    status: StatusEnum,
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
        seatId: input.seatId,
      });

      return {
        ...result,
        ticketBooking: null,
      };
    } else {
      const result = await addNewBooking({
        ticketBookingId: ticketBooking.id,
        userId,
        status: ticketBooking.status.toUpperCase() as Booking['status'],
        seatId: input.seatId,
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
    const ticketBookingId = await getTicketBookingId(input.id);

    if (ticketBookingId === null) {
      throw createHttpError(404, 'Booking not found');
    }

    const CancelBookingResponse = await cancelBookingRequest(ticketBookingId);

    if (CancelBookingResponse === null) {
      return {
        message: 'Something went wrong',
      };
    }

    updateBookingStatus(input.id, 'CANCELLED');
    return {
      message: 'Booking cancelled',
    };
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
    ticketBookingId: z.number().nullable(),
    userId: z.string(),
    createdAt: ez.dateOut(),
    status: StatusEnum,
    pdfUrl: z.string().nullable(),
  }),
  async handler({input}) {
    const booking = await getBookingById(input.id);
    if (!booking) {
      throw createHttpError(404, 'Booking not found');
    }

    if (booking.ticketBookingId === null) {
      return {
        ...booking,
        pdfUrl: null,
      };
    }

    if (booking.status === 'INPROCESS' || booking.status === 'QUEUED') {
      const ticketBooking = await getBookingInfoRequest(
        booking.ticketBookingId
      );
      if (!ticketBooking) {
        await updateBookingStatus(input.id, 'FAILED');
        return {
          ...booking,
          pdfUrl: null,
        };
      }
      if (ticketBooking.status !== booking.status) {
        booking.status =
          ticketBooking.status.toUpperCase() as Booking['status'];
        await updateBookingStatus(input.id, booking.status);
      }
    }
    const pdfUrl = getPdfBookingUrl(booking.ticketBookingId);
    if (pdfUrl === null) {
      return {
        ...booking,
        pdfUrl: "Can't get pdf url",
      };
    } else {
      return {
        ...booking,
        pdfUrl,
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
        createdAt: ez.dateOut(),
        status: StatusEnum,
      })
    ),
  }),
  async handler({options: {user}}) {
    const bookings = await getAllUserBookings(user.id);

    await updateNeededBookings(bookings);

    return {
      bookings,
    };
  },
});
