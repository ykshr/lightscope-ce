import { API_URL } from '@/helpers/env';

export async function fetchGet(
  url: string,
  headers: RequestInit['headers'] = {},
  expectJson: boolean = true
) {
  const urlToUse = new URL(url, API_URL);
  const res = await fetch(urlToUse, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': expectJson ? 'application/json' : 'text/plain',
      ...headers,
    },
  });

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error(`Response was not ok - ${res.status}: ${text}`);
  }

  if (!expectJson) return text;

  const json = JSON.parse(text);

  return json;
}

export async function fetchPost(
  url: string,
  body: any,
  headers: RequestInit['headers'] = {},
  expectJson: boolean = true
) {
  const urlToUse = new URL(url, API_URL);
  const res = await fetch(urlToUse, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': expectJson ? 'application/json' : 'text/plain',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error(`Response was not ok - ${res.status}: ${text}`);
  }

  if (!expectJson) return text;

  const json = JSON.parse(text);

  return json;
}

export async function fetchDelete(
  url: string,
  headers: RequestInit['headers'] = {},
  expectJson: boolean = true
) {
  const urlToUse = new URL(url, API_URL);
  const res = await fetch(urlToUse, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': expectJson ? 'application/json' : 'text/plain',
      ...headers,
    },
  });

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error(`Response was not ok - ${res.status}: ${text}`);
  }

  if (!expectJson) return text;

  if (!text) return {};

  const json = JSON.parse(text);

  return json;
}
