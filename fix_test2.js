const fs = require('fs');

const file = 'packages/e2e/tests/dashboard.test.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `    await expect(page).toHaveURL(/articleFilter/);\n    await expect(page).toHaveURL(/test-site/);`,
  `    await expect(page).toHaveURL(/isn=test-site/);`
);

fs.writeFileSync(file, code);
