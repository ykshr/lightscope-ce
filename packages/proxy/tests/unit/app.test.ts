import { createApp } from '@/app';
import { env } from 'hono/adapter';
import { describe, expect, it, vi } from 'vitest';

// Mock env from hono/adapter to inject env variables in tests
vi.mock('hono/adapter', async () => {
  const actual = await vi.importActual('hono/adapter');
  return {
    ...(actual as any),
    env: vi.fn(),
  };
});

describe('App', () => {
  it('should expose /health route', async () => {
    vi.mocked(env).mockReturnValue({});
    const app = createApp(async () => ({}) as any);
    const req = new Request('http://localhost/health');
    const res = await app.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  describe('App CORS', () => {
    it('should NOT set CORS headers if ALLOWED_ORIGINS is missing', async () => {
      vi.mocked(env).mockReturnValue({});
      const mockCreateContext = vi.fn().mockResolvedValue({});
      const app = createApp(mockCreateContext);

      const res = await app.request('/health');

      expect(res.status).toBe(200);
      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    });

    it('should set CORS headers if ALLOWED_ORIGINS matches', async () => {
      vi.mocked(env).mockReturnValue({ PROXY_ALLOWED_ORIGINS: 'http://example.com' });
      const mockCreateContext = vi.fn().mockResolvedValue({});
      const app = createApp(mockCreateContext);

      app.get('/test-cors', (c) => c.json({ ok: true }));

      const res = await app.request(
        new Request('http://localhost/test-cors', {
          method: 'GET',
          headers: {
            Origin: 'http://example.com',
          },
        })
      );

      expect(res.headers.get('access-control-allow-origin')).toBe('http://example.com');
    });

    it('should NOT set CORS headers if ALLOWED_ORIGINS does NOT match', async () => {
      vi.mocked(env).mockReturnValue({ PROXY_ALLOWED_ORIGINS: 'http://example.com' });
      const mockCreateContext = vi.fn().mockResolvedValue({});
      const app = createApp(mockCreateContext);
      app.get('/test-cors', (c) => c.json({ ok: true }));

      const res = await app.request(
        new Request('http://localhost/test-cors', {
          method: 'GET',
          headers: {
            Origin: 'http://malicious.com',
          },
        })
      );

      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle SyntaxError with 400 Bad Request', async () => {
      vi.mocked(env).mockReturnValue({});
      const app = createApp(async () => ({}) as any);
      app.get('/error-syntax', () => {
        throw new SyntaxError('Unexpected token');
      });

      const res = await app.request('/error-syntax');
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Bad request: Invalid JSON' });
    });

    it('should handle generic errors with 500 Internal Server Error', async () => {
      vi.mocked(env).mockReturnValue({});
      const app = createApp(async () => ({}) as any);
      app.get('/error-generic', () => {
        throw new Error('Something went wrong');
      });

      const res = await app.request('/error-generic');
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Internal Server Error' });
    });
  });
});
