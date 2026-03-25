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

    const organizationId = c.req.header('x-organization-id');
    if (!organizationId) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const organization = await c.var.$.auth.api.getFullOrganization({
      headers: c.req.raw.headers,
      query: {
        organizationId,
      },
    });

    if (!organization) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const user = {
      id: session.user.id,
      role: (session.user as any).role,
      organizationId: (session.user as any).organizationId,
    };

    c.set('user', user);
    return await next();
  });
}
