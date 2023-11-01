import {type NextFunction, type Request, type Response} from 'express';
import {StatusCodes, getReasonPhrase} from 'http-status-codes';

export const pageNotFound = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  response.status(StatusCodes.NOT_FOUND).json({
    error: getReasonPhrase(StatusCodes.NOT_FOUND),
  });
};
