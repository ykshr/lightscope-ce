// This file is for
//   1) type definition on types/index.ts
//   2) better-auth cli (auth generate --config src/types/auth.ts --output prisma/schema/schema.prisma --yes)
import { PrismaClient } from '@/__generated__/prisma/client';
import processAllowedOriginsString from '@/helpers/allowedOrigins';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';

const trustedOrigins = processAllowedOriginsString(undefined);

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });

const auth = createBetterAuth({
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url }) => {
      console.log(`Reset password url: ${url}`);
    },
  },
  rateLimit: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [organization()],
});

export default auth;

export type Auth = typeof auth;
