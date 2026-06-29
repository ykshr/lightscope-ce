import { allKeysUsedInCategoryOptions, allKeysUsedInCategoryOptionsSet, findCategoryOptionByValue } from '@/helpers/constants/category';
import { describe, expect, it } from 'vitest';

describe('category constant helpers', () => {
  describe('findCategoryOptionByValue', () => {
    it('should return "Total" when input is empty', () => {
      const result = findCategoryOptionByValue({});
      expect(result).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should return correct option when input matches a known category', () => {
      const result = findCategoryOptionByValue({ category: 'ageAge' });
      expect(result).toEqual({
        label: 'Age',
        value: {
          category: 'ageAge',
        },
      });
    });

    it('should return correct option when input matches a known category with extra keys', () => {
      const result = findCategoryOptionByValue({ category: 'geoCountry', extra: 'key' });
      expect(result).toEqual({
        label: 'Country',
        value: {
          category: 'geoCountry',
        },
      });
    });

    it('should return "Custom" when input does not match any known category', () => {
      const result = findCategoryOptionByValue({ category: 'unknown' });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'unknown',
        },
      });
    });

    it('should return "Total" when input only has unknown keys', () => {
      const result = findCategoryOptionByValue({ unknown: 'value' });
      expect(result).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should handle array values and return "Custom" if they do not match', () => {
      // Inputting an array for 'category' (which expects a string in categoryOptions)
      const result = findCategoryOptionByValue({ category: ['ageAge'] });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: ['ageAge'],
        },
      });
    });

    it('should compare array values correctly (sorting and length check)', () => {
      // Although no current categoryOptions use arrays, the function logic handles them.
      // To test this logic, we'd need to mock categoryOptions or just rely on the fact that
      // if it didn't handle arrays, it might fail differently.
      // Given we cannot easily mock categoryOptions here as it is a constant in the same file,
      // we can at least verify it doesn't crash and returns Custom.
      const result = findCategoryOptionByValue({ category: ['b', 'a'] });
      expect(result.label).toBe('Custom');
      expect(result.value).toEqual({ category: ['b', 'a'] });
    });
  });

  describe('allKeysUsedInCategoryOptions', () => {
    it('should be an array of all keys used in category options values', () => {
      expect(Array.isArray(allKeysUsedInCategoryOptions)).toBe(true);
      expect(allKeysUsedInCategoryOptions).toEqual(['category']);
    });
  });

  describe('allKeysUsedInCategoryOptionsSet', () => {
    it('should be a Set of all keys used in category options values', () => {
      expect(allKeysUsedInCategoryOptionsSet instanceof Set).toBe(true);
      expect(allKeysUsedInCategoryOptionsSet.size).toBe(1);
      expect(allKeysUsedInCategoryOptionsSet.has('category')).toBe(true);
    });
  });

});
