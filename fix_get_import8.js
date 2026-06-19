const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `describe('Tracker Router', () => {
  describe('GET /tracker', () => {
    it('should return trackers for members', async () => {
      const app = setupApp('member');
      const res = await app.request('/tracker');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('trackers');
    });

    it('should handle errors and return 500', async () => {
      const testApp = new Hono<{ Variables: Variables; Bindings: Bindings }>();
      testApp.use('*', async (c, next) => {
        c.set('user', { id: 'u1' } as any);
        c.set('organization', { id: 'org1' });
        c.set('me', { role: 'admin' } as any);
        await next();
      });
      testApp.route('/tracker', trackerApp);

      const getLoader = await import('@/rest/loaders/tracker');
      // @ts-ignore
      getLoader.default.mockRejectedValueOnce(new Error('Database error'));

      const res = await testApp.request('/tracker');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty('error', 'Failed to get a token list');
    });
  });`;

const regex = /describe\('Tracker Router', \(\) => \{\n  describe\('GET \/tracker', \(\) => \{\n    it\('should return trackers for members', async \(\) => \{\n      const app = setupApp\('member'\);\n      const res = await app\.request\('\/tracker'\);\n      expect\(res\.status\)\.toBe\(200\);\n      const data = await res\.json\(\);\n      expect\(data\)\.toHaveProperty\('trackers'\);\n    \}\);\n\n    it\('should handle errors and return 500', async \(\) => \{\n      const testApp = new Hono<\{ Variables: Variables; Bindings: Bindings \}>\(\);\n      testApp\.use\('\*', async \(c, next\) => \{\n        c\.set\('user', \{ id: 'u1' \} as any\);\n        c\.set\('organization', \{ id: 'org1' \}\);\n        c\.set\('me', \{ role: 'admin' \} as any\);\n        await next\(\);\n      \}\);\n      testApp\.route\('\/tracker', trackerApp\);\n      \n      const \{ default: getLoader \} = await import\('@\/rest\/loaders\/tracker'\);\n      \/\/ Use standard vitest mock override since vi.mocked didn't work for default export\n      \/\/ @ts-ignore\n      getLoader\.mockRejectedValueOnce\(new Error\('Database error'\)\);\n\n      const res = await testApp\.request\('\/tracker'\);\n      \n      expect\(res\.status\)\.toBe\(500\);\n      const data = await res\.json\(\);\n      expect\(data\)\.toHaveProperty\('error', 'Failed to get a token list'\);\n    \}\);\n  \}\);/g;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
