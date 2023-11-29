import createHttpError from 'http-errors';
import {getBookingsBySeats} from 'src/database/repos/booking';
import {authReqEndpointsFactory} from 'src/factories/auth';
import {getAllEvents, getEventById} from 'src/service/event.service';
import {updateNeededBookings} from 'src/service/ticket.service';
import {
  EventDetailSchema,
  EventPreviewSchema,
  EventSchema,
} from 'src/types/event';
import {z} from 'zod';

export const getEventsEndpoint = authReqEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({events: z.array(EventPreviewSchema)}),
  async handler() {
    const events = await getAllEvents();
    return {
      events,
    };
  },
});

export const getEventByIdEndpoint = authReqEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string().transform(id => parseInt(id, 10)),
  }),
  output: EventDetailSchema,
  async handler({input, options: {user}}) {
    const event = await getEventById(input.id);
    if (!event) {
      throw createHttpError(404, 'Event not found');
    }
    const seatIds = event.seats.map(seat => seat.id);
    const bookings = await getBookingsBySeats(user.id, seatIds);
    await updateNeededBookings(bookings);
    event.seats.forEach(seat => {
      const bookingSeat = bookings.find(s => s.seatId === seat.id);
      if (bookingSeat) {
        seat.status = bookingSeat.status;
      } else {
        seat.status = null;
      }
    });

    return event;
  },
});
