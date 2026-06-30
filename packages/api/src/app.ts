import typeDefs from '@/__generated__/graphql/typeDefs';
import resolvers from '@/graphql/resolvers';
import processAllowedOriginsString, { splitCommaSeparated } from '@/helpers/allowedOrigins';
import { redactError } from '@/helpers/error';
import createContextMiddleware from '@/middlewares/context';
import createOrganizationMiddleware from '@/middlewares/organization';
import createUserMiddleware from '@/middlewares/user';
import trackerRouter from '@/rest/routers/tracker';
import { $, Env } from '@/types';
import { createSchema, createYoga } from 'graphql-yoga';
import { Context, Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import createLoadersMiddleware from './middlewares/loaders';

export function createApp(createContext: (c: Context) => Promise<$>) {
  const app = new Hono<Env>();

  app.use('*', logger());
  app.use('*', async (c, next) => {
    const { API_ALLOW_ORIGINS, API_CORS_ALLOW_HEADERS } = env(c);
    const origins = processAllowedOriginsString(API_ALLOW_ORIGINS);
    const allowHeaders = splitCommaSeparated(API_CORS_ALLOW_HEADERS) || [
      'Content-Type',
      'Authorization',
    ];

    const handler = cors({
      origin: (origin) => {
        if (!origins) return undefined;
        if (origins.includes('*')) return '*';
        return origins.includes(origin) ? origin : undefined;
      },
      allowHeaders,
      credentials: true,
    });
    return handler(c, next);
  });

  app.get('/health', (c) => c.json({ ok: true }));

  app.use('*', createContextMiddleware(createContext));

  app.all('/api/auth/*', (c) => c.var.$.auth.handler(c.req.raw));

  app.use('*', createUserMiddleware(), createOrganizationMiddleware(), createLoadersMiddleware());

  app.route('/tracker', trackerRouter);

  const yoga = createYoga({
    schema: createSchema({
      typeDefs,
      resolvers,
    }),
    batching: true,
  });
  app.all('/graphql', (c) => yoga.fetch(c.req.raw, { c }));

  app.onError((err, c) => {
    console.error(redactError(err));
    if (err instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
}
