import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
  locale?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Selecione uma data',
  align = 'center',
  locale = 'pt-BR',
  ...props
}: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y', { locale: ptBR })} -{' '}
                  {format(value.to, 'LLL dd, y', { locale: ptBR })}
                </>
              ) : (
                format(value.from, 'LLL dd, y', { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
