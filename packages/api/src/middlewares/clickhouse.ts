import { env } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';
import { createClient, ClickHouseClient } from '@clickhouse/client';

export type Clickhouse = ClickHouseClient;

let client: ClickHouseClient | null;
export default function createClickhouseMiddleware() {
  return createMiddleware(async (c, next) => {
    if (!client) {
      const { CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = env(c);
      client = createClient({
        host: CLICKHOUSE_HOST,
        username: CLICKHOUSE_USERNAME,
        password: CLICKHOUSE_PASSWORD,
      });
    }

    c.set('clickhouse', client);
    await next();
  });
}
