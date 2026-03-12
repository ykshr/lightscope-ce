import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/schema/**/*.ts',
  generates: {
    'src/__generated__/graphql-resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
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
