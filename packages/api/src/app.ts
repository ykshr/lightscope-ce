import typeDefs from '@/__generated__/typeDefs';
import createAuthMiddleware from '@/middlewares/auth';
import createContextMiddleware from '@/middlewares/context';
import resolvers from '@/resolvers';
import { $, Env } from '@/types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlServer } from '@hono/graphql-server';
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

  app.get('/health', (c) => c.json({ ok: true }));

  app.use('*', createContextMiddleware(createContext));

  app.all('/api/auth/*', (c) => c.var.$.auth.handler(c));

  app.all(
    '/gql',
    createAuthMiddleware(),
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

  return app;
}
