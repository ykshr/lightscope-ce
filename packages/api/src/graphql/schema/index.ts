import { readdir, readFile } from 'node:fs/promises';

const isGraphqlFile = (file: string) => file.endsWith('.graphql');

const readGraphqlDir = async (dir: URL) => {
  const files = await readdir(dir);
  return Promise.all(
    files.filter(isGraphqlFile).map((file) => readFile(new URL(file, dir), 'utf8'))
  );
};

const schemaDir = new URL('.', import.meta.url);
const typeDir = new URL('./type/', schemaDir);

const typeDefs = [...(await readGraphqlDir(schemaDir)), ...(await readGraphqlDir(typeDir))];

export default typeDefs;
