import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import indexRouter from '@/routers/index';
import createEventsRouter from '@/routers/events';
import createAuthMiddleware, { AuthProvider } from '@/middlewares/auth';
import NoAuthProvider from '@/middlewares/auth/noAuth';
import createEgressMiddleware, { Egress } from '@/middlewares/egress';
import ClickHouseEgress from '@/middlewares/egress/clickhouse';
import { getGeoData as defaultGetGeoData } from '@/helpers/geo';
import { Context } from 'hono';

export interface AppDependencies {
  authProvider?: AuthProvider;
  egress?: Egress;
  getGeoData?: (c: Context) => any;
}

export function createApp(deps: AppDependencies = {}) {
  const {
    authProvider = new NoAuthProvider(),
    egress = new ClickHouseEgress(),
    getGeoData = defaultGetGeoData,
  } = deps;

  const app = new Hono();

  app.use('*', logger());
  app.use('*', cors());

  // Public routes that don't require authentication
  app.route('/', indexRouter);
  app.get('/health', (c) => c.json({ ok: true }));

  // Events endpoint has its own tracker token authentication
  app.use(
    '/events/*',
    createAuthMiddleware(authProvider),
    createEgressMiddleware(egress)
  );
  app.route('/events', createEventsRouter(getGeoData));

  app.onError((err, c) => {
    if (err instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
}
