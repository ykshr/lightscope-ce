import type { RankParameters, Resolvers } from '@/__generated__/graphql/resolvers';
import getRankLoader from '@/graphql/loaders/rank';
import { getArticle } from '@/graphql/resolvers/article';
import { resolveRequestedAttributesWithArticle } from '@/graphql/resolvers/helpers/processAttributes';
import { GraphQLContext } from '@/types';
import { GraphQLResolveInfo } from 'graphql';

const createCategoryResolver =
  (tableName: string) =>
  async (
    parent: { parameters: RankParameters },
    args: any,
    cxt: GraphQLContext,
    info: GraphQLResolveInfo
  ) => {
    const attributes = resolveRequestedAttributesWithArticle(info);

    const loader = getRankLoader(cxt, {
      tableName,
      queryParams: { ...parent.parameters },
      attributes,
      categoryFilter: args,
    });

    return loader.load();
  };

const resolvers: Resolvers = {
  Query: {
    rank: async (_parent, args, cxt) => {
      const loaderParams = {
        tableName: 'pv',
        queryParams: args,
      };
      const loader = getRankLoader(cxt, loaderParams);
      const data = await loader.total();
      if (!data || data.length === 0)
        return {
          total: 0,
          parameters: {
            metric: args.metric,
            order: args.order,
            articleFilter: args.articleFilter,
            startDate: args.startDate,
            endDate: args.endDate,
            limit: args.limit,
            page: args.page,
          },
        };
      return {
        total: data[0].value,
        parameters: {
          metric: args.metric,
          order: args.order,
          articleFilter: args.articleFilter,
          startDate: args.startDate,
          endDate: args.endDate,
          limit: args.limit,
          page: args.page,
        },
      };
    },
  },
  Rank: {
    categoryAge: createCategoryResolver('pv_age'),
    categoryApp: createCategoryResolver('pv_app'),
    categoryDevice: createCategoryResolver('pv_device'),
    categoryGender: createCategoryResolver('pv_gender'),
    categoryGeo: createCategoryResolver('pv_geo'),
    categoryReferrer: createCategoryResolver('pv_referrer'),
    categoryUtm: createCategoryResolver('pv_utm'),
    articles: createCategoryResolver('pv'),
  },
  RankAnalytics: { article: getArticle },
};

export default resolvers;
