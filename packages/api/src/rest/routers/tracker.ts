import getLoader from '@/loaders/tracker';
import { Context, Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';

const trackerApp = new Hono();

const generateSchema = z.object({
  origin: z.string().url('Must be a valid URL like https://example.com'),
  availableMinutes: z.number().int().nonnegative().optional().nullable(),
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

    const { origin, availableMinutes } = parsed.data;
    const iat = availableMinutes
      ? Math.floor(Date.now() / 1000) + 60 * availableMinutes
      : undefined;

    const payload = {
      organizationId,
      origin,
      iat,
    };

    const { secret, algorithm } = c.var.$.jwt;
    const token = await sign(payload, secret, algorithm);
    const expiresAt = iat ? new Date(iat * 1000) : undefined;

    const data = {
      organizationId,
      origin,
      token,
      expiresAt,
    };

    await c.var.$.prisma.tracker.create({ data });

    const trackers = await getLoader(c);

    return c.json({ trackers });
  } catch (error) {
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
