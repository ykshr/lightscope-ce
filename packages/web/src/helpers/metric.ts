import { Metric } from '@/../generated/graphql';

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

export const metricUrlParamsToVariables = (urlParams: { [name: string]: any }) => {
  const { metric = 'visits' } = urlParams;
  return {
    metric: returnMetric(metric),
  };
};
