import { Metric } from '@/__generated__/graphql';
import { metricUrlParamsToVariables } from '@/helpers/metric';
import { FilterToQuery } from '@/types/filter';
import { describe, expect, it } from 'vitest';

describe('metric helpers', () => {
  describe('metricUrlParamsToVariables', () => {
    it('should map visits correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visits' } as FilterToQuery)).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should map visitors correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visitors' } as FilterToQuery)).toEqual({
        metric: Metric.VisitorsViews,
      });
    });

    it('should map users correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'users' } as FilterToQuery)).toEqual({
        metric: Metric.UsersViews,
      });
    });

    it('should default to visits for unknown metric', () => {
      expect(metricUrlParamsToVariables({ metric: 'unknown' } as FilterToQuery)).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should default to visits if metric missing', () => {
      expect(metricUrlParamsToVariables({} as FilterToQuery)).toEqual({
        metric: Metric.VisitsViews,
      });
    });
  });
});
