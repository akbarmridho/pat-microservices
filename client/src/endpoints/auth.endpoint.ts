import {DrizzleError, eq} from 'drizzle-orm';
import createHttpError from 'http-errors';
import {StatusCodes} from 'http-status-codes';
import {db} from 'src/database/db';
import {first, firstSure} from 'src/database/helper';
import {users} from 'src/database/schema';
import {authOptEndpointsFactory} from 'src/factories/auth';
import {baseEndpointsFactory} from 'src/factories/base';
import {LoginRequest, PasswordType, UsernameType} from 'src/types/auth';
import {
  checkPassword,
  clearTokenCookie,
  hashPassword,
  setTokenCookie,
} from 'src/utils/auth';
import {z} from 'zod';

export const loginEndpoint = baseEndpointsFactory.build({
  tag: 'auth',
  method: 'post',
  input: LoginRequest,
  output: z.object({
    id: z.string(),
  }),
  handler: async ({input, options: {res}}) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, input.username))
      .then(first);
    if (!user) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid email or password'
      );
    }
    if (!(await checkPassword(input.password, user.password))) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid email or password'
      );
    }

    setTokenCookie(user, res);

    return {
      id: user.id,
    };
  },
});

export const logoutEndpoint = baseEndpointsFactory.build({
  tag: 'auth',
  method: 'post',
  input: z.object({}),
  output: z.object({}),
  handler: async ({options: {res}}) => {
    clearTokenCookie(res);
    return {};
  },
});

export const registerEndpoint = baseEndpointsFactory.build({
  tag: 'auth',
  method: 'post',
  input: z.object({
    username: UsernameType,
    password: PasswordType,
    name: z.string().min(3, 'Name must be at least 3 characters long'),
  }),
  output: z.object({
    id: z.string(),
  }),
  handler: async ({input, options: {res}}) => {
    try {
      const newUser = await db
        .insert(users)
        .values({
          ...input,
          password: await hashPassword(input.password),
        })
        .returning({
          id: users.id,
        })
        .then(firstSure);
      setTokenCookie(newUser, res);
      return newUser;
    } catch (e) {
      console.log(e);
      if (e instanceof DrizzleError && e.name === '23505') {
        throw createHttpError(
          StatusCodes.BAD_REQUEST,
          'Username already exists'
        );
      }
      throw e;
    }
  },
});

export const meEndpoint = authOptEndpointsFactory.build({
  tag: 'auth',
  method: 'get',
  input: z.object({}),
  output: z.object({
    user: z
      .object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
      })
      .nullable(),
  }),
  handler: async ({options: {user}}) => {
    return {user: user ?? null};
  },
});
