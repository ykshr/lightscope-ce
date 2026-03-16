import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/__generated__/graphql-resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
    'src/__generated__/schema.generated.graphql': {
      plugins: ['schema-ast'],
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
