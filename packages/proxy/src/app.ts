import createContextMiddleware from '@/middlewares/context';
import createTrackerMiddleware from '@/middlewares/tracker';
import eventsRouter from '@/routers/events';
import indexRouter from '@/routers/index';
import { $, Env } from '@/types';
import { Context, Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

export function createApp(createContext: (c: Context) => Promise<$>) {
  const app = new Hono<Env>();

  app.use('*', logger());
  app.use('*', async (c, next) => {
    const { ALLOWED_ORIGIN = '*' } = env<{ ALLOWED_ORIGIN: string }>(c);
    const corsMiddlewareHandler = cors({
      origin: ALLOWED_ORIGIN,
    });
    return corsMiddlewareHandler(c, next);
  });

  // Public routes that don't require authentication
  app.route('/', indexRouter);
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
