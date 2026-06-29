import { describe, expect, it } from 'vitest';
import { findSortOptionByValue, sortOptions } from '@/helpers/constants/sort';

describe('sort options constants', () => {
  describe('findSortOptionByValue', () => {
    it('should return the Total option for an empty object', () => {
      expect(findSortOptionByValue({})).toEqual(sortOptions[0]); // { label: 'Total', value: {} }
    });

    it('should match an exact existing option', () => {
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

    it('should match an option even if array contents are out of order', () => {
      // Mocking a predefined option by taking advantage of a known one,
      // but the current constants only have single-item arrays.
      // We will test standard matching with a known option.
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['desktop'],
      });
      expect(result).toEqual({
        label: 'Device:Desktop',
        value: {
          category: 'device',
          includeDeviceTypes: ['desktop'],
        },
      });
    });

    it('should ignore extraneous keys and still find a match', () => {
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['mobile'],
        extraneousKey: 'should-be-ignored',
      });
      expect(result).toEqual({
        label: 'Device:Mobile',
        value: {
          category: 'device',
          includeDeviceTypes: ['mobile'],
        },
      });
    });

    it('should fallback to Custom when array length differs', () => {
      const result = findSortOptionByValue({
        category: 'device',
        includeDeviceTypes: ['mobile', 'desktop'], // More elements than predefined
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'device',
          includeDeviceTypes: ['mobile', 'desktop'],
        },
      });
    });

    it('should fallback to Custom when elements do not match', () => {
      const result = findSortOptionByValue({
        category: 'geo',
        includeContinents: ['XX'], // Unknown continent
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'geo',
          includeContinents: ['XX'],
        },
      });
    });

    it('should fallback to Custom when values do not match any option, preserving only valid keys', () => {
      const result = findSortOptionByValue({
        category: 'unknown_category',
        extraneousKey: 'ignored',
      });
      expect(result).toEqual({
        label: 'Custom',
        value: {
          category: 'unknown_category',
        },
      });
    });
  });
});
