import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  convertDateString,
  getStartOfMinute,
  getStartOfNextMinute,
} from '@/helpers/date';
import { useUrlParams } from '@/hooks/useUrl';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const RELATIVE_OPTIONS_QUICK_ACCESS = [
  { label: 'Today', startDateString: 'So0D', endDateString: 'So1D' },
  { label: 'This week', startDateString: 'So0W', endDateString: 'So1D' },
  { label: 'This month', startDateString: 'So0M', endDateString: 'So1D' },
];

const RELATIVE_OPTIONS = [
  { label: 'Today', startDateString: 'So0D', endDateString: 'So1D' },
  { label: 'Yesterday', startDateString: 'So-1D', endDateString: 'So0D' },
  { label: 'This week', startDateString: 'So0W', endDateString: 'So1D' },
  { label: 'Last week', startDateString: 'So-1W', endDateString: 'So0W' },
  { label: 'This 2 weeks', startDateString: 'So-2W', endDateString: 'So1D' },
  { label: 'This month', startDateString: 'So0M', endDateString: 'So1D' },
  { label: 'Last month', startDateString: 'So-1M', endDateString: 'So0M' },
  { label: 'This 3 months', startDateString: 'So-3M', endDateString: 'So1D' },
  { label: 'This year', startDateString: 'So0Y', endDateString: 'So0M' },
  { label: 'Past 24 hours', startDateString: 'PT24H', endDateString: 'So1D' },
  { label: 'Past 48 hours', startDateString: 'PT48H', endDateString: 'So1D' },
  { label: 'Past 7 days', startDateString: 'P7D', endDateString: 'So1D' },
  { label: 'Past 30 days', startDateString: 'P30D', endDateString: 'So1D' },
];

const tabTriggerClassName =
  'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm';

export default function DateFilter() {
  const [searchParams] = useSearchParams();
  const currentStartDateString = searchParams.get('sd') || undefined;
  const currentEndDateString = searchParams.get('ed') || undefined;

  const [, updateUrlParams] = useUrlParams();

  const handleTabChange = (value: string) => {
    let start = '';
    const found = RELATIVE_OPTIONS_QUICK_ACCESS.find((o) => o.label === value);
    if (found) {
      start = found.startDateString;
      updateUrlParams({
        startDate: found.startDateString,
        endDate: found.endDateString,
      });
      return;
    }
    updateUrlParams({ startDate: 'So0D', endDate: 'So1D' });
  };

  const getTabValue = () => {
    const found = RELATIVE_OPTIONS_QUICK_ACCESS.find(
      (o) =>
        o.startDateString === currentStartDateString &&
        o.endDateString === currentEndDateString
    );
    if (found) return found.label;
    return 'custom';
  };

  return (
    <>
      <ButtonGroup className="hidden sm:inline-flex">
        {RELATIVE_OPTIONS_QUICK_ACCESS.map((item) => {
          const isActive = getTabValue() === item.label;
          return (
            <Button
              key={item.label}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => handleTabChange(item.label)}
            >
              {item.label}
            </Button>
          );
        })}
        <CustomDateRangePicker
          isActive={getTabValue() === 'custom'}
          onApply={(start, end) => updateUrlParams({ sd: start, ed: end })}
        />
      </ButtonGroup>
      <ButtonGroup className="sm:hidden">
        <CustomDateRangePicker
          isActive={getTabValue() === 'custom'}
          onApply={(start, end) => updateUrlParams({ sd: start, ed: end })}
        />
      </ButtonGroup>
    </>
  );
}

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

function CustomDateRangePicker({
  isActive,
  onApply,
}: {
  isActive: boolean;
  onApply: (s: Date | string, e: Date | string) => void;
}) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string>('relative');
  const [selectedRelative, setSelectedRelative] = useState(RELATIVE_OPTIONS[0]);
  const [range, setRange] = useState<DateRange | undefined>();

  const handleApply = () => {
    if (mode === 'relative') {
      const { startDateString, endDateString } = selectedRelative;
      onApply(startDateString, endDateString);
      setOpen(false);
    } else {
      if (range?.from && range?.to) {
        onApply(range.from, range.to);
        setOpen(false);
      }
    }
  };

  const showCurrentDate = (
    relativeStr: string,
    isStartDate: boolean = true
  ) => {
    try {
      const date = convertDateString(relativeStr);
      const roundedDate = isStartDate
        ? getStartOfMinute(date, 0, 5)
        : getStartOfNextMinute(date, 0, 5);
      return roundedDate.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <ResponsiveModal
      trigger={
        <Button
          variant={isActive ? 'default' : 'outline'}
          className="h-9 gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      }
      title="Date Filter"
      description="Set other date filter conditions"
      open={open}
      onOpenChange={setOpen}
    >
      {/* Tabs Component */}
      <Tabs.Root value={mode} onValueChange={setMode} className="w-full">
        <Tabs.List className="grid w-full grid-cols-2 mb-4 bg-muted p-1 rounded-lg">
          <Tabs.Trigger
            value="relative"
            className={cn(
              'py-1.5 text-sm font-medium transition-all rounded-md',
              tabTriggerClassName
            )}
          >
            Relative
          </Tabs.Trigger>
          <Tabs.Trigger
            value="absolute"
            className={cn(
              'py-1.5 text-sm font-medium transition-all rounded-md',
              tabTriggerClassName
            )}
          >
            Absolute
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.TabsContent value="relative" className="space-y-4">
          <Label>Relative</Label>
          <Select
            value={selectedRelative.label}
            onValueChange={(label) => {
              const preset = RELATIVE_OPTIONS.find((o) => o.label === label);
              if (preset) setSelectedRelative(preset);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RELATIVE_OPTIONS.map((o) => (
                <SelectItem key={o.label} value={o.label}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-md bg-muted text-xs p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From (inclusive):</span>
              <span className="font-medium">
                {showCurrentDate(selectedRelative.startDateString)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To (exclusive):</span>
              <span className="font-medium">
                {showCurrentDate(selectedRelative.endDateString, false)}
              </span>
            </div>
          </div>
        </Tabs.TabsContent>

        <Tabs.TabsContent value="absolute" className="space-y-4">
          <Label>
            Date Range
            <Button
              className="ml-auto"
              variant="ghost"
              size="sm"
              onClick={() => setRange(undefined)}
            >
              Reset
            </Button>
          </Label>
          <div className="rounded-md border bg-card overflow-hidden flex justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={isDesktop ? 2 : 1}
              autoFocus
            />
          </div>
        </Tabs.TabsContent>
      </Tabs.Root>
      <div className="p-4 border-t bg-muted/50 flex justify-end gap-2">
        <Button
          onClick={handleApply}
          className="w-full mt-4"
          disabled={mode === 'absolute' && (!range?.from || !range?.to)}
        >
          Apply Changes
        </Button>
      </div>
    </ResponsiveModal>
  );
}
