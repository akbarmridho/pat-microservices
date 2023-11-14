import cookieParser from 'cookie-parser';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import express from 'express';
import {attachRouting} from 'express-zod-api';
import helmet from 'helmet';
import {env} from './config/env';
import {app, config} from './config/server';
import {db, postgresClient} from './database/db';
import {routing} from './routes';

require('express-async-errors');

async function main() {
  // migrate db
  await migrate(db, {
    migrationsFolder: 'drizzle',
  });

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser());
  const {notFoundHandler} = attachRouting(config, routing);

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // not found handler
  app.use(notFoundHandler);

  const server = app.listen(env.PORT, () => {
    console.log(`Service listening on port ${env.PORT}`);
  });

  process.on('SIGINT', () => {
    server.close();
    postgresClient.end();
  });
}

void main();
