import customFetch from '@/helpers/fetch';
import { create, windowScheduler } from '@yornaath/batshit';

type GqlKey = {
  id: string;
  query: string;
  variables?: any;
};

const chunkSize = 10;

const gqlBatch = create<Map<string, any>, GqlKey>({
  fetcher: async (keys) => {
    const chunkPromises: Promise<void>[] = [];
    const flatResponses: any[] = new Array(keys.length);

    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunkEnd = Math.min(i + chunkSize, keys.length);
      const requestBody = new Array(chunkEnd - i);

      for (let j = i; j < chunkEnd; j++) {
        requestBody[j - i] = {
          query: keys[j].query,
          variables: keys[j].variables || {},
        };
      }

      const chunkPromise = customFetch('POST', '/graphql', {
        body: requestBody,
      }).then(({ body }) => {
        const results = body as any[];
        for (let j = 0; j < results.length; j++) {
          flatResponses[i + j] = results[j];
        }
      });

      chunkPromises.push(chunkPromise);
    }

    await Promise.all(chunkPromises);

    // ⚡ Bolt: Return a Map to allow O(1) lookups in the resolver
    const resultMap = new Map<string, any>();
    for (let i = 0; i < keys.length; i++) {
      resultMap.set(keys[i].id, flatResponses[i]);
    }

    return resultMap;
  },

  resolver: (items: Map<string, any>, query) => {
    // ⚡ Bolt: O(1) lookup instead of O(N^2) items.find
    return items.get(query.id);
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
