import ResponsiveModal from '@/components/common/ResponsiveModal';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_DATE_STRING,
  RELATIVE_OPTIONS,
  RELATIVE_OPTIONS_QUICK_ACCESS,
} from '@/helpers/constants/date';
import { convertDateString, formatDate, timezoneOffset as tOffset } from '@/helpers/date';
import { useIsMobile } from '@/hooks/use-mobile';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useUrlParams } from '@/hooks/useUrl';
import { ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

export default function DateFilter() {
  const [searchParams] = useSearchParams();
  const currentStartDateString = searchParams.get('sd') || DEFAULT_DATE_STRING.startDateString;
  const currentEndDateString = searchParams.get('ed') || DEFAULT_DATE_STRING.endDateString;

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
    updateUrlParams({ startDate: 'So0D', endDate: `So1D${tOffset}` });
  };

  const getCurrentTab = () => {
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
          return (
            <Button
              key={item.label}
              variant={getCurrentTab() === item.label ? 'default' : 'outline'}
              onClick={() => handleTabChange(item.label)}
            >
              {item.label}
            </Button>
          );
        })}
        <CustomDateRangeDialog
          currentDate={{ startDate: currentStartDateString, endDate: currentEndDateString }}
          isActive={getCurrentTab() === 'custom'}
          onApply={(start, end) => updateUrlParams({ sd: start, ed: end })}
        />
      </ButtonGroup>
      <ButtonGroup className="sm:hidden">
        <CustomDateRangeDialog
          currentDate={{ startDate: currentStartDateString, endDate: currentEndDateString }}
          isActive={getCurrentTab() === 'custom'}
          onApply={(start, end) => updateUrlParams({ sd: start, ed: end })}
        />
      </ButtonGroup>
    </>
  );
}

type DateFilterFormValues = {
  startDate: string | Date;
  endDate: string | Date;
  presetLabel?: string;
};

function CustomDateRangeDialog({
  currentDate,
  isActive,
  onApply,
}: {
  currentDate: { startDate?: string; endDate?: string };
  isActive: boolean;
  onApply: (s: Date | string, e: Date | string) => void;
}) {
  const isDesktop = !useIsMobile();
  const isScreen600 = useMediaQuery('(min-width: 600px)');
  const isScreen1024 = useMediaQuery('(min-width: 1024px)');
  const [open, setOpen] = useState(false);

  const { handleSubmit, setValue, watch, reset } = useForm<DateFilterFormValues>({
    defaultValues: {
      startDate: currentDate.startDate || '',
      endDate: currentDate.endDate || '',
      presetLabel: RELATIVE_OPTIONS.find(
        (o) =>
          o.startDateString === currentDate.startDate && o.endDateString === currentDate.endDate
      )?.label,
    },
  });
  const watchedValues = watch();

  const numberOfMonths = (() => {
    if (isScreen1024) return 2;
    if (isDesktop) return 1;
    if (isScreen600) return 2;
    return 1;
  })();

  useEffect(() => {
    if (open) {
      if (currentDate.startDate || currentDate.endDate) {
        reset({
          startDate: currentDate.startDate || '',
          endDate: currentDate.endDate || '',
          presetLabel: RELATIVE_OPTIONS.find(
            (o) =>
              o.startDateString === currentDate.startDate && o.endDateString === currentDate.endDate
          )?.label,
        });
      } else {
        const defaultPreset = RELATIVE_OPTIONS[0];
        reset({
          startDate: defaultPreset.startDateString,
          endDate: defaultPreset.endDateString,
          presetLabel: defaultPreset.label,
        });
      }
    }
  }, [open, currentDate.startDate, currentDate.endDate, reset]);

  const onSubmit = (data: DateFilterFormValues) => {
    onApply(data.startDate, data.endDate);
    setOpen(false);
  };

  const handlePresetClick = (preset: (typeof RELATIVE_OPTIONS)[0]) => {
    setValue('startDate', preset.startDateString);
    setValue('endDate', preset.endDateString);
    setValue('presetLabel', preset.label);
  };

  const getDisplayDate = (val: string | Date | undefined) => {
    if (!val) return undefined;
    try {
      return typeof val === 'string' ? convertDateString(val) : val;
    } catch {
      return undefined;
    }
  };

  const formatForInput = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    return formatDate(date, 'YYYY-MM-DDTHH:mm');
  };

  return (
    <ResponsiveModal
      trigger={
        <Button
          data-testid="date-filter-btn"
          variant={isActive ? 'default' : 'outline'}
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden md:inline">Custom Date</span>
        </Button>
      }
      title="Advanced Date Filter"
      description="Choose relative presets or specific dates."
      open={open}
      onOpenChange={setOpen}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="date-filter-form"
            className="px-8 shadow-sm"
            disabled={!watchedValues.startDate || !watchedValues.endDate}
          >
            Apply Filter
          </Button>
        </div>
      }
    >
      <form
        id="date-filter-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row w-full overflow-hidden border rounded-lg mt-4"
      >
        {isDesktop && (
          <aside className="w-full md:w-48 bg-muted/30 p-4 flex flex-col space-y-1 border-r overflow-y-auto max-h-[500px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Presets
            </h3>
            {RELATIVE_OPTIONS.map((o) => (
              <Button
                key={o.label}
                type="button"
                variant={watchedValues.presetLabel === o.label ? 'default' : 'ghost'}
                className="justify-start font-normal h-9 w-full"
                onClick={() => handlePresetClick(o)}
              >
                {o.label}
              </Button>
            ))}
          </aside>
        )}

        <main className="flex-1 flex flex-col bg-background">
          <div className="px-6 py-4 flex flex-col lg:flex-row items-center gap-4 bg-muted/10 border-b">
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <span className="text-xs font-medium">Start Date (inclusive)</span>
              <Input
                type="datetime-local"
                value={formatForInput(getDisplayDate(watchedValues.startDate))}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : '';
                  setValue('startDate', newDate);
                  setValue('presetLabel', undefined);
                }}
              />
            </div>
            <ArrowRight className="hidden lg:block text-muted-foreground mt-4" />
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <span className="text-xs font-medium">End Date (exclusive)</span>
              <Input
                type="datetime-local"
                value={formatForInput(getDisplayDate(watchedValues.endDate))}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : '';
                  setValue('endDate', newDate);
                  setValue('presetLabel', undefined);
                }}
              />
            </div>
          </div>

          <div className="p-4 flex justify-center overflow-x-auto">
            <Calendar
              mode="range"
              selected={{
                from: getDisplayDate(watchedValues.startDate),
                to: getDisplayDate(watchedValues.endDate),
              }}
              onSelect={(range) => {
                setValue('startDate', range?.from ?? '');
                setValue('endDate', range?.to ?? '');
                setValue('presetLabel', undefined);
              }}
              numberOfMonths={numberOfMonths}
              className="w-full"
            />
          </div>
        </main>
      </form>
    </ResponsiveModal>
  );
}
