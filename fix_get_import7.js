const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("await import('@/loaders/tracker')", "await import('@/rest/loaders/tracker')");
fs.writeFileSync(file, content);
