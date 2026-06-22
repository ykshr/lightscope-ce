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
import { useMemo } from 'react';
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
}

export default function PieDonutText({
  title,
  description,
  isLoading,
  data,
  centerLabel,
}: GenericDonutChartProps) {
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

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
    <Card className="flex flex-col border-border h-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-4">
          {title} {isLoading && <Spinner />}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex flex-col">
        <ChartContainer config={config} className="mx-auto aspect-square w-full max-h-[250px]">
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
                        className="fill-foreground text-2xl font-bold"
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

        <div className="mt-6 space-y-3">
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
