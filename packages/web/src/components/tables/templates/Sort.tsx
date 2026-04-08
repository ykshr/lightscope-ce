import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryOptions = [
  {
    label: 'Total',
    value: {},
  },
  {
    label: 'Continent:Africa',
    value: {
      category: 'geo',
      includeContinents: ['AF'],
    },
  },
  {
    label: 'Continent:Antarctica',
    value: {
      category: 'geo',
      includeContinents: ['AN'],
    },
  },
  {
    label: 'Continent:Asia',
    value: {
      category: 'geo',
      includeContinents: ['AS'],
    },
  },
  {
    label: 'Continent:Europe',
    value: {
      category: 'geo',
      includeContinents: ['EU'],
    },
  },
  {
    label: 'Continent:North America',
    value: {
      category: 'geo',
      includeContinents: ['NA'],
    },
  },
  {
    label: 'Continent:Oceania',
    value: {
      category: 'geo',
      includeContinents: ['OC'],
    },
  },
  {
    label: 'Continent:South America',
    value: {
      category: 'geo',
      includeContinents: ['SA'],
    },
  },
  {
    label: 'Referrer:Direct',
    value: {
      category: 'referrer',
      includeDomains: ['direct'],
    },
  },
  {
    label: 'Device:Tablet',
    value: {
      category: 'device',
      includeDeviceTypes: ['tablet'],
    },
  },
  {
    label: 'Device:Desktop',
    value: {
      category: 'device',
      includeDeviceTypes: ['desktop'],
    },
  },
  {
    label: 'Device:Mobile',
    value: {
      category: 'device',
      includeDeviceTypes: ['mobile'],
    },
  },
];

const allKeysUsedInCategoryOptions = Array.from(
  new Set<string>(categoryOptions.flatMap((option) => Object.keys(option.value)))
).sort();

export const findCategoryOptionByValue = (value: any) => {
  const categoryKeys = Object.keys(value)
    .filter((key) => allKeysUsedInCategoryOptions.includes(key))
    .sort();

  const foundOption = categoryOptions.find((option) => {
    const optionKeys = Object.keys(option.value).sort();
    if (categoryKeys.length !== optionKeys.length) {
      return false;
    }
    for (let i = 0; i < categoryKeys.length; i++) {
      const key = categoryKeys[i];
      if (key !== optionKeys[i]) {
        return false;
      }
      const val1 = value[key];
      const val2 = option.value[key as keyof typeof option.value];
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
          return false;
        }
        const sortedVal1 = [...val1].sort();
        const sortedVal2 = [...val2].sort();
        for (let j = 0; j < sortedVal1.length; j++) {
          if (sortedVal1[j] !== sortedVal2[j]) {
            return false;
          }
        }
      } else {
        if (val1 !== val2) {
          return false;
        }
      }
    }
    return true;
  });

  if (foundOption) return foundOption;

  return {
    label: 'Custom',
    value: categoryKeys.reduce(
      (acc, key) => {
        acc[key] = value[key];
        return acc;
      },
      {} as Record<string, any>
    ),
  };
};

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
    currentSort.label === 'Custom' ? [...categoryOptions, currentSort] : categoryOptions;

  const onMetricValueChange = (value: string) => {
    onMetricChange(value);
  };

  const onSortValueChange = (value: string) => {
    const parsedValue = JSON.parse(value);
    const nextValue = {
      ...Object.fromEntries(allKeysUsedInCategoryOptions.map((key) => [key, undefined])),
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
