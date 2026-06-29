import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  convertDateString,
  formatDate,
  getPastDate,
  getPreviousDates,
  getStartOfDay,
  getStartOfMinute,
  getStartOfNextDay,
  getStartOfNextFiveMinutes,
  getStartOfNextMinute,
  getTimeBetween,
  timezoneOffset,
} from '@/helpers/date';

describe('date helpers', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(formatDate(date)).toBe('2023-01-01T12:00+00:00');
    });

    it('should format date with custom format', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2023/01/01');
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const start = getStartOfDay(date);
      expect(start.getFullYear()).toBe(2023);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
    });
  });

  describe('getStartOfNextDay', () => {
    it('should return start of next day', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const next = getStartOfNextDay(date);
      expect(next.getFullYear()).toBe(2023);
      expect(next.getMonth()).toBe(0);
      expect(next.getDate()).toBe(2);
      expect(next.getHours()).toBe(0);
    });
  });

  describe('getTimeBetween', () => {
    it('should calculate time difference', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T12:00:00Z');
      expect(getTimeBetween(start, end)).toBe(2 * 60 * 60 * 1000);
    });
  });

  describe('getPastDate', () => {
    it('should calculate past date', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const diff = 2 * 60 * 60 * 1000;
      const past = getPastDate(date, diff);
      expect(past.toISOString()).toBe('2023-01-01T10:00:00.000Z');
    });
  });

  describe('getStartOfMinute', () => {
    it('should return start of minute', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const start = getStartOfMinute(date);
      expect(start.getMinutes()).toBe(30);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe('getStartOfNextMinute', () => {
    it('should return start of next minute', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const next = getStartOfNextMinute(date);
      expect(next.getMinutes()).toBe(31);
      expect(next.getSeconds()).toBe(0);
    });
  });

  describe('getStartOfNextFiveMinutes', () => {
    it('should round to next 5 minutes', () => {
      const date = new Date('2023-01-01T12:31:45Z');
      const next = getStartOfNextFiveMinutes(date); // 31 + 1 = 32 -> ceil(32/5)*5 = 35
      expect(next.getMinutes()).toBe(35);
    });
  });

  describe('getPreviousDates', () => {
    it('should calculate previous dates for a standard duration (e.g., 1 day)', () => {
      const startDate = new Date('2023-01-02T12:00:00Z');
      const endDate = new Date('2023-01-03T12:00:00Z'); // 1 day later

      const result = getPreviousDates(startDate, endDate);

      // timeBetween = 1 day
      // startDatePrevious = 2023-01-02 - 1 day = 2023-01-01
      expect(result.startDatePrevious.toISOString()).toBe('2023-01-01T12:00:00.000Z');
      expect(result.endDatePrevious.toISOString()).toBe('2023-01-02T12:00:00.000Z');
    });

    it('should calculate previous dates for a longer duration (e.g., 1 week)', () => {
      const startDate = new Date('2023-01-10T00:00:00Z');
      const endDate = new Date('2023-01-17T00:00:00Z'); // 7 days later

      const result = getPreviousDates(startDate, endDate);

      expect(result.startDatePrevious.toISOString()).toBe('2023-01-03T00:00:00.000Z');
      expect(result.endDatePrevious.toISOString()).toBe('2023-01-10T00:00:00.000Z');
    });

    it('should handle identical start and end dates (zero duration)', () => {
      const date = new Date('2023-01-01T12:00:00Z');

      const result = getPreviousDates(date, date);

      expect(result.startDatePrevious.toISOString()).toBe('2023-01-01T12:00:00.000Z');
      expect(result.endDatePrevious.toISOString()).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should handle start date after end date (negative duration)', () => {
      const startDate = new Date('2023-01-02T12:00:00Z');
      const endDate = new Date('2023-01-01T12:00:00Z'); // 1 day earlier

      const result = getPreviousDates(startDate, endDate);

      // timeBetween = -1 day
      // startDatePrevious = 2023-01-02 - (-1 day) = 2023-01-03
      expect(result.startDatePrevious.toISOString()).toBe('2023-01-03T12:00:00.000Z');
      expect(result.endDatePrevious.toISOString()).toBe('2023-01-02T12:00:00.000Z');
    });
  });

  describe('convertDateString', () => {
    it('should return date object if input is Date', () => {
      const date = new Date();
      expect(convertDateString(date)).toBe(date);
    });

    it('should parse So format (So-1D)', () => {
      const date = convertDateString('So-1D');
      const expected = dayjs().utc().add(-1, 'day').startOf('day').toDate();
      // Allow small difference due to execution time
      expect(date.getTime()).toBeCloseTo(expected.getTime(), -2); // Check roughly
    });

    it('should parse So format with timezone offset (So-1D+09:00)', () => {
      const date = convertDateString('So-1D+09:00');
      const expected = dayjs().utcOffset('+09:00').add(-1, 'day').startOf('day').toDate();
      // Allow small difference due to execution time
      expect(date.getTime()).toBeCloseTo(expected.getTime(), -2); // Check roughly
    });

    it('should parse So format with timezone offset (So+1D+09:00)', () => {
      const date = convertDateString('So+1D+09:00');
      const expected = dayjs().utcOffset('+09:00').add(1, 'day').startOf('day').toDate();
      expect(date.getTime()).toBeCloseTo(expected.getTime(), -2);
    });

    it('should parse ISO duration (P1D)', () => {
      // Mock Date.now to have consistent test
      const now = 1672531200000; // 2023-01-01T00:00:00Z
      const originalDateNow = Date.now;
      Date.now = () => now;

      try {
        const date = convertDateString('P1D'); // 1 day ago
        expect(date.getTime()).toBe(now - 24 * 60 * 60 * 1000);
      } finally {
        Date.now = originalDateNow;
      }
    });

    it('should parse standard date string', () => {
      const dateStr = '2023-01-01';
      const date = convertDateString(dateStr);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // Jan
      expect(date.getDate()).toBe(1);
    });
  });

  describe('timezoneOffset', () => {
    it('should return a valid timezone offset string', () => {
      expect(timezoneOffset).toMatch(/^[+-]\d{2}:\d{2}$/);
      expect(timezoneOffset).toBe(dayjs().format('Z'));
    });
  });
});
