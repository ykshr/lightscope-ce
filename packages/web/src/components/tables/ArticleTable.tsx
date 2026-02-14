import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUrlParams } from '@/hooks/useUrl';
import { categoryUrlParamsToVariables } from '@/helpers/category';
import { metricUrlParamsToVariables } from '@/helpers/metric';
import { useArticleRankQuery } from '@/__generated__/graphql';
import TableHeader from './templates/TableHeader';
import TableBody from './templates/TableBody';
import TablePagination from './templates/TablePagination';
import Sort, { findCategoryOptionByValue } from './templates/Sort';
import useProcessData from './helpers/useProcessData';
import { useState } from 'react';

interface ArticleTableProps {
  title?: string;
  viewMoreHref?: string;
  itemsPerPage?: number;
  hideSort?: boolean;
  description?: string;
  showAnalyticsFilter?: boolean;
  useUrlParamsForAnalyticsFilter?: boolean;
}

export default function ArticleTable({
  title,
  viewMoreHref,
  itemsPerPage = 25,
  description,
  showAnalyticsFilter = false,
  useUrlParamsForAnalyticsFilter = false,
}: ArticleTableProps) {
  const [localParams, setLocalParams] = useState<{ [name: string]: any }>({});

  const [urlParams, updateUrlParams] = useUrlParams(localParams);
  const {
    startDate,
    endDate,
    articleFilter,
    page = 1,
    limit,
    metric = 'visits',
  } = urlParams;

  const categoryVariables = categoryUrlParamsToVariables(urlParams);
  const metricVariables = metricUrlParamsToVariables(urlParams);

  const { data, isLoading } = useArticleRankQuery({
    startDate,
    endDate,
    articleFilter,
    page,
    limit,
    ...categoryVariables,
    ...metricVariables,
  });

  const { articles, columns } = useProcessData(data, metric);

  const onMetricChange = (value: string) => {
    const nextValue = { metric: value };
    if (useUrlParamsForAnalyticsFilter) {
      updateUrlParams(nextValue);
    } else {
      setLocalParams((prev) => ({ ...prev, ...nextValue }));
    }
  };

  const onSortChange = (value: string) => {
    const nextValue = JSON.parse(value);
    if (useUrlParamsForAnalyticsFilter) {
      updateUrlParams(nextValue);
    } else {
      setLocalParams((prev) => ({ ...prev, ...nextValue }));
    }
  };

  const currentSort = findCategoryOptionByValue(urlParams);

  const totalCount = undefined; // TODO: get total count from API
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalCount || 0);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex flex-col">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {viewMoreHref && (
            <Button
              variant="link"
              className="text-sm flex items-center gap-1 ml-auto"
              asChild
            >
              <a href={viewMoreHref}>
                View More <ArrowRight size={16} />
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          {totalCount !== undefined && (
            <CardDescription className="text-xs">
              Showing
              <span className="font-medium text-foreground px-1">
                {startItem}-{endItem}
              </span>
              of
              <span className="font-medium text-foreground px-1">
                {totalCount}
              </span>
              results
            </CardDescription>
          )}
          {showAnalyticsFilter && (
            <div className="ml-auto">
              <Sort
                currentMetricValue={metric || 'unknown'}
                currentSortValue={
                  JSON.stringify(currentSort?.value) || 'unknown'
                }
                onMetricChange={onMetricChange}
                onSortChange={onSortChange}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto border-t border-border">
          <Table className="table-fixed w-full">
            <TableHeader columns={columns} />
            <TableBody
              data={articles}
              columns={columns}
              isLoading={isLoading}
            />
          </Table>
        </div>
      </CardContent>

      {/* Pagination Footer */}
      <CardFooter className="flex items-center justify-center border-t border-border py-4">
        <TablePagination
          page={page}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      </CardFooter>
    </Card>
  );
}
