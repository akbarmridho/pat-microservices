import {z} from 'zod';

export const SeatSchema = z.object({
  id: z.number().int().positive(),
  seatNumber: z.number().int().positive(),
  status: z.enum(['Open', 'Ongoing', 'Booked']),
  eventId: z.number().int().positive(),
});

export type Seat = z.infer<typeof SeatSchema>;
