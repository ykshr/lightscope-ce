import { useTotalViewsQuery } from '@/__generated__/graphql';
import StatCardLive from '@/components/cards/templates/StatCardLive';
import { getStartOfMinute, getStartOfNextMinute } from '@/helpers/date';
import { useUrlParams } from '@/hooks/useUrl';

export default function CardLiveViews({ lastMins = 5 }: { lastMins?: number }) {
  const now = new Date();
  const startDate = getStartOfMinute(new Date(now.getTime() - lastMins * 60 * 1000));
  const endDate = getStartOfNextMinute(now);

  const [urlParams] = useUrlParams();
  const { articleFilter } = urlParams;

  const { data, isLoading } = useTotalViewsQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const value = data?.trend?.total?.[0]?.value;

  return (
    <StatCardLive
      label="Realtime Visitors"
      value={value}
      isLoading={isLoading}
      description={`Users viewed in the last ${lastMins} minutes`}
    />
  );
}
