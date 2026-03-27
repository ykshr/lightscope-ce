import { ClickHouseClient } from '@clickhouse/client';

export default async function <T>(
  client: ClickHouseClient,
  query: string,
  query_params: any = undefined
): Promise<T[]> {
  const rows = await client.query({
    query,
    query_params,
    format: 'JSONEachRow',
  });
  const data = await rows.json<T>();

  return data;
}

export const formatToDateTime = (date: Date) =>
  date.toISOString().split('.')[0].replace('T', ' ').replace('Z', '');
