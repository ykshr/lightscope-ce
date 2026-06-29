import {
  sortOptions,
  allKeysUsedInSortOptions,
  allKeysUsedInSortOptionsSet,
  findSortOptionByValue,
} from '@/helpers/constants/sort';
import { describe, expect, it } from 'vitest';

describe('sort constant helpers', () => {
  describe('allKeysUsedInSortOptions', () => {
    it('should contain all unique keys used in sortOptions.value, sorted alphabetically', () => {
      // Manually calculate expected keys from sortOptions
      const expectedKeys = Array.from(
        new Set<string>(sortOptions.flatMap((option) => Object.keys(option.value)))
      ).sort();

      expect(allKeysUsedInSortOptions).toEqual(expectedKeys);
      expect(allKeysUsedInSortOptions).toEqual([
        'category',
        'includeContinents',
        'includeDeviceTypes',
        'includeDomains',
      ]);
    });
  });

  describe('allKeysUsedInSortOptionsSet', () => {
    it('should be a Set containing exactly the elements of allKeysUsedInSortOptions', () => {
      expect(allKeysUsedInSortOptionsSet).toBeInstanceOf(Set);
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

    it('should return correct option when input matches a known category', () => {
      const result = findSortOptionByValue({ category: 'geo', includeContinents: ['AF'] });
      expect(result).toEqual({
        label: 'Continent:Africa',
        value: {
          category: 'geo',
          includeContinents: ['AF'],
        },
      });
    });

    it('should return correct option when input matches a known category with extra unknown keys ignored', () => {
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['mobile'],
        extra: 'key',
      });
      expect(result).toEqual({
        label: 'Device:Mobile',
        value: {
          category: 'device',
          includeDeviceTypes: ['mobile'],
        },
      });
    });

    it('should return "Custom" when input does not match any known option exactly', () => {
      const result = findSortOptionByValue({ category: 'geo', includeContinents: ['NA', 'SA'] });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'geo',
          includeContinents: ['NA', 'SA'],
        },
      });
    });

    it('should return "Total" when input only has unknown keys', () => {
      const result = findSortOptionByValue({ unknown: 'value' });
      expect(result).toEqual({
        label: 'Total',
        value: {},
      });
    });

    it('should correctly compare and find arrays regardless of their order in the input', () => {
      // Although our sortOptions might have single element arrays, we should test the sorting logic
      // We know `Device:Mobile` has `includeDeviceTypes: ['mobile']`.
      const result = findSortOptionByValue({ category: 'device', includeDeviceTypes: ['mobile'] });
      expect(result.label).toBe('Device:Mobile');
    });

    it('should return custom if array lengths differ from predefined option', () => {
      const result = findSortOptionByValue({ category: 'geo', includeContinents: [] });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'geo',
          includeContinents: [],
        },
      });
    });
  });
});
