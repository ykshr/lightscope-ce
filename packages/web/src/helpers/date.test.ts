import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  formatDate,
  getStartOfDay,
  getStartOfNextDay,
  getTimeBetween,
  getPastDate,
  getStartOfMinute,
  getStartOfNextMinute,
  getStartOfNextFiveMinutes,
  convertDateString,
} from './date';

describe('date helpers', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(formatDate(date)).toBe('2023-01-01T12:00Z');
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

  describe('convertDateString', () => {
    it('should return date object if input is Date', () => {
      const date = new Date();
      expect(convertDateString(date)).toBe(date);
    });

    it('should parse So format (So-1D)', () => {
      const date = convertDateString('So-1D');
      // dayjs().add(-1, 'day').startOf('day')
      const expected = dayjs().add(-1, 'day').startOf('day').toDate();
      // Allow small difference due to execution time
      expect(date.getTime()).toBeCloseTo(expected.getTime(), -2); // Check roughly
      // Actually startOf('day') sets time to 00:00:00, so it should be exact if local time matches
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
});
