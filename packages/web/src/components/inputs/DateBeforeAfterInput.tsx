import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

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
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card shadow-sm">
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* After (From) */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">After (inclusive)</Label>
          <div className="relative">
            <DatePickerField
              value={afterValue}
              onChange={(date) => onChange('after', date)}
              placeholder="Select start date"
            />
            {afterValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('after', undefined);
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear date</span>
              </Button>
            )}
          </div>
        </div>

        {/* Before (To) */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Before (inclusive)</Label>
          <div className="relative">
            <DatePickerField
              value={beforeValue}
              onChange={(date) => onChange('before', date)}
              placeholder="Select end date"
            />
            {beforeValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('before', undefined);
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear date</span>
              </Button>
            )}
          </div>
        </div>
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
  placeholder = 'Select date',
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal pr-8',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {value ? format(value, 'yyyy/MM/dd', { locale: ja }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
