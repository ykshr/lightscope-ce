import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import indexRouter from '@/routers/index';
import eventsRouter from '@/routers/events';
import createAuthMiddleware from '@/middlewares/auth';
import NoAuthProvider from '@/middlewares/auth/noAuth';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

// Public routes that don't require authentication
app.route('/', indexRouter);
app.get('/health', (c) => c.json({ ok: true }));

// Events endpoint has its own tracker token authentication
app.use('/events/*', createAuthMiddleware(new NoAuthProvider()));
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
