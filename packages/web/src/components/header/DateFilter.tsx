import ResponsiveModal from '@/components/common/ResponsiveModal';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { convertDateString, getStartOfMinute, getStartOfNextMinute } from '@/helpers/date';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUrlParams } from '@/hooks/useUrl';
import { cn } from '@/utils';
import * as Tabs from '@radix-ui/react-tabs';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
    const found = RELATIVE_OPTIONS_QUICK_ACCESS.find((o) => o.label === value);
    if (found) {
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
        o.startDateString === currentStartDateString && o.endDateString === currentEndDateString
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

  const showCurrentDate = (relativeStr: string, isStartDate: boolean = true) => {
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
        <Button variant={isActive ? 'default' : 'outline'} className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden md:inline">Custom Date</span>
        </Button>
      }
      title="Advanced Date Filter"
      description="Choose relative presets or specific dates."
      open={open}
      onOpenChange={setOpen}
      dialogClassName="md:max-w-2xl"
    >
      {/* Tabs Component */}
      <Tabs.Root value={mode} onValueChange={setMode} className="w-full flex flex-col pt-2">
        <Tabs.List className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1.5 rounded-lg border shadow-sm">
          <Tabs.Trigger
            value="relative"
            className={cn(
              'py-2 text-sm font-semibold transition-all rounded-md flex items-center justify-center gap-2',
              tabTriggerClassName
            )}
          >
            <Clock className="h-4 w-4" />
            Relative
          </Tabs.Trigger>
          <Tabs.Trigger
            value="absolute"
            className={cn(
              'py-2 text-sm font-semibold transition-all rounded-md flex items-center justify-center gap-2',
              tabTriggerClassName
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            Absolute Range
          </Tabs.Trigger>
        </Tabs.List>

        <div className="min-h-[280px]">
          <Tabs.TabsContent value="relative" className="space-y-6 animate-in fade-in-50">
            <div className="space-y-3">
              <Label className="text-base">Quick Presets</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIVE_OPTIONS.map((o) => (
                  <Button
                    key={o.label}
                    type="button"
                    variant={selectedRelative.label === o.label ? 'default' : 'outline'}
                    className="justify-start font-normal h-9"
                    onClick={() => setSelectedRelative(o)}
                  >
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Selected Range Details</Label>
              <div className="rounded-lg bg-muted/30 border text-sm p-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground font-medium">From (inclusive)</span>
                  <span className="font-semibold bg-background border px-2 py-1 rounded shadow-sm">
                    {showCurrentDate(selectedRelative.startDateString)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground font-medium">To (exclusive)</span>
                  <span className="font-semibold bg-background border px-2 py-1 rounded shadow-sm">
                    {showCurrentDate(selectedRelative.endDateString, false)}
                  </span>
                </div>
              </div>
            </div>
          </Tabs.TabsContent>

          <Tabs.TabsContent value="absolute" className="space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <Label className="text-base">Select Date Range</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRange(undefined)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Reset Selection
              </Button>
            </div>

            <div className="rounded-lg border bg-card/50 shadow-sm overflow-hidden flex justify-center p-2">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={isDesktop ? 2 : 1}
                autoFocus
              />
            </div>
          </Tabs.TabsContent>
        </div>
      </Tabs.Root>

      <div className="mt-6 pt-4 border-t flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          className="px-8 shadow-sm"
          disabled={mode === 'absolute' && (!range?.from || !range?.to)}
        >
          Apply Filter
        </Button>
      </div>
    </ResponsiveModal>
  );
}
