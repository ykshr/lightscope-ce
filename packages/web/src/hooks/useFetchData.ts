import authClient from '@/helpers/auth';
import { API_URL } from '@/helpers/env';

export const useFetchData = <TData, TVariables>(
  query: string,
  options?: RequestInit['headers']
): ((variables?: TVariables) => Promise<TData>) => {
  return async (variables?: TVariables) => {
    const { data: session } = await authClient.getSession();
    if (!session) throw new Error('Not authenticated');

    const serializedVariables = variables ? serializeDates(variables) : undefined;

    const res = await fetch(`${API_URL}/gql`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options,
      },
      body: JSON.stringify({
        query,
        variables: serializedVariables,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      if (json.errors) {
        const { message } = json.errors[0] || {};
        throw new Error(message || 'Response was not ok - no error message');
      }
      throw new Error(json.message || 'Response was not ok - no message');
    }

    if (json.errors) {
      const { message } = json.errors[0] || {};
      throw new Error(message || 'GraphQL Error');
    }

    return json.data;
  };
};

/**
 * Recursively traverses an object and converts Date types to strings
 */
export const serializeDates = (obj: any): any => {
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
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeDates(obj[key]);
      return acc;
    }, {} as any);
  }

  // Otherwise (string, number, boolean, etc.), return as is
  return obj;
};
