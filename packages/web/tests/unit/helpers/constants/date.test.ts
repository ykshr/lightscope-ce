import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DATE_STRING,
  RELATIVE_OPTIONS,
  RELATIVE_OPTIONS_QUICK_ACCESS,
} from '@/helpers/constants/date';

describe('date constants', () => {
  describe('DEFAULT_DATE_STRING', () => {
    it('should match the first option of RELATIVE_OPTIONS_QUICK_ACCESS', () => {
      expect(DEFAULT_DATE_STRING).toEqual({
        startDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].startDateString,
        endDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].endDateString,
      });
    });
  });

  describe('RELATIVE_OPTIONS_QUICK_ACCESS', () => {
    it('should be an array of date options', () => {
      expect(Array.isArray(RELATIVE_OPTIONS_QUICK_ACCESS)).toBe(true);
      expect(RELATIVE_OPTIONS_QUICK_ACCESS.length).toBeGreaterThan(0);

      RELATIVE_OPTIONS_QUICK_ACCESS.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('startDateString');
        expect(option).toHaveProperty('endDateString');
      });
    });
  });

  describe('RELATIVE_OPTIONS', () => {
    it('should be an array of date options', () => {
      expect(Array.isArray(RELATIVE_OPTIONS)).toBe(true);
      expect(RELATIVE_OPTIONS.length).toBeGreaterThan(0);

      RELATIVE_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('startDateString');
        expect(option).toHaveProperty('endDateString');
      });
    });
  });
});
