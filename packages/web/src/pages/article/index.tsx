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
import Metadata, { type Article } from './Metadata';

// --- Sample Data ---
const SAMPLE_ARTICLE: Article = {
  url: 'https://example.com/analytics/global-economy-2024.html',
  title: 'Global Economy Trends in 2024: A Comprehensive Outlook',
  type: 'Article',
  image:
    'https://ichef.bbci.co.uk/news/1536/cpsprodpb/fb0c/live/24597b60-f8f7-11f0-a66e-ad6304ba581b.jpg.webp',
  description: 'An in-depth analysis of global market shifts and financial forecasts.',
  site_name: 'LightScope Analytics',
  locale: 'en-US',
  published_time: '2023-10-24T14:00:00Z',
  modified_time: '2023-10-26T09:30:00Z',
  expiration_time: '2025-12-31T23:59:59Z', // 未来の日付（Published）
  // expiration_time: "2022-12-31T23:59:59Z", // 過去の日付（Expired確認用）
  authors: ['jenkins.sarah@example.com', 'michael.ross@example.com'],
  section: 'Economy',
  tags: ['GlobalEconomy', 'Finance2024', 'MarketTrends', 'Outlook'],
};

// --- Main Component ---
export default function Article() {
  const header = (
    <>
      <DateFilter />
      <ArticleFilter />
    </>
  );

  const article = SAMPLE_ARTICLE;

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
