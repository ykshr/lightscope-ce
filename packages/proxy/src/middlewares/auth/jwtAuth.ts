import { Context } from 'hono';
import { AuthProvider, Tracker } from './index';
import { verify } from 'hono/jwt';

export default class JwtAuth implements AuthProvider {
  async getTracker(c: Context): Promise<Tracker | null> {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      console.log('JwtAuth: No token provided');
      return null;
    }

    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';
      
      // Verify JWT signature and expiration
      const decodedPayload = await verify(token, secret);
      
      // Expected tokens have { tenantId, origin, iat }
      if (!decodedPayload || typeof decodedPayload.tenantId !== 'number' || typeof decodedPayload.origin !== 'string') {
        console.error('JwtAuth: Missing tenantId or origin in token payload');
        return null;
      }

      // Check origin. In browsers, Origin header is sent for cross-origin POSTs.
      // If the Origin header is absent, we might check Referer, though Origin is more strict.
      const requestOrigin = c.req.header('Origin') || c.req.header('Referer');
      
      if (requestOrigin) {
         // Some rudimentary origin comparison. 
         // A tracker embedded in https://mysite.com might send Origin: https://mysite.com
         // or Referer: https://mysite.com/some/path
         try {
             const tokenOriginUrl = new URL(decodedPayload.origin);
             const requestUrl = new URL(requestOrigin);
             
             if (tokenOriginUrl.hostname !== requestUrl.hostname) {
                 console.error(`JwtAuth: Origin mismatch. Token allows ${tokenOriginUrl.hostname}, but request came from ${requestUrl.hostname}`);
                 return null;
             }
         } catch(e) {
             console.error('JwtAuth: Failed to parse origins for comparison', e);
             return null;
         }
      } else {
         console.log('JwtAuth: Request lacks Origin/Referer header, tracking conditionally allowed but warned');
      }

      return {
        tenantId: decodedPayload.tenantId,
      };
    } catch (e) {
      console.error('JwtAuth: Error verifying JWT token:', e);
      return null;
    }
  }
}
