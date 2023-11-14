// eslint-disable-next-line node/no-unpublished-import
import type {Config} from 'drizzle-kit';
import {env} from './src/config/env';

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {connectionString: env.DATABASE_URL},
} satisfies Config;
