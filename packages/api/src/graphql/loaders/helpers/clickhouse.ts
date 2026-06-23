import { renameKeySnakeToCamel, snakeToCamel } from '@/graphql/loaders/helpers/rename';
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

  // Combine snake_case to camelCase renaming and date string formatting into a single pass over the dataset
  const dateKeysSet = new Set(dateKeys);

  return data.map((row) => {
    if (row === null || typeof row !== 'object' || Array.isArray(row) || row instanceof Date) {
      return renameKeySnakeToCamel(row);
    }

    const formattedRow: any = {};
    for (const key of Object.keys(row)) {
      const camelKey = snakeToCamel(key);
      const val = (row as any)[key];

      if (dateKeysSet.has(camelKey) && val !== null && val !== undefined) {
        if (typeof val === 'string') {
          if (val === '0') {
            formattedRow[camelKey] = null;
          } else {
            const dateStr = val.includes('T') ? val : val.replace(' ', 'T') + 'Z';
            formattedRow[camelKey] = new Date(dateStr).getTime() === 0 ? null : dateStr;
          }
        } else if (typeof val === 'number') {
          formattedRow[camelKey] = val === 0 ? null : new Date(val).toISOString();
        } else if (val instanceof Date) {
          formattedRow[camelKey] = val.getTime() === 0 ? null : val;
        } else {
          formattedRow[camelKey] = renameKeySnakeToCamel(val);
        }
      } else {
        formattedRow[camelKey] = renameKeySnakeToCamel(val);
      }
    }
    return formattedRow;
  }) as T[];
};

/**
 * Converts Node.js Date object to ClickHouse DateTime string format.
 * Output: "2024-01-01 12:00:00"
 */
export const formatToDateTime = (date: Date): string =>
  date.toISOString().split('.')[0].replace('T', ' ');
