import {type NextFunction, type Request, type Response} from 'express';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';
import {UnauthorizedError} from 'express-jwt';

export const unauthorizedErrorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (error instanceof UnauthorizedError) {
    if (
      (error.inner instanceof Error &&
        error.inner.name === 'TokenExpiredError') ||
      error.inner.message === 'TokenExpiredError' ||
      error.inner.message === 'UserNotFoundError'
    ) {
      response.clearCookie('access_token', {
        secure: true,
        sameSite: 'none',
      });
    }

    response.status(StatusCodes.UNAUTHORIZED).json({
      error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
    });
  } else {
    next(error);
  }
};
