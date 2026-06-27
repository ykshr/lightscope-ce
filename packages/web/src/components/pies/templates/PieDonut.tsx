import { LegendItem } from '@/components/common/Legend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Spinner } from '@/components/ui/spinner';
import { getColorForIndex } from '@/helpers/color';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Label, Pie, PieChart } from 'recharts';

export interface ChartDataItem {
  id: string; // identifier (e.g., 'search')
  label: string; // display name (e.g., 'Search (Google/Yahoo)')
  value: number; // numeric value
  color?: string; // color (hsl, rgb, hex, or var(--primary), etc.)
}

interface GenericDonutChartProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  data: ChartDataItem[];
  centerLabel: string;
  legendPosition?: 'auto' | 'horizontal' | 'vertical';
}

export default function PieDonutText({
  title,
  description,
  isLoading,
  data,
  centerLabel,
  legendPosition = 'auto',
}: GenericDonutChartProps) {
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (legendPosition !== 'auto') return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const currentWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setWidth(currentWidth);
    });

    observer.observe(element);
    setWidth(element.offsetWidth);

    return () => {
      observer.disconnect();
    };
  }, [legendPosition]);

  const activeLegendPosition = useMemo(() => {
    if (legendPosition !== 'auto') {
      return legendPosition;
    }
    // threshold: 350px
    return width >= 350 ? 'vertical' : 'horizontal';
  }, [legendPosition, width]);

  const { config, chartData } = useMemo(() => {
    const generatedConfig: ChartConfig = {};

    const formatted = data.map((item, index) => {
      // if no color provided, assign from default colors
      const itemColor = item.color || getColorForIndex(index);

      generatedConfig[item.id] = {
        label: item.label,
        color: itemColor,
      };

      return {
        ...item,
        pct: item.value / totalValue,
        fill: itemColor,
      };
    });

    return { config: generatedConfig, chartData: formatted };
  }, [data]);

  return (
    <Card
      ref={containerRef}
      data-testid={`pie-chart-${title.replace(/\s+/g, '-').toLowerCase()}`}
      className="flex flex-col border-border h-full"
    >
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-4">
          {title} {isLoading && <Spinner />}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent
        className={
          activeLegendPosition === 'vertical'
            ? 'flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6'
            : 'flex flex-col'
        }
      >
        <ChartContainer
          config={config}
          className={`mx-auto aspect-square w-full ${
            activeLegendPosition === 'vertical'
              ? 'max-h-[180px] max-w-[180px] sm:max-h-[200px] sm:max-w-[200px]'
              : 'max-h-[250px]'
          }`}
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="id"
              innerRadius={70}
              strokeWidth={5}
              startAngle={90}
              endAngle={-270}
            >
              <Label
                content={({ viewBox }) => {
                  if (!(viewBox && 'cx' in viewBox && 'cy' in viewBox)) return null;
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-xl sm:text-2xl font-bold"
                      >
                        {totalValue.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-[10px] uppercase"
                      >
                        {centerLabel}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div
          className={
            activeLegendPosition === 'vertical'
              ? 'space-y-3 w-full sm:w-auto flex-1 mt-4 sm:mt-0'
              : 'mt-6 space-y-3'
          }
        >
          {chartData
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map((item) => (
              <LegendItem
                key={item.id}
                label={item.label}
                value={item.value}
                pct={item.pct}
                pctToFixed={0}
                color={item.fill}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
