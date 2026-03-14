import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '@/schema';
import resolvers from '@/resolvers';
import createAuthMiddleware, { AuthProvider } from '@/middlewares/auth';
import NoAuthProvider from '@/middlewares/auth/noAuth';
import createLoadersMiddleware from '@/middlewares/loaders';

export interface AppDependencies {
  authProvider?: AuthProvider;
}

export function createApp(deps: AppDependencies = {}) {
  const { authProvider = new NoAuthProvider() } = deps;
  const app = new Hono();

  app.use('*', logger());
  app.use('*', cors());

  app.get('/health', (c) => c.json({ ok: true }));
  app.all(
    '/gql',
    createAuthMiddleware(authProvider),
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
