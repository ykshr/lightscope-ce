import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createOrganizationMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
    const noAuthToken = process.env.NO_AUTH_TOKEN || 'dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==';
    const authHeader = c.req.header('Authorization');
    if (authHeader === `Bearer ${noAuthToken}`) {
      c.set('organization', {
        id: 'anonymous',
        name: 'Anonymous',
        slug: 'anonymous',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return await next();
    }

    const session = await c.var.$.auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const activeOrganizationId = session.session?.activeOrganizationId;

    if (!activeOrganizationId) {
      return c.json({ error: 'not found active organization' }, 401);
    }

    const activeOrganization = await c.var.$.auth.api.getFullOrganization({
      headers: c.req.raw.headers,
      query: {
        organizationId: activeOrganizationId,
      },
    });

    const organization = {
      id: activeOrganizationId,
      ...activeOrganization,
    };

    c.set('organization', organization);
    return await next();
  });
}
