const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'packages/e2e/scenarios');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // First, let's just do a clean replace to avoid regex issues.
    content = content.replace("const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';", "const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';");
    content = content.replace("const API_URL = 'http://127.0.0.1:3000';", "const API_URL = 'http://127.0.0.1:3001';");
    content = content.replace("const INSERT_URL = process.env.INSERT_URL || 'http://127.0.0.1:3000';", "const INSERT_URL = process.env.INSERT_URL || 'http://127.0.0.1:3001';");
    content = content.replace("const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:5173';", "const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000';");
    content = content.replace("'http://127.0.0.1:5173/long-run-page'", "'http://127.0.0.1:3000/long-run-page'");
    content = content.replace("'http://127.0.0.1:5173/load-test'", "'http://127.0.0.1:3000/load-test'");
    content = content.replace("'http://127.0.0.1:5173/test-page'", "'http://127.0.0.1:3000/test-page'");

    fs.writeFileSync(filePath, content);
  }
}
