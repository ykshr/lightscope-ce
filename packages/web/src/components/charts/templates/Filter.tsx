import { categoryOptions, allKeysUsedInCategoryOptions } from '@/helpers/constants/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterProps {
  currentMetricValue: string;
  currentFilterValue: string;
  onMetricChange?: (value: string) => void;
  onFilterChange?: (value: string) => void;
}

export default function Filter({
  currentMetricValue,
  currentFilterValue,
  onMetricChange = () => {},
  onFilterChange = () => {},
}: FilterProps) {
  const currentFilter = JSON.parse(currentFilterValue);
  const extendedFilterOptions =
    currentFilter.label === 'Custom' ? [...categoryOptions, currentFilter] : categoryOptions;

  const onMetricValueChange = (value: string) => {
    onMetricChange(value);
  };

  const onFilterValueChange = (value: string) => {
    const parsedValue = JSON.parse(value);
    const nextValue = {
      ...Object.fromEntries(allKeysUsedInCategoryOptions.map((key) => [key, undefined])),
      ...parsedValue,
    };

    onFilterChange(JSON.stringify(nextValue));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
      <Select value={currentMetricValue} onValueChange={onMetricValueChange}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Metric" />
        </SelectTrigger>
        <SelectContent>
          {['visits', 'visitors', 'users'].map((option) => (
            <SelectItem key={option} value={option} className="text-xs">
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground whitespace-nowrap">of</span>
      <Select value={currentFilterValue} onValueChange={onFilterValueChange}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {extendedFilterOptions.map((option) => (
            <SelectItem key={option.label} value={JSON.stringify(option.value)} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
