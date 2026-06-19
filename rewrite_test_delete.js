const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

const newTest = `
    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        const mockPrisma = {
          tracker: {
            deleteMany: vi.fn().mockRejectedValue(new Error('Database error')),
          }
        };
        c.set('$', {
          prisma: mockPrisma
        } as unknown as $);
        await next();
      });
      testApp.route('/tracker', trackerApp);

      const res = await testApp.request('/tracker/1', { method: 'DELETE' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to delete tracker');
    });
`;

const lines = content.split('\n');
const insertIndex = lines.findIndex(line => line.includes(`});\n});`));

// Actually, we'll just append it before the final "});" lines.
// Find the last index of `});` and insert before it
content = content.replace(/  \}\);\n\}\);\n$/g, `  });${newTest}});`);
fs.writeFileSync(file, content);
