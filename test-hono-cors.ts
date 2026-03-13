import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();
app.use('*', cors({ origin: [] }));
app.get('/', (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: 4000 }, () => {
  console.log('Server started');
});
