import { createMiddleware } from 'hono/factory';

export default function createTrackerMiddleware() {
  return createMiddleware(async (c, next) => {
    const tracker = await c.var.$.auth.getUser(c);

    if (!tracker) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('tracker', tracker);
    return await next();
  });
}
