import ResponsiveModal from '@/components/common/ResponsiveModal';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { convertDateString, getStartOfMinute, getStartOfNextMinute } from '@/helpers/date';
import useMediaQuery, { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUrlParams } from '@/hooks/useUrl';
import { ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDefaultClassNames } from 'react-day-picker';
import { useSearchParams } from 'react-router-dom';

const RELATIVE_OPTIONS_QUICK_ACCESS = [
  { label: 'Today', startDateString: 'So0D', endDateString: 'So1D' },
  { label: 'This week', startDateString: 'So0W', endDateString: 'So1D' },
  { label: 'This month', startDateString: 'So0M', endDateString: 'So1D' },
];

const RELATIVE_OPTIONS = [
  { label: 'Past 12 hours', startDateString: 'PT12H', endDateString: 'So1D' },
  { label: 'Past 24 hours', startDateString: 'PT24H', endDateString: 'So1D' },
  // { label: 'Past 48 hours', startDateString: 'PT48H', endDateString: 'So1D' },
  { label: 'Today', startDateString: 'So0D', endDateString: 'So1D' },
  { label: 'Yesterday', startDateString: 'So-1D', endDateString: 'So0D' },
  { label: 'This week', startDateString: 'So0W', endDateString: 'So1D' },
  { label: 'Last week', startDateString: 'So-1W', endDateString: 'So0W' },
  // { label: 'This 2 weeks', startDateString: 'So-2W', endDateString: 'So1D' },
  { label: 'This month', startDateString: 'So0M', endDateString: 'So1D' },
  { label: 'Last month', startDateString: 'So-1M', endDateString: 'So0M' },
  // { label: 'This 3 months', startDateString: 'So-3M', endDateString: 'So1D' },
  { label: 'This year', startDateString: 'So0Y', endDateString: 'So0M' },
  { label: 'Past 7 days', startDateString: 'P7D', endDateString: 'So1D' },
  { label: 'Past 30 days', startDateString: 'P30D', endDateString: 'So1D' },
];

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
  const isScreen600 = useMediaQuery('(min-width: 600px)');
  const isScreen1024 = useMediaQuery('(min-width: 1024px)');
  const [open, setOpen] = useState(false);
  const [selectedRelative, setSelectedRelative] = useState<
    (typeof RELATIVE_OPTIONS)[0] | undefined
  >(RELATIVE_OPTIONS[0]);
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (open && selectedRelative) {
      try {
        const from = getStartOfMinute(convertDateString(selectedRelative.startDateString), 0, 5);
        const to = getStartOfNextMinute(convertDateString(selectedRelative.endDateString), 0, 5);
        setRange({ from, to });
      } catch (e) {
        // Ignore
      }
    }
  }, [open, selectedRelative]);

  const handleApply = () => {
    if (selectedRelative) {
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

  const formatForInput = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newDate = val ? new Date(val) : undefined;
    setRange((prev) => ({ from: newDate, to: prev?.to }));
    setSelectedRelative(undefined);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newDate = val ? new Date(val) : undefined;
    setRange((prev) => ({ from: prev?.from, to: newDate }));
    setSelectedRelative(undefined);
  };

  const handlePresetClick = (preset: (typeof RELATIVE_OPTIONS)[0]) => {
    setSelectedRelative(preset);
  };

  const handleCalendarSelect = (newRange: DateRange | undefined) => {
    setRange(newRange);
    setSelectedRelative(undefined);
  };

  const numberOfMonths = (() => {
    if (isScreen1024) return 2;
    if (isDesktop) return 1;
    if (isScreen600) return 2;
    return 1;
  })();

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
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="px-8 shadow-sm"
            disabled={!selectedRelative && (!range?.from || !range?.to)}
          >
            Apply Filter
          </Button>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row w-full overflow-hidden border rounded-lg mt-4">
        {/* Sidebar: Common Ranges */}
        {isDesktop && (
          <aside className="w-full md:w-48 bg-muted/30 p-4 flex flex-col space-y-1 border-b md:border-b-0 md:border-r overflow-y-auto">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Presets
            </h3>
            {RELATIVE_OPTIONS.map((o) => {
              const isSelected = selectedRelative?.label === o.label;
              return (
                <Button
                  key={o.label}
                  type="button"
                  variant={isSelected ? 'default' : 'ghost'}
                  className="justify-start font-normal h-9 w-full"
                  onClick={() => handlePresetClick(o)}
                >
                  {o.label}
                </Button>
              );
            })}
          </aside>
        )}

        {/* Main Calendar Interface */}
        <main className="flex-1 flex flex-col bg-background relative overflow-y-auto">
          {/* Details header */}
          <div className="px-6 py-4 flex flex-col lg:flex-row items-center gap-4 bg-muted/10 border-b">
            <div className="flex-1 flex flex-col gap-1.5 w-full">
              <span>Start Date (inclusive)</span>
              <Input
                type="datetime-local"
                value={formatForInput(range?.from)}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="text-muted-foreground hidden lg:block mt-4">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5 w-full">
              <span>End Date (exclusive)</span>
              <Input
                type="datetime-local"
                value={formatForInput(range?.to)}
                onChange={handleEndDateChange}
              />
            </div>
          </div>

          <div className="flex-1 p-2 flex justify-center items-start w-full">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleCalendarSelect}
              numberOfMonths={numberOfMonths}
              autoFocus
              className="w-[90%] [&_table]:w-full [&_th]:w-full [&_td]:w-full [&_td>*]:w-full [&_td>*]:h-auto [&_td>*]:aspect-square"
              classNames={{
                months: `relative flex flex-col gap-4 sm:flex-row ${getDefaultClassNames().months}`,
              }}
            />
          </div>
        </main>
      </div>
    </ResponsiveModal>
  );
}
