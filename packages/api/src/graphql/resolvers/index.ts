import { DateTimeResolver } from 'graphql-scalars';
import { Resolvers } from '@/graphql/__generated__/graphql-resolvers';
import articleResolvers from '@/graphql/resolvers/articleResolver';
import articleAnalyticsResolvers from '@/graphql/resolvers/articleAnalyticsResolver';
import rankResolvers from '@/graphql/resolvers/rankResolver';
import trendResolvers from '@/graphql/resolvers/trendResolver';
import deepMerge from '@/helpers/deepMerge';

const resolvers: Resolvers = deepMerge(
  { DateTime: DateTimeResolver },
  articleResolvers,
  articleAnalyticsResolvers,
  rankResolvers,
  trendResolvers
);

export default resolvers;
