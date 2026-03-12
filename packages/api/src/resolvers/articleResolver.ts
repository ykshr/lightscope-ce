import { Article, Resolvers } from '@/__generated__/graphql-resolvers';
import getArticleLoader from '@/loaders/article';
import { Context } from '@/types';

export const getArticle = async (
  parent: { url?: string },
  args: { url?: string },
  ctx: Context
): Promise<Article | null> => {
  const url = args.url ?? parent.url;
  if (!url) return null;
  const loader = getArticleLoader(ctx);
  const article = await loader.load(url);
  return article;
};

const resolvers: Resolvers = {
  Query: {
    article: getArticle,
  },
  Article: {
    analytics: (parent, args) => {
      const startDate = new Date(
        Math.max(new Date(args.startDate).getTime(), new Date(parent.publishedTime ?? 0).getTime())
      ).toISOString();
      const endDate = new Date(args.endDate).toISOString();
      return {
        parameters: {
          startDate,
          endDate,
          aggregation: args.aggregation,
          limit: args.limit,
          page: args.page,
          siteName: parent.siteName,
          url: parent.url,
          metric: args.metric,
        },
      };
    },
  },
};

export default resolvers;
