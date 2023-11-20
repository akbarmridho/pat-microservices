import bcrypt from 'bcryptjs';
import {Response} from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import {env} from 'src/config/env';

export async function checkPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function setTokenCookie(
  user: {
    id: string;
  },
  res: Response
) {
  const token = jwt.sign({}, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
    subject: user.id,
  });
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ms(env.JWT_EXPIRES_IN),
    path: '/',
  });
}

export function clearTokenCookie(res: Response) {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
}
