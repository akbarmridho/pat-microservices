import {sendOkWithMessage} from '../utils/sendResponse';
import {Request, Response} from 'express';

export async function sayHello(
  request: Request,
  response: Response
): Promise<void> {
  sendOkWithMessage('Hello world!', response);
}
