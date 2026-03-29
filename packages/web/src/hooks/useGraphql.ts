import { fetchPost } from '@/helpers/fetch';

export const useGraphql = <TData, TVariables>(
  query: string,
  headers?: RequestInit['headers']
): ((variables?: TVariables) => Promise<TData>) => {
  return async (variables?: TVariables) => {
    const serializedVariables = variables ? serializeDates(variables) : undefined;

    const body = {
      query,
      variables: serializedVariables,
    };

    const { errors, data } = await fetchPost('/gql', body, headers);

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
