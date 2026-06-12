import { renameKeySnakeToCamel } from '@/graphql/loaders/helpers/rename';
import { ClickHouseClient } from '@clickhouse/client';

export default async function <T>(
  client: ClickHouseClient,
  query: string,
  query_params: any = undefined
): Promise<T[]> {
  try {
    // console.debug('loaders/helpers/clickhouse.ts', query, query_params);
    const rows = await client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    });
    const data = await rows.json<T>();
    return data;
  } catch (error) {
    console.error('CLICKHOUSE ERROR:', error);
    throw error;
  }
}

/**
 * Converts ClickHouse Date/DateTime strings to Node.js ISO 8601 format.
 * ClickHouse format: "2024-01-01 12:00:00" or "2024-01-01"
 */
export const formatData = <T>(data: T[], dateKeys: string[] = []): T[] => {
  if (dateKeys.length === 0) {
    return data.map((row) => renameKeySnakeToCamel(row));
  }

  return data.map((row) => {
    const formattedRow = renameKeySnakeToCamel(row);
    for (let i = 0; i < dateKeys.length; i++) {
      const dateKey = dateKeys[i];
      const val = formattedRow[dateKey];
      if (val && typeof val === 'string') {
        formattedRow[dateKey] = val.replace(' ', 'T') + 'Z';
      }
    }
    return formattedRow;
  });
};

/**
 * Converts Node.js Date object to ClickHouse DateTime string format.
 * Output: "2024-01-01 12:00:00"
 */
export const formatToDateTime = (date: Date): string =>
  date.toISOString().split('.')[0].replace('T', ' ');
