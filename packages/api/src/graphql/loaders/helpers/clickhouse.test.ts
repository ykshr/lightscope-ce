import { formatToDateTime } from '@/graphql/loaders/helpers/clickhouse';
import { describe, expect, it } from 'vitest';

describe('formatToDateTime', () => {
  it('should format a regular date correctly', () => {
    const date = new Date('2023-01-01T12:34:56.789Z');
    expect(formatToDateTime(date)).toBe('2023-01-01 12:34:56');
  });

  it('should handle the start of the year', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(formatToDateTime(date)).toBe('2024-01-01 00:00:00');
  });

  it('should handle the end of the year', () => {
    const date = new Date('2023-12-31T23:59:59.999Z');
    expect(formatToDateTime(date)).toBe('2023-12-31 23:59:59');
  });

  it('should handle leap years (Feb 29)', () => {
    const date = new Date('2024-02-29T12:00:00.000Z');
    expect(formatToDateTime(date)).toBe('2024-02-29 12:00:00');
  });

  it('should handle dates with single digit month and day', () => {
    const date = new Date('2023-05-05T05:05:05.000Z');
    expect(formatToDateTime(date)).toBe('2023-05-05 05:05:05');
  });
});
