import { describe, it, expect } from 'vitest';
import { getAggregationUnit } from './getCollectionUnitWithDates';
import { AggregationUnit } from '@/__generated__/graphql-resolvers';

describe('getAggregationUnit', () => {
  it('returns Minute for <= 1 day difference', () => {
    const start = new Date('2023-01-01T00:00:00.000Z');

    // Exactly 1 day
    expect(getAggregationUnit(start, new Date('2023-01-02T00:00:00.000Z'))).toBe(
      AggregationUnit.Minute
    );

    // Half a day
    expect(getAggregationUnit(start, new Date('2023-01-01T12:00:00.000Z'))).toBe(
      AggregationUnit.Minute
    );

    // Same time
    expect(getAggregationUnit(start, start)).toBe(AggregationUnit.Minute);

    // Negative difference (end before start) should theoretically also fall under <= 1
    expect(getAggregationUnit(new Date('2023-01-02T00:00:00.000Z'), start)).toBe(
      AggregationUnit.Minute
    );
  });

  it('returns Hour for <= 7 days difference (> 1 day)', () => {
    const start = new Date('2023-01-01T00:00:00.000Z');

    // Exactly 1 day + 1 ms
    expect(getAggregationUnit(start, new Date('2023-01-02T00:00:00.001Z'))).toBe(
      AggregationUnit.Hour
    );

    // Exactly 7 days
    expect(getAggregationUnit(start, new Date('2023-01-08T00:00:00.000Z'))).toBe(
      AggregationUnit.Hour
    );
  });

  it('returns Day for > 7 days difference', () => {
    const start = new Date('2023-01-01T00:00:00.000Z');

    // Exactly 7 days + 1 ms
    expect(getAggregationUnit(start, new Date('2023-01-08T00:00:00.001Z'))).toBe(
      AggregationUnit.Day
    );

    // 30 days
    expect(getAggregationUnit(start, new Date('2023-01-31T00:00:00.000Z'))).toBe(
      AggregationUnit.Day
    );
  });
});
