import typeDefs from '@/__generated__/graphql/typeDefs';
import resolvers from '@/graphql/resolvers';
import createContextMiddleware from '@/middlewares/context';
import createUserMiddleware from '@/middlewares/user';
import trackerRouter from '@/rest/routers/tracker';
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
      allowHeaders: ['Content-Type', 'Authorization'],
    });
    return corsMiddlewareHandler(c, next);
  });

  app.get('/health', (c) => c.json({ ok: true }));

  app.use('*', createContextMiddleware(createContext));

  app.all('/api/auth/*', (c) => c.var.$.auth.handler(c.req.raw));

  app.use('*', createUserMiddleware());

  app.route('/tracker', trackerRouter);

  app.all(
    '/gql',
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
