import { PrismaClient } from '@/__generated__/prisma/client';
import Auth from '@/helpers/auth';
import { ClickHouseClient } from '@clickhouse/client';
import type { Context as HonoContext } from 'hono';
import { AlgorithmTypes } from 'hono/jwt';

type User = {
  id: string;
  role: string;
};

type Organization = {
  id: string;
};

export type Bindings = {
  DATABASE_URL: string;
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
  JWT_SECRET: string;
  JWT_ALGORITHM: AlgorithmTypes;
};

export type $ = {
  auth: typeof Auth;
  clickhouse: ClickHouseClient;
  loaders: Map<string, any>;
  prisma: PrismaClient;
  jwt: {
    secret: string;
    algorithm: AlgorithmTypes;
  };
};

export type Variables = { user: User; organization: Organization; $: $ };

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;
