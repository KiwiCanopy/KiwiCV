import { formatDate } from '@/components/preview/themes/shared';
import { type DatePickerModel } from '@/components/ui/date-picker/useDatePicker';
import { cn } from '@/utils/cn';
import { format, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePrecisionFieldsProps {
  model: DatePickerModel;
}

function PagerButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-input hover:bg-muted rounded-md border p-1"
    >
      {children}
    </button>
  );
}

export function DatePrecisionFields({ model }: DatePrecisionFieldsProps) {
  if (model.granularity === 'month') {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center p-3">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <span className="text-sm font-semibold">
            {formatDate(format(model.month, 'yyyy'), model.interactionLocale)}
          </span>
          <div className="flex gap-1">
            <PagerButton
              onClick={() =>
                model.setMonthView(setYear(model.month, model.month.getFullYear() - 1))
              }
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </PagerButton>
            <PagerButton
              onClick={() =>
                model.setMonthView(setYear(model.month, model.month.getFullYear() + 1))
              }
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </PagerButton>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {model.monthNames.map((name, index) => (
            <button
              type="button"
              key={index}
              onClick={() => model.handleMonthSelect(index)}
              className={cn(
                'rounded-lg px-2 py-3 text-xs font-semibold transition-all active:scale-95',
                model.hasSelectedMonth &&
                  model.tempDate &&
                  model.tempDate.getMonth() === index &&
                  model.tempDate.getFullYear() === model.month.getFullYear()
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center p-3">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <span className="text-sm font-semibold">
          {model.yearPageStart} - {model.yearPageStart + 11}
        </span>
        <div className="flex gap-1">
          <PagerButton onClick={() => model.setYearPageStart((value) => value - 12)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </PagerButton>
          <PagerButton onClick={() => model.setYearPageStart((value) => value + 12)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </PagerButton>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {model.yearOptions.map((year) => (
          <button
            type="button"
            key={year}
            onClick={() => model.handleYearSelect(year)}
            className={cn(
              'rounded-lg px-2 py-3 text-xs font-semibold transition-all active:scale-95',
              model.tempDate && model.tempDate.getFullYear() === year
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
