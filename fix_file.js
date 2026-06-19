const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// There's a typo from the regex replace I did earlier. Let's just fix it by hand:
content = content.replace("c.set('          prisma: mockPrisma", "c.set('$', {\n          prisma: mockPrisma");
fs.writeFileSync(file, content);
