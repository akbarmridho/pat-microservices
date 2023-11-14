import {IOSchema, createMiddleware} from 'express-zod-api';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import {db} from 'src/database/db';
import {z} from 'zod';
import {env} from '../config/env';
import {baseEndpointsFactory} from './base';

export const authMiddleware = createMiddleware({
  input: z.object({}),
  async middleware({request}) {
    const token = request.cookies.access_token;
    if (!token) {
      return {user: undefined};
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: [env.JWT_ALGORITHM],
      });
      if (typeof payload.sub !== 'string') {
        return {user: undefined};
      }
      const userId = payload.sub;
      const user = await db.query.users.findFirst({
        where: (t, {eq}) => eq(t.id, userId),
        columns: {
          id: true,
          name: true,
          username: true,
        },
      });
      return {user};
    } catch {
      return {user: undefined};
    }
  },
});

export const authRequiredMiddleware = createMiddleware<
  IOSchema<'strip'>,
  {
    user:
      | {
          id: string;
          name: string;
          username: string;
        }
      | undefined;
  },
  {
    user: {
      id: string;
      name: string;
      username: string;
    };
  },
  string
>({
  input: z.object({}),
  async middleware(params) {
    if (!params.options.user) {
      throw createHttpError(401, 'Unauthorized');
    }
    return {user: params.options.user};
  },
});

export const authOptEndpointsFactory =
  baseEndpointsFactory.addMiddleware(authMiddleware);
export const authReqEndpointsFactory = authOptEndpointsFactory.addMiddleware(
  authRequiredMiddleware
);
