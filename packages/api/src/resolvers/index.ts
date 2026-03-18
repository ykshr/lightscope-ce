import { Resolvers } from '@/__generated__/resolvers';
import deepMerge from '@/helpers/deepMerge';
import articleResolvers from '@/resolvers/article';
import articleAnalyticsResolvers from '@/resolvers/articleAnalytics';
import rankResolvers from '@/resolvers/rank';
import tokenResolvers from '@/resolvers/tracker';
import trendResolvers from '@/resolvers/trend';
import { DateTimeResolver } from 'graphql-scalars';

const resolvers: Resolvers = deepMerge(
  { DateTime: DateTimeResolver },
  articleResolvers,
  articleAnalyticsResolvers,
  rankResolvers,
  trendResolvers,
  tokenResolvers
);

export default resolvers;
