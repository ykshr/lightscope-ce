import { User } from 'lucide-react';
import StatCardTrend from '@/components/cards/templates/StatCardTrend';
import { useTotalUniqueUsersQuery } from '@/__generated__/graphql';
import { getPreviousDates } from '@/helpers/date';
import { useUrlParams } from '@/hooks/useUrl';

export default function CardUniqueUsers() {
  const [urlParams] = useUrlParams();
  const { startDate, endDate, articleFilter } = urlParams;

  const { startDatePrevious, endDatePrevious } = getPreviousDates(
    startDate,
    endDate
  );

  const { data, isLoading } = useTotalUniqueUsersQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const { data: dataPrevious, isLoading: isLoadingPrevious } =
    useTotalUniqueUsersQuery({
      startDate: startDatePrevious,
      endDate: endDatePrevious,
      articleFilter,
    });

  const value = data?.trend?.total?.[0].value;
  const valuePrevious = dataPrevious?.trend?.total?.[0].value;

  return (
    <StatCardTrend
      label="Unique Users"
      value={value}
      valuePrevious={valuePrevious}
      showPrevious
      isLoading={isLoading}
      isLoadingPrevious={isLoadingPrevious}
      icon={User}
    />
  );
}
