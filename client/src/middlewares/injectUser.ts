import {type NextFunction, type Response} from 'express';
import {type AuthenticatedRequest} from '../types/auth';
import {db} from '../database/db';
import {eq} from 'drizzle-orm';
import {users} from '../database/schema';
import {UnauthorizedError} from 'express-jwt';

export const injectUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  const auth = request.auth;

  if (!auth) {
    throw new Error('Missing auth in jwt.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.id),
    columns: {
      id: true,
      username: true,
      name: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError(
      'revoked_token',
      new Error('UserNotFoundError')
    );
  }

  request.user = {
    ...user,
  };

  next();
};
