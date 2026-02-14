const DEFAULT_COLORS = [
  'var(--chart-blue-1)',
  'var(--chart-blue-2)',
  'var(--chart-blue-3)',
  'var(--chart-blue-4)',
  'var(--chart-blue-5)',
];

export function getColorForIndex(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function getColorsForCount(count: number): string[] {
  return Array.from({ length: count }, (_, index) => getColorForIndex(index));
}
