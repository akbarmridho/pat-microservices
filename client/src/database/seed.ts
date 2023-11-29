// todo
// references: https://github.com/turso-extended/app-the-mug-store/blob/master/drizzle/seed.ts

import {faker} from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import {db, postgresClient} from './db';
import {users} from './schema';

async function runSeed() {
  console.log('Seeding database...');
  await db
    .insert(users)
    .values(
      [...Array(5)].map((_, i) => ({
        name: faker.person.fullName(),
        username: 'user' + i,
        password: bcrypt.hashSync('password'),
      }))
    )
    .onConflictDoNothing()
    .execute();

  console.log('Seeding complete!');
}

runSeed()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    postgresClient.end();
  });
