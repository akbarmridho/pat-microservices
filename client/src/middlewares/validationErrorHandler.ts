import {type Request, type Response, type NextFunction} from 'express';
import {ZodError} from 'zod';
import {sendBadRequest} from '../utils/sendResponse';

export const validationErrorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (error instanceof ZodError) {
    sendBadRequest(
      error.errors.map(each => {
        const value =
          (each.path.find(p => typeof p === 'string') as string | undefined) ??
          'unknown';
        return {field: value, message: each.message};
      }),
      response
    );
  } else {
    next(error);
  }
};
