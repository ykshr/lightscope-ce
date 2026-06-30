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
    sendResetPassword: async ({ user: _user, url: _url, token: _token }, _request) => {
      // TODO: Send password reset email to the user with the provided URL
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user: _user, url: _url, token: _token }, _request) => {
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
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }),
    ...(process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET && {
        microsoft: {
          clientId: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        },
      }),
    ...(process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY &&
      process.env.APPLE_APP_BUNDLE_IDENTIFIER && {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET || '',
          appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
        },
      }),
  },
});

export default auth;

export type Auth = typeof auth;
