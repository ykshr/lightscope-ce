import { Aggregation, AggregationUnit } from '@/__generated__/graphql/resolvers';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs/plugin/utc';

dayjs.extend(dayjsPluginUTC);

const ClickhouseTableUnits = ['day', 'hour', 'min'] as const;
type ClickhouseTableUnit = (typeof ClickhouseTableUnits)[number];

interface AggregationOption {
  unit: AggregationUnit;
  interval: number;
  mins: number; // 分換算した値
}

const AGGREGATION_OPTIONS: AggregationOption[] = [
  { unit: AggregationUnit.Minute, interval: 1, mins: 1 },
  { unit: AggregationUnit.Minute, interval: 5, mins: 5 },
  { unit: AggregationUnit.Minute, interval: 15, mins: 15 },
  { unit: AggregationUnit.Minute, interval: 30, mins: 30 },
  { unit: AggregationUnit.Hour, interval: 1, mins: 60 },
  { unit: AggregationUnit.Hour, interval: 4, mins: 240 },
  { unit: AggregationUnit.Hour, interval: 12, mins: 720 },
  { unit: AggregationUnit.Day, interval: 1, mins: 1440 },
  { unit: AggregationUnit.Day, interval: 7, mins: 10080 }, // 1 week
  { unit: AggregationUnit.Month, interval: 1, mins: 43200 }, // 1 month
];

function getDynamicAggregation(startDate: Date, endDate: Date, targetPoints = 200) {
  const totalMins = (endDate.getTime() - startDate.getTime()) / 1000 / 60;
  const minIntervalMins = 5;

  const idealMinsPerPoint = totalMins / targetPoints;
  let selected = AGGREGATION_OPTIONS.find((opt) => opt.mins >= idealMinsPerPoint);

  if (!selected) {
    selected = AGGREGATION_OPTIONS[AGGREGATION_OPTIONS.length - 1];
  }

  if (selected.mins < minIntervalMins) {
    return { unit: AggregationUnit.Minute, interval: 5 };
  }

  return {
    unit: selected.unit,
    interval: selected.interval,
  };
}

export function getAggregationUnitWithInterval(
  startDate: Date,
  endDate: Date,
  aggregation?: Aggregation | null
): { unit: AggregationUnit; interval: number } {
  if (!aggregation || aggregation.unit === AggregationUnit.Total)
    return { unit: AggregationUnit.Total, interval: 0 };
  if (aggregation.unit === AggregationUnit.Auto) {
    return getDynamicAggregation(startDate, endDate);
  }
  if (!aggregation.interval) {
    switch (aggregation.unit) {
      case AggregationUnit.Minute:
        return { unit: AggregationUnit.Minute, interval: 5 };
      case AggregationUnit.Hour:
        return { unit: AggregationUnit.Hour, interval: 1 };
      case AggregationUnit.Day:
        return { unit: AggregationUnit.Day, interval: 1 };
      case AggregationUnit.Month:
        return { unit: AggregationUnit.Month, interval: 1 };
      case AggregationUnit.Year:
        return { unit: AggregationUnit.Year, interval: 1 };
      default:
        return { unit: AggregationUnit.Day, interval: 1 };
    }
  }
  return { unit: aggregation.unit, interval: aggregation.interval };
}

type TableUnitWithDates = {
  unit: ClickhouseTableUnit;
  startDate: Date;
  endDate: Date;
};

type DayjsUnit = 'day' | 'hour' | 'minute';
const TableDataInterval: {
  [key in ClickhouseTableUnit]: {
    unit: DayjsUnit;
    interval: number;
  };
} = {
  day: { unit: 'day', interval: 1 },
  hour: { unit: 'hour', interval: 1 },
  min: { unit: 'minute', interval: 5 },
};

export const getNextAvailableDate = (
  date: Date,
  unitIndex: number,
  isForward: boolean = true
): Date => {
  // Lens collections only have data with minute or larger units, so ignore seconds and milliseconds
  const dateToUse = new Date(date);
  dateToUse.setSeconds(0, 0);

  const { unit = 'minute', interval = 5 } =
    TableDataInterval[ClickhouseTableUnits[unitIndex]] || {};
  const dayjsUTC = dayjs(dateToUse).utc();

  const mod = dayjsUTC.get(unit) % interval;

  const minimumUnit = TableDataInterval[ClickhouseTableUnits[ClickhouseTableUnits.length - 1]].unit;
  if (mod === 0 && dayjsUTC.diff(dayjsUTC.startOf(unit), minimumUnit) === 0) return dateToUse;

  return isForward
    ? dayjsUTC
        .add(interval - mod, unit)
        .startOf(unit)
        .toDate()
    : dayjsUTC.subtract(mod, unit).startOf(unit).toDate();
};

function findUnitAndDate(
  startDate: Date,
  endDate: Date,
  unitIndex: number = 0
): TableUnitWithDates[] {
  if (!(unitIndex < ClickhouseTableUnits.length)) return [];

  const startDateNext = getNextAvailableDate(startDate, unitIndex, true);
  const endDateNext = getNextAvailableDate(endDate, unitIndex, false);
  if (startDateNext < endDateNext) {
    const mid =
      startDateNext < endDateNext
        ? [
            {
              unit: ClickhouseTableUnits[unitIndex],
              startDate: startDateNext,
              endDate: endDateNext,
            },
          ]
        : [];
    const left =
      startDate < startDateNext ? findUnitAndDate(startDate, startDateNext, unitIndex + 1) : [];
    const right = endDateNext < endDate ? findUnitAndDate(endDateNext, endDate, unitIndex + 1) : [];

    return [...mid, ...left, ...right];
  }

  return findUnitAndDate(startDate, endDate, unitIndex + 1);
}

function mapAggregationUnitToClickhouseUnit(
  aggregationUnit: AggregationUnit
): ClickhouseTableUnit | null {
  switch (aggregationUnit) {
    case AggregationUnit.Day:
      return 'day';
    case AggregationUnit.Hour:
      return 'hour';
    case AggregationUnit.Minute:
      return 'min';
    default:
      return 'day';
  }
}

export function getTableUnitWithDates(
  startDate: Date,
  endDate: Date,
  aggregationUnit?: AggregationUnit
): TableUnitWithDates[] {
  const startDateRound = getNextAvailableDate(startDate, ClickhouseTableUnits.length - 1, false);
  const endDateRound = getNextAvailableDate(endDate, ClickhouseTableUnits.length - 1, true);

  const startUnit = aggregationUnit
    ? mapAggregationUnitToClickhouseUnit(aggregationUnit)!
    : ClickhouseTableUnits[0];
  const startUnitIndex = ClickhouseTableUnits.indexOf(startUnit);
  const collections = findUnitAndDate(startDateRound, endDateRound, startUnitIndex);
  return collections;
}
