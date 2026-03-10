import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Polyfill require and __dirname for tsx (ESM)
if (typeof require === 'undefined') {
  globalThis.require = createRequire(import.meta.url) as any;
}
const currentDir =
  typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));

function loadSchema(reqFn: () => any, path: string): string {
  try {
    return reqFn() as unknown as string;
  } catch (err: any) {
    const fs = require('node:fs');
    return fs.readFileSync(join(currentDir, path), 'utf8');
  }
}

const typeDefs = [
  loadSchema(() => require('./enum.graphql'), './enum.graphql'),
  loadSchema(() => require('./input.graphql'), './input.graphql'),
  loadSchema(() => require('./query.graphql'), './query.graphql'),
  loadSchema(() => require('./scalar.graphql'), './scalar.graphql'),
  loadSchema(() => require('./type/article.graphql'), './type/article.graphql'),
  loadSchema(() => require('./type/rank.graphql'), './type/rank.graphql'),
  loadSchema(() => require('./type/trend.graphql'), './type/trend.graphql'),
];

export default typeDefs;
