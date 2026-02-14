import { TrendingDown, TrendingUp, MoveRight } from 'lucide-react';

export default function TrendBadge({
  value,
  previousValue,
}: {
  value?: number;
  previousValue?: number;
}) {
  const isNew = !previousValue && !!value;
  const isUp = previousValue && value && value > previousValue;
  const isDown = previousValue && value && value < previousValue;
  const trend =
    previousValue && value
      ? (((value - previousValue) / previousValue) * 100).toFixed(1) + ' %'
      : isNew
        ? 'New'
        : '0.0 %';

  return (
    <div
      className={`
        flex items-center justify-end gap-1
        ${isNew && 'bg-muted-500/10 text-muted-500'}
        ${isUp && 'bg-emerald-500/10 text-emerald-500'}
        ${isDown && 'bg-destructive/10 text-destructive'}
      `}
    >
      {isNew && <MoveRight size={14} />}
      {isUp && <TrendingUp size={14} />}
      {isDown && <TrendingDown size={14} />}
      {trend}
    </div>
  );
}
