const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// Use vi.mocked
content = content.replace(
  "      const { default: getLoader } = await import('@/rest/loaders/tracker');\n      // @ts-ignore\n      getLoader.mockRejectedValueOnce(new Error('Database error'));",
  "      const { default: getLoader } = await import('@/rest/loaders/tracker');\n      vi.mocked(getLoader).mockRejectedValueOnce(new Error('Database error'));"
);
fs.writeFileSync(file, content);
