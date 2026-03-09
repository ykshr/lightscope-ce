import { ApolloServer, HeaderMap } from '@apollo/server';
import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';
import { Context as HonoContext } from 'hono';

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
              if (response.http) {
                response.http.status = 500;
              }
            }
          },
        };
      },
    },
  ],
});

await server.start();

export const graphqlHandler = async (c: HonoContext) => {
  const req = c.req.raw;
  
  const headers = new HeaderMap();
  for (const [key, value] of req.headers.entries()) {
    if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const user = c.get('user');
  const tenantId = user?.tenant_id ? String(user.tenant_id) : '1';

  const body = req.method === 'POST' ? await c.req.json().catch(() => ({})) : {};

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      headers,
      method: req.method.toUpperCase(),
      body,
      search: new URL(req.url).search,
    },
    context: async () => ({
      tenantId,
      loaders: new Map(),
    }),
  });

  for (const [key, value] of httpGraphQLResponse.headers) {
    c.header(key, value);
  }

  if (httpGraphQLResponse.body.kind === 'complete') {
    return c.body(httpGraphQLResponse.body.string, {
      status: httpGraphQLResponse.status || 200,
    });
  }
  
  return c.text('Chunked response not supported', 500);
};
