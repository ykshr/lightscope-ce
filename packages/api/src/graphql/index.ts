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
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse({ response, errors }) {
            if (errors && errors.length > 0) {
              response.http.status = 500;
            }
          },
        };
      },
    },
  ],
});

await server.start();

export default expressMiddleware(server, {
  context: async ({ req }) => {
    const tenantId = req.user?.tenant_id ? String(req.user.tenant_id) : '1';

    return {
      tenantId,
      loaders: new Map(),
    };
  },
});
