import { $, Bindings, Variables } from '@/types';
import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import trackerApp from '@/rest/routers/tracker';

vi.mock('hono/jwt', () => ({
  sign: vi.fn().mockResolvedValue('mocked_token'),
}));

vi.mock('@/loaders/tracker', () => ({
  default: vi.fn().mockResolvedValue([{ id: '1', token: 'mocked_token' }]),
}));

const setupApp = (role: string = 'member') => {
  const app = new Hono<{ Variables: Variables; Bindings: Bindings }>();

  app.use('*', async (c, next) => {
    c.set('user', {
      id: 'u1',
      name: 'user',
      email: 'user@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    c.set('organization', { id: 'org1' });
    c.set('me', {
      id: 'm1',
      organizationId: 'org1',
      userId: 'u1',
      role,
      createdAt: new Date(),
    } as any);
    c.set('$', {
      jwt: { secret: 'secret', algorithm: 'HS256' },
      prisma: {
        tracker: {
          create: vi.fn().mockResolvedValue({}),
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          findMany: vi.fn().mockResolvedValue([{}]),
        },
      },
    } as unknown as $);
    await next();
  });

  app.route('/tracker', trackerApp);
  return app;
};

describe('Tracker Router', () => {
  describe('GET /tracker', () => {
    it('should return trackers for members', async () => {
      const app = setupApp('member');
      const res = await app.request('/tracker');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('trackers');
    });
  });

  describe('POST /tracker/generate', () => {
    const validPayload = { origin: 'https://example.com' };

    it('should forbid token generation for members', async () => {
      const app = setupApp('member');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      expect(res.status).toBe(403);
    });

    it('should allow token generation for admins', async () => {
      const app = setupApp('admin');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      expect(res.status).toBe(200);
    });

    it('should allow token generation for owners', async () => {
      const app = setupApp('owner');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid payload', async () => {
      const app = setupApp('admin');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: 'not-a-url' }), // invalid URL
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Invalid payload');
    });

    it('should return 400 for excessively long origin', async () => {
      const app = setupApp('admin');
      const longOrigin = 'https://' + 'a'.repeat(1000) + '.com';
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: longOrigin }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Origin is too long');
    });

    it('should allow token generation with expiry date', async () => {
      const app = setupApp('admin');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'https://example.com',
          expiresAt: new Date().toISOString(),
        }),
      });
      expect(res.status).toBe(200);
    });

    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        const mockPrisma = {
          tracker: {
            create: vi.fn().mockRejectedValue(new Error('Database error')),
          },
        };
        c.set('$', {
          jwt: { secret: 'secret', algorithm: 'HS256' },
          prisma: mockPrisma,
        } as unknown as $);
        await next();
      });
      testApp.route('/tracker', trackerApp);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await testApp.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: 'https://example.com' }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to generate token');

      consoleSpy.mockRestore();
    });
  });

  describe('DELETE /tracker/:id', () => {
    it('should forbid token deletion for members', async () => {
      const app = setupApp('member');
      const res = await app.request('/tracker/1', { method: 'DELETE' });
      expect(res.status).toBe(403);
    });

    it('should allow token deletion for admins', async () => {
      const app = setupApp('admin');
      const res = await app.request('/tracker/1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('should allow token deletion for owners', async () => {
      const app = setupApp('owner');
      const res = await app.request('/tracker/1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        const mockPrisma = {
          tracker: {
            deleteMany: vi.fn().mockRejectedValue(new Error('Database error')),
          },
        };
        c.set('$', {
          prisma: mockPrisma,
        } as unknown as $);
        await next();
      });
      testApp.route('/tracker', trackerApp);

      const res = await testApp.request('/tracker/1', { method: 'DELETE' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to delete tracker');
    });
  });
});
