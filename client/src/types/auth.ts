import {z} from 'zod';
import {type JwtPayload} from 'jsonwebtoken';
import {type Request as JWTRequest} from 'express-jwt';

export const UsernameType = z
  .string()
  .toLowerCase()
  .trim()
  .min(5)
  .max(20)
  .regex(
    /^(?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
    'Username hanya boleh memiliki huruf, angka, simbol _ dan .'
  );
export const PasswordType = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(127, 'Password maksimal 127 karakter');

export const LoginRequest = z.object({
  username: z.string().toLowerCase().trim(),
  password: z.string(),
});

export const ChangePasswordRequest = z.object({
  oldPassword: z.string(),
  newPassword: PasswordType,
});

export interface UserAuth extends JwtPayload {
  id: number;
}

export interface AuthenticatedRequest extends JWTRequest<UserAuth> {
  user?: {
    id: number;
    username: string;
    name: string;
  };
}
