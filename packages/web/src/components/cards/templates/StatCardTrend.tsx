import { Spinner } from '@/components/common/Loading';
import TrendBadge from '@/components/common/TrendBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export type ParamsTrend = {
  label: string;
  value?: number;
  isLoading: boolean;
  showPrevious?: boolean;
  valuePrevious?: number;
  isLoadingPrevious?: boolean;
  icon: React.ComponentType<{ size?: number }>;
};

export default function StatCardTrend({
  label,
  value,
  isLoading,
  showPrevious = false,
  valuePrevious,
  isLoadingPrevious,
  icon: Icon,
}: ParamsTrend) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight">
            {isLoading && value == null && <Spinner sizeByCharLength={3} />}
            {!isLoading && !value ? 'N/A' : value}
          </h3>
        </div>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon size={20} />
        </div>
      </CardHeader>

      {showPrevious && (
        <CardContent>
          <div className="flex items-center gap-2">
            {isLoadingPrevious && valuePrevious == null && <Spinner sizeByCharLength={3} />}
            {!isLoadingPrevious && <TrendBadge value={value} previousValue={valuePrevious} />}
            <span className="text-xs text-muted-foreground/60">vs last period</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
