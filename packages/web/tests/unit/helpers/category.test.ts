import { describe, it, expect } from 'vitest';
import { categoryUrlParamsToVariables } from '@/helpers/category';

describe('category helpers', () => {
  const baseParams = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02'),
  };

  describe('categoryUrlParamsToVariables', () => {
    it('should return isArticles: true if no category', () => {
      expect(categoryUrlParamsToVariables({ ...baseParams })).toEqual({ isArticles: true });
    });

    it('should handle age category', () => {
      const result = categoryUrlParamsToVariables({
        ...baseParams,
        category: 'age',
        includeAges: ['25-34'],
      });
      expect(result).toEqual({
        isCategoryAge: true,
        isCategoryAgeAge: false,
        includeAges: ['25-34'],
        excludeAges: undefined,
      });
    });

    it('should handle app category and subcategories', () => {
      const result = categoryUrlParamsToVariables({ ...baseParams, category: 'appApp' });
      expect(result).toMatchObject({
        isCategoryApp: true,
        isCategoryAppApp: true,
        isCategoryAppAppType: false,
      });
    });

    it('should handle device category', () => {
      const result = categoryUrlParamsToVariables({ ...baseParams, category: 'device' });
      expect(result).toMatchObject({
        isCategoryDevice: true,
      });
    });

    it('should handle geo category', () => {
      const result = categoryUrlParamsToVariables({
        ...baseParams,
        category: 'geoCountry',
        includeCountries: ['US'],
      });
      expect(result).toMatchObject({
        isCategoryGeo: true,
        isCategoryGeoCountry: true,
        includeCountries: ['US'],
      });
    });

    it('should handle referrer category', () => {
      const result = categoryUrlParamsToVariables({
        ...baseParams,
        category: 'referrerDomain',
      });
      expect(result).toMatchObject({
        isCategoryReferrer: true,
        isCategoryReferrerDomain: true,
      });
    });

    it('should handle utm category', () => {
      const result = categoryUrlParamsToVariables({ ...baseParams, category: 'utmSource' });
      expect(result).toMatchObject({
        isCategoryUtm: true,
        isCategoryUtmSource: true,
      });
    });

    it('should return empty object for unknown category', () => {
      expect(categoryUrlParamsToVariables({ ...baseParams, category: 'unknown' })).toEqual({});
    });
  });
});
