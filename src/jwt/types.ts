import jwt from 'jsonwebtoken';


export interface JWTValidatorOptions {
  /** JWT secret key for verification. Can be a string or a function that returns a string. Defaults to process.env.JWT_SECRET */
  secret?: string | (() => string);
  /** Header name to look for the JWT token. Defaults to 'Authorization' */
  headerName?: string;
  /** Whether to require 'Bearer ' prefix. Defaults to true */
  requireBearer?: boolean;
  /** Additional JWT verification options (e.g., algorithms, issuer, audience) */
  verifyOptions?: jwt.VerifyOptions;
}
export type LambdaEvent = {
  headers?: Record<string, string | undefined>;
  multiValueHeaders?: Record<string, string[] | undefined>;
};
