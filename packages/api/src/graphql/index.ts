import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { buildSchema } from 'graphql';
import schemaSDL from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';
import { Context as HonoContext } from 'hono';

export interface Context extends HonoContext {
  tenantId: string;
  loaders: Map<string, any>;
}

const schema = makeExecutableSchema({
  typeDefs: buildSchema(schemaSDL),
  resolvers,
});

export const graphqlHandler = graphqlServer({
  schema,
  pretty: true,
  graphiql: true,
});
