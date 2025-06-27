import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center mb-1',
        caption_label: 'text-sm font-semibold text-gray-900 dark:text-gray-100',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-white border-gray-300 p-0 opacity-70 hover:opacity-100 hover:bg-gray-50 transition-all duration-200',
          'dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-gray-500 rounded-md w-9 font-medium text-[0.8rem] dark:text-gray-400',
        row: 'flex w-full mt-2',
        cell: cn(
          'h-9 w-9 text-center text-sm p-0 relative transition-colors duration-200',
          '[&:has([aria-selected].day-range-end)]:rounded-r-md',
          '[&:has([aria-selected].day-outside)]:bg-blue-50/50 dark:[&:has([aria-selected].day-outside)]:bg-blue-900/20',
          '[&:has([aria-selected])]:bg-blue-50 dark:[&:has([aria-selected])]:bg-blue-900/30',
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          'focus-within:relative focus-within:z-20'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md transition-all duration-200',
          'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:bg-blue-600',
        day_today:
          'bg-blue-100 text-blue-900 font-semibold dark:bg-blue-900/40 dark:text-blue-100',
        day_outside:
          'day-outside text-gray-400 opacity-50 aria-selected:bg-blue-50/50 aria-selected:text-gray-400 aria-selected:opacity-30 dark:text-gray-600',
        day_disabled: 'text-gray-300 opacity-50 dark:text-gray-700',
        day_range_middle:
          'aria-selected:bg-blue-50 aria-selected:text-blue-900 dark:aria-selected:bg-blue-900/30 dark:aria-selected:text-blue-100',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
