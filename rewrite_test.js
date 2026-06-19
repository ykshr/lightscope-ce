const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

const newTest = `
    it('should handle errors and return 500', async () => {
      const app = setupApp('admin');

      // We will re-use setupApp and just intercept the prisma.create
      const originalHandler = app.routes.find(r => r.path === '/tracker/generate' && r.method === 'POST')?.handler;

      if (originalHandler) {
        // Find the middleware where we can inject our mock
        app.use('/error-test/*', async (c, next) => {
           // We need a fresh object to override prisma for just this request,
           // but setupApp sets it for every request.
           c.set('$', {
             jwt: { secret: 'secret', algorithm: 'HS256' },
             prisma: {
               tracker: {
                 create: vi.fn().mockRejectedValue(new Error('Database error')),
               }
             }
           } as any);
           await next();
        });
      }

      // Instead, let's just make a new app inside the test
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        const mockPrisma = {
          tracker: {
            create: vi.fn().mockRejectedValue(new Error('Database error')),
          }
        };
        c.set('$', {
          jwt: { secret: 'secret', algorithm: 'HS256' },
          prisma: mockPrisma
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
`;

const lines = content.split('\n');
const insertIndex = lines.findIndex(line => line.includes(`describe('DELETE /tracker/:id', () => {`));

lines.splice(insertIndex, 0, newTest);

fs.writeFileSync(file, lines.join('\n'));
