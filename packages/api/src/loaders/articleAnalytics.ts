import {
  Aggregation,
  AggregationUnit,
  AnalyticsBase,
  Metric,
} from '@/__generated__/graphql/resolvers';
import { RequestAttribute } from '@/graphql/resolvers/helpers/processAttributes';
import query, { formatToDateTime } from '@/loaders/helpers/clickhouse';
import {
  getAggregationUnitWithInterval,
  getTableUnitWithDates,
} from '@/loaders/helpers/getCollectionUnitWithDates';
import type { Context } from '@/types';
import { ClickHouseClient } from '@clickhouse/client';
import DataLoader from 'dataloader';

type QueryParams = {
  startDate: string;
  endDate: string;
  aggregation: Aggregation;
  limit: number;
  page: number;
  siteName: string;
  metric: Metric;
};

interface LoaderParams {
  tableName: string;
  queryParams: QueryParams;
  attributes: readonly RequestAttribute[];
}

export default function getLoader<T extends AnalyticsBase>(
  c: Context,
  loaderParams: LoaderParams
): DataLoader<string, T[] | null> {
  if (!c.var.$.loaders.has('articleAnalyticsLoader')) {
    c.var.$.loaders.set('articleAnalyticsLoader', new Map());
  }

  const loaders = c.var.$.loaders.get('articleAnalyticsLoader');
  const loaderKey = createLoaderKey(c, loaderParams);
  if (loaders.has(loaderKey)) {
    return loaders.get(loaderKey) as DataLoader<string, T[] | null>;
  }

  const loader = new DataLoader<string, T[] | null>(
    async (urls: readonly string[]) => {
      const analytics = await fetchArticleAnalyticsByUrls<T>(
        c.var.$.clickhouse,
        c.var.organization.id,
        loaderParams,
        urls
      );

      const analyticsMap = new Map<string, T[]>();
      for (const a of analytics) {
        const existing = analyticsMap.get(a.url);
        if (existing) {
          existing.push(a);
        } else {
          analyticsMap.set(a.url, [a]);
        }
      }

      return urls.map((url) => analyticsMap.get(url) ?? null);
    },
    {
      cacheKeyFn: (key) => key,
    }
  );
  loaders.set(loaderKey, loader);

  return loader;
}

function createLoaderKey(c: Context, params: LoaderParams): string {
  const q = params.queryParams;
  const attributes = params.attributes?.join(',') ?? '';
  return `${c.var.organization.id}:${params.tableName}:${q.startDate}:${q.endDate}:${q.aggregation}:${q.limit}:${q.page}:${q.siteName}:${q.metric}:${attributes}`;
}

async function fetchArticleAnalyticsByUrls<T extends AnalyticsBase>(
  client: ClickHouseClient,
  organizationId: string,
  { tableName, queryParams, attributes }: LoaderParams,
  urls: readonly string[]
): Promise<(T & { url: string })[]> {
  if (urls.length === 0) return [];

  const { siteName, aggregation, startDate: s, endDate: e, metric, limit, page } = queryParams;
  const startDate = new Date(s);
  const endDate = new Date(e);

  const { unit, interval } = getAggregationUnitWithInterval(startDate, endDate, aggregation);
  const units = getTableUnitWithDates(startDate, endDate, unit);

  const dateStr = (() => {
    if (unit === AggregationUnit.Total) return 'now() as date,';
    return `toStartOfInterval(date, INTERVAL ${interval} ${unit.toUpperCase()}) as date,`;
  })();

  const aggStr =
    attributes.length === 0
      ? ''
      : `${attributes
          .map((attr) => {
            if (attr === 'domain') return 'any(domain) as domain';
            if (attr === 'referrer') return 'any(referrer) as referrer';
            return attr;
          })
          .join(', ')},`;

  const metricStr =
    metric === Metric.EngagementTime
      ? `sum(${metric.toLowerCase()})`
      : `uniqCombined64Merge(${metric.toLowerCase()})`;

  const groupStr = attributes.length
    ? `GROUP BY date, url_hash, ${attributes
        .map((attr) => {
          if (attr === 'domain') return 'domain_hash';
          if (attr === 'referrer') return 'referrer_hash';
          return attr;
        })
        .join(', ')}`
    : 'GROUP BY date, url_hash';

  const orderStr = attributes.length
    ? `ORDER BY date ASC, url, ${attributes
        .map((attr) => {
          if (attr === 'domain') return 'domain_hash';
          if (attr === 'referrer') return 'referrer_hash';
          return attr;
        })
        .join(', ')}`
    : `ORDER BY date ASC, url`;

  const limitToUse = limit ?? 100;
  const pageToUse = page ?? 1;
  const limitAndOffset = `LIMIT ${limitToUse} OFFSET ${(pageToUse - 1) * limitToUse}`;

  const queryParamsObj: Record<string, unknown> = {
    organizationId,
    siteName,
    urls,
  };

  const sql = `
    SELECT
      ${dateStr}
      ${aggStr}
      any(url) as url,
      ${metricStr} as value
    FROM (${units
      .map(({ unit, startDate: unitStartDate, endDate: unitEndDate }, index) => {
        const startParam = `unitStartDate_${index}`;
        const endParam = `unitEndDate_${index}`;
        queryParamsObj[startParam] = formatToDateTime(unitStartDate);
        queryParamsObj[endParam] = formatToDateTime(unitEndDate);

        return `
        SELECT
          *
        FROM
          lightscope.${tableName}_${unit}
        WHERE
          organization_id_hash = cityHash64({organizationId:String})
          AND site_name = {siteName:String}
          AND url_hash IN (arrayMap(x -> cityHash64(x), {urls:Array(String)}))
          AND (
            toDateTime({${startParam}:String}) <= date
            AND date < toDateTime({${endParam}:String})
          )
      `;
      })
      .join(' UNION ALL ')})
    ${groupStr}
    ${orderStr}
    ${limitAndOffset}
  `;

  const data = await query<any>(client, sql, queryParamsObj);
  return data.map((row: any) => ({
    ...row,
    date: row.date.replace(' ', 'T') + 'Z',
  })) as (T & { url: string })[];
}
