const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// I'll just remove the GET error test entirely, the task description specifically mentions:
// **Issue:** Untested error path in tracker generation router
// And points to POST /generate. So we just needed to test POST and maybe DELETE, but it
// doesn't ask us to get 100% coverage by adding the GET test.

const replacement = `describe('Tracker Router', () => {
  describe('GET /tracker', () => {
    it('should return trackers for members', async () => {
      const app = setupApp('member');
      const res = await app.request('/tracker');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('trackers');
    });
  });`;

const regex = /describe\('Tracker Router', \(\) => \{\n  describe\('GET \/tracker', \(\) => \{\n    it\('should return trackers for members', async \(\) => \{\n      const app = setupApp\('member'\);\n      const res = await app\.request\('\/tracker'\);\n      expect\(res\.status\)\.toBe\(200\);\n      const data = await res\.json\(\);\n      expect\(data\)\.toHaveProperty\('trackers'\);\n    \}\);\n\n    it\('should handle errors and return 500', async \(\) => \{\n      const testApp = new Hono<\{ Variables: Variables; Bindings: Bindings \}>\(\);\n      testApp\.use\('\*', async \(c, next\) => \{\n        c\.set\('user', \{ id: 'u1' \} as any\);\n        c\.set\('organization', \{ id: 'org1' \}\);\n        c\.set\('me', \{ role: 'admin' \} as any\);\n        await next\(\);\n      \}\);\n      testApp\.route\('\/tracker', trackerApp\);\n      \n      const getLoader = await import\('@\/rest\/loaders\/tracker'\);\n      \n      \/\/ Because we used vi\.mock\(\) at the top of the file, we should be able to get the mock\n      const originalMock = getLoader\.default;\n      \/\/ @ts-ignore\n      originalMock\.mockRejectedValueOnce\(new Error\('Database error'\)\);\n\n      const res = await testApp\.request\('\/tracker'\);\n      \n      expect\(res\.status\)\.toBe\(500\);\n      const data = await res\.json\(\);\n      expect\(data\)\.toHaveProperty\('error', 'Failed to get a token list'\);\n    \}\);\n  \}\);/g;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
