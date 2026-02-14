import { account } from '@/lib/appwrite';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers']
): (() => Promise<TData>) => {
  return async () => {
    const userId = (await account.get()).$id;
    if (!userId) throw new Error('User not authenticated');

    const token = localStorage.getItem('auth_token');

    const serializedVariables = variables
      ? serializeDates(variables)
      : undefined;

    const res = await fetch(`${API_ENDPOINT}/gql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options,
      },
      body: JSON.stringify({
        query,
        variables: serializedVariables,
        userId,
      }),
    });

    const json = await res.json();

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
const serializeDates = (obj: any): any => {
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
