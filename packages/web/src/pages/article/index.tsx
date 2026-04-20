import { useArticleQuery } from '@/__generated__/graphql';
import CardEngagementTime from '@/components/cards/EngagementTime';
import CardLiveViews from '@/components/cards/LiveViews';
import CardTotalViews from '@/components/cards/TotalViews';
import CardUniqueUsers from '@/components/cards/UniqueUsers';
import AreaStacked from '@/components/charts/ArticleAreaStacked';
import { Loading } from '@/components/common/Loading';
import DateFilter from '@/components/filters/DateFilter';
import MapCountry from '@/components/maps/MapCountry';
import Page from '@/components/page/Page';
import PieReferrerDomain from '@/components/pies/PieReferrerDomain';
import PieUtmCampaign from '@/components/pies/PieUtmCampaign';
import { Separator } from '@/components/ui/separator';
import { useUrlParams } from '@/hooks/useUrl';
import Metadata from './Metadata';

// --- Main Component ---
export default function Article() {
  const [urlParams] = useUrlParams();
  const { url } = urlParams as Record<string, unknown>;
  const { data, isLoading } = useArticleQuery({ url: String(url) }, { enabled: !!url });

  const header = (
    <>
      <DateFilter />
    </>
  );

  let content = null;

  if (!url) {
    content = <div className="p-8 text-center text-muted-foreground">No article URL provided.</div>;
  } else if (isLoading) {
    content = <Loading />;
  } else if (!data?.article) {
    content = <div className="p-8 text-center text-muted-foreground">Article not found.</div>;
  } else {
    const article = data.article;
    content = (
      <>
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
      </>
    );
  }

  return <Page header={header}>{content}</Page>;
}
