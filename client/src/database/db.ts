import {drizzle} from 'drizzle-orm/node-postgres';
import {Client} from 'pg';
import * as schema from './schema';

export const postgresClient = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const db = drizzle(postgresClient, {schema});
