import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PORT, ALLOWED_ORIGINS } from '@/helpers/env';
import typeDefs from '@/schema';
import resolvers from '@/resolvers';
import createAuthMiddleware from '@/middlewares/auth';
import NoAuthProvider from '@/middlewares/auth/noAuth';
import createLoadersMiddleware from '@/middlewares/loaders';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: ALLOWED_ORIGINS }));

app.get('/health', (c) => c.json({ ok: true }));
app.all(
  '/gql',
  createAuthMiddleware(new NoAuthProvider()),
  createLoadersMiddleware(),
  graphqlServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    pretty: true,
  })
);

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: 'Bad request: Invalid JSON' }, 400);
  }
  return c.json({ error: 'Internal Server Error' }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
