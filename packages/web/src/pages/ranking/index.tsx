import DateFilter from '@/components/filters/DateFilter';
import Page from '@/components/page/Page';
import ArticleTable from '@/components/tables/ArticleTable';

export default function Ranking() {
  const header = <DateFilter />;

  return (
    <Page header={header}>
      <ArticleTable title="Ranking" />
    </Page>
  );
}
