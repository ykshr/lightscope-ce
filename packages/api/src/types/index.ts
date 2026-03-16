import type { Context as HonoContext } from 'hono';
import { ClickHouseClient } from '@clickhouse/client';
import type { User } from '@/middlewares/auth';
import type { Loaders } from '@/middlewares/loaders';

export type Bindings = {
  NO_AUTH_TOKEN: string;
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
};

export type Variables = { user: User; loaders: Loaders; clickhouse: ClickHouseClient };

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;
