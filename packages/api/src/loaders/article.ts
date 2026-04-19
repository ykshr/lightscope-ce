import { Article } from '@/__generated__/graphql/resolvers';
import query, { formatData } from '@/loaders/helpers/clickhouse';
import type { Context } from '@/types';
import { ClickHouseClient } from '@clickhouse/client';
import DataLoader from 'dataloader';

export default function getLoader(c: Context): DataLoader<string, Article | null> {
  if (!c.var.loaders.has('articleLoader')) {
    c.var.loaders.set('articleLoader', new Map());
  }

  const loaders = c.var.loaders.get('articleLoader');
  const loaderKey = createLoaderKey(c);
  if (loaders.has(loaderKey)) {
    return loaders.get(loaderKey) as DataLoader<string, Article | null>;
  }

  const loader = new DataLoader<string, Article | null>(
    async (urls: readonly string[]) => {
      const articles = await fetchArticleByUrls(c.var.$.clickhouse, c.var.organization.id, urls);

      const articleMap = new Map<string, Article>();
      for (const article of articles) {
        articleMap.set(article.url, article);
      }

      return urls.map((url) => articleMap.get(url) ?? null);
    },
    {
      cacheKeyFn: (key) => key,
    }
  );
  loaders.set(loaderKey, loader);

  return loader;
}

function createLoaderKey(c: Context): string {
  return JSON.stringify({
    organizationId: c.var.organization.id,
  });
}

async function fetchArticleByUrls(
  client: ClickHouseClient,
  organizationId: string,
  urls: readonly string[]
): Promise<Article[]> {
  if (urls.length === 0) return [];

  const sql = `
      SELECT
        url,
        title,
        type,
        image,
        description,
        site_name,
        locale,
        published_time,
        modified_time,
        expiration_time,
        authors,
        authors_hash,
        section,
        tags,
        created_at
      FROM lightscope.article
      WHERE
        organization_id_hash = cityHash64({organizationId:String})
        AND url_hash IN (
          SELECT arrayJoin(arrayMap(x -> cityHash64(x), {urls:Array(String)}))
        )
    `;

  const data = await query<Article>(client, sql, { organizationId, urls });
  const dateFields = ['publishedTime', 'modifiedTime', 'expirationTime'];
  const formattedData = formatData(data, dateFields);

  return formattedData;
}
