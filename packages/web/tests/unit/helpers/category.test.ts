import { categoryUrlParamsToVariables } from '@/helpers/category';
import { describe, expect, it } from 'vitest';

describe('category helpers', () => {
  describe('categoryUrlParamsToVariables', () => {
    it('should return isArticles: true if no category', () => {
      expect(categoryUrlParamsToVariables({} as any)).toEqual({ isArticles: true });
    });

    it('should handle age category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'age',
        includeAges: ['25-34'],
      } as any);
      expect(result).toEqual({
        isCategoryAge: true,
        isCategoryAgeAge: false,
        includeAges: ['25-34'],
        excludeAges: undefined,
      });
    });

    it('should handle app category and subcategories', () => {
      const result = categoryUrlParamsToVariables({ category: 'appApp' } as any);
      expect(result).toMatchObject({
        isCategoryApp: true,
        isCategoryAppApp: true,
        isCategoryAppAppType: false,
      });
    });

    it('should handle device category', () => {
      const result = categoryUrlParamsToVariables({ category: 'device' } as any);
      expect(result).toMatchObject({
        isCategoryDevice: true,
      });
    });

    it('should handle geo category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'geoCountry',
        includeCountries: ['US'],
      } as any);
      expect(result).toMatchObject({
        isCategoryGeo: true,
        isCategoryGeoCountry: true,
        includeCountries: ['US'],
      });
    });

    it('should handle referrer category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'referrerDomain',
      } as any);
      expect(result).toMatchObject({
        isCategoryReferrer: true,
        isCategoryReferrerDomain: true,
      });
    });

    it('should handle utm category', () => {
      const result = categoryUrlParamsToVariables({ category: 'utmSource' } as any);
      expect(result).toMatchObject({
        isCategoryUtm: true,
        isCategoryUtmSource: true,
      });
    });

    it('should return undefined for unknown category', () => {
      expect(categoryUrlParamsToVariables({ category: 'unknown' } as any)).toEqual({});
    });
  });
});
