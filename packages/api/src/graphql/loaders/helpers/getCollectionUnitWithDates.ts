import { AggregationUnit } from '@/__generated__/graphql-resolvers';

export function getAggregationUnit(startDate: Date, endDate: Date): AggregationUnit {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);

  if (daysDiff <= 1) {
    return AggregationUnit.Minute;
  } else if (daysDiff <= 7) {
    return AggregationUnit.Hour;
  } else {
    return AggregationUnit.Day;
  }
}
