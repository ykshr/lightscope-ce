import {
  AggregationUnit,
  Metric,
  type QueryRankArgs,
  type RankAnalytics,
  type RankCategoryAgeArgs,
  type RankCategoryAppArgs,
  type RankCategoryDeviceArgs,
  type RankCategoryGenderArgs,
  type RankCategoryGeoArgs,
  type RankCategoryReferrerArgs,
  type RankCategoryUtmArgs,
} from '@/__generated__/resolvers';
import query, { formatToDateTime } from '@/helpers/clickhouse';
import processArticleFilter from '@/loaders/helpers/articleFilter';
import processCategoryFilter from '@/loaders/helpers/categoryFilter';
import { getTableUnitWithDates } from '@/loaders/helpers/getCollectionUnitWithDates';
import { RequestAttributesWithArticle } from '@/resolvers/helpers/processAttributes';
import type { Context } from '@/types';
import { ClickHouseClient } from '@clickhouse/client';

interface LoaderParams {
  tableName: string;
  queryParams: QueryRankArgs;
  attributes?: readonly RequestAttributesWithArticle[];
  categoryFilter?:
    | RankCategoryAgeArgs
    | RankCategoryAppArgs
    | RankCategoryDeviceArgs
    | RankCategoryGenderArgs
    | RankCategoryGeoArgs
    | RankCategoryReferrerArgs
    | RankCategoryUtmArgs;
}

export default function getLoader(c: Context, loaderParams: LoaderParams) {
  return {
    total: () => rank(c.var.$.clickhouse, c.var.user.tenantId, loaderParams),
    load: () => rank(c.var.$.clickhouse, c.var.user.tenantId, loaderParams),
  };
}

async function rank(client: ClickHouseClient, tenantId: number, loaderParams: LoaderParams) {
  const { tableName, queryParams, attributes, categoryFilter } = loaderParams;
  const { startDate: s, endDate: e, articleFilter, metric, order, limit, page } = queryParams;
  const startDate = new Date(s);
  const endDate = new Date(e);

  const units = getTableUnitWithDates(startDate, endDate, AggregationUnit.Total);

  const attributesRenamed = Array.from(
    new Set(attributes?.map((attr) => (attr === 'article' ? 'url' : attr)))
  );

  const attStr = attributesRenamed?.length
    ? `${attributesRenamed
        .map((attr) => {
          if (attr === 'url') return 'any(url) as url';
          if (attr === 'domain') return 'any(domain) as domain';
          if (attr === 'referrer') return 'any(referrer) as referrer';
          return attr;
        })
        .join(', ')},`
    : '';

  const metricStr =
    metric === Metric.EngagementTime
      ? `sum(${metric.toLowerCase()})`
      : `uniqCombined64Merge(${metric?.toLowerCase()})`;

  const groupStr = attributesRenamed?.length
    ? `GROUP BY ${attributesRenamed
        .map((attr) => {
          if (attr === 'url') return 'url_hash';
          if (attr === 'domain') return 'domain_hash';
          if (attr === 'referrer') return 'referrer_hash';
          return attr;
        })
        .join(', ')}`
    : '';

  const processedArticleFilter = processArticleFilter(articleFilter);
  const processedCategoryFilter = processCategoryFilter(categoryFilter);

  const where = processedArticleFilter?.query;
  const categoryWhere = processedCategoryFilter?.query;

  const queryParamsObj: Record<string, unknown> = {
    tenantId,
    ...processedArticleFilter?.params,
    ...processedCategoryFilter?.params,
  };

  const limitToUse = limit ?? 100;
  const pageToUse = page ?? 1;
  const limitAndOffset = `LIMIT ${limitToUse} OFFSET ${(pageToUse - 1) * limitToUse}`;

  const sql = `
    SELECT
      rowNumberInAllBlocks() as index,
      *
    FROM (
      SELECT
        ${attStr}
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
            lightscope.${tableName}_${unit} t
            ${where ? `INNER JOIN lightscope.article a ON t.url_hash = a.url_hash` : ''}
          WHERE
            t.tenant_id = {tenantId:UInt64}
            AND (
              toDateTime({${startParam}:String}) <= t.date
              AND t.date < toDateTime({${endParam}:String})
            )
            ${where ? `AND ${where}` : ''}
            ${categoryWhere ? `AND ${categoryWhere}` : ''}
        `;
        })
        .join(' UNION ALL ')})
      ${groupStr}
      ORDER BY value ${order === 'ASC' ? 'ASC' : 'DESC'}
    )
    ${limitAndOffset}
  `;

  const data = await query<RankAnalytics>(client, sql, queryParamsObj);
  return data;
}
