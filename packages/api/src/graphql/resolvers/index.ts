import { Resolvers } from '@/__generated__/graphql/resolvers';
import articleResolvers from '@/graphql/resolvers/article';
import articleAnalyticsResolvers from '@/graphql/resolvers/articleAnalytics';
import deepMerge from '@/graphql/resolvers/helpers/deepMerge';
import rankResolvers from '@/graphql/resolvers/rank';
import trendResolvers from '@/graphql/resolvers/trend';
import { DateTimeResolver } from 'graphql-scalars';

const resolvers: Resolvers = deepMerge(
  { DateTime: DateTimeResolver },
  articleResolvers,
  articleAnalyticsResolvers,
  rankResolvers,
  trendResolvers
);

export default resolvers;
