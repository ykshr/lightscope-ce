const fs = require('fs');
const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// Append two tests: one for POST /generate and one for DELETE /:id
const newGenerateTest = `
    it('should handle errors and return 500', async () => {
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

const newDeleteTest = `
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

// Insert the generate test at the end of the POST /tracker/generate block
// The block ends with:
//     });
//   });
//
//   describe('DELETE /tracker/:id', () => {
const insertIndexGenerate = content.indexOf(`  describe('DELETE /tracker/:id', () => {`);
if (insertIndexGenerate !== -1) {
    // Find the `  });` just before it
    const beforeDescribeDelete = content.lastIndexOf(`  });`, insertIndexGenerate);
    if (beforeDescribeDelete !== -1) {
        content = content.substring(0, beforeDescribeDelete) + newGenerateTest + content.substring(beforeDescribeDelete);
    }
}

// Append the delete test at the very end, before the last `});\n});`
const insertIndexDelete = content.lastIndexOf(`});\n});`);
if (insertIndexDelete !== -1) {
    content = content.substring(0, insertIndexDelete) + newDeleteTest + content.substring(insertIndexDelete);
}

fs.writeFileSync(file, content);
