import { PrismaClient } from '@/__generated__/prisma/client';
import processAllowedOriginsString from '@/helpers/allowedOrigins';
import { generateAppleClientSecret } from '@/helpers/apple';
import { $ } from '@/types';
import { createClient as createClickHouseClient } from '@clickhouse/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AlgorithmTypes } from 'hono/jwt';

export default async function createContext(c: Context): Promise<$> {
  const { DATABASE_URL } = env(c);
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment.');
  }

  const adapter = new PrismaLibSql({
    url: DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    APPLE_CLIENT_ID,
    APPLE_TEAM_ID,
    APPLE_KEY_ID,
    APPLE_PRIVATE_KEY,
    APPLE_APP_BUNDLE_IDENTIFIER,
  } = env(c);

  const { API_ALLOWED_ORIGINS } = env(c);
  const trustedOrigins = processAllowedOriginsString(API_ALLOWED_ORIGINS);
  const auth = createBetterAuth({
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ url }) => {
        // TODO: Send reset password email to the user with the provided URL
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
        clientId: GOOGLE_CLIENT_ID || 'dummy',
        clientSecret: GOOGLE_CLIENT_SECRET || 'dummy',
      },
      microsoft: {
        clientId: MICROSOFT_CLIENT_ID || 'dummy',
        clientSecret: MICROSOFT_CLIENT_SECRET || 'dummy',
      },
      apple: {
        clientId: APPLE_CLIENT_ID || 'dummy',
        clientSecret:
          (await generateAppleClientSecret(
            APPLE_CLIENT_ID,
            APPLE_TEAM_ID,
            APPLE_KEY_ID,
            APPLE_PRIVATE_KEY
          )) || 'dummy',
        appBundleIdentifier: APPLE_APP_BUNDLE_IDENTIFIER,
      },
    },
  });

  const { CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD, CLICKHOUSE_DB } = env(c);
  const clickhouse = createClickHouseClient({
    url: CLICKHOUSE_URL,
    database: CLICKHOUSE_DB,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  });

  const { JWT_SECRET, JWT_ALGORITHM = AlgorithmTypes.HS256 } = env(c);
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment.');
  }

  const jwt = {
    secret: JWT_SECRET,
    algorithm: JWT_ALGORITHM,
  };

  return {
    auth,
    clickhouse,
    prisma,
    jwt,
  };
}
