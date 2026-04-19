import { ClickHouseClient } from '@clickhouse/client';

interface Options {
  dateFields?: string[];
}

export default async function <T>(
  client: ClickHouseClient,
  query: string,
  query_params: any = undefined,
  options: Options = {}
): Promise<T[]> {
  try {
    console.debug('loaders/helpers/clickhouse.ts', query, query_params);
    const rows = await client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    });

    // Cast to any[] to allow property mutation during formatting
    const data = (await rows.json<T>()) as any[];

    if (options.dateFields && data.length > 0) {
      data.forEach((row) => {
        options.dateFields!.forEach((dateField) => {
          if (row[dateField] !== undefined) {
            row[dateField] = formatFromDateTime(row[dateField]);
          }
        });
      });
    }

    return data as T[];
  } catch (error) {
    console.error('CLICKHOUSE ERROR:', error);
    throw error;
  }
}

/**
 * Converts ClickHouse Date/DateTime strings to Node.js ISO 8601 format.
 * ClickHouse format: "2024-01-01 12:00:00" or "2024-01-01"
 */
const formatFromDateTime = (dateVal: any): string | null => {
  if (!dateVal) return null;

  const d = new Date(dateVal);

  // Return original value if the date is invalid
  if (isNaN(d.getTime())) return dateVal;

  return d.toISOString(); // e.g., "2024-01-01T12:00:00.000Z"
};

/**
 * Converts Node.js Date object to ClickHouse DateTime string format.
 * Output: "2024-01-01 12:00:00"
 */
export const formatToDateTime = (date: Date): string =>
  date.toISOString().split('.')[0].replace('T', ' ');
