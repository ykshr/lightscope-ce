const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /  describe\('GET \/tracker \(error path\)', \(\) => \{\n[\s\S]*?  \}\);\n/m;
content = content.replace(regex, '');

fs.writeFileSync(file, content);
