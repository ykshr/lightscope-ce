import {
  QueryTrendArgs,
  AggregationUnit,
  TrendCategoryAgeArgs,
  TrendCategoryAppArgs,
  TrendCategoryDeviceArgs,
  TrendCategoryGenderArgs,
  TrendCategoryGeoArgs,
  TrendCategoryReferrerArgs,
  TrendCategoryUtmArgs,
} from '@/graphql/__generated__/graphql-resolvers';
import query, { formatToDateTime } from '@/helpers/clickhouse';
import {
  getAggregationUnit,
  getTableUnitWithDates,
} from '@/graphql/loaders/helpers/getCollectionUnitWithDates';
import { Context } from '@/graphql';
import processArticleFilter from '@/graphql/loaders/helpers/articleFilter';
import processCategoryFilter from '@/graphql/loaders/helpers/categoryFilter';
import { RequestAttributesWithArticle } from '@/graphql/resolvers/helpers/processAttributes';

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

export default function getLoader(ctx: Context, loaderParams: LoaderParams) {
  return {
    total: <T>() => Trend<T>(ctx.tenantId, loaderParams),
    load: <T>() => Trend<T>(ctx.tenantId, loaderParams),
  };
}

async function Trend<T>(tenantId: string, loaderParams: LoaderParams) {
  const { tableName, queryParams, attributes, categoryFilter } = loaderParams;
  const { startDate: s, endDate: e, articleFilter, metric, aggregation, limit, page } = queryParams;
  const { top = 10 } = categoryFilter || {};
  const startDate = new Date(s);
  const endDate = new Date(e);

  const { unit, interval } = getAggregationUnit(startDate, endDate, aggregation);
  const units = getTableUnitWithDates(startDate, endDate, unit);

  const dateStr = (() => {
    if (unit === AggregationUnit.Total) return "'total' as date,";
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

  const where = processArticleFilter(articleFilter);
  const categoryWhere = processCategoryFilter(categoryFilter);

  const limitToUse = limit ?? 100;
  const pageToUse = page ?? 1;
  const limitAndOffset = `LIMIT ${limitToUse} OFFSET ${(pageToUse - 1) * limitToUse}`;

  const categoryLimitStr = top != null && top > 0 ? `LIMIT ${top} BY date` : '';

  const sql = `
    SELECT
      ${dateStr}
      ${attStr}
      uniqCombined64Merge(${metric?.toLowerCase()}) as value
    FROM (${units
      .map(
        ({ unit, startDate: unitStartDate, endDate: unitEndDate }) => `
        SELECT
          *
        FROM
          lightscope.${tableName}_${unit} t
          ${where ? `INNER JOIN lightscope.article a ON t.url_hash = a.url_hash` : ''}
        WHERE
          t.tenant_id = ${tenantId}
          AND (
            toDateTime('${formatToDateTime(unitStartDate)}') <= t.date
            AND t.date < toDateTime('${formatToDateTime(unitEndDate)}')
          )
          ${where ? `AND ${where}` : ''}
          ${categoryWhere ? `AND ${categoryWhere}` : ''}
      `
      )
      .join(' UNION ALL ')})
    ${groupStr}
    ${orderStr}
    ${categoryLimitStr}
    ${limitAndOffset}
  `;

  const data = await query<any>(sql);
  return data.map((row: any) => ({
    ...row,
    ...(row.date && row.date !== 'total' ? { date: row.date.replace(' ', 'T') + 'Z' } : {}),
  })) as T[];
}
