import jwt from 'jsonwebtoken';

export interface JWTValidationResult {
  isValid: boolean;
  payload?: jwt.JwtPayload | string;
  error?: string;
}

export interface JWTValidatorOptions {
  /**
   * JWT secret key for verification. Can be a string or a function that returns a string.
   * If not provided, will use process.env.JWT_SECRET
   */
  secret?: string | (() => string);
  /**
   * Header name to look for the JWT token. Defaults to 'Authorization'
   */
  headerName?: string;
  /**
   * Whether to require 'Bearer ' prefix. Defaults to true
   */
  requireBearer?: boolean;
  /**
   * Additional JWT verification options (e.g., algorithms, issuer, audience)
   */
  verifyOptions?: jwt.VerifyOptions;
}

/**
 * Extracts JWT token from Lambda event headers
 */
function extractTokenFromHeaders(
  headers: Record<string, string | undefined> | undefined,
  headerName = 'Authorization',
  requireBearer = true,
): string | null {
  if (!headers) return null;

  // Handle case-insensitive header lookup
  const headerKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
  const headerValue = headerKey ? headers[headerKey] : null;

  if (!headerValue) return null;

  if (requireBearer) {
    const bearerPrefix = 'Bearer ';
    if (!headerValue.startsWith(bearerPrefix)) return null;
    return headerValue.substring(bearerPrefix.length).trim();
  }

  return headerValue.trim();
}

/**
 * Validates a JWT token and returns the validation result
 */
export function validateJWT(token: string, options: JWTValidatorOptions = {}): JWTValidationResult {
  const { secret = process.env.JWT_SECRET, verifyOptions = {} } = options;

  if (!secret) {
    return {
      isValid: false,
      error: 'JWT secret is not configured',
    };
  }

  try {
    const secretValue = typeof secret === 'function' ? secret() : secret;
    const payload = jwt.verify(token, secretValue, verifyOptions);
    return {
      isValid: true,
      payload: payload as jwt.JwtPayload,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid token';
    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Validates JWT from Lambda event headers
 * Supports both API Gateway v1 and v2 event formats
 */
export function validateJWTFromEvent(
  event: {
    headers?: Record<string, string | undefined>;
    multiValueHeaders?: Record<string, string[] | undefined>;
  },
  options: JWTValidatorOptions = {},
): JWTValidationResult {
  const { headerName = 'Authorization', requireBearer = true } = options;

  // Try to get headers from event
  let headers = event.headers;

  // Fallback to multiValueHeaders (API Gateway v1) - take first value
  if (!headers && event.multiValueHeaders) {
    headers = Object.entries(event.multiValueHeaders).reduce((acc, [key, values]) => {
      if (values && values.length > 0) {
        acc[key] = values[0];
      }
      return acc;
    }, {} as Record<string, string | undefined>);
  }

  const token = extractTokenFromHeaders(headers, headerName, requireBearer);

  if (!token) {
    return {
      isValid: false,
      error: `JWT token not found in ${headerName} header`,
    };
  }

  return validateJWT(token, options);
}

/**
 * Middleware-style function that validates JWT and throws if invalid
 * Useful for use in Lambda handlers where you want to fail fast
 */
export function requireValidJWT(
  event: {
    headers?: Record<string, string | undefined>;
    multiValueHeaders?: Record<string, string[] | undefined>;
  },
  options: JWTValidatorOptions = {},
): jwt.JwtPayload {
  const result = validateJWTFromEvent(event, options);

  if (!result.isValid) {
    throw new Error(result.error || 'JWT validation failed');
  }

  if (!result.payload || typeof result.payload === 'string') {
    throw new Error('Invalid JWT payload format');
  }

  return result.payload;
}
