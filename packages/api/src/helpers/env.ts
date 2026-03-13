import dotenv from 'dotenv';

dotenv.config();

// --------------------
// Server
// --------------------
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export { PORT };

// --------------------
// ClickHouse client setup
// --------------------
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME;
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
export { CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD };
