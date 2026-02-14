import {
  AggregationUnit,
  type QueryRankArgs,
  type RankAnalytics,
  type RankCategoryAgeArgs,
  type RankCategoryAppArgs,
  type RankCategoryDeviceArgs,
  type RankCategoryGenderArgs,
  type RankCategoryGeoArgs,
  type RankCategoryReferrerArgs,
  type RankCategoryUtmArgs,
} from '@/graphql/__generated__/graphql-resolvers';
import { Context } from '@/graphql';
import query, { formatToDateTime } from '@/helpers/clickhouse';
import { getTableUnitWithDates } from '@/graphql/loaders/helpers/getCollectionUnitWithDates';
import processArticleFilter from '@/graphql/loaders/helpers/articleFilter';
import processCategoryFilter from '@/graphql/loaders/helpers/categoryFilter';
import { RequestAttributesWithArticle } from '@/graphql/resolvers/helpers/processAttributes';

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

export default function getLoader(ctx: Context, loaderParams: LoaderParams) {
  return {
    total: () => rank(ctx.tenantId, loaderParams),
    load: () => rank(ctx.tenantId, loaderParams),
  };
}

async function rank(tenantId: string, loaderParams: LoaderParams) {
  const { tableName, queryParams, attributes, categoryFilter } = loaderParams;
  const {
    startDate: s,
    endDate: e,
    articleFilter,
    metric,
    order,
    limit,
    page,
  } = queryParams;
  const startDate = new Date(s);
  const endDate = new Date(e);

  const units = getTableUnitWithDates(
    startDate,
    endDate,
    AggregationUnit.Total
  );

  const attributesRenamed = Array.from(
    new Set(attributes?.map((attr) => (attr === 'article' ? 'url' : attr)))
  );

  const attStr = attributesRenamed?.length
    ? `${attributesRenamed
        .map((attr) => {
          if (attr === 'url') return 'any(t.url) as url';
          if (attr === 'domain') return 'any(t.domain) as domain';
          if (attr === 'referrer') return 'any(t.referrer) as referrer';
          return `t.${attr}`;
        })
        .join(', ')},`
    : '';

  const groupStr = attributesRenamed?.length
    ? `GROUP BY ${attributesRenamed
        .map((attr) => {
          if (attr === 'url') return 't.url_hash';
          if (attr === 'domain') return 't.domain_hash';
          if (attr === 'referrer') return 't.referrer_hash';
          return `t.${attr}`;
        })
        .join(', ')}`
    : '';

  const where = processArticleFilter(articleFilter);
  const categoryWhere = processCategoryFilter(categoryFilter);

  const limitToUse = limit ?? 100;
  const pageToUse = page ?? 1;
  const limitAndOffset = `LIMIT ${limitToUse} OFFSET ${(pageToUse - 1) * limitToUse}`;

  const sql = `
    SELECT
      rowNumber() as index,
      ${attStr}
      uniqCombined64Merge(t.${metric?.toLowerCase()}) as value
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
    ORDER BY value ${order === 'ASC' ? 'ASC' : 'DESC'}
    ${limitAndOffset}
  `;

  const data = await query<RankAnalytics>(sql);
  return data;
}
