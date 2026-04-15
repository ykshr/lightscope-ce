const fs = require('fs');

let content = fs.readFileSync('packages/api/integration/api.integration.test.ts', 'utf8');

// I will output the json.errors directly with JSON.stringify instead of console.error to see full details
content = content.replace(
  'if (json.errors) console.error(json.errors);',
  "if (json.errors) console.log('RANK ERRORS: ' + JSON.stringify(json.errors, null, 2));"
);
content = content.replace(
  'if (json.errors) console.error(json.errors);',
  "if (json.errors) console.log('TREND ERRORS: ' + JSON.stringify(json.errors, null, 2));"
);

fs.writeFileSync('packages/api/integration/api.integration.test.ts', content);
