import { Metric } from '@/../generated/graphql';
import { describe, expect, it } from 'vitest';
import { metricUrlParamsToVariables } from './metric';

describe('metric helpers', () => {
  describe('metricUrlParamsToVariables', () => {
    it('should map visits correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visits' })).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should map visitors correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'visitors' })).toEqual({
        metric: Metric.VisitorsViews,
      });
    });

    it('should map users correctly', () => {
      expect(metricUrlParamsToVariables({ metric: 'users' })).toEqual({
        metric: Metric.UsersViews,
      });
    });

    it('should default to visits for unknown metric', () => {
      expect(metricUrlParamsToVariables({ metric: 'unknown' })).toEqual({
        metric: Metric.VisitsViews,
      });
    });

    it('should default to visits if metric missing', () => {
      expect(metricUrlParamsToVariables({})).toEqual({
        metric: Metric.VisitsViews,
      });
    });
  });
});
