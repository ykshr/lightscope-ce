import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getColorForIndex } from '@/helpers/color';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

export interface AreaChartDataItem {
  [key: string]: string | number;
}

export interface AreaCategoryConfig {
  id: string; // data key (e.g., 'thisWeek')
  label: string; // display name (e.g., 'This Week')
  total?: number; // total value for legend
  pct?: number; // percentage for legend
  color?: string; // optional specific color
  stackId?: string; // optional stack ID for stacking areas
}

interface GenericStackedAreaChartProps {
  data: AreaChartDataItem[];
  categories: AreaCategoryConfig[];
  xAxisKey: string;
  tickFormatter?: (value: string | number) => string;
}

export default function AreaStacked({
  data,
  categories,
  xAxisKey,
  tickFormatter,
}: GenericStackedAreaChartProps) {
  const areas = categories.map((item, index) => {
    const itemColor = item.color || getColorForIndex(index);
    return {
      ...item,
      color: itemColor,
      fill: itemColor,
    };
  });
  const config: ChartConfig = Object.fromEntries(areas.map((area) => [area.id, area]));
  console.log(data);
  return (
    <ChartContainer config={config} className="mx-auto aspect-square w-full max-h-[250px]">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          right: 0,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          // tickMargin={8}
          className="text-xs"
          tickFormatter={tickFormatter}
        />
        <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
        {areas.map((area) => (
          <Area
            key={area.id}
            dataKey={area.id}
            type="monotone"
            fill={area.fill}
            fillOpacity={0.1}
            stroke={area.fill}
            strokeWidth={2}
            stackId={area.stackId || area.id}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
