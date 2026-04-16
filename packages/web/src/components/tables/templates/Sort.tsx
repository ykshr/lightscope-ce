import { sortOptions, allKeysUsedInSortOptions } from '@/helpers/constants/sort';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortProps {
  currentMetricValue: string;
  currentSortValue: string;
  onMetricChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
}

export default function Sort({
  currentMetricValue,
  currentSortValue,
  onMetricChange = (value: string) => console.log(JSON.stringify(value)),
  onSortChange = (value: string) => console.log(JSON.stringify(value)),
}: SortProps) {
  const currentSort = JSON.parse(currentSortValue);
  const extenedSortOptions =
    currentSort.label === 'Custom' ? [...sortOptions, currentSort] : sortOptions;

  const onMetricValueChange = (value: string) => {
    onMetricChange(value);
  };

  const onSortValueChange = (value: string) => {
    const parsedValue = JSON.parse(value);
    const nextValue = {
      ...Object.fromEntries(allKeysUsedInSortOptions.map((key) => [key, undefined])),
      ...parsedValue,
    };

    onSortChange(JSON.stringify(nextValue));
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
      <Select value={currentSortValue} onValueChange={onSortValueChange}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {extenedSortOptions.map((option) => (
            <SelectItem key={option.label} value={JSON.stringify(option.value)} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
