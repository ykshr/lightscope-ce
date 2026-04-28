import { Metric } from '@/__generated__/graphql';
import { describe, expect, it } from 'vitest';
import { metricUrlParamsToVariables } from '@/helpers/metric';

describe('metric helpers', () => {
  const baseParams = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02'),
  };

  describe('metricUrlParamsToVariables', () => {
    it('should map visits correctly', () => {
      expect(metricUrlParamsToVariables({ ...baseParams, metric: 'visits' })).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should map visitors correctly', () => {
      expect(metricUrlParamsToVariables({ ...baseParams, metric: 'visitors' })).toEqual({
        metric: Metric.VisitorsViews,
      });
    });

    it('should map users correctly', () => {
      expect(metricUrlParamsToVariables({ ...baseParams, metric: 'users' })).toEqual({
        metric: Metric.UsersViews,
      });
    });

    it('should default to visits for unknown metric', () => {
      expect(metricUrlParamsToVariables({ ...baseParams, metric: 'unknown' })).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should default to visits if metric missing', () => {
      expect(metricUrlParamsToVariables({ ...baseParams })).toEqual({
        metric: Metric.VisitsViews,
      });
    });
  });
});
