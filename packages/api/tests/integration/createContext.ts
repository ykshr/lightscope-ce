import { PrismaClient } from '@/__generated__/prisma/client';
import processAllowedOriginsString from '@/helpers/allowedOrigins';
import { $ } from '@/types';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization, testUtils } from 'better-auth/plugins';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AlgorithmTypes } from 'hono/jwt';
import { vi } from 'vitest';

export const mockClickhouseQuery = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue([
    {
      index: 1,
      date: '2023-01-01 12:00:00',
      value: 10,
      total: 10,
      url: 'https://example.com/mock-1',
      title: 'Mocked Title',
      site_name: 'Mocked Site',
      source: 'google',
      medium: 'organic',
      campaign: 'test',
    },
  ]),
});

export const mockSendResetPassword = vi.fn();

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
      sendResetPassword: mockSendResetPassword,
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

  const clickhouse = {
    query: mockClickhouseQuery,
  };

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
    clickhouse: clickhouse as any,
    prisma,
    jwt,
  };
}
