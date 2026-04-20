import ArticleFilter from '@/components/filters/ArticleFilter';
import DateFilter from '@/components/filters/DateFilter';
import Page from '@/components/page/Page';
import ArticleTable from '@/components/tables/ArticleTable';

export default function Ranking() {
  const header = (
    <>
      <DateFilter />
      <ArticleFilter />
    </>
  );

  return (
    <Page header={header}>
      <ArticleTable />
    </Page>
  );
}
