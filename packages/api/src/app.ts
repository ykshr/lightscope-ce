import typeDefs from '@/__generated__/typeDefs';
import { auth } from '@/lib/auth';
import createAuthMiddleware, { AuthProvider } from '@/middlewares/auth';
import createClickhouseMiddleware from '@/middlewares/clickhouse';
import createLoadersMiddleware from '@/middlewares/loaders';
import resolvers from '@/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlServer } from '@hono/graphql-server';
import { Hono, Env as HonoEnv } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

export interface AppDependencies {
  authProvider: AuthProvider;
}

export function createApp<Env extends HonoEnv>(deps: AppDependencies) {
  const { authProvider } = deps;
  const app = new Hono<Env>();

  app.use('*', logger());
  app.use('*', async (c, next) => {
    const { ALLOWED_ORIGIN = '*' } = env<{ ALLOWED_ORIGIN: string }>(c);
    const corsMiddlewareHandler = cors({
      origin: ALLOWED_ORIGIN,
    });
    return corsMiddlewareHandler(c, next);
  });

  app.all('/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
  });

  app.get('/health', (c) => c.json({ ok: true }));
  app.all(
    '/gql',
    createAuthMiddleware(authProvider),
    createClickhouseMiddleware(),
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

  return app;
}
