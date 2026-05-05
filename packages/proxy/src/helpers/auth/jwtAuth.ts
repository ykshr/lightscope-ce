import { redactError } from '@/helpers/error';
import { Context } from 'hono';
import { AlgorithmTypes, verify } from 'hono/jwt';
import { AuthProvider, Tracker } from './index';

export default class JwtAuth implements AuthProvider {
  secret: string;
  algorithm: AlgorithmTypes;

  constructor(secret: string, algorithm: AlgorithmTypes) {
    this.secret = secret;
    this.algorithm = algorithm;
  }

  async getTracker(c: Context): Promise<Tracker | null> {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return null;
    }

    try {
      // Verify JWT signature and expiration
      const decodedPayload = await verify(token, this.secret, this.algorithm);

      // Expected tokens have { organizationId, origin, iat }
      if (
        !decodedPayload ||
        typeof decodedPayload.organizationId !== 'string' ||
        typeof decodedPayload.origin !== 'string'
      ) {
        console.error('JwtAuth: Missing organizationId or origin in token payload');
        return null;
      }

      // Check origin. In browsers, Origin header is sent for cross-origin POSTs.
      const requestOrigin = c.req.header('Origin');
      if (!requestOrigin) {
        console.error('JwtAuth: Request lacks Origin header');
        return null;
      }

      // Some rudimentary origin comparison.
      // A tracker embedded in https://mysite.com might send Origin: https://mysite.com
      // or Referer: https://mysite.com/some/path
      try {
        const tokenOriginUrl = new URL(decodedPayload.origin);
        const requestUrl = new URL(requestOrigin);

        if (tokenOriginUrl.hostname !== requestUrl.hostname) {
          console.error(
            `JwtAuth: Origin mismatch. Token allows ${tokenOriginUrl.hostname}, but request came from ${requestUrl.hostname}`
          );
          return null;
        }
      } catch (e) {
        console.error('JwtAuth: Failed to parse origins for comparison', redactError(e));
        return null;
      }

      return {
        organizationId: decodedPayload.organizationId,
      };
    } catch (e) {
      console.error('JwtAuth: Error verifying JWT token:', redactError(e));
      return null;
    }
  }
}
