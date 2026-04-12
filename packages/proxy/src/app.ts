import processAllowedOriginsString from '@/helpers/allowedOrigins';
import createContextMiddleware from '@/middlewares/context';
import createTrackerMiddleware from '@/middlewares/tracker';
import eventsRouter from '@/routers/events';
import { $, Env } from '@/types';
import { Context, Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

export function createApp(createContext: (c: Context) => Promise<$>) {
  const app = new Hono<Env>();

  app.use('*', logger());
  app.use('*', async (c, next) => {
    const { ALLOWED_ORIGINS } = env(c);
    const origins = processAllowedOriginsString(ALLOWED_ORIGINS);
    if (!origins) return next();

    const corsMiddlewareHandler = cors({
      origin: origins.length === 1 ? origins[0] : origins,
      allowHeaders: ['Content-Type', 'Authorization'],
    });
    return corsMiddlewareHandler(c, next);
  });

  // Public routes that don't require authentication
  app.get('/health', (c) => c.json({ ok: true }));

  // Events endpoint has its own tracker token authentication
  app.use('*', createContextMiddleware(createContext));

  app.use('/events/*', createTrackerMiddleware());
  app.route('/events', eventsRouter);

  app.onError((err, c) => {
    if (err instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
}
