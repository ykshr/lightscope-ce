import PieDonutText, {
  type ChartDataItem,
} from '@/components/pies/templates/PieDonutText';
import { useTotalReferrerDomainQuery } from '@/__generated__/graphql';
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

  const totalValue = domains.reduce((acc, curr) => acc + curr.value, 0);

  const trafficData: ChartDataItem[] = domains.map((item) => ({
    id: item.domain,
    label: item.domain,
    value: (item.value / totalValue) * 100,
  }));

  return (
    <PieDonutText
      title="Referrer Domains"
      isLoading={isLoading}
      data={trafficData}
      centerLabel="Total"
      unit="%"
    />
  );
}
