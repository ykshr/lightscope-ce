import { createApp } from '@/app';
import { describe, expect, it, vi } from 'vitest';

describe('App CORS', () => {
  const mockCreateContext = vi.fn().mockResolvedValue({});

  it('should NOT set CORS headers if ALLOWED_ORIGINS is missing', async () => {
    const app = createApp(mockCreateContext);
    const res = await app.request('/health', {
      method: 'GET',
      headers: {
        Origin: 'https://example.com',
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('should set CORS headers if ALLOWED_ORIGINS matches', async () => {
    // We need to mock the environment variable.
    // In Hono, env(c) retrieves from c.env (for Cloudflare) or process.env (for Node).
    // Our app uses env(c) from hono/adapter.

    process.env.ALLOWED_ORIGINS = 'https://example.com,https://another.com';

    const app = createApp(mockCreateContext);
    const res = await app.request('/health', {
      method: 'GET',
      headers: {
        Origin: 'https://example.com',
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');

    delete process.env.ALLOWED_ORIGINS;
  });

  it('should NOT set CORS headers if ALLOWED_ORIGINS does NOT match', async () => {
    process.env.ALLOWED_ORIGINS = 'https://trusted.com';

    const app = createApp(mockCreateContext);
    const res = await app.request('/health', {
      method: 'GET',
      headers: {
        Origin: 'https://malicious.com',
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();

    delete process.env.ALLOWED_ORIGINS;
  });
});
