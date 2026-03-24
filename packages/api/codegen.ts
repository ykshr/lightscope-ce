import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/schema/**/*.graphql',
  generates: {
    'generated/graphql/resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
    'generated/graphql/typeDefs.ts': {
      plugins: [
        {
          add: {
            content: 'export default `',
          },
        },
        'schema-ast',
        {
          add: {
            placement: 'append',
            content: '`;',
          },
        },
      ],
    },
  },
  config: {
    scalars: {
      DateTime: 'string',
    },
    contextType: '@/types#Context',
  },
};

export default config;
