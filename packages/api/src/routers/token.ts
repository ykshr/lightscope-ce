import { auth } from '@/helpers/prisma'; // Ensure this exists and works
import { Context, Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';

const tokenApp = new Hono();

const generateSchema = z.object({
  origin: z.string().url('Must be a valid URL like https://example.com'),
});

tokenApp.post('/generate', async (c: Context) => {
  // Use Better Auth to get the user session
  // Extract token from header to verify
  const header = c.req.header('Authorization');
  let userContextCookie = null;
  if (!header && c.req.header('Cookie')) {
    // if from web client, fallback to headers which better-auth processes
  }

  // We can just use the internal better-auth context using c.req.raw mapping
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session || !session.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { tenantId = 1 } = session.user as any; // Cast for now, tenantId comes from our DB

  try {
    const body = await c.req.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return c.json({ error: 'Invalid payload', details: result.error.errors }, 400);
    }

    const { origin } = result.data;
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';

    const payload = {
      tenantId,
      origin,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = await sign(payload, secret);

    return c.json({ token, origin });
  } catch (error) {
    return c.json({ error: 'Failed to generate token' }, 500);
  }
});

export default tokenApp;
