import {z} from 'zod';
import {Seat, SeatSchema} from './seat';

export const EventSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  price: z.number().positive(),
});

export const EventPreviewSchema = EventSchema.extend({});

export const EventDetailSchema = EventSchema.extend({
  seats: z.array(
    SeatSchema.extend({
      status: z.string(),
    })
  ),
});

export type EventPreview = z.infer<typeof EventPreviewSchema>;

export type EventDetail = z.infer<typeof EventDetailSchema>;
