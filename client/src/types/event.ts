import {Seat} from './seat';

export interface Event {
  id: number;
  title: string;
  description: string;
  price: number;
  seats: Seat[] | null;
}
