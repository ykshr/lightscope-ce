import dotenv from 'dotenv';
import fs from 'fs';
import maxmind, { type CityResponse } from 'maxmind';
import { createClient } from '@clickhouse/client';

dotenv.config();

const MAXMIND_DB_PATH = process.env.MAXMIND_DB_PATH || 'data/GeoLite2-City.mmdb';
const dbExists = fs.existsSync(MAXMIND_DB_PATH);
const geo = dbExists ? await maxmind.open<CityResponse>(MAXMIND_DB_PATH) : null;
export { geo };

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
  host: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});
export const CLICKHOUSE_ARTICLE_TABLE_NAME = process.env.CLICKHOUSE_ARTICLE_TABLE_NAME || 'article';
export const CLICKHOUSE_PV_TABLE_NAME = process.env.CLICKHOUSE_PV_TABLE_NAME || 'pv_raw';
export const CLICKHOUSE_INSERT_BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000;
export const CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS =
  Number(process.env.CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS) || 200;
export const CLICKHOUSE_INSERT_MAX_TRY = Number(process.env.INSERT_MAX_TRY) || 3;
