import dotenv from 'dotenv';

dotenv.config();

// --------------------
// ClickHouse client setup
// --------------------
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
const clickhouse = {
  CLICKHOUSE_HOST,
  CLICKHOUSE_USERNAME,
  CLICKHOUSE_PASSWORD,
};

export { clickhouse };
