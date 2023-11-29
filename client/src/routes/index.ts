import {DependsOnMethod, Routing} from 'express-zod-api';
import {
  loginEndpoint,
  logoutEndpoint,
  meEndpoint,
  registerEndpoint,
  updateUserEndpoint,
} from 'src/endpoints/auth.endpoint';
import {
  addNewBookingEndpoint,
  cancelBookingEndpoint,
  getAllUserBookingsEndpoint,
  getBookingInfoEndpoint,
} from 'src/endpoints/booking.endpoint';
import {
  getEventByIdEndpoint,
  getEventsEndpoint,
} from 'src/endpoints/ticket.endpoint';

export const routing: Routing = {
  api: {
    auth: {
      login: loginEndpoint,
      register: registerEndpoint,
      logout: logoutEndpoint,
      user: new DependsOnMethod({get: meEndpoint, put: updateUserEndpoint}),
    },
    bookings: {
      '': new DependsOnMethod({
        get: getAllUserBookingsEndpoint,
        post: addNewBookingEndpoint,
      }),
      ':id': getBookingInfoEndpoint,
      cancel: cancelBookingEndpoint,
    },
    events: {
      '': getEventsEndpoint,
      ':id': getEventByIdEndpoint,
    },
  },
};
