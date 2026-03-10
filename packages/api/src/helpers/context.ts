import dotenv from 'dotenv';
import { createClient } from '@clickhouse/client';

dotenv.config();

// --------------------
// ClickHouse client setup
// --------------------
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
if (!CLICKHOUSE_HOST || !CLICKHOUSE_USERNAME || !CLICKHOUSE_PASSWORD) {
  // throw new Error(
  //   'CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, or CLICKHOUSE_PASSWORD is not defined in environment variables'
  // );
}
export const clickhouseClient = createClient({
  url: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});
