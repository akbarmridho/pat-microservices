export const JWT_ALGORITHM = 'HS256';

export const JWT_EXPIRE_TIME = 60 * 60 * 24 * 7; // 1 week

export const getSecret = (): Buffer => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Buffer.from(process.env.APP_SECRET!, 'base64');
};
