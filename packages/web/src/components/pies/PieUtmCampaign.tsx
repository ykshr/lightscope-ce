import { useTotalUtmCampaignQuery } from '@/__generated__/graphql';
import PieDonut, { type ChartDataItem } from '@/components/pies/templates/PieDonut';
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

  const trafficData: ChartDataItem[] = campaigns.map((item) => ({
    id: item.utmCampaign,
    label: item.utmCampaign || 'no name',
    value: item.value,
  }));

  return (
    <PieDonut title="UTM Campaign" isLoading={isLoading} data={trafficData} centerLabel="Visits" />
  );
}
