import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createUserMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
    const session = await c.var.$.auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const user = {
      id: session.user.id,
    };

    c.set('user', user);
    return await next();
  });
}
