const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// I need to insert these inside the `POST /tracker/generate` block

const missingTests = `
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
          expiresAt: new Date().toISOString()
        }),
      });
      expect(res.status).toBe(200);
    });
`;

// Also let's test GET error: line 20 in tracker.ts?
// No wait, trackerApp.get error is line 17.

const getErrorTest = `
    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        await next();
      });

      const { default: trackerApp } = await import('@/rest/routers/tracker');
      testApp.route('/tracker', trackerApp);

      // Let's mock getLoader locally just for this endpoint test
      const { default: getLoader } = await import('@/rest/loaders/tracker');

      // @ts-ignore
      if(getLoader.mockRejectedValueOnce) {
        // @ts-ignore
        getLoader.mockRejectedValueOnce(new Error('Database error'));
      }

      const res = await testApp.request('/tracker');
      // Wait we need vitest to intercept it, but let's try a different approach since this was flaky:
      // We will skip testing GET error if it's too hard to intercept, it's not the main issue
    });
`;

// Insert the missing POST tests before `describe('DELETE`
const insertIndex = content.indexOf(`  describe('DELETE /tracker/:id', () => {`);
if (insertIndex !== -1) {
    const beforeDescribeDelete = content.lastIndexOf(`  });`, insertIndex);
    if (beforeDescribeDelete !== -1) {
        content = content.substring(0, beforeDescribeDelete) + missingTests + content.substring(beforeDescribeDelete);
    }
}

fs.writeFileSync(file, content);
