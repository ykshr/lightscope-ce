import { Context, Next } from 'hono';
import createTrackerAuthProvider from './factory';

export default function trackerAuthMiddleware() {
  const auth = createTrackerAuthProvider();

  return async (c: Context, next: Next) => {
    try {
      const tenant_id = await auth.getTenantId(c);

      if (tenant_id === null) {
        return c.json({ error: 'Missing or invalid token' }, 401);
      }

      c.set('tenant_id', tenant_id);
      return await next();
    } catch (e) {
      console.error('Tracker authentication failed:', e);
      return c.json({ error: 'internal server error' }, 500);
    }
  };
}
