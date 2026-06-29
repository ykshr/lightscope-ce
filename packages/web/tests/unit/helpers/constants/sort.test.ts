import {
  sortOptions,
  allKeysUsedInSortOptions,
  allKeysUsedInSortOptionsSet,
  findSortOptionByValue,
} from '@/helpers/constants/sort';
import { describe, expect, it } from 'vitest';

describe('sort constant helpers', () => {
  describe('sortOptions', () => {
    it('should be an array of options with label and value', () => {
      expect(Array.isArray(sortOptions)).toBe(true);
      expect(sortOptions.length).toBeGreaterThan(0);

      for (const option of sortOptions) {
        expect(option).toHaveProperty('label');
        expect(typeof option.label).toBe('string');
        expect(option).toHaveProperty('value');
        expect(typeof option.value).toBe('object');
      }
    });

    it('should contain the Total option as the first element', () => {
      expect(sortOptions[0]).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should contain expected specific options', () => {
      const options = sortOptions.map((o) => o.label);
      expect(options).toContain('Continent:Africa');
      expect(options).toContain('Device:Mobile');
      expect(options).toContain('Referrer:Direct');
    });

    it('should have correct structural integrity for geo category', () => {
      const geoOptions = sortOptions.filter(
        (o) => o.value && (o.value as Record<string, unknown>).category === 'geo'
      );
      expect(geoOptions.length).toBe(7); // Africa, Antarctica, Asia, Europe, North America, Oceania, South America

      for (const option of geoOptions) {
        const val = option.value as Record<string, unknown>;
        expect(val).toHaveProperty('includeContinents');
        expect(Array.isArray(val.includeContinents)).toBe(true);
        expect((val.includeContinents as string[]).length).toBe(1);
      }
    });
  });

  describe('allKeysUsedInSortOptions', () => {
    it('should contain all keys used in sortOptions values', () => {
      expect(allKeysUsedInSortOptions).toContain('category');
      expect(allKeysUsedInSortOptions).toContain('includeContinents');
      expect(allKeysUsedInSortOptions).toContain('includeDomains');
      expect(allKeysUsedInSortOptions).toContain('includeDeviceTypes');
    });

    it('should be sorted', () => {
      const sortedKeys = [...allKeysUsedInSortOptions].sort();
      expect(allKeysUsedInSortOptions).toEqual(sortedKeys);
    });
  });

  describe('allKeysUsedInSortOptionsSet', () => {
    it('should be a Set containing the same elements as allKeysUsedInSortOptions', () => {
      expect(allKeysUsedInSortOptionsSet instanceof Set).toBe(true);
      expect(allKeysUsedInSortOptionsSet.size).toBe(allKeysUsedInSortOptions.length);
      for (const key of allKeysUsedInSortOptions) {
        expect(allKeysUsedInSortOptionsSet.has(key)).toBe(true);
      }
    });
  });

  describe('findSortOptionByValue', () => {
    it('should return "Total" when input is empty', () => {
      const result = findSortOptionByValue({});
      expect(result).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should return correct option when input matches a known sort option', () => {
      const result = findSortOptionByValue({
        category: 'geo',
        includeContinents: ['AF'],
      });
      expect(result).toEqual({
        label: 'Continent:Africa',
        value: {
          category: 'geo',
          includeContinents: ['AF'],
        },
      });
    });

    it('should return correct option when input matches a known sort option with extra unknown keys', () => {
      const result = findSortOptionByValue({
        category: 'geo',
        includeContinents: ['AF'],
        extraKey: 'should-be-ignored',
      });
      expect(result).toEqual({
        label: 'Continent:Africa',
        value: {
          category: 'geo',
          includeContinents: ['AF'],
        },
      });
    });

    it('should return "Custom" when input does not match any known option', () => {
      const result = findSortOptionByValue({
        category: 'geo',
        includeContinents: ['XX'], // Unknown continent code
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'geo',
          includeContinents: ['XX'],
        },
      });
    });

    it('should return "Total" when input only has unknown keys', () => {
      const result = findSortOptionByValue({
        unknownKey1: 'value1',
        unknownKey2: ['value2'],
      });
      expect(result).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should handle array values order independently', () => {
      const result = findSortOptionByValue({
        category: 'geo',
        includeContinents: ['AF', 'EU'],
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'geo',
          includeContinents: ['AF', 'EU'],
        },
      });
    });

    it('should handle different array lengths correctly and return Custom', () => {
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['mobile', 'desktop'],
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'device',
          includeDeviceTypes: ['mobile', 'desktop'],
        },
      });
    });

    it('should correctly handle different array lengths without sorting if not needed', () => {
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['mobile', 'tablet'],
      });
      expect(result.label).toEqual('Custom');
      expect(result.value).toEqual({
        category: 'device',
        includeDeviceTypes: ['mobile', 'tablet'],
      });
    });
  });
});
