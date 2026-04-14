import { describe, it, expect } from 'vitest';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000';

describe('Web Integration Test', () => {
  describe('Normal Cases', () => {
    it('should return the index HTML page for root (/)', async () => {
      const res = await fetch(`${WEB_URL}/`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      const html = await res.text();
      expect(html).toContain('<div id="root"></div>');
    });

    it.each([
      '/ranking',
      '/article',
      '/settings',
      '/signin',
      '/signup',
    ])('should return the index HTML page for route %s', async (route) => {
      const res = await fetch(`${WEB_URL}${route}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      const html = await res.text();
      expect(html).toContain('<div id="root"></div>');
    });

    it('should serve static assets correctly', async () => {
      const res = await fetch(`${WEB_URL}/LittleScope.png`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('image/png');
    });

    it('should support OPTIONS requests (CORS preflight)', async () => {
      const res = await fetch(`${WEB_URL}/`, { method: 'OPTIONS' });
      // Depending on Vite server behavior, OPTIONS might be 200 or 204.
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('Abnormal Cases', () => {
    it.each(['POST', 'PUT', 'DELETE', 'PATCH'])('should return 404 for unsupported HTTP methods (%s)', async (method) => {
      const res = await fetch(`${WEB_URL}/`, { method });
      expect(res.status).toBe(404);
    });

    it('should return index HTML as fallback for unknown routes', async () => {
      // SPA routing fallback
      const res = await fetch(`${WEB_URL}/unknown-route-12345`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      const html = await res.text();
      expect(html).toContain('<div id="root"></div>');
    });
  });
});
