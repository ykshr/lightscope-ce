import customFetch from '@/helpers/fetch';
import { create, windowScheduler } from '@yornaath/batshit';

type GqlKey = {
  id: string;
  query: string;
  variables?: any;
};

const chunkSize = 10;

const gqlBatch = create<any, GqlKey>({
  fetcher: async (keys) => {
    const chunkPromises: Promise<any[]>[] = [];

    for (let i = 0; i < keys.length; i += chunkSize) {
      const requestBody: { query: string; variables: any }[] = [];
      const end = Math.min(i + chunkSize, keys.length);
      for (let j = i; j < end; j++) {
        requestBody.push({
          query: keys[j].query,
          variables: keys[j].variables ?? {},
        });
      }

      chunkPromises.push(
        customFetch('POST', '/graphql', {
          body: requestBody,
        }).then(({ body }) => body as any[])
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    const results = new Map<string, any>();
    let k = 0;

    for (let i = 0; i < chunkResults.length; i++) {
      const chunk = chunkResults[i];
      if (chunk) {
        for (let j = 0; j < chunk.length; j++) {
          results.set(keys[k++].id, chunk[j]);
        }
      }
    }

    return results;
  },

  resolver: (items: Map<string, any>, query) => {
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
