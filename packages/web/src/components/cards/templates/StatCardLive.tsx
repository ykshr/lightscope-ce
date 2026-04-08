import { Spinner } from '@/components/common/Loading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export type Params = {
  label: string;
  value?: number;
  isLoading?: boolean;
  description?: string;
};

export default function StatCardLive({ label, value, isLoading, description }: Params) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight">
            {isLoading && <Spinner sizeByCharLength={3} />}
            {value}
            {!isLoading && !value && 'N/A'}
          </h3>
        </div>

        {/* LIVE indicator */}
        <div className="relative flex h-3 w-3 mt-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </div>
      </CardHeader>

      <CardContent className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-wider text-primary">LIVE</span>
        <span className="text-xs text-muted-foreground/60">{description}</span>
      </CardContent>
    </Card>
  );
}
