import {
  Resolvers,
  TrendAnalytics,
  TrendAnalyticsAge,
  TrendAnalyticsApp,
  TrendAnalyticsArticle,
  TrendAnalyticsBase,
  TrendAnalyticsDevice,
  TrendAnalyticsGender,
  TrendAnalyticsGeo,
  TrendAnalyticsReferrer,
  TrendAnalyticsUtm,
  TrendParameters,
} from '@/__generated__/resolvers';
import getTrendLoader from '@/loaders/trend';
import { getArticle } from '@/resolvers/article';
import { resolveRequestedAttributesWithArticle } from '@/resolvers/helpers/processAttributes';
import { Context } from '@/types';
import { GraphQLResolveInfo } from 'graphql';

const createCategoryResolver =
  <T extends TrendAnalyticsBase>(tableName: string) =>
  async (
    parent: { parameters: TrendParameters },
    args: any,
    c: Context,
    info: GraphQLResolveInfo
  ): Promise<T[]> => {
    const attributes = resolveRequestedAttributesWithArticle(info);

    const loader = getTrendLoader(c, {
      tableName,
      queryParams: { ...parent.parameters },
      attributes,
      categoryFilter: args,
    });

    return loader.load<T>();
  };

const resolvers: Resolvers = {
  Query: {
    trend: async (_parent, args, c) => {
      const loaderParams = {
        tableName: 'pv',
        queryParams: args,
      };
      const loader = getTrendLoader(c, loaderParams);
      const data = await loader.total<TrendAnalytics>();
      return {
        total: data,
        parameters: {
          startDate: args.startDate,
          endDate: args.endDate,
          articleFilter: args.articleFilter,
          aggregation: args.aggregation,
          limit: args.limit,
          page: args.page,
          metric: args.metric,
        },
      };
    },
  },
  Trend: {
    categoryAge: createCategoryResolver<TrendAnalyticsAge>('pv_age'),
    categoryApp: createCategoryResolver<TrendAnalyticsApp>('pv_app'),
    categoryDevice: createCategoryResolver<TrendAnalyticsDevice>('pv_device'),
    categoryGender: createCategoryResolver<TrendAnalyticsGender>('pv_gender'),
    categoryGeo: createCategoryResolver<TrendAnalyticsGeo>('pv_geo'),
    categoryReferrer: createCategoryResolver<TrendAnalyticsReferrer>('pv_referrer'),
    categoryUtm: createCategoryResolver<TrendAnalyticsUtm>('pv_utm'),
    articles: createCategoryResolver<TrendAnalyticsArticle>('pv'),
  },
  TrendAnalyticsAge: { article: getArticle },
  TrendAnalyticsApp: { article: getArticle },
  TrendAnalyticsDevice: { article: getArticle },
  TrendAnalyticsGender: { article: getArticle },
  TrendAnalyticsGeo: { article: getArticle },
  TrendAnalyticsReferrer: { article: getArticle },
  TrendAnalyticsUtm: { article: getArticle },
  TrendAnalyticsArticle: { article: getArticle },
};

export default resolvers;
