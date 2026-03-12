import DataLoader from 'dataloader';
import { Article } from '@/__generated__/graphql-resolvers';
import query from '@/helpers/clickhouse';
import { renameKeySnakeToCamel } from '@/helpers/rename';
import type { Context } from '@/types';

export default function getLoader(ctx: Context): DataLoader<string, Article | null> {
  if (ctx.var.loaders.has('articleLoader')) {
    return ctx.var.loaders.get('articleLoader') as DataLoader<string, Article | null>;
  }
  const loader = new DataLoader<string, Article | null>(
    async (urls: readonly string[]) => {
      const articles = await fetchArticleByUrls(ctx.var.user.tenantId, urls);

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
  ctx.var.loaders.set('articleLoader', loader);

  return loader;
}

async function fetchArticleByUrls(tenantId: string, urls: readonly string[]): Promise<Article[]> {
  if (urls.length === 0) return [];

  const url_hashes = urls.map((url) => `cityHash64('${url}')`).join(', ');
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
        tenant_id = ${tenantId}
        AND url_hash IN (${url_hashes})
    `;

  const data = await query<Article>(sql);
  const renamedData = data.map((row) => renameKeySnakeToCamel(row));

  return renamedData;
}
