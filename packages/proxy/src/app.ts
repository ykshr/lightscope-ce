import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from 'hono/adapter';
import indexRouter from '@/routers/index';
import eventsRouter from '@/routers/events';
import createAuthMiddleware, { AuthProvider } from '@/middlewares/auth';
import createEgressMiddleware, { EgressProvider } from '@/middlewares/egress';
import createGeoMiddleware, { GeoProvider } from '@/middlewares/geo';

export interface AppDependencies {
  authProvider: AuthProvider;
  egressProvider: EgressProvider;
  geoProvider: GeoProvider;
}

export function createApp(deps: AppDependencies) {
  const { authProvider, egressProvider, geoProvider } = deps;

  const app = new Hono();

  app.use('*', logger());
  app.use('*', async (c, next) => {
    const { ALLOWED_ORIGIN } = env<{ ALLOWED_ORIGIN?: string }>(c);
    if (!ALLOWED_ORIGIN) {
      return next();
    }
    const origins = ALLOWED_ORIGIN.split(',').map((o) => o.trim());
    const corsMiddlewareHandler = cors({
      origin: origins.length === 1 ? origins[0] : origins,
    });
    return corsMiddlewareHandler(c, next);
  });

  // Public routes that don't require authentication
  app.route('/', indexRouter);
  app.get('/health', (c) => c.json({ ok: true }));

  // Events endpoint has its own tracker token authentication
  app.use(
    '/events/*',
    createAuthMiddleware(authProvider),
    createEgressMiddleware(egressProvider),
    createGeoMiddleware(geoProvider)
  );
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
