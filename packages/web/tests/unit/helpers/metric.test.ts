import { Metric } from '@/__generated__/graphql';
import { metricUrlParamsToVariables } from '@/helpers/metric';
import { describe, expect, it } from 'vitest';

describe('metric helpers', () => {
  describe('metricUrlParamsToVariables', () => {
    it('should map visits correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visits' } as any)).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should map visitors correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visitors' } as any)).toEqual({
        metric: Metric.VisitorsViews,
      });
    });

    it('should map users correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'users' } as any)).toEqual({
        metric: Metric.UsersViews,
      });
    });

    it('should default to visits for unknown metric', () => {
      expect(metricUrlParamsToVariables({ metric: 'unknown' } as any)).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should default to visits if metric missing', () => {
      expect(metricUrlParamsToVariables({} as any)).toEqual({
        metric: Metric.VisitsViews,
      });
    });
  });
});
