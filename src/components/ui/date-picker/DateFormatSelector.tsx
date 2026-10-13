import { useEffect, useRef, useState } from 'react';

import { type DateFormatType, type DateLabelTranslator } from '@/components/ui/date-picker/types';
import { cn } from '@/utils/cn';
import { Check, ChevronDown } from 'lucide-react';

interface DateFormatSelectorProps {
  value: DateFormatType;
  onChange: (value: DateFormatType) => void;
  translate: DateLabelTranslator;
}

export function DateFormatSelector({ value, onChange, translate }: DateFormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'year' as const, label: translate('common.date.formats.year', 'Year') },
    {
      value: 'month_year' as const,
      label: translate('common.date.formats.month_year', 'Month & Year'),
    },
    {
      value: 'day_month_year' as const,
      label: translate('common.date.formats.day_month_year', 'Day, Month & Year'),
    },
  ];
  const currentOption = options.find((option) => option.value === value) || options[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="border-input bg-card hover:bg-muted group focus-visible:ring-primary-strong flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
      >
        <span className="truncate">{currentOption.label}</span>
        <ChevronDown
          size={12}
          className={cn(
            'text-muted-foreground/60 group-hover:text-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          strokeWidth={3}
        />
      </button>

      {isOpen && (
        <div className="border-border bg-popover animate-in fade-in-50 zoom-in-95 absolute right-0 z-[300] mt-1 flex w-48 flex-col gap-0.5 rounded-lg border p-1 shadow-lg duration-100">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'hover:bg-muted flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
                value === option.value ? 'bg-muted text-foreground font-bold' : 'text-foreground',
              )}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={12} className="ml-2 h-3 w-3 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
