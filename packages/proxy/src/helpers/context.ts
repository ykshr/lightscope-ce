import dotenv from 'dotenv';

dotenv.config();

// --------------------
// MAXMIND (geo)
// --------------------
const MAXMIND_DB_PATH = process.env.MAXMIND_DB_PATH || 'data/GeoLite2-City.mmdb';
const geo = { MAXMIND_DB_PATH };

export { geo };

// --------------------
// ClickHouse
// --------------------
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
const CLICKHOUSE_INSERT_BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000;
const CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS =
  Number(process.env.CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS) || 200;
const CLICKHOUSE_INSERT_MAX_TRY = Number(process.env.INSERT_MAX_TRY) || 3;

const clickhouse = {
  CLICKHOUSE_HOST,
  CLICKHOUSE_USERNAME,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_INSERT_BATCH_SIZE,
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
  CLICKHOUSE_INSERT_MAX_TRY,
};

export { clickhouse };
