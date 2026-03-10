import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';
import { Context as HonoContext } from 'hono';

export interface Context extends HonoContext {
  tenantId: string;
  loaders: Map<string, any>;
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

export const graphqlHandler = graphqlServer({
  schema,
  pretty: true,
});
