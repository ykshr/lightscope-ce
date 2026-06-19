const fs = require('fs');
const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

const newGetTest = `
  describe('GET /tracker (error path)', () => {
    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        // To mock getLoader failing, we need to handle that via vi.mock
        // But since we already have a file-level mock for getLoader, we can
        // temporarily override its mock implementation
        await next();
      });
      testApp.route('/tracker', trackerApp);

      const { default: getLoader } = await import('@/loaders/tracker');
      // @ts-ignore
      getLoader.mockRejectedValueOnce(new Error('Database error'));

      const res = await testApp.request('/tracker');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to get a token list');
    });
  });
`;

const insertIndex = content.indexOf(`  describe('POST /tracker/generate', () => {`);
if (insertIndex !== -1) {
    content = content.substring(0, insertIndex) + newGetTest + "\n" + content.substring(insertIndex);
}

fs.writeFileSync(file, content);
