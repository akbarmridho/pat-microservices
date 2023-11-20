import {Routing} from 'express-zod-api';
import {
  loginEndpoint,
  logoutEndpoint,
  meEndpoint,
  registerEndpoint,
} from 'src/endpoints/auth.endpoint';

export const routing: Routing = {
  api: {
    auth: {
      login: loginEndpoint,
      register: registerEndpoint,
      logout: logoutEndpoint,
      user: meEndpoint,
    },
  },
};
