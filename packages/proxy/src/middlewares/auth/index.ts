import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

export type Tracker = {
  tenantId: string;
};

export interface AuthProvider {
  getTracker(c: Context): Promise<Tracker | null>;
}

export default function createAuthMiddleware(authProvider: AuthProvider) {
  return createMiddleware(async (c, next) => {
    const tracker = await authProvider.getTracker(c);

    if (!tracker) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('tracker', tracker);
    return await next();
  });
}
