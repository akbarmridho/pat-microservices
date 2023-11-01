// eslint-disable-next-line node/no-unpublished-import
import type {Config} from 'drizzle-kit';

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    // based on docker config
    host: 'istwibuku-rest-database',
    port: 5433,
    user: 'postgres',
    password: 'pgpassword',
    database: 'postgres',
    ssl: true,
  },
} satisfies Config;
