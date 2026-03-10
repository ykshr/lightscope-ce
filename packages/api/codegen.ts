import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/graphql/schema/**/*.ts',
  generates: {
    'src/graphql/__generated__/graphql-resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  config: {
    scalars: {
      DateTime: 'string',
    },
    contextType: '../index#Context',
  },
};

export default config;
