import dayjs, { type ManipulateType } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(duration);

export const timezoneOffset = dayjs().format('Z');

export function formatDate(date: Date, formatStr: string = 'YYYY-MM-DDTHH:mmZ'): string {
  return dayjs(date).format(formatStr);
}

export function getStartOfDay(date: Date, offset: number = 0, interval: number = 1): Date {
  const days = date.getDate() - offset;
  const roundedDays = Math.floor(days / interval) * interval;
  return new Date(date.getFullYear(), date.getMonth(), roundedDays);
}

export function getStartOfNextDay(date: Date, offset: number = 1, interval: number = 1): Date {
  const days = date.getDate() + offset;
  const roundedDays = Math.ceil(days / interval) * interval;
  return new Date(date.getFullYear(), date.getMonth(), roundedDays);
}

export function getTimeBetween(startDate: Date, endDate: Date): number {
  return endDate.getTime() - startDate.getTime();
}

export function getPastDate(date: Date, timeBetween: number): Date {
  return new Date(date.getTime() - timeBetween);
}

export function getStartOfMinute(date: Date, offset: number = 0, interval: number = 1): Date {
  const minutes = date.getMinutes() - offset;
  const roundedMinutes = Math.floor(minutes / interval) * interval;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes
  );
}

export function getStartOfNextMinute(date: Date, offset: number = 1, interval: number = 1): Date {
  const minutes = date.getMinutes() + offset;
  const roundedMinutes = Math.ceil(minutes / interval) * interval;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes
  );
}

export function getStartOfNextFiveMinutes(date: Date, offset: number = 1): Date {
  return getStartOfNextMinute(date, offset, 5);
}

export function getPreviousDates(
  startDate: Date,
  endDate: Date
): { startDatePrevious: Date; endDatePrevious: Date } {
  const timeBetween = getTimeBetween(startDate, endDate);
  const startDatePrevious = getPastDate(startDate, timeBetween);
  return { startDatePrevious, endDatePrevious: startDate };
}

export function convertDateString(date: Date | string): Date {
  // Return if already a Date object
  if (date instanceof Date) {
    return date;
  }

  // Valid units: Y (year), M (month), W (week), D (day), h (hour), m (minute)
  const soMatch = date.match(/^So([+-]?\d+)([YMWDhm])([+-]\d{2}:\d{2}|Z)?$/);

  if (soMatch) {
    const value = parseInt(soMatch[1], 10);
    const unitChar = soMatch[2];
    const offset = soMatch[3];

    const unitMap: Record<string, ManipulateType> = {
      Y: 'year',
      M: 'month',
      W: 'week',
      D: 'day',
      h: 'hour',
      m: 'minute',
    };

    const unit = unitMap[unitChar];
    if (!unit) throw new Error('Invalid unit in So format');

    let d = dayjs();
    if (offset) {
      d = d.utcOffset(offset === 'Z' ? 0 : offset);
    }

    // Calculate the date based on the current date and the relative offset
    return d.add(value, unit).startOf(unit).toDate();
  }

  // ISO 8601 Duration format (e.g., P1D, PT24H)
  if (date.startsWith('P')) {
    const duration = dayjs.duration(date);
    const ms = duration.asMilliseconds();
    if (isNaN(ms)) throw new Error('Invalid duration format');
    return new Date(Date.now() - ms);
  }

  // Convert regular ISO8601 or other date strings to Date object
  const parsed = dayjs(date);
  if (!parsed.isValid()) throw new Error('Invalid date format');

  return parsed.toDate();
}
