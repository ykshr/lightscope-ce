import DataLoader from 'dataloader';
import { AnalyticsBase } from '@/__generated__/graphql-resolvers';
import { Aggregation, AggregationUnit, Metric } from '@/__generated__/graphql-resolvers';
import { RequestAttribute } from '@/resolvers/helpers/processAttributes';
import query, { formatToDateTime } from '@/helpers/clickhouse';
import {
  getAggregationUnit,
  getTableUnitWithDates,
} from '@/loaders/helpers/getCollectionUnitWithDates';
import type { Context } from '@/types';

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
  ctx: Context,
  loaderParams: LoaderParams
): DataLoader<string, T[] | null> {
  if (!ctx.loaders.has('articleAnalyticsLoader')) {
    ctx.loaders.set('articleAnalyticsLoader', new Map());
  }

  const loaders = ctx.loaders.get('articleAnalyticsLoader');
  const loaderKey = createLoaderKey(ctx, loaderParams);
  if (loaders.has(loaderKey)) {
    return loaders.get(loaderKey) as DataLoader<string, T[] | null>;
  }

  const loader = new DataLoader<string, T[] | null>(
    async (urls: readonly string[]) => {
      const analytics = await fetchArticleAnalyticsByUrls<T>(ctx.user.tenantId, loaderParams, urls);

      const analyticsMap = new Map<string, T[]>();
      for (const a of analytics) {
        analyticsMap.set(
          a.url,
          analytics.filter((aa) => a.url === aa.url)
        );
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

function createLoaderKey(ctx: Context, params: LoaderParams): string {
  return JSON.stringify({
    tenantId: ctx.user.tenantId,
    tableName: params.tableName,
    queryParams: {
      startDate: params.queryParams.startDate,
      endDate: params.queryParams.endDate,
      aggregation: params.queryParams.aggregation,
      limit: params.queryParams.limit,
      page: params.queryParams.page,
      siteName: params.queryParams.siteName,
      metric: params.queryParams.metric,
    },
    attributes: params.attributes,
  });
}

async function fetchArticleAnalyticsByUrls<T extends AnalyticsBase>(
  tenantId: string,
  { tableName, queryParams, attributes }: LoaderParams,
  urls: readonly string[]
): Promise<(T & { url: string })[]> {
  if (urls.length === 0) return [];

  const { siteName, aggregation, startDate: s, endDate: e, metric, limit, page } = queryParams;
  const startDate = new Date(s);
  const endDate = new Date(e);

  const { unit, interval } = getAggregationUnit(startDate, endDate, aggregation);
  const units = getTableUnitWithDates(startDate, endDate, unit);

  const dateStr = (() => {
    if (unit === AggregationUnit.Total) return "'total' as date,";
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

  const urlHashStr = urls.map((url) => `cityHash64('${url}')`).join(', ');

  const sql = `
    SELECT
      ${dateStr}
      ${aggStr}
      any(url) as url,
      uniqCombined64Merge(${metric.toLowerCase()}) as value
    FROM (${units
      .map(
        ({ unit, startDate: unitStartDate, endDate: unitEndDate }) => `
        SELECT
          *
        FROM
          lightscope.${tableName}_${unit}
        WHERE
          tenant_id = ${tenantId}
          AND site_name = '${siteName}'
          AND url_hash IN (${urlHashStr})
          AND (
            toDateTime('${formatToDateTime(unitStartDate)}') <= date
            AND date < toDateTime('${formatToDateTime(unitEndDate)}')
          )
      `
      )
      .join(' UNION ALL ')})
    ${groupStr}
    ${orderStr}
    ${limitAndOffset}
  `;

  const data = await query<any>(sql);
  return data.map((row: any) => ({
    ...row,
    ...(row.date && row.date !== 'total' ? { date: row.date.replace(' ', 'T') + 'Z' } : {}),
  })) as (T & { url: string })[];
}
