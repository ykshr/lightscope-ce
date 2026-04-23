import { API_URL } from '@/helpers/env';

export default async function customFetch(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: {
    body?: unknown;
    headers?: RequestInit['headers'];
    expectJson?: boolean;
  } = {}
) {
  const urlToUse = new URL(url, API_URL);
  const { body, headers, expectJson = true } = options;
  const requestOptions: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': expectJson ? 'application/json' : 'text/plain',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(urlToUse, requestOptions);

  const text = await res.text();

  if (!res.ok) {
    throw new Error(JSON.stringify({ status: res.status, body: text }));
  }

  if (!expectJson) return { status: res.status, body: text };

  if (!text) return { status: res.status };

  return { status: res.status, body: JSON.parse(text) };
}

export const queryFetch = <TData, TVariables>(
  query: string,
  options?: RequestInit['headers']
): ((variables?: TVariables) => Promise<TData>) => {
  return async (variables?: TVariables) => {
    const serializedVariables = variables ? serializeDates(variables) : undefined;

    const body = {
      query,
      variables: serializedVariables,
    };

    const { body: responseBody } = await customFetch('POST', '/gql', {
      body,
      headers: {
        'Content-Type': 'application/json',
        ...options,
      },
    });
    const { errors, data } = responseBody;

    if (errors) {
      const { message } = errors[0] || {};
      throw new Error(message || 'GraphQL Error');
    }

    return data;
  };
};

/**
 * Recursively traverses an object and converts Date types to strings
 */
export const serializeDates = (obj: unknown): unknown => {
  // Check for null or undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // If Date type, convert to string (ISO 8601 format is common)
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // If array, recursively process each element
  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  // If object, recursively process each property
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (acc, key) => {
        acc[key] = serializeDates((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  // Otherwise (string, number, boolean, etc.), return as is
  return obj;
};
