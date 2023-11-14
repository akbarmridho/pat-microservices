import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {env} from '../config/env';
import * as schema from './schema';

export const postgresClient = postgres(env.DATABASE_URL);

export const db = drizzle(postgresClient, {schema});
