import { DateTimeResolver } from 'graphql-scalars';
import { Resolvers } from '@/__generated__/resolvers';
import articleResolvers from '@/resolvers/articleResolver';
import articleAnalyticsResolvers from '@/resolvers/articleAnalyticsResolver';
import rankResolvers from '@/resolvers/rankResolver';
import trendResolvers from '@/resolvers/trendResolver';
import deepMerge from '@/helpers/deepMerge';

const resolvers: Resolvers = deepMerge(
  { DateTime: DateTimeResolver },
  articleResolvers,
  articleAnalyticsResolvers,
  rankResolvers,
  trendResolvers
);

export default resolvers;
