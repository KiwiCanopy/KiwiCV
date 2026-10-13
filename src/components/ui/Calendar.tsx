import * as React from 'react';

import { cn } from '@/utils/cn';
import { DayPicker } from '@daypicker/react';
import '@daypicker/react/style.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 text-sm', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'w-full space-y-4',
        month_caption: 'flex h-8 items-center justify-center px-10 relative',
        caption_label: 'text-sm font-medium',
        nav: 'pointer-events-none absolute top-0 left-0 right-0 flex h-8 items-center justify-between z-10',
        button_previous: cn(
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground pointer-events-auto absolute left-1 inline-flex h-8 w-8 items-center justify-center rounded-md opacity-50 transition-colors transition-opacity hover:opacity-100',
        ),
        button_next: cn(
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground pointer-events-auto absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-md opacity-50 transition-colors transition-opacity hover:opacity-100',
        ),
        month_grid: 'w-full table-fixed border-collapse',
        weekdays: 'border-b border-transparent',
        weekday: 'text-muted-foreground h-8 w-10 pb-1 text-center text-xs font-semibold',
        day: 'text-foreground h-10 w-10 p-0 text-center align-middle',
        day_button: cn(
          // ⚠️ `disabled:pointer-events-none`, or a cell that cannot be clicked
          // still fills under the cursor (`code/UI_PATTERNS.md`).
          'hover:bg-accent hover:text-accent-foreground focus:ring-ring mx-auto flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none',
        ),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground',
        // Brand green marks today. It has to stay legible against `selected`
        // above, so this is a tint plus a ring rather than a second fill.
        today:
          '[&:not([aria-selected=true])>button]:bg-kiwi/20 [&:not([aria-selected=true])>button]:ring-kiwi [&:not([aria-selected=true])>button]:text-foreground [&:not([aria-selected=true])>button]:font-bold [&:not([aria-selected=true])>button]:ring-1 [&:not([aria-selected=true])>button:hover]:bg-kiwi/35',
        outside: 'text-muted-foreground opacity-50 data-[selected=true]:opacity-40',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'bg-accent text-accent-foreground',
        range_end: 'rounded-r-md',
        range_start: 'rounded-l-md',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
