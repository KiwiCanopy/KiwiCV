import { useId } from 'react';

import { LockedReason } from '@/components/ui/LockedReason';
import { Popover, PopoverTrigger } from '@/components/ui/Popover';
import { DatePickerPopover } from '@/components/ui/date-picker/DatePickerPopover';
import { type DatePickerProps } from '@/components/ui/date-picker/types';
import { useDatePicker } from '@/components/ui/date-picker/useDatePicker';
import { LOCKED_CONTROL_CLASS, lockedReasonId } from '@/components/ui/fieldLock';
import { cn } from '@/utils/cn';
import { Calendar as CalendarIcon } from 'lucide-react';

export type {
  DateFormatType,
  DateGranularity,
  DatePickerProps,
} from '@/components/ui/date-picker/types';

export function DatePicker({
  date,
  placeholder,
  className,
  showToday = false,
  allowGranularityChange = true,
  enableCurrentDateButton = false,
  currentDateLabel,
  showFormatSelector = false,
  labelledBy,
  id,
  lock,
  ...props
}: DatePickerProps) {
  const valueId = useId();
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const model = useDatePicker({
    ...props,
    date,
    placeholder,
    className,
    showToday,
    allowGranularityChange,
    enableCurrentDateButton,
    currentDateLabel,
    showFormatSelector,
  });

  const describedBy =
    [lock ? lockedReasonId(triggerId) : undefined, labelledBy && !date ? valueId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <>
      <LockedReason controlId={triggerId} lock={lock} />
      <Popover
        open={model.open && !lock}
        onOpenChange={(nextOpen) => {
          if (lock && nextOpen) return;
          model.handleOpenChange(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            id={triggerId}
            aria-labelledby={labelledBy && date ? `${labelledBy} ${valueId}` : labelledBy}
            aria-describedby={describedBy}
            aria-disabled={lock ? true : undefined}
            className={cn(
              'border-input bg-card focus:border-primary-strong focus:ring-primary-strong/20 flex min-h-[42px] w-full items-center justify-start rounded-md border px-3 py-2 text-left text-base font-normal shadow-sm transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              !date && 'text-muted-foreground',
              lock && LOCKED_CONTROL_CLASS,
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {/* Dates and placeholders are in the CV's language, not the UI's. */}
            <span id={valueId} lang={props.localeCode} className="truncate whitespace-nowrap">
              {date
                ? model.formatDisplayDate(date)
                : placeholder || model.translate('common.date.label', 'Pick a date')}
            </span>
          </button>
        </PopoverTrigger>
        <DatePickerPopover
          model={model}
          date={date}
          placeholder={placeholder}
          showToday={showToday}
          allowGranularityChange={allowGranularityChange}
          enableCurrentDateButton={enableCurrentDateButton}
          currentDateLabel={currentDateLabel}
          showFormatSelector={showFormatSelector}
          labelledBy={labelledBy}
        />
      </Popover>
    </>
  );
}
