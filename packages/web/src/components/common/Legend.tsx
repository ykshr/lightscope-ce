import { getColorForIndex } from '@/helpers/color';

interface LegendItems {
  id: string; // data key (e.g., 'thisWeek')
  label: string; // display name (e.g., 'This Week')
  value?: number; // total value for legend
  pct?: number; // percentage for legend
  color?: string; // optional specific color
}

export default function LegendItems({
  legendItems,
  isLoading,
}: {
  legendItems: LegendItems[];
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {legendItems.map((item, index) => (
        <LegendItem
          key={item.id}
          isLoading={isLoading}
          label={item.label}
          value={item.value}
          pct={item.pct}
          color={item.color || getColorForIndex(index)}
        />
      ))}
    </div>
  );
}

export function LegendItem({
  color,
  label,
  value,
  pct,
  isLoading,
}: {
  color: string;
  label: string;
  value?: number;
  pct?: number;
  isLoading?: boolean;
}) {
  const valueLabel = (() => {
    if (value !== undefined && pct !== undefined)
      return `${value.toLocaleString()} (${(pct * 100).toFixed(2)}%)`;
    if (value !== undefined) return `${value.toLocaleString()}`;
    if (pct !== undefined) return `${(pct * 100).toFixed(2)}%`;
    return null;
  })();

  return (
    <div className="flex items-center justify-between">
      {!isLoading && (
        <>
          <div className="flex items-center gap-2 mr-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          {valueLabel && (
            <span className="text-sm text-muted-foreground">{valueLabel}</span>
          )}
        </>
      )}
    </div>
  );
}
