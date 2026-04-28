import { Metric } from '@/__generated__/graphql';
import { FilterToQuery } from '@/types/filter';

export type MetricVariables = {
  metric: Metric;
};

const returnMetric = (metric: string) => {
  switch (metric) {
    case 'visits':
      return Metric.VisitsViews;
    case 'visitors':
      return Metric.VisitorsViews;
    case 'users':
      return Metric.UsersViews;
    default:
      return Metric.VisitsViews;
  }
};

export const metricUrlParamsToVariables = (urlParams: FilterToQuery): MetricVariables => {
  const { metric = 'visits' } = urlParams;
  return {
    metric: returnMetric(metric),
  };
};
