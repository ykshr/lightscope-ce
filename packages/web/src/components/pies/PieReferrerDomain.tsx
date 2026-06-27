import { useTotalReferrerDomainQuery } from '@/__generated__/graphql';
import PieDonut, { type ChartDataItem } from '@/components/pies/templates/PieDonut';
import { useUrlParams } from '@/hooks/useUrl';

export default function PieReferrerDomain() {
  const [urlParams] = useUrlParams();
  const { startDate, endDate, articleFilter } = urlParams;

  const { data, isLoading } = useTotalReferrerDomainQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const domains =
    data?.trend?.categoryReferrer?.filter(
      (item): item is { domain: string; value: number } =>
        typeof item.domain === 'string' && typeof item.value === 'number'
    ) ?? [];

  const trafficData: ChartDataItem[] = domains.map((item) => ({
    id: item.domain,
    label: item.domain || 'no name',
    value: item.value,
  }));

  return (
    <PieDonut
      title="Referrer Domains"
      isLoading={isLoading}
      data={trafficData}
      centerLabel="Visits"
    />
  );
}
