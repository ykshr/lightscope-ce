import { AggregationUnit } from '@/__generated__/graphql/resolvers';
import {
  getAggregationUnitWithInterval,
  getNextAvailableDate,
  getTableUnitWithDates,
} from '@/graphql/loaders/helpers/getCollectionUnitWithDates';
import { describe, expect, it } from 'vitest';

describe('getCollectionUnitWithDates', () => {
  describe('getAggregationUnitWithInterval', () => {
    it('returns Total when aggregation is not provided', () => {
      const result = getAggregationUnitWithInterval(new Date(), new Date(), undefined);
      expect(result).toEqual({ unit: AggregationUnit.Total, interval: 0 });
    });

    it('returns Total when aggregation unit is Total', () => {
      const result = getAggregationUnitWithInterval(new Date(), new Date(), {
        unit: AggregationUnit.Total,
      });
      expect(result).toEqual({ unit: AggregationUnit.Total, interval: 0 });
    });

    describe('Auto', () => {
      it('returns Minute with interval 5 for < 1 day', () => {
        const start = new Date('2023-01-01T00:00:00.000Z');
        const end = new Date('2023-01-01T23:59:00.000Z');
        const result = getAggregationUnitWithInterval(start, end, { unit: AggregationUnit.Auto });
        expect(result).toEqual({ unit: AggregationUnit.Minute, interval: 5 });
      });

      it('returns Hour with interval 1 for < 7 days', () => {
        const start = new Date('2023-01-01T00:00:00.000Z');
        const end = new Date('2023-01-07T23:59:00.000Z');
        const result = getAggregationUnitWithInterval(start, end, { unit: AggregationUnit.Auto });
        expect(result).toEqual({ unit: AggregationUnit.Hour, interval: 1 });
      });

      it('returns Day with interval 1 for < 365 days', () => {
        const start = new Date('2023-01-01T00:00:00.000Z');
        const end = new Date('2023-12-31T23:59:00.000Z');
        const result = getAggregationUnitWithInterval(start, end, { unit: AggregationUnit.Auto });
        expect(result).toEqual({ unit: AggregationUnit.Day, interval: 1 });
      });

      it('returns Month with interval 1 for >= 365 days', () => {
        const start = new Date('2023-01-01T00:00:00.000Z');
        const end = new Date('2024-01-01T00:00:00.000Z');
        const result = getAggregationUnitWithInterval(start, end, { unit: AggregationUnit.Auto });
        expect(result).toEqual({ unit: AggregationUnit.Month, interval: 1 });
      });
    });

    describe('Explicit Units without interval', () => {
      it('defaults Minute interval to 5', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Minute,
        });
        expect(result).toEqual({ unit: AggregationUnit.Minute, interval: 5 });
      });

      it('defaults Hour interval to 1', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Hour,
        });
        expect(result).toEqual({ unit: AggregationUnit.Hour, interval: 1 });
      });

      it('defaults Day interval to 1', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Day,
        });
        expect(result).toEqual({ unit: AggregationUnit.Day, interval: 1 });
      });

      it('defaults Month interval to 1', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Month,
        });
        expect(result).toEqual({ unit: AggregationUnit.Month, interval: 1 });
      });

      it('defaults Year interval to 1', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Year,
        });
        expect(result).toEqual({ unit: AggregationUnit.Year, interval: 1 });
      });

      it('defaults unknown explicit to Day with interval 1', () => {
        const result = getAggregationUnitWithInterval(new Date(), new Date(), {
          unit: AggregationUnit.Week,
        });
        expect(result).toEqual({ unit: AggregationUnit.Day, interval: 1 });
      });
    });

    it('respects provided interval', () => {
      const result = getAggregationUnitWithInterval(new Date(), new Date(), {
        unit: AggregationUnit.Hour,
        interval: 2,
      });
      expect(result).toEqual({ unit: AggregationUnit.Hour, interval: 2 });
    });
  });

  describe('getNextAvailableDate', () => {
    it('ignores seconds and milliseconds and rounds to the correct interval', () => {
      const date = new Date('2023-01-01T00:02:45.123Z');

      // unitIndex 2 is 'min' (interval 5)
      // isForward = true -> should round up from 00:02:00 to 00:05:00
      expect(getNextAvailableDate(date, 2, true)).toEqual(new Date('2023-01-01T00:05:00.000Z'));
      // isForward = false -> should round down from 00:02:00 to 00:00:00
      expect(getNextAvailableDate(date, 2, false)).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });

    it('returns the same time if the date lands exactly on the interval after ignoring seconds/milliseconds', () => {
      const date = new Date('2023-01-01T00:05:30.999Z');
      expect(getNextAvailableDate(date, 2, true)).toEqual(new Date('2023-01-01T00:05:00.000Z'));
      expect(getNextAvailableDate(date, 2, false)).toEqual(new Date('2023-01-01T00:05:00.000Z'));
    });
  });

  describe('getTableUnitWithDates', () => {
    it('splits correctly without aggregationUnit provided', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const end = new Date('2023-01-02T01:10:00.000Z');
      const result = getTableUnitWithDates(start, end);

      expect(result).toEqual([
        {
          unit: 'day',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-02T00:00:00.000Z'),
        },
        {
          unit: 'hour',
          startDate: new Date('2023-01-02T00:00:00.000Z'),
          endDate: new Date('2023-01-02T01:00:00.000Z'),
        },
        {
          unit: 'min',
          startDate: new Date('2023-01-02T01:00:00.000Z'),
          endDate: new Date('2023-01-02T01:10:00.000Z'),
        },
      ]);
    });

    it('ignores seconds and milliseconds when splitting intervals', () => {
      const start = new Date('2023-01-01T00:00:45.123Z'); // Effectively 00:00:00
      const end = new Date('2023-01-02T01:10:30.999Z'); // Effectively 01:10:00
      const result = getTableUnitWithDates(start, end);

      expect(result).toEqual([
        {
          unit: 'day',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-02T00:00:00.000Z'),
        },
        {
          unit: 'hour',
          startDate: new Date('2023-01-02T00:00:00.000Z'),
          endDate: new Date('2023-01-02T01:00:00.000Z'),
        },
        {
          unit: 'min',
          startDate: new Date('2023-01-02T01:00:00.000Z'),
          endDate: new Date('2023-01-02T01:10:00.000Z'),
        },
      ]);
    });

    it('splits correctly with aggregation unit Day', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const end = new Date('2023-01-03T00:00:00.000Z');
      const result = getTableUnitWithDates(start, end, AggregationUnit.Day);

      expect(result).toEqual([
        {
          unit: 'day',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-03T00:00:00.000Z'),
        },
      ]);
    });

    it('splits correctly with aggregation unit Hour', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const end = new Date('2023-01-01T02:30:00.000Z');
      const result = getTableUnitWithDates(start, end, AggregationUnit.Hour);

      expect(result).toEqual([
        {
          unit: 'hour',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-01T02:00:00.000Z'),
        },
        {
          unit: 'min',
          startDate: new Date('2023-01-01T02:00:00.000Z'),
          endDate: new Date('2023-01-01T02:30:00.000Z'),
        },
      ]);
    });

    it('returns empty array if start >= end', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const end = new Date('2023-01-01T00:00:00.000Z');
      const result = getTableUnitWithDates(start, end);

      expect(result).toEqual([]);
    });

    it('handles dates not perfectly aligned to intervals', () => {
      const start = new Date('2023-01-01T00:02:00.000Z');
      const end = new Date('2023-01-01T02:08:00.000Z');
      const result = getTableUnitWithDates(start, end);

      expect(result).toEqual([
        {
          unit: 'hour',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-01T02:00:00.000Z'),
        },
        {
          unit: 'min',
          startDate: new Date('2023-01-01T02:00:00.000Z'),
          endDate: new Date('2023-01-01T02:10:00.000Z'),
        },
      ]);
    });

    it('handles fallback aggregation to Day', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const end = new Date('2023-01-02T00:00:00.000Z');
      const result = getTableUnitWithDates(start, end, AggregationUnit.Week);

      expect(result).toEqual([
        {
          unit: 'day',
          startDate: new Date('2023-01-01T00:00:00.000Z'),
          endDate: new Date('2023-01-02T00:00:00.000Z'),
        },
      ]);
    });
  });
});
