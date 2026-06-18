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

const setupApp = (role: string = 'member', trackerMocks: any = {}) => {
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
          create: trackerMocks.create || vi.fn().mockResolvedValue({}),
          deleteMany: trackerMocks.deleteMany || vi.fn().mockResolvedValue({ count: 1 }),
          findMany: trackerMocks.findMany || vi.fn().mockResolvedValue([{}]),
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

    it('should return 500 when tracker deletion fails', async () => {
      const app = setupApp('admin', {
        deleteMany: vi.fn().mockRejectedValue(new Error('Database error')),
      });
      const res = await app.request('/tracker/1', { method: 'DELETE' });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Failed to delete tracker' });
    });
  });
});
