import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { PORT, ALLOWED_ORIGINS } from '@/helpers/env';
import indexRouter from '@/routers/index';
import eventsRouter from '@/routers/events';
import createAuthMiddleware from '@/middlewares/auth';
import NoAuthProvider from '@/middlewares/auth/noAuth';
import createEgressMiddleware from '@/middlewares/egress';
import ClickHouseEgress from '@/middlewares/egress/clickhouse';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: ALLOWED_ORIGINS }));

// Public routes that don't require authentication
app.route('/', indexRouter);
app.get('/health', (c) => c.json({ ok: true }));

// Events endpoint has its own tracker token authentication
app.use(
  '/events/*',
  createAuthMiddleware(new NoAuthProvider()),
  createEgressMiddleware(new ClickHouseEgress())
);
app.route('/events', eventsRouter);

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: 'Bad request: Invalid JSON' }, 400);
  }
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`insert server listening on ${info.port}`);
  }
);
