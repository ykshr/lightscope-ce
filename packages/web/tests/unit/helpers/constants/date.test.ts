import { RELATIVE_OPTIONS, RELATIVE_OPTIONS_QUICK_ACCESS, DEFAULT_DATE_STRING } from '@/helpers/constants/date';
import { timezoneOffset as tOffset } from '@/helpers/date';
import { describe, expect, it } from 'vitest';

describe('date constants', () => {
  describe('RELATIVE_OPTIONS_QUICK_ACCESS', () => {
    it('should have the correct number of options', () => {
      expect(RELATIVE_OPTIONS_QUICK_ACCESS).toHaveLength(3);
    });

    it('should contain the expected labels', () => {
      const labels = RELATIVE_OPTIONS_QUICK_ACCESS.map(option => option.label);
      expect(labels).toEqual(['Today', 'This week', 'This month']);
    });

    it('should correctly format date strings with timezone offset', () => {
      expect(RELATIVE_OPTIONS_QUICK_ACCESS[0]).toEqual({
        label: 'Today',
        startDateString: `So0D${tOffset}`,
        endDateString: `So1D${tOffset}`,
      });
    });
  });

  describe('RELATIVE_OPTIONS', () => {
    it('should have the correct number of options', () => {
      expect(RELATIVE_OPTIONS).toHaveLength(11);
    });

    it('should contain specific predefined labels', () => {
      const labels = RELATIVE_OPTIONS.map(option => option.label);
      expect(labels).toContain('Past 12 hours');
      expect(labels).toContain('Past 24 hours');
      expect(labels).toContain('Today');
      expect(labels).toContain('Yesterday');
      expect(labels).toContain('This week');
      expect(labels).toContain('Last week');
      expect(labels).toContain('This month');
      expect(labels).toContain('Last month');
      expect(labels).toContain('This year');
      expect(labels).toContain('Past 7 days');
      expect(labels).toContain('Past 30 days');
    });

    it('should structure PT hours correctly without timezone in startDateString', () => {
      const past12Hours = RELATIVE_OPTIONS.find(o => o.label === 'Past 12 hours');
      expect(past12Hours?.startDateString).toBe('PT12H');
      expect(past12Hours?.endDateString).toBe(`So1D${tOffset}`);
    });

    it('should structure So days correctly with timezone', () => {
      const yesterday = RELATIVE_OPTIONS.find(o => o.label === 'Yesterday');
      expect(yesterday?.startDateString).toBe(`So-1D${tOffset}`);
      expect(yesterday?.endDateString).toBe(`So0D${tOffset}`);
    });
  });

  describe('DEFAULT_DATE_STRING', () => {
    it('should match the first option in RELATIVE_OPTIONS_QUICK_ACCESS', () => {
      expect(DEFAULT_DATE_STRING).toEqual({
        startDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].startDateString,
        endDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].endDateString,
      });
    });
  });
});
