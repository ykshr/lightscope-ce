import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useIsDesktop } from '@/hooks/useMediaQuery';

interface DateBeforeAfterInputProps {
  label?: string;
  afterValue: Date | undefined;
  beforeValue: Date | undefined;
  onChange: (name: 'before' | 'after', value: Date | undefined) => void;
}

export default function DateBeforeAfterInput({
  label,
  afterValue,
  beforeValue,
  onChange,
}: DateBeforeAfterInputProps) {
  const [mode, setMode] = useState<'after' | 'before' | 'range' | 'none'>(() => {
    if (afterValue && beforeValue) return 'range';
    if (afterValue) return 'after';
    if (beforeValue) return 'before';
    return 'none';
  });

  const handleModeChange = (newMode: 'after' | 'before' | 'range' | 'none') => {
    setMode(newMode);
    // Clear unnecessary values when switching modes
    if (newMode === 'after') onChange('before', undefined);
    if (newMode === 'before') onChange('after', undefined);
    if (newMode === 'none') {
      onChange('after', undefined);
      onChange('before', undefined);
    }
  };

  return (
    <div className="space-y-2 border p-3 rounded-md bg-muted/10">
      <div className="flex items-center justify-between">
        {label && <Label>{label}</Label>}
        <Select value={mode} onValueChange={(v: any) => handleModeChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No selection</SelectItem>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="after">After</SelectItem>
            <SelectItem value="range">Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {mode === 'range' ? (
          // Range selection mode
          <DateRangePickerField
            from={afterValue}
            to={beforeValue}
            onChange={(range) => {
              onChange('after', range?.from);
              onChange('before', range?.to);
            }}
          />
        ) : (
          // Single selection mode (After / Before)
          <div className="grid grid-cols-2 gap-2">
            {mode === 'after' && (
              <div className="col-span-2 space-y-1">
                <DatePickerField value={afterValue} onChange={(date) => onChange('after', date)} />
              </div>
            )}
            {mode === 'before' && (
              <div className="col-span-2 space-y-1">
                <DatePickerField
                  value={beforeValue}
                  onChange={(date) => onChange('before', date)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * For single date selection
 */
const DatePickerField = ({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('w-full justify-start', !value && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {value ? format(value, 'yyyy/MM/dd', { locale: ja }) : 'Select date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} autoFocus />
      </PopoverContent>
    </Popover>
  );
};

/**
 * For range selection (Range Mode)
 */
const DateRangePickerField = ({
  from,
  to,
  onChange,
}: {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (range: DateRange | undefined) => void;
}) => {
  const isDesktop = useIsDesktop();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('w-full justify-start', !from && !to && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {from ? (
            to ? (
              <>
                {format(from, 'yyyy/MM/dd', { locale: ja })} -{' '}
                {format(to, 'yyyy/MM/dd', { locale: ja })}
              </>
            ) : (
              format(from, 'yyyy/MM/dd', { locale: ja })
            )
          ) : (
            <span>Select period</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={onChange}
          numberOfMonths={isDesktop ? 2 : 1}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
};
