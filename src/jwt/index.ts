import jwt from 'jsonwebtoken';
import { LambdaEvent, JWTValidatorOptions } from './types';
import { normalizeHeaders, extractToken } from './utils';

export { type JWTValidatorOptions };

export function verifyJWT(token: string, options: JWTValidatorOptions = {}): jwt.JwtPayload {
  const secret = options.secret ?? process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret is not configured');

  try {
    const secretValue = typeof secret === 'function' ? secret() : secret;
    const payload = jwt.verify(token, secretValue, options.verifyOptions);

    if (typeof payload === 'string') throw new Error('Invalid JWT payload format');
    return payload as jwt.JwtPayload;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invalid token');
  }
}

export function verifyJWTFromEvent(event: LambdaEvent, options: JWTValidatorOptions = {}): jwt.JwtPayload {
  const { headerName = 'Authorization', requireBearer = true } = options;
  const headers = normalizeHeaders(event);
  const token = extractToken(headers, headerName, requireBearer);

  if (!token) throw new Error(`JWT token not found in ${headerName} header`);

  return verifyJWT(token, options);
}
