import { PrismaClient } from '@/__generated__/prisma/client';
import processAllowedOriginsString from '@/helpers/allowedOrigins';
import { $ } from '@/types';
import { createClient as createClickHouseClient } from '@clickhouse/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization, testUtils } from 'better-auth/plugins';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AlgorithmTypes } from 'hono/jwt';

export default async function createContext(c: Context): Promise<$> {
  const { DATABASE_URL, ALLOWED_ORIGINS } = env(c);
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment.');
  }

  const adapter = new PrismaLibSql({
    url: DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const trustedOrigins = processAllowedOriginsString(ALLOWED_ORIGINS);
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
    plugins: [organization(), testUtils()],
  });

  const { CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);
  const clickhouse = createClickHouseClient({
    url: CLICKHOUSE_URL,
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
    auth: auth as any,
    clickhouse,
    prisma,
    jwt,
  };
}
