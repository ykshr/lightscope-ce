import { CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } from './env';
import { createClient } from '@clickhouse/client';

// --------------------
// ClickHouse client setup
// --------------------
if (!CLICKHOUSE_HOST || !CLICKHOUSE_USERNAME || !CLICKHOUSE_PASSWORD) {
  throw new Error(
    'CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, or CLICKHOUSE_PASSWORD is not defined in environment variables'
  );
}

export const clickhouseClient = createClient({
  url: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});
