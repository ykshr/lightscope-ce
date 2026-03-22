import { createMiddleware } from 'hono/factory';

export default function createUserMiddleware() {
  return createMiddleware(async (c, next) => {
    const user = await c.var.$.auth.getUser(c);

    if (!user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('user', user);
    return await next();
  });
}
