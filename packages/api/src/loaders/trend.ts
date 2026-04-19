import {
  AggregationUnit,
  Metric,
  QueryTrendArgs,
  TrendCategoryAgeArgs,
  TrendCategoryAppArgs,
  TrendCategoryDeviceArgs,
  TrendCategoryGenderArgs,
  TrendCategoryGeoArgs,
  TrendCategoryReferrerArgs,
  TrendCategoryUtmArgs,
} from '@/__generated__/graphql/resolvers';
import { RequestAttributesWithArticle } from '@/graphql/resolvers/helpers/processAttributes';
import processArticleFilter from '@/loaders/helpers/articleFilter';
import processCategoryFilter from '@/loaders/helpers/categoryFilter';
import query, { formatData, formatToDateTime } from '@/loaders/helpers/clickhouse';
import {
  getAggregationUnitWithInterval,
  getTableUnitWithDates,
} from '@/loaders/helpers/getCollectionUnitWithDates';
import type { Context } from '@/types';
import { ClickHouseClient } from '@clickhouse/client';

interface LoaderParams {
  tableName: string;
  queryParams: QueryTrendArgs;
  attributes?: readonly RequestAttributesWithArticle[];
  categoryFilter?:
    | TrendCategoryAgeArgs
    | TrendCategoryAppArgs
    | TrendCategoryDeviceArgs
    | TrendCategoryGenderArgs
    | TrendCategoryGeoArgs
    | TrendCategoryReferrerArgs
    | TrendCategoryUtmArgs;
}

export default function getLoader(c: Context, loaderParams: LoaderParams) {
  return {
    total: <T>() => Trend<T>(c.var.$.clickhouse, c.var.organization.id, loaderParams),
    load: <T>() => Trend<T>(c.var.$.clickhouse, c.var.organization.id, loaderParams),
  };
}

async function Trend<T>(
  client: ClickHouseClient,
  organizationId: string,
  loaderParams: LoaderParams
) {
  const { tableName, queryParams, attributes, categoryFilter } = loaderParams;
  const { startDate: s, endDate: e, articleFilter, metric, aggregation, limit, page } = queryParams;
  const { top = 10 } = categoryFilter || {};
  const startDate = new Date(s);
  const endDate = new Date(e);

  const { unit, interval } = getAggregationUnitWithInterval(startDate, endDate, aggregation);
  const units = getTableUnitWithDates(startDate, endDate, unit);

  const dateStr = (() => {
    if (unit === AggregationUnit.Total) return 'now() as date,';
    return `toStartOfInterval(date, INTERVAL ${interval} ${unit.toUpperCase()}) as date,`;
  })();

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

  const orderStr = `ORDER BY date ASC, value DESC`;

  const groupStr = attributesRenamed?.length
    ? `GROUP BY date, ${attributesRenamed
        .map((attr) => {
          if (attr === 'url') return 'url_hash';
          if (attr === 'domain') return 'domain_hash';
          if (attr === 'referrer') return 'referrer_hash';
          return attr;
        })
        .join(', ')}`
    : 'GROUP BY date';

  const processedArticleFilter = processArticleFilter(articleFilter);
  const processedCategoryFilter = processCategoryFilter(categoryFilter);

  const where = processedArticleFilter?.query;
  const categoryWhere = processedCategoryFilter?.query;

  const queryParamsObj: Record<string, unknown> = {
    organizationId,
    ...processedArticleFilter?.params,
    ...processedCategoryFilter?.params,
  };

  const limitToUse = limit ?? 100;
  const pageToUse = page ?? 1;
  const limitAndOffset = `LIMIT ${limitToUse} OFFSET ${(pageToUse - 1) * limitToUse}`;

  const categoryLimitStr = top != null && top > 0 ? `LIMIT ${top} BY date` : '';

  const sql = `
    SELECT
      ${dateStr}
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
          t.organization_id_hash = cityHash64({organizationId:String})
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
    ${orderStr}
    ${categoryLimitStr}
    ${limitAndOffset}
  `;

  const data = await query<T>(client, sql, queryParamsObj);
  const formattedData = formatData(data, ['date']);
  return formattedData;
}
