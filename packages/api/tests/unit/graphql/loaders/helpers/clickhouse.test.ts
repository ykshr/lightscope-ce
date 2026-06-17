import { formatData, formatToDateTime } from '@/graphql/loaders/helpers/clickhouse';
import { describe, expect, it } from 'vitest';

describe('formatData', () => {
  it('should format nested objects correctly', () => {
    const data = [
      {
        id: 1,
        nested_obj: {
          nested_key: 'value'
        }
      },
      [
        { array_item: 1 }
      ],
      new Date(),
      null,
      'primitive_string'
    ];

    const result = formatData(data, ['createdAt']);

    expect(result[0]).toEqual(
      {
        id: 1,
        nestedObj: {
          nestedKey: 'value'
        }
      }
    );
    expect(result[1]).toEqual([{ arrayItem: 1 }]);
    expect(result[2]).toBeInstanceOf(Date);
    expect(result[3]).toBeNull();
    expect(result[4]).toEqual('primitive_string');
  });

  it('should rename keys from snake_case to camelCase and format dates', () => {
    const data = [
      {
        id: 1,
        created_at: '2023-01-01 12:34:56',
        updated_at: '2023-01-02 12:34:56',
        user_name: 'John Doe',
      },
    ];

    const result = formatData(data, ['createdAt', 'updatedAt']);

    expect(result).toEqual([
      {
        id: 1,
        createdAt: '2023-01-01T12:34:56Z',
        updatedAt: '2023-01-02T12:34:56Z',
        userName: 'John Doe',
      },
    ]);
  });

  it('should format data without dateKeys correctly', () => {
    const data = [
      {
        id: 1,
        user_name: 'John Doe',
      },
    ];

    const result = formatData(data);

    expect(result).toEqual([
      {
        id: 1,
        userName: 'John Doe',
      },
    ]);
  });
});

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

  it('should handle dates with zero milliseconds', () => {
    const date = new Date('2023-01-01T12:34:56.000Z');
    expect(formatToDateTime(date)).toBe('2023-01-01 12:34:56');
  });

  it('should handle dates with one millisecond', () => {
    const date = new Date('2023-01-01T12:34:56.001Z');
    expect(formatToDateTime(date)).toBe('2023-01-01 12:34:56');
  });

  it('should throw RangeError for invalid dates', () => {
    const date = new Date('invalid');
    expect(() => formatToDateTime(date)).toThrow(RangeError);
  });
});
