const fs = require('fs');
const filePath = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let code = fs.readFileSync(filePath, 'utf8');

const search = `    it('should allow token generation for owners', async () => {
      const app = setupApp('owner');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /tracker/:id', () => {`;

const replace = `    it('should allow token generation for owners', async () => {
      const app = setupApp('owner');
      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      expect(res.status).toBe(200);
    });

    it('should handle errors and return 500', async () => {
      const app = new Hono<{ Variables: Variables; Bindings: Bindings }>();

      app.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        c.set('$', {
          jwt: { secret: 'secret', algorithm: 'HS256' },
          prisma: {
            tracker: {
              create: vi.fn().mockRejectedValue(new Error('Database error')),
            },
          },
        } as unknown as $);
        await next();
      });

      app.route('/tracker', trackerApp);

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await app.request('/tracker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to generate token');

      consoleSpy.mockRestore();
    });
  });

  describe('DELETE /tracker/:id', () => {`;

code = code.replace(search, replace);
fs.writeFileSync(filePath, code);
