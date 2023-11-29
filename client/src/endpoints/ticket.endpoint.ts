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
import {Booking} from '../database/schema';

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

    event.seats.forEach(e => {
      e.status = e.status.toUpperCase();
    });

    return event;
  },
});
