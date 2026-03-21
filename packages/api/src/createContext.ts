import BetterAuth from '@/helpers/auth/betterAuth';
import { $ } from '@/types';
import { createClient as createClickHouseClient } from '@clickhouse/client';
import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Context } from 'hono';
import { env } from 'hono/adapter';

export default async function createContext(c: Context): Promise<$> {
  const { CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);

  const prisma = new PrismaClient();
  const auth = new BetterAuth({
    database: prismaAdapter(prisma, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
    },
  });

  const clickhouse = createClickHouseClient({
    url: CLICKHOUSE_URL,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  });

  const loaders = new Map();

  return {
    auth,
    clickhouse,
    loaders,
    prisma,
  };
}
