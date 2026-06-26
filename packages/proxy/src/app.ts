import processAllowedOriginsString, { splitCommaSeparated } from '@/helpers/allowedOrigins';
import { redactError } from '@/helpers/error';
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
    const { PROXY_ALLOW_ORIGINS, PROXY_CORS_ALLOW_HEADERS } = env(c);
    const origins = processAllowedOriginsString(PROXY_ALLOW_ORIGINS);
    const allowHeaders = splitCommaSeparated(PROXY_CORS_ALLOW_HEADERS) || [
      'Content-Type',
      'Authorization',
    ];

    const corsMiddlewareHandler = cors({
      origin: (origin) => {
        if (!origins || origins.includes('*')) return origin;
        return origins.includes(origin) ? origin : undefined;
      },
      allowHeaders,
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
    console.error(redactError(err));
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
}
