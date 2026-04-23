import customFetch from '@/helpers/fetch';
import { create, windowScheduler } from '@yornaath/batshit';

type GqlKey = {
  query: string;
  variables?: any;
};

const gqlBatch = create<GqlKey, any>({
  fetcher: async (keys) => {
    const body = keys.map(({ query, variables }) => ({
      query,
      variables,
    }));

    const { body: responseBody } = await customFetch('POST', '/gql', { body });

    return responseBody.map((res: any) => {
      if (res.errors) {
        return Promise.reject(new Error(res.errors[0]?.message || 'GraphQL Error'));
      }
      return res.data;
    });
  },

  resolver: (key) => ({
    query: key.query,
    variables: key.variables,
  }),

  scheduler: windowScheduler(10),
});

export const useGraphql = <TData, TVariables>(
  query: string
): ((variables?: TVariables) => Promise<TData>) => {
  return async (variables?: TVariables) => {
    const serializedVariables = variables ? serializeDates(variables) : undefined;

    const data = await gqlBatch.fetch({
      query,
      variables: serializedVariables,
    });

    return data as TData;
  };
};

export const serializeDates = (obj: unknown): unknown => {
  if (obj == null) return obj;

  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) return obj.map(serializeDates);

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, serializeDates(v)])
    );
  }

  return obj;
};
