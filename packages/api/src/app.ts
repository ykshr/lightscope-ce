import { Hono, Env as HonoEnv } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from 'hono/adapter';
import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import createAuthMiddleware, { AuthProvider } from '@/middlewares/auth';
import createLoadersMiddleware from '@/middlewares/loaders';
import createClickhouseMiddleware from '@/middlewares/clickhouse';
import typeDefs from '@/__generated__/typeDefs';
import resolvers from '@/resolvers';

export interface AppDependencies {
  authProvider: AuthProvider;
}

export function createApp<Env extends HonoEnv>(deps: AppDependencies) {
  const { authProvider } = deps;
  const app = new Hono<Env>();

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
