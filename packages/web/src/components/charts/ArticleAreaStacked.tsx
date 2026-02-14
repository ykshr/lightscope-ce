import { useState } from 'react';
import { categoryUrlParamsToVariables } from '@/helpers/category';
import { metricUrlParamsToVariables } from '@/helpers/metric';
import { useUrlParams } from '@/hooks/useUrl';
import { useArticleTrendQuery } from '@/__generated__/graphql';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LegendItems from '../common/Legend';
import AreaStacked from './templates/AreaStacked';
import Filter, { findCategoryOptionByValue } from './templates/Filter';
import useProcessData from './helpers/useProcessData';

// const data = [
//   { date: '2024-04-01', desktop: 222, mobile: 150 },
//   { date: '2024-04-02', desktop: 97, mobile: 180 },
//   { date: '2024-04-03', desktop: 167, mobile: 120 },
//   { date: '2024-04-04', desktop: 242, mobile: 260 },
//   { date: '2024-04-05', desktop: 373, mobile: 290 },
//   { date: '2024-04-06', desktop: 301, mobile: 340 },
// ];

// const categories = [
//   { id: 'desktop', label: 'Desktop', value: 1402 },
//   { id: 'mobile', label: 'Mobile', value: 1540 },
// ];

interface ArticleAreaStackedProps {
  title?: string;
  description?: string;
  showLegend?: boolean;
  showAnalyticsFilter?: boolean;
  useUrlParamsForAnalyticsFilter?: boolean;
}

export default function ArticleAreaStacked({
  title,
  description,
  showLegend = false,
  showAnalyticsFilter = false,
  useUrlParamsForAnalyticsFilter = false,
}: ArticleAreaStackedProps) {
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

  const categoryParams = categoryUrlParamsToVariables(urlParams);
  const metricParams = metricUrlParamsToVariables(urlParams);

  const { data, isLoading } = useArticleTrendQuery({
    startDate,
    endDate,
    articleFilter,
    page,
    limit,
    ...categoryParams,
    ...metricParams,
  });

  const { chartData, chartConfigs } = useProcessData(data);

  const onMetricChange = (value: string) => {
    const nextValue = { metric: value };
    if (useUrlParamsForAnalyticsFilter) {
      updateUrlParams(nextValue);
    } else {
      setLocalParams((prev) => ({ ...prev, ...nextValue }));
    }
  };

  const onFilterChange = (value: string) => {
    const nextValue = JSON.parse(value);
    if (useUrlParamsForAnalyticsFilter) {
      updateUrlParams(nextValue);
    } else {
      setLocalParams((prev) => ({ ...prev, ...nextValue }));
    }
  };

  const currentFilter = findCategoryOptionByValue(urlParams);

  return (
    <Card className="flex flex-col border-border h-full">
      <CardHeader>
        <div>
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showAnalyticsFilter && (
            <div className="ml-auto">
              <Filter
                currentMetricValue={metric || 'unknown'}
                currentFilterValue={
                  JSON.stringify(currentFilter?.value) || 'unknown'
                }
                onMetricChange={onMetricChange}
                onFilterChange={onFilterChange}
              />
            </div>
          )}
        </div>

        {showLegend && (
          <LegendItems legendItems={chartConfigs} isLoading={isLoading} />
        )}
      </CardHeader>

      <CardContent className="flex flex-col">
        <AreaStacked
          data={chartData}
          categories={chartConfigs}
          xAxisKey="date"
        />
      </CardContent>
    </Card>
  );
}
