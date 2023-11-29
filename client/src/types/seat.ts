export interface Seat {
  id: number;
  seatNumber: number;
  status: 'Open' | 'Ongoing' | 'Booked';
  eventId: number;
}
