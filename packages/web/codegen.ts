import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // schema: "http://localhost:3000/gql",
  schema: '../api/src/schema/**/*.ts',
  documents: 'src/**/*.graphql',
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: {
        enumsAsConst: true,
        reactQueryVersion: 5,
        fetcher: {
          func: '@/hooks/useFetchData#useFetchData',
          isReactHook: true,
        },
      },
    },
  },
};

export default config;
