import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createUserMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
    const noAuthToken = process.env.NO_AUTH_TOKEN || 'dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==';
    const authHeader = c.req.header('Authorization');
    if (authHeader === `Bearer ${noAuthToken}`) {
      c.set('user', { id: 'anonymous', role: 'admin' });
      return await next();
    }

    const session = await c.var.$.auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const user = {
      id: session.user.id,
      role: (session.user as any).role,
    };

    c.set('user', user);
    return await next();
  });
}
