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
