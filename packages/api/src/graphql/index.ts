import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';

export interface Context {
  tenantId: string;
  loaders: Map<string, any>;
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

await server.start();

export default expressMiddleware(server, {
  context: async ({ req }) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new Error('Missing tenantId');

    return {
      tenantId,
      loaders: new Map(),
    };
  },
});
