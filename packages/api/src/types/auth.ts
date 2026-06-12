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
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`Password reset requested for user: ${user.email}`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // TODO: Send verification email to the user with the provided URL
    },
  },
  rateLimit: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const uuid = crypto.randomUUID();
          await auth.api.createOrganization({
            body: {
              name: 'Default',
              slug: uuid,
              userId: user.id,
            },
          });
        },
      },
    },
  },
  plugins: [organization()],
  socialProviders: {
    google: {
      clientId: '',
      clientSecret: '',
    },
    microsoft: {
      clientId: '',
      clientSecret: '',
    },
    apple: {
      clientId: '',
      clientSecret: '',
      appBundleIdentifier: '',
    },
  },
});

export default auth;

export type Auth = typeof auth;
