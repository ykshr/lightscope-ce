import type { AuthProvider, User } from '@/helpers/auth';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaClient } from '@prisma/client';
import type { Context as HonoContext } from 'hono';
import { AlgorithmTypes } from 'hono/jwt';

export type Bindings = {
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
  JWT_SECRET: string;
  JWT_ALGORITHM: AlgorithmTypes;
};

export type $ = {
  auth: AuthProvider;
  clickhouse: ClickHouseClient;
  loaders: Map<string, any>;
  prisma: PrismaClient;
  jwt: {
    secret: string;
    algorithm: AlgorithmTypes;
  };
};

export type Variables = { user: User; $: $ };

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;
