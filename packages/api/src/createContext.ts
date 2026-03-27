import BetterAuth from '@/helpers/auth/betterAuth';
import { $ } from '@/types';
import { createClient as createClickHouseClient } from '@clickhouse/client';
import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AlgorithmTypes } from 'hono/jwt';

export default async function createContext(c: Context): Promise<$> {
  const prisma = new PrismaClient();
  const auth = new BetterAuth({
    database: prismaAdapter(prisma, {
      provider: 'sqlite',
    }),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const userData = user as any;
            const userCountInTenant = await prisma.user.count({
              where: {
                tenantId: userData.tenantId,
              },
            });

            if (userCountInTenant === 0) {
              return {
                data: {
                  ...userData,
                  role: 'admin',
                },
              };
            }

            return { data: userData };
          },
        },
      },
    },
  });

  const { CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);
  const clickhouse = createClickHouseClient({
    url: CLICKHOUSE_URL,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  });

  const loaders = new Map();

  const { JWT_SECRET, JWT_ALGORITHM } = env(c);

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment.');
  }

  const jwt = {
    secret: JWT_SECRET,
    algorithm: JWT_ALGORITHM || AlgorithmTypes.HS256,
  };

  return {
    auth,
    clickhouse,
    loaders,
    prisma,
    jwt,
  };
}
