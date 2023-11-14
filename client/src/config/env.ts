import dotenv from 'dotenv';

dotenv.config();

import {createEnv} from '@t3-oss/env-core';
import {z} from 'zod';

export const env = createEnv({
  isServer: true,
  server: {
    DATABASE_URL: z.string(),
    PORT: z.string().default('3000'),
    NODE_ENV: z.string().default('development'),
    JWT_SECRET: z
      .string()
      .default('secret')
      .transform(v => Buffer.from(v, 'base64')),
    JWT_ALGORITHM: z
      .enum([
        'HS256',
        'HS384',
        'HS512',
        'RS256',
        'RS384',
        'RS512',
        'ES256',
        'ES384',
        'ES512',
        'PS256',
        'PS384',
        'PS512',
        'none',
      ])
      .default('HS256'),
    JWT_EXPIRES_IN: z.string().default('1w'),
  },
  runtimeEnv: process.env,
});

export const isDev = env.NODE_ENV === 'development';
