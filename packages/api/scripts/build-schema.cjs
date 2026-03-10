const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '../src/graphql/schema');
const typeDir = path.join(schemaDir, 'type');

const getFiles = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.graphql'))
    .map((f) => path.join(dir, f));

const files = [...getFiles(schemaDir), ...getFiles(typeDir)];

const schemaStr = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

const outPath = path.join(__dirname, '../src/graphql/schema/schema.ts');
fs.writeFileSync(outPath, `export default ${JSON.stringify(schemaStr)};\n`);
console.log('Schema built to ' + outPath);
