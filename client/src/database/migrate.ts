import {drizzle} from 'drizzle-orm/postgres-js';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import {env} from 'src/config/env';

export async function runMigrate() {
  const migrationClient = postgres(env.DATABASE_URL, {max: 1});
  await migrate(drizzle(migrationClient), {migrationsFolder: './drizzle'});
  await migrationClient.end();
}
runMigrate();
