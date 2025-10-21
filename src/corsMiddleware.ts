import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

interface CorsOptions {
  origin: string | string[];
  isDev: boolean;
  packageName: string;
}

const corsMiddleware = (options?: CorsOptions) => {
  const {
    origin = [/^.*\.cosva\.app$/, 'https://cosva.app'],
    isDev = process.env.NODE_ENV !== 'production',
    packageName = 'com.cosva.app',
  } = options ?? {};

  return (req: Request, res: Response, next: NextFunction) => {
    const xRequestedWith = req.header('X-Requested-With');
    const isAppRequest = xRequestedWith === packageName;
    cors({
      origin: isDev || isAppRequest ? '*' : origin,
    })(req, res, next);
  };
};

export default corsMiddleware;
