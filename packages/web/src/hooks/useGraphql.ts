import customFetch from '@/helpers/fetch';
import { create, windowScheduler } from '@yornaath/batshit';

type GqlKey = {
  id: string;
  query: string;
  variables?: any;
};

const gqlBatch = create<any, GqlKey>({
  fetcher: async (keys) => {
    const requestBody = keys.map(({ query, variables = {} }) => ({
      query,
      variables,
    }));

    const { body: responseBody } = await customFetch('POST', '/graphql', {
      body: requestBody,
    });
    return keys.map((key, index) => ({
      id: key.id,
      result: (responseBody as any[])[index],
    }));
  },

  resolver: (items: any[], query) => {
    return items.find((item) => item.id === query.id)?.result;
  },

  scheduler: windowScheduler(10),
});

export const useGraphql = <TData, TVariables>(
  query: string
): ((variables?: TVariables) => Promise<TData>) => {
  return async (variables?: TVariables) => {
    const serializedVariables = variables ? serializeDates(variables) : undefined;
    const id = crypto.randomUUID();

    const { data } = await gqlBatch.fetch({
      id,
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
