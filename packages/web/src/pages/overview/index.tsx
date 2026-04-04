import CardEngagementTime from '@/components/cards/EngagementTime';
import CardLiveViews from '@/components/cards/LiveViews';
import CardTotalViews from '@/components/cards/TotalViews';
import CardUniqueUsers from '@/components/cards/UniqueUsers';
import AreaStacked from '@/components/charts/ArticleAreaStacked';
import DateFilter from '@/components/filters/DateFilter';
import Page from '@/components/page/Page';
import PieReferrerDomain from '@/components/pies/PieReferrerDomain';
import ArticleTable from '@/components/tables/ArticleTable';

export default function Overview() {
  const header = <DateFilter />;

  return (
    <Page header={header}>
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardTotalViews />
        <CardUniqueUsers />
        <CardEngagementTime />
        <CardLiveViews />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AreaStacked />
        </div>
        <div className="lg:col-span-1">
          <PieReferrerDomain />
        </div>
      </div>

      {/* Articles Table */}
      <ArticleTable title="Ranking" viewMoreHref="/articles" />
    </Page>
  );
}
