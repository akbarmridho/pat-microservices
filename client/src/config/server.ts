import express from 'express';
import {createConfig} from 'express-zod-api';
import {env} from './env';

export const app = express();
export const config = createConfig({
  app,
  server: {
    listen: env.PORT,
  },
  cors: false,
  logger: {
    level: 'debug',
    color: true,
  },
  startupLogo: false,
});
