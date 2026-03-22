import { AnalyticsBase, ArticleAnalytics, Resolvers } from '@/__generated__/resolvers';
import getArticleAnalyticsLoader from '@/loaders/articleAnalytics';
import { resolveRequestedAttributes } from '@/resolvers/helpers/processAttributes';
import type { Context } from '@/types';
import { GraphQLResolveInfo } from 'graphql';

const createArticleAnalyticsResolver =
  <T extends AnalyticsBase>(tableName: string) =>
  async (
    parent: ArticleAnalytics,
    _args: any,
    c: Context,
    info: GraphQLResolveInfo
  ): Promise<T[] | null> => {
    const { startDate, endDate, aggregation, limit, page, siteName, url, metric } =
      parent.parameters;
    const attributes = resolveRequestedAttributes(info);
    const loader = getArticleAnalyticsLoader<T>(c, {
      tableName,
      queryParams: {
        startDate,
        endDate,
        aggregation,
        limit,
        page,
        siteName,
        metric,
      },
      attributes,
    });
    const data = await loader.load(url);
    return data;
  };

const resolvers: Resolvers = {
  ArticleAnalytics: {
    analytics: createArticleAnalyticsResolver('pv'),
    analyticsAge: createArticleAnalyticsResolver('pv_age'),
    analyticsApp: createArticleAnalyticsResolver('pv_app'),
    analyticsDevice: createArticleAnalyticsResolver('pv_device'),
    analyticsGender: createArticleAnalyticsResolver('pv_gender'),
    analyticsGeo: createArticleAnalyticsResolver('pv_geo'),
    analyticsReferrer: createArticleAnalyticsResolver('pv_referrer'),
    analyticsUtm: createArticleAnalyticsResolver('pv_utm'),
  },
};

export default resolvers;
