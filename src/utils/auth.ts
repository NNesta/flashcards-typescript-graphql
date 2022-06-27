import * as jwt from 'jsonwebtoken';

export const APP_SECRET = 'supersecret';

export interface AuthTokenPayload {
  // 1
  userId: number;
  role: string;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload {
  // 2
  const token = authHeader.replace('Bearer ', ''); // 3

  if (!token) {
    throw new Error('No token found');
  }
  return jwt.verify(token, APP_SECRET) as AuthTokenPayload; // 4
}
