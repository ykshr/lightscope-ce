import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../api/src/__generated__/graphql/typeDefs.ts',
  documents: 'src/**/*.graphql',
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: {
        enumsAsConst: true,
        reactQueryVersion: 5,
        fetcher: {
          func: '@/helpers/fetch#queryFetch',
          isReactHook: true,
        },
      },
    },
  },
};

export default config;
