import { Calendar } from '@/components/ui/Calendar';
import { PopoverContent } from '@/components/ui/Popover';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { DateFormatSelector } from '@/components/ui/date-picker/DateFormatSelector';
import { DatePrecisionFields } from '@/components/ui/date-picker/DatePrecisionFields';
import { type DatePickerModel } from '@/components/ui/date-picker/useDatePicker';

interface DatePickerPopoverProps {
  model: DatePickerModel;
  date?: Date;
  placeholder?: string;
  showToday: boolean;
  allowGranularityChange: boolean;
  enableCurrentDateButton: boolean;
  currentDateLabel?: string;
  showFormatSelector: boolean;
  labelledBy?: string;
}

export function DatePickerPopover({
  model,
  date,
  placeholder,
  showToday,
  allowGranularityChange,
  enableCurrentDateButton,
  currentDateLabel,
  showFormatSelector,
  labelledBy,
}: DatePickerPopoverProps) {
  return (
    <PopoverContent
      className="flex h-[470px] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden p-0"
      align="start"
      side="bottom"
      aria-labelledby={labelledBy}
    >
      {allowGranularityChange && (
        <div className="border-border shrink-0 border-b p-3">
          {showFormatSelector && (
            <div className="border-border/60 mb-3 flex items-center justify-between border-b pb-2.5">
              <span className="text-muted-foreground text-xs font-bold">
                {model.translate('common.date.format', 'Format')}
              </span>
              <DateFormatSelector
                value={model.activeFormat}
                onChange={model.handleFormatChange}
                translate={model.translate}
              />
            </div>
          )}
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
                {model.stepLabel}
              </p>
              <p className="text-foreground text-sm font-semibold">{model.selectedSummary}</p>
            </div>
          </div>
          <SegmentedToggle
            value={model.granularity}
            onChange={(value) => model.setGranularity(value)}
            options={model.granularityOptions}
            variant="pill"
            className="h-8"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        {model.granularity === 'day' ? (
          <Calendar
            mode="single"
            selected={model.hasSelectedDay ? model.tempDate : undefined}
            onSelect={model.handleDaySelect}
            autoFocus
            locale={model.uiLocale}
            month={model.month}
            onMonthChange={model.setMonthView}
            // ⚠️ Not shown-and-disabled: a `disabled` matcher dead-ends arrow and
            // Home/Page keys at every boundary (`code/UI_PATTERNS.md`).
            showOutsideDays={false}
            className="p-3"
          />
        ) : (
          <DatePrecisionFields model={model} />
        )}
      </div>

      {((enableCurrentDateButton && date) || showToday || (date && !enableCurrentDateButton)) && (
        <div className="border-border flex shrink-0 gap-2 border-t p-3">
          {date && !enableCurrentDateButton && (
            <FooterButton onClick={() => model.handleCommit(undefined)} variant="muted">
              {model.translate('common.clear', 'Clear')}
            </FooterButton>
          )}
          {enableCurrentDateButton && date && (
            <FooterButton onClick={() => model.handleCommit(undefined)} variant="primary">
              {currentDateLabel || placeholder || model.translate('common.date.current', 'Current')}
            </FooterButton>
          )}
          {showToday && (
            <FooterButton onClick={model.handleToday} variant="today">
              {model.translate('common.date.today', 'Today')}
            </FooterButton>
          )}
        </div>
      )}
    </PopoverContent>
  );
}

function FooterButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'muted' | 'primary' | 'today';
}) {
  const className: Record<typeof variant, string> = {
    muted:
      'bg-muted text-foreground hover:bg-accent inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors',
    primary:
      'bg-primary text-primary-foreground inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors hover:opacity-90',
    today:
      'bg-muted text-foreground hover:bg-accent flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors',
  };

  return (
    <button type="button" onClick={onClick} className={className[variant]}>
      {children}
    </button>
  );
}
