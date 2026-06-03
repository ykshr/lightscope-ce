import { useTotalUtmCampaignQuery } from '@/__generated__/graphql';
import PieDonutText, { type ChartDataItem } from '@/components/pies/templates/PieDonutText';
import { useUrlParams } from '@/hooks/useUrl';

export default function PieUtmCampaign() {
  const [urlParams] = useUrlParams();
  const { startDate, endDate, articleFilter } = urlParams;

  const { data, isLoading } = useTotalUtmCampaignQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const campaigns =
    data?.trend?.categoryUtm?.filter(
      (item): item is { utmCampaign: string; value: number } =>
        typeof item.utmCampaign === 'string' && typeof item.value === 'number'
    ) ?? [];

  const totalValue = campaigns.reduce((acc, curr) => acc + curr.value, 0);

  const trafficData: ChartDataItem[] = campaigns.map((item) => ({
    id: item.utmCampaign,
    label: item.utmCampaign,
    value: (item.value / totalValue) * 100,
  }));

  return (
    <PieDonutText
      title="UTM Campaign"
      isLoading={isLoading}
      data={trafficData}
      centerLabel="Total"
      unit="%"
    />
  );
}
