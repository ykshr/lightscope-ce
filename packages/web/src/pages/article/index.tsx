import { useArticleQuery } from '@/__generated__/graphql';
import { useUrlParams } from '@/hooks/useUrl';
import { Loading } from '@/components/common/Loading';
import CardEngagementTime from '@/components/cards/EngagementTime';
import CardLiveViews from '@/components/cards/LiveViews';
import CardTotalViews from '@/components/cards/TotalViews';
import CardUniqueUsers from '@/components/cards/UniqueUsers';
import AreaStacked from '@/components/charts/ArticleAreaStacked';
import ArticleFilter from '@/components/filters/ArticleFilter';
import DateFilter from '@/components/filters/DateFilter';
import MapCountry from '@/components/maps/MapCountry';
import Page from '@/components/page/Page';
import PieReferrerDomain from '@/components/pies/PieReferrerDomain';
import PieUtmCampaign from '@/components/pies/PieUtmCampaign';
import { Separator } from '@/components/ui/separator';
import Metadata from './Metadata';

// --- Main Component ---
export default function Article() {
  const header = (
    <>
      <DateFilter />
      <ArticleFilter />
    </>
  );

  const [urlParams] = useUrlParams();
  const { url } = urlParams as Record<string, unknown>;
  const { data, isLoading } = useArticleQuery({ url: String(url) }, { enabled: !!url });

  if (!url)
    return <div className="p-8 text-center text-muted-foreground">No article URL provided.</div>;
  if (isLoading) return <Loading />;
  if (!data?.article)
    return <div className="p-8 text-center text-muted-foreground">Article not found.</div>;

  const article = data.article;

  return (
    <Page header={header}>
      {/* Main Header Card */}
      <Metadata article={article} />

      <Separator />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardTotalViews />
        <CardUniqueUsers />
        <CardEngagementTime />
        <CardLiveViews />
        <PieReferrerDomain />
        <PieUtmCampaign />
        <MapCountry />
      </div>

      <AreaStacked showLegend showAnalyticsFilter />
    </Page>
  );
}
