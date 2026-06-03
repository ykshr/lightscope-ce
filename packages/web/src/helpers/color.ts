const DEFAULT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function getColorForIndex(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function getColorsForCount(count: number): string[] {
  return Array.from({ length: count }, (_, index) => getColorForIndex(index));
}
