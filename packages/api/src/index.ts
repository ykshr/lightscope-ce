import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphqlHandler } from '@/graphql';
import authMiddleware from '@/auth';

const app = new Hono<{ Variables: { user: any } }>();

app.use('*', cors());

app.get('/health', (c) => c.json({ ok: true }));

// Auth middleware - all routes below this require authentication for dashboard users
app.use('/gql/*', authMiddleware());

app.use('/gql', async (c, next) => {
  const user = c.get('user');
  (c as any).tenantId = user?.tenant_id ? String(user.tenant_id) : '1';
  (c as any).loaders = new Map();
  await next();
});

app.all('/gql', graphqlHandler);

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: 'Bad request: Invalid JSON' }, 400);
  }
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
