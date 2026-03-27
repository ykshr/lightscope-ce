import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createTrackerMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
    const tracker = await c.var.$.auth.getTracker(c);

    if (!tracker) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('tracker', tracker);
    return await next();
  });
}
