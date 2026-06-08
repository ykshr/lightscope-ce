import { ArticleRankQuery } from '@/__generated__/graphql';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Column } from '../templates/types';

type ArticleData = {
  id: number;
  value: number;
  url: string;
  title?: string;
  type?: string;
  image?: string;
  siteName?: string;
  publishedTime?: Date;
  section?: string;
};

export default function useProcessData(data: ArticleRankQuery | undefined, metric: string) {
  const [articles, setArticles] = useState<ArticleData[] | undefined>(undefined);
  const [columns, setColumns] = useState<Column<ArticleData>[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const mappedArticles: ArticleData[] | undefined = data?.rank?.articles?.map(
      ({ index, url, value, article }) => ({
        id: index + 1,
        value,
        url,
        image: article?.image || '/placeholders/article.png',
        title: article?.title || 'No Title',
        publishedTime: article?.publishedTime ? new Date(article.publishedTime) : undefined,
        siteName: article?.siteName || 'Unknown',
        type: article?.type || 'Unknown',
        section: article?.section || 'Unknown',
      })
    );

    const classNameTime = 'inline-flex items-left';
    const classNameLabel =
      'inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium border border-border overflow-x-scroll';
    const articleColumns: Column<ArticleData>[] = [
      {
        header: 'Rank',
        accessorKey: 'id',
        className: 'text-center',
        gridSpan: 1,
      },
      {
        header: 'Image',
        accessorKey: 'image',
        gridSpan: 2,
        className: 'flex items-center justify-center',
        render: ({ image }) => (
          <img
            src={image}
            className="max-h-[3em]"
            onError={(e) => {
              e.currentTarget.src = '/LittleScope_logo.png';
            }}
          />
        ),
        hideMobile: true,
      },
      {
        header: 'Title',
        accessorKey: 'title',
        className: 'group-hover:text-primary transition-colors cursor-pointer truncate',
        gridSpan: 5,
        render: ({ title, url }) => (
          <Link to={`/article?url=${encodeURIComponent(url)}`}>{title}</Link>
        ),
      },
      {
        header: 'Published Date',
        accessorKey: 'publishedTime',
        gridSpan: 2,
        render: ({ publishedTime }) => (
          <span className={classNameTime}>
            {publishedTime ? new Date(publishedTime).toLocaleDateString() : 'Unknown'}
          </span>
        ),
        hideMobile: true,
      },
      {
        header: 'Site name',
        accessorKey: 'siteName',
        gridSpan: 2,
        render: ({ siteName }) => <span className={classNameLabel}>{siteName}</span>,
        hideMobile: true,
      },
      {
        header: 'Type',
        accessorKey: 'type',
        gridSpan: 2,
        render: ({ type }) => <span className={classNameLabel}>{type}</span>,
        hideMobile: true,
      },
      {
        header: `${metric[0].toUpperCase()}${metric.slice(1).toLowerCase()}`,
        accessorKey: 'value',
        className: 'text-right',
        gridSpan: 2,
      },
    ];

    const filteredArticleColumns = articleColumns.filter((col) => !(col.hideMobile && isMobile));
    setArticles(mappedArticles);
    setColumns(filteredArticleColumns);
  }, [data, metric, isMobile]);

  return { articles, columns };
}
