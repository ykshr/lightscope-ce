import { GraphQLResolveInfo } from 'graphql';
import {
  Resolvers,
  TrendParameters,
  TrendAnalyticsBase,
  TrendAnalytics,
  TrendAnalyticsAge,
  TrendAnalyticsApp,
  TrendAnalyticsDevice,
  TrendAnalyticsGender,
  TrendAnalyticsGeo,
  TrendAnalyticsReferrer,
  TrendAnalyticsUtm,
  TrendAnalyticsArticle,
} from '@/graphql/__generated__/graphql-resolvers';
import getTrendLoader from '@/graphql/loaders/trend';
import { getArticle } from '@/graphql/resolvers/articleResolver';
import { resolveRequestedAttributesWithArticle } from '@/graphql/resolvers/helpers/processAttributes';
import { Context } from '@/graphql';

const createCategoryResolver =
  <T extends TrendAnalyticsBase>(tableName: string) =>
  async (
    parent: { parameters: TrendParameters },
    args: any,
    ctx: Context,
    info: GraphQLResolveInfo
  ): Promise<T[]> => {
    const attributes = resolveRequestedAttributesWithArticle(info);

    const loader = getTrendLoader(ctx, {
      tableName,
      queryParams: { ...parent.parameters },
      attributes,
      categoryFilter: args,
    });

    return loader.load<T>();
  };

const resolvers: Resolvers = {
  Query: {
    trend: async (_parent, args, ctx) => {
      const loaderParams = {
        tableName: 'pv',
        queryParams: args,
      };
      const loader = getTrendLoader(ctx, loaderParams);
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
    categoryReferrer:
      createCategoryResolver<TrendAnalyticsReferrer>('pv_referrer'),
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
