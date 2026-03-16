import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/helpers/env';

export const useFetchData = <TData, TVariables>(
  query: string,
  options?: RequestInit['headers']
): ((variables?: TVariables) => Promise<TData>) => {
  const { auth } = useAuth();

  return async (variables?: TVariables) => {
    if (!auth) throw new Error('Auth provider is not ready');

    const token = await auth.getToken();
    if (!token) throw new Error('User not authenticated');

    const serializedVariables = variables ? serializeDates(variables) : undefined;

    const res = await fetch(`${API_URL}/gql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options,
      },
      body: JSON.stringify({
        query,
        variables: serializedVariables,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'Network response was not ok');
    }

    if (json.errors) {
      const { message } = json.errors[0] || {};
      throw new Error(message || 'Response Error');
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
