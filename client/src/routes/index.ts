import {DependsOnMethod, Routing} from 'express-zod-api';
import {
  loginEndpoint,
  logoutEndpoint,
  meEndpoint,
  registerEndpoint,
  updateUserEndpoint,
} from 'src/endpoints/auth.endpoint';
import {getBookingInfoEndpoint} from 'src/endpoints/booking.endpoint';

export const routing: Routing = {
  api: {
    auth: {
      login: loginEndpoint,
      register: registerEndpoint,
      logout: logoutEndpoint,
      user: new DependsOnMethod({get: meEndpoint, put: updateUserEndpoint}),
    },
    bookings: {
      ':id': getBookingInfoEndpoint,
    },
  },
};
