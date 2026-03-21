import type { AuthProvider, User } from '@/helpers/auth';
import type { Loaders } from '@/middlewares/loaders';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaClient } from '@prisma/client';
import type { Context as HonoContext } from 'hono';

export type Bindings = {
  NO_AUTH_TOKEN: string;
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
};

export type $ = {
  auth: AuthProvider;
  clickhouse: ClickHouseClient;
  loaders: Loaders;
  prisma: PrismaClient;
};

export type Variables = { user: User; $: $ };

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;
