import getLoader from '@/loaders/tracker';
import { Context, Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';

const trackerApp = new Hono();

const generateSchema = z.object({
  origin: z.string().url('Must be a valid URL like https://example.com'),
  expiresAt: z.coerce.date().optional().nullable(),
});

trackerApp.get('/', async (c: Context) => {
  try {
    const trackers = await getLoader(c);
    return c.json({ trackers });
  } catch (error) {
    return c.json({ error: 'Failed to get a token list' }, 500);
  }
});

trackerApp.post('/generate', async (c: Context) => {
  try {
    const organizationId = c.var.organization.id;
    const body = await c.req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Invalid payload', details: parsed.error.errors }, 400);
    }

    const { origin, expiresAt } = parsed.data;

    const notBefore = new Date();
    const nbf = Math.floor(notBefore.getTime() / 1000);
    const issuedAt = new Date();
    const iat = Math.floor(issuedAt.getTime() / 1000);
    const exp = expiresAt ? Math.floor(expiresAt.getTime() / 1000) : undefined;

    if (1000 < origin.length) {
      return c.json({ error: 'Origin is too long' }, 400);
    }

    const payload = {
      organizationId,
      origin,
      nbf,
      iat,
      exp,
    };

    const { secret, algorithm } = c.var.$.jwt;
    const token = await sign(payload, secret, algorithm);

    const data = {
      organizationId,
      origin,
      notBefore,
      issuedAt,
      expiresAt,
      token,
    };

    await c.var.$.prisma.tracker.create({ data });
    const trackers = await getLoader(c);

    return c.json({ trackers });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to generate token' }, 500);
  }
});

trackerApp.delete('/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const organizationId = c.var.organization.id;

    // We should probably check if the tracker belongs to the org, but Prisma can do this.
    await c.var.$.prisma.tracker.deleteMany({
      where: {
        id,
        organizationId,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete tracker' }, 500);
  }
});

export default trackerApp;
