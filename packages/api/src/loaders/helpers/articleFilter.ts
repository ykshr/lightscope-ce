import { ArticleFilterInput, InputMaybe } from '@/__generated__/graphql/resolvers';
import { formatToDateTime } from '@/loaders/helpers/clickhouse';

export default function processArticleFilter(
  filter?: InputMaybe<ArticleFilterInput>,
  tableAlias = 'a'
): { query: string; params: Record<string, unknown> } | undefined {
  if (!filter) return undefined;

  const c: string[] = [];
  const params: Record<string, unknown> = {};
  const col = (name: string) => `${tableAlias}.${name}`;

  if (filter.includeUrls?.length) {
    c.push(`${col('url')} IN ({includeUrls:Array(String)})`);
    params.includeUrls = filter.includeUrls;
  }

  if (filter.excludeUrls?.length) {
    c.push(`${col('url')} NOT IN ({excludeUrls:Array(String)})`);
    params.excludeUrls = filter.excludeUrls;
  }

  if (filter.title) {
    c.push(`positionCaseInsensitiveUTF8(${col('title')}, {title:String}) > 0`);
    params.title = filter.title;
  }

  if (filter.includeTypes?.length) {
    c.push(`${col('type')} IN ({includeTypes:Array(String)})`);
    params.includeTypes = filter.includeTypes;
  }

  if (filter.excludeTypes?.length) {
    c.push(`${col('type')} NOT IN ({excludeTypes:Array(String)})`);
    params.excludeTypes = filter.excludeTypes;
  }

  if (filter.description) {
    c.push(`positionCaseInsensitiveUTF8(${col('description')}, {description:String}) > 0`);
    params.description = filter.description;
  }

  if (filter.includeSiteNames?.length) {
    c.push(`${col('site_name')} IN ({includeSiteNames:Array(String)})`);
    params.includeSiteNames = filter.includeSiteNames;
  }

  if (filter.excludeSiteNames?.length) {
    c.push(`${col('site_name')} NOT IN ({excludeSiteNames:Array(String)})`);
    params.excludeSiteNames = filter.excludeSiteNames;
  }

  if (filter.includeLocales?.length) {
    c.push(`${col('locale')} IN ({includeLocales:Array(String)})`);
    params.includeLocales = filter.includeLocales;
  }

  if (filter.excludeLocales?.length) {
    c.push(`${col('locale')} NOT IN ({excludeLocales:Array(String)})`);
    params.excludeLocales = filter.excludeLocales;
  }

  if (filter.publishedTimeBefore) {
    c.push(`${col('published_time')} < toDateTime({publishedTimeBefore:String})`);
    params.publishedTimeBefore = formatToDateTime(new Date(filter.publishedTimeBefore));
  }

  if (filter.publishedTimeAfter) {
    c.push(`${col('published_time')} > toDateTime({publishedTimeAfter:String})`);
    params.publishedTimeAfter = formatToDateTime(new Date(filter.publishedTimeAfter));
  }

  if (filter.modifiedTimeBefore) {
    c.push(`${col('modified_time')} < toDateTime({modifiedTimeBefore:String})`);
    params.modifiedTimeBefore = formatToDateTime(new Date(filter.modifiedTimeBefore));
  }

  if (filter.modifiedTimeAfter) {
    c.push(`${col('modified_time')} > toDateTime({modifiedTimeAfter:String})`);
    params.modifiedTimeAfter = formatToDateTime(new Date(filter.modifiedTimeAfter));
  }

  if (filter.expirationTimeBefore) {
    c.push(`${col('expiration_time')} < toDateTime({expirationTimeBefore:String})`);
    params.expirationTimeBefore = formatToDateTime(new Date(filter.expirationTimeBefore));
  }

  if (filter.expirationTimeAfter) {
    c.push(`${col('expiration_time')} > toDateTime({expirationTimeAfter:String})`);
    params.expirationTimeAfter = formatToDateTime(new Date(filter.expirationTimeAfter));
  }

  if (filter.includeAuthors?.length) {
    const sets: string[] = [];
    for (const set of filter.includeAuthors) {
      if (!set) continue;
      const paramKey = `includeAuthors_${sets.length}`;
      params[paramKey] = set;
      sets.push(`hasAny(${col('authors')}, {${paramKey}:Array(String)})`);
    }
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.excludeAuthors?.length) {
    const sets: string[] = [];
    for (const set of filter.excludeAuthors) {
      if (!set) continue;
      const paramKey = `excludeAuthors_${sets.length}`;
      params[paramKey] = set;
      sets.push(`NOT hasAny(${col('authors')}, {${paramKey}:Array(String)})`);
    }
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.includeSections?.length) {
    c.push(`${col('section')} IN ({includeSections:Array(String)})`);
    params.includeSections = filter.includeSections;
  }

  if (filter.excludeSections?.length) {
    c.push(`${col('section')} NOT IN ({excludeSections:Array(String)})`);
    params.excludeSections = filter.excludeSections;
  }

  if (filter.includeTags?.length) {
    const sets: string[] = [];
    for (const set of filter.includeTags) {
      if (!set) continue;
      const paramKey = `includeTags_${sets.length}`;
      params[paramKey] = set;
      sets.push(`hasAny(${col('tags')}, {${paramKey}:Array(String)})`);
    }
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.excludeTags?.length) {
    const sets: string[] = [];
    for (const set of filter.excludeTags) {
      if (!set) continue;
      const paramKey = `excludeTags_${sets.length}`;
      params[paramKey] = set;
      sets.push(`NOT hasAny(${col('tags')}, {${paramKey}:Array(String)})`);
    }
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  return c.length ? { query: c.join(' AND '), params } : undefined;
}
