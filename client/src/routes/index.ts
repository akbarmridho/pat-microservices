import {Routing} from 'express-zod-api';
import {helloEndpoint} from 'src/endpoints/hello.endpoint';

export const routing: Routing = {
  api: {
    hello: helloEndpoint,
  },
};
