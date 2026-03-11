import { createClient } from '@clickhouse/client';
import { clickhouse } from '@/helpers/context';

const { CLICKHOUSE_HOST, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD } = clickhouse;

const clickhouseClient = createClient({
  url: CLICKHOUSE_HOST,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
});

export default async function <T>(query: string, query_params: any = undefined): Promise<T[]> {
  const rows = await clickhouseClient.query({
    query,
    query_params,
    format: 'JSONEachRow',
  });
  const data = await rows.json<T>();

  return data;
}

export const formatToDateTime = (date: Date) =>
  date.toISOString().split('.')[0].replace('T', ' ').replace('Z', '');
