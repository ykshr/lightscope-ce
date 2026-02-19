import { ArticleFilterInput, InputMaybe } from '@/graphql/__generated__/graphql-resolvers';
import { formatToDateTime } from '@/helpers/clickhouse';

export default function processArticleFilter(
  filter?: InputMaybe<ArticleFilterInput>,
  tableAlias = 'a'
): string | undefined {
  if (!filter) return undefined;

  const c: string[] = [];
  const col = (name: string) => `${tableAlias}.${name}`;

  if (filter.includeUrls?.length) {
    c.push(`${col('url')} IN (${filter.includeUrls.map((u) => `'${u}'`).join(',')})`);
  }

  if (filter.excludeUrls?.length) {
    c.push(`${col('url')} NOT IN (${filter.excludeUrls.map((u) => `'${u}'`).join(',')})`);
  }

  if (filter.title) {
    c.push(`positionCaseInsensitiveUTF8(${col('title')}, '${filter.title}') > 0`);
  }

  if (filter.includeTypes?.length) {
    c.push(`${col('type')} IN (${filter.includeTypes.map((t) => `'${t}'`).join(',')})`);
  }

  if (filter.excludeTypes?.length) {
    c.push(`${col('type')} NOT IN (${filter.excludeTypes.map((t) => `'${t}'`).join(',')})`);
  }

  if (filter.description) {
    c.push(`positionCaseInsensitiveUTF8(${col('description')}, '${filter.description}') > 0`);
  }

  if (filter.includeSiteNames?.length) {
    c.push(`${col('site_name')} IN (${filter.includeSiteNames.map((s) => `'${s}'`).join(',')})`);
  }

  if (filter.excludeSiteNames?.length) {
    c.push(
      `${col('site_name')} NOT IN (${filter.excludeSiteNames.map((s) => `'${s}'`).join(',')})`
    );
  }

  if (filter.includeLocales?.length) {
    c.push(`${col('locale')} IN (${filter.includeLocales.map((l) => `'${l}'`).join(',')})`);
  }

  if (filter.excludeLocales?.length) {
    c.push(`${col('locale')} NOT IN (${filter.excludeLocales.map((l) => `'${l}'`).join(',')})`);
  }

  if (filter.publishedTimeBefore) {
    c.push(
      `${col('published_time')} < toDateTime('${formatToDateTime(
        new Date(filter.publishedTimeBefore)
      )}')`
    );
  }

  if (filter.publishedTimeAfter) {
    c.push(
      `${col('published_time')} > toDateTime('${formatToDateTime(
        new Date(filter.publishedTimeAfter)
      )}')`
    );
  }

  if (filter.modifiedTimeBefore) {
    c.push(
      `${col('modified_time')} < toDateTime('${formatToDateTime(
        new Date(filter.modifiedTimeBefore)
      )}')`
    );
  }

  if (filter.modifiedTimeAfter) {
    c.push(
      `${col('modified_time')} > toDateTime('${formatToDateTime(
        new Date(filter.modifiedTimeAfter)
      )}')`
    );
  }

  if (filter.expirationTimeBefore) {
    c.push(
      `${col('expiration_time')} < toDateTime('${formatToDateTime(
        new Date(filter.expirationTimeBefore)
      )}')`
    );
  }

  if (filter.expirationTimeAfter) {
    c.push(
      `${col('expiration_time')} > toDateTime('${formatToDateTime(
        new Date(filter.expirationTimeAfter)
      )}')`
    );
  }

  if (filter.includeAuthors?.length) {
    const sets = filter.includeAuthors
      .filter(Boolean)
      .map((set) => `hasAny(${col('authors')}, [${set!.map((a) => `'${a}'`).join(',')}])`);
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.excludeAuthors?.length) {
    const sets = filter.excludeAuthors
      .filter(Boolean)
      .map((set) => `NOT hasAny(${col('authors')}, [${set!.map((a) => `'${a}'`).join(',')}])`);
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.includeSections?.length) {
    c.push(`${col('section')} IN (${filter.includeSections.map((s) => `'${s}'`).join(',')})`);
  }

  if (filter.excludeSections?.length) {
    c.push(`${col('section')} NOT IN (${filter.excludeSections.map((s) => `'${s}'`).join(',')})`);
  }

  if (filter.includeTags?.length) {
    const sets = filter.includeTags
      .filter(Boolean)
      .map((set) => `hasAny(${col('tags')}, [${set!.map((t) => `'${t}'`).join(',')}])`);
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  if (filter.excludeTags?.length) {
    const sets = filter.excludeTags
      .filter(Boolean)
      .map((set) => `NOT hasAny(${col('tags')}, [${set!.map((t) => `'${t}'`).join(',')}])`);
    if (sets.length) c.push(`(${sets.join(' AND ')})`);
  }

  return c.length ? c.join(' AND ') : undefined;
}
