import cookieParser from 'cookie-parser';
import express from 'express';
import {attachRouting} from 'express-zod-api';
import fs from 'fs';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import {env, isDev} from './config/env';
import {app, config} from './config/server';
import {postgresClient} from './database/db';
import {routing} from './routes';

require('express-async-errors');

async function main() {
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser());
  const {notFoundHandler} = attachRouting(config, routing);

  const file = fs.readFileSync('./docs/openapi.swagger.yaml', 'utf8');
  const swaggerDocument = YAML.parse(file);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
