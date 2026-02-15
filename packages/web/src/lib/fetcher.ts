// TODO: Add unit tests - The serializeDates function handles recursive date serialization and needs to be tested to ensure it handles nested objects and arrays correctly.
import createAuthProvider from '@/auth';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers']
): (() => Promise<TData>) => {
  return async () => {
    const auth = createAuthProvider();
    await auth.initialize();
    const user = await auth.getUser();
    const token = await auth.getToken();

    // if (!user?.id) throw new Error('User not authenticated');

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
        userId: user?.id,
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
