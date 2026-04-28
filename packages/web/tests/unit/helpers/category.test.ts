import { categoryUrlParamsToVariables } from '@/helpers/category';
import { FilterToQuery } from '@/types/filter';
import { describe, expect, it } from 'vitest';

describe('category helpers', () => {
  describe('categoryUrlParamsToVariables', () => {
    it('should return isArticles: true if no category', () => {
      expect(categoryUrlParamsToVariables({} as FilterToQuery)).toEqual({ isArticles: true });
    });

    it('should handle age category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'age',
        includeAges: ['25-34'],
      } as FilterToQuery);
      expect(result).toEqual({
        isCategoryAge: true,
        isCategoryAgeAge: false,
        includeAges: ['25-34'],
        excludeAges: undefined,
      });
    });

    it('should handle app category and subcategories', () => {
      const result = categoryUrlParamsToVariables({ category: 'appApp' } as FilterToQuery);
      expect(result).toMatchObject({
        isCategoryApp: true,
        isCategoryAppApp: true,
        isCategoryAppAppType: false,
      });
    });

    it('should handle device category', () => {
      const result = categoryUrlParamsToVariables({ category: 'device' } as FilterToQuery);
      expect(result).toMatchObject({
        isCategoryDevice: true,
      });
    });

    it('should handle geo category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'geoCountry',
        includeCountries: ['US'],
      } as FilterToQuery);
      expect(result).toMatchObject({
        isCategoryGeo: true,
        isCategoryGeoCountry: true,
        includeCountries: ['US'],
      });
    });

    it('should handle referrer category', () => {
      const result = categoryUrlParamsToVariables({
        category: 'referrerDomain',
      } as FilterToQuery);
      expect(result).toMatchObject({
        isCategoryReferrer: true,
        isCategoryReferrerDomain: true,
      });
    });

    it('should handle utm category', () => {
      const result = categoryUrlParamsToVariables({ category: 'utmSource' } as FilterToQuery);
      expect(result).toMatchObject({
        isCategoryUtm: true,
        isCategoryUtmSource: true,
      });
    });

    it('should return undefined for unknown category', () => {
      expect(categoryUrlParamsToVariables({ category: 'unknown' } as FilterToQuery)).toEqual({});
    });
  });
});
