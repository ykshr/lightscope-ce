import { useTotalEngagementTimeQuery } from '@/__generated__/graphql';
import StatCardTrend from '@/components/cards/templates/StatCardTrend';
import { getPreviousDates } from '@/helpers/date';
import { useUrlParams } from '@/hooks/useUrl';
import { Timer } from 'lucide-react';

export default function CardEngagementTime() {
  const [urlParams] = useUrlParams();
  const { startDate, endDate, articleFilter } = urlParams;

  const { startDatePrevious, endDatePrevious } = getPreviousDates(startDate, endDate);

  const { data, isLoading } = useTotalEngagementTimeQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const { data: dataPrevious, isLoading: isLoadingPrevious } = useTotalEngagementTimeQuery({
    startDate: startDatePrevious,
    endDate: endDatePrevious,
    articleFilter,
  });

  const value = data?.trend?.total?.[0]?.value;
  const valuePrevious = dataPrevious?.trend?.total?.[0]?.value;

  return (
    <StatCardTrend
      label="Avg. Engagement Time"
      value={value}
      valuePrevious={valuePrevious}
      isLoading={isLoading}
      isLoadingPrevious={isLoadingPrevious}
      icon={Timer}
    />
  );
}
