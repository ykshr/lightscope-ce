import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createOrganizationMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
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

    if (!activeOrganization) {
      return c.json({ error: 'not found active organization' }, 401);
    }

    const me = activeOrganization.members?.find(
      (member: any) => member.user.id === session.user.id
    );

    if (!me) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const { id, ...orgWithoutId } = activeOrganization;
    const organization = {
      id: activeOrganizationId,
      ...orgWithoutId,
    };

    c.set('organization', organization);
    c.set('me', me as any);
    return await next();
  });
}
