import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';

// We provide a dummy Prisma client just for schema generation
// This avoids needing the actual generated client during db:generate
const dummyPrisma = {} as any;

export const auth = betterAuth({
  database: prismaAdapter(dummyPrisma, {
    provider: 'sqlite',
  }),
  plugins: [organization()],
});
