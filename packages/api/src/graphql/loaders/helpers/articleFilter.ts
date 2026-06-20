import { ArticleFilterInput, InputMaybe } from '@/__generated__/graphql/resolvers';
import { formatToDateTime } from '@/graphql/loaders/helpers/clickhouse';

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
    let count = 0;
    const str = filter.includeAuthors.reduce((acc, set) => {
      if (!set) return acc;
      const paramKey = `includeAuthors_${count++}`;
      params[paramKey] = set;
      const clause = `hasAny(${col('authors')}, {${paramKey}:Array(String)})`;
      return acc ? `${acc} AND ${clause}` : clause;
    }, '');
    if (str) c.push(`(${str})`);
  }

  if (filter.excludeAuthors?.length) {
    let count = 0;
    const str = filter.excludeAuthors.reduce((acc, set) => {
      if (!set) return acc;
      const paramKey = `excludeAuthors_${count++}`;
      params[paramKey] = set;
      const clause = `NOT hasAny(${col('authors')}, {${paramKey}:Array(String)})`;
      return acc ? `${acc} AND ${clause}` : clause;
    }, '');
    if (str) c.push(`(${str})`);
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
    let count = 0;
    const str = filter.includeTags.reduce((acc, set) => {
      if (!set) return acc;
      const paramKey = `includeTags_${count++}`;
      params[paramKey] = set;
      const clause = `hasAny(${col('tags')}, {${paramKey}:Array(String)})`;
      return acc ? `${acc} AND ${clause}` : clause;
    }, '');
    if (str) c.push(`(${str})`);
  }

  if (filter.excludeTags?.length) {
    let count = 0;
    const str = filter.excludeTags.reduce((acc, set) => {
      if (!set) return acc;
      const paramKey = `excludeTags_${count++}`;
      params[paramKey] = set;
      const clause = `NOT hasAny(${col('tags')}, {${paramKey}:Array(String)})`;
      return acc ? `${acc} AND ${clause}` : clause;
    }, '');
    if (str) c.push(`(${str})`);
  }

  return c.length ? { query: c.join(' AND '), params } : undefined;
}
