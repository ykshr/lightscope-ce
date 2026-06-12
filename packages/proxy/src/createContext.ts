import JwtAuth from '@/helpers/auth/jwtAuth';
import ClickHouseEgress from '@/helpers/egress/clickhouse';
import MaxmindGeo from '@/helpers/geo/maxmind';
import { $ } from '@/types';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AlgorithmTypes } from 'hono/jwt';

export default async function createContext(c: Context): Promise<$> {
  const { JWT_SECRET, JWT_ALGORITHM = AlgorithmTypes.HS256 } = env(c);
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment.');
  }
  const auth = new JwtAuth(JWT_SECRET, JWT_ALGORITHM);

  const {
    CLICKHOUSE_URL,
    CLICKHOUSE_USERNAME,
    CLICKHOUSE_PASSWORD,
    CLICKHOUSE_DB,
    CLICKHOUSE_INSERT_BATCH_SIZE,
    CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
    CLICKHOUSE_INSERT_MAX_TRY,
  } = env(c);
  const egress = new ClickHouseEgress({
    clickhouseDb: CLICKHOUSE_DB,
    clickhouseUrl: CLICKHOUSE_URL,
    clickhouseUsername: CLICKHOUSE_USERNAME,
    clickhousePassword: CLICKHOUSE_PASSWORD,
    insertBatchSize: CLICKHOUSE_INSERT_BATCH_SIZE,
    insertFlushIntervalMs: CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
    insertMaxTry: CLICKHOUSE_INSERT_MAX_TRY,
  });

  const { MAXMIND_DB_PATH } = env(c);
  const geo = new MaxmindGeo(MAXMIND_DB_PATH);
  await geo.init();

  return {
    auth,
    egress,
    geo,
  };
}
