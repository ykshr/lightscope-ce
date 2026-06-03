import { timezoneOffset as tOffset } from '@/helpers/date';

export const RELATIVE_OPTIONS_QUICK_ACCESS = [
  {
    label: 'Today',
    startDateString: `So0D${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'This week',
    startDateString: `So0W${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'This month',
    startDateString: `So0M${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
];

export const RELATIVE_OPTIONS = [
  { label: 'Past 12 hours', startDateString: 'PT12H', endDateString: `So1D${tOffset}` },
  { label: 'Past 24 hours', startDateString: 'PT24H', endDateString: `So1D${tOffset}` },
  {
    label: 'Today',
    startDateString: `So0D${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'Yesterday',
    startDateString: `So-1D${tOffset}`,
    endDateString: `So0D${tOffset}`,
  },
  {
    label: 'This week',
    startDateString: `So0W${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'Last week',
    startDateString: `So-1W${tOffset}`,
    endDateString: `So0W${tOffset}`,
  },
  {
    label: 'This month',
    startDateString: `So0M${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'Last month',
    startDateString: `So-1M${tOffset}`,
    endDateString: `So0M${tOffset}`,
  },
  {
    label: 'This year',
    startDateString: `So0Y${tOffset}`,
    endDateString: `So0M${tOffset}`,
  },
  {
    label: 'Past 7 days',
    startDateString: `So-7D${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
  {
    label: 'Past 30 days',
    startDateString: `So-30D${tOffset}`,
    endDateString: `So1D${tOffset}`,
  },
];

export const DEFAULT_DATE_STRING = {
  startDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].startDateString,
  endDateString: RELATIVE_OPTIONS_QUICK_ACCESS[0].endDateString,
};
