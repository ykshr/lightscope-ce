import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // schema: "http://localhost:3000/gql",
  schema: '../api/src/graphql/schema/index.ts',
  documents: 'src/**/*.graphql',
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: {
        enumsAsConst: true,
        fetcher: '@/lib/fetcher#fetchData',
        exposeQueryKeys: true,
        // exposeFetcher: true,
        reactQueryVersion: 5,
        // useTypeImports: true,
      },
    },
  },
};

export default config;
