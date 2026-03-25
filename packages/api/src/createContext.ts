import { PrismaClient } from '@/__generated__/prisma/client';
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
  const adapter = new PrismaLibSql({
    url: 'file:./prisma/dev.db',
  });
  const prisma = new PrismaClient({ adapter });
  const betterAuth = createBetterAuth({
    emailAndPassword: {
      enabled: true,
    },
    database: prismaAdapter(prisma, {
      provider: 'sqlite',
    }),
    plugins: [organization()],
  });

  const { CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);
  const clickhouse = createClickHouseClient({
    url: CLICKHOUSE_URL,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  });

  const loaders = new Map();

  const { JWT_SECRET, JWT_ALGORITHM } = env(c);
  const jwt = {
    secret: JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod',
    algorithm: JWT_ALGORITHM || AlgorithmTypes.HS256,
  };

  return {
    betterAuth,
    clickhouse,
    loaders,
    prisma,
    jwt,
  };
}
