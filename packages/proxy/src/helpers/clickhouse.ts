export const formatToDateTime = (date: Date) =>
  date.toISOString().split('.')[0].replace('T', ' ').replace('Z', '');
