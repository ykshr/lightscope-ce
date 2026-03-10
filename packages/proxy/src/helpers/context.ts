import dotenv from 'dotenv';
import fs from 'fs';
import maxmind, { type CityResponse } from 'maxmind';
import { createClient } from '@clickhouse/client';

dotenv.config();

// --------------------
// Geo provider
// --------------------
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
const CLICKHOUSE_INSERT_BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000;
const CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS =
  Number(process.env.CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS) || 200;
const CLICKHOUSE_INSERT_MAX_TRY = Number(process.env.INSERT_MAX_TRY) || 3;
const clickhouseClient = createClient({
  url: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});

const clickhouse = {
  clickhouseClient,
  CLICKHOUSE_INSERT_BATCH_SIZE,
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
  CLICKHOUSE_INSERT_MAX_TRY,
};

export { clickhouse };
