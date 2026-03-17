import typeDefs from '@/__generated__/typeDefs';
import createClickhouseMiddleware from '@/middlewares/clickhouse';
import createLoadersMiddleware from '@/middlewares/loaders';
import resolvers from '@/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlServer } from '@hono/graphql-server';
import { Hono } from 'hono';

const app = new Hono();

app.all(
  '/gql',
  createClickhouseMiddleware(),
  createLoadersMiddleware(),
  graphqlServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    pretty: true,
  })
);

export default app;
