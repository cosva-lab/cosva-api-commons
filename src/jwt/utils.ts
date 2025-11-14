import { LambdaEvent } from './types';

export const normalizeHeaders = (event: LambdaEvent): Record<string, string | undefined> | undefined => {
  if (event.headers) return event.headers;
  if (!event.multiValueHeaders) return undefined;

  return Object.fromEntries(
    Object.entries(event.multiValueHeaders)
      .filter(([, values]) => values?.[0])
      .map(([key, values]) => [key, values?.[0] ?? ''])
  );
};
export const extractToken = (
  headers: Record<string, string | undefined> | undefined,
  headerName: string,
  requireBearer: boolean
): string | null => {
  if (!headers) return null;

  const headerKey = Object.keys(headers).find((k) => k.toLowerCase() === headerName.toLowerCase());
  const value = headerKey ? headers[headerKey] : null;
  if (!value) return null;

  if (requireBearer) {
    const bearer = 'Bearer ';
    return value.startsWith(bearer) ? value.slice(bearer.length).trim() : null;
  }

  return value.trim();
};
