import dotenv from 'dotenv';
import { createClient } from '@clickhouse/client';

dotenv.config();

// --------------------
// ClickHouse client setup
// --------------------
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
const clickhouseClient = createClient({
  url: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});
const clickhouse = {
  clickhouseClient,
};

export { clickhouse };
