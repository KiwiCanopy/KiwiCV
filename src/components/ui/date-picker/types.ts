import { type FieldLock } from '@/components/ui/fieldLock';
import { type LocaleCode } from '@/locales';

export type DateGranularity = 'year' | 'month' | 'day';
export type DateFormatType = 'year' | 'month_year' | 'day_month_year';

export interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined, granularity: DateGranularity) => void;
  placeholder?: string;
  className?: string;
  showToday?: boolean;
  initialGranularity?: DateGranularity;
  allowGranularityChange?: boolean;
  enableCurrentDateButton?: boolean;
  currentDateLabel?: string;
  localeCode?: LocaleCode;
  uiLocaleCode?: LocaleCode;
  translateLabel?: (key: string) => string;
  showFormatSelector?: boolean;
  /**
   * The id of the visible label. The trigger is named by it plus the date it
   * shows; while empty, by the label alone, with the placeholder as its
   * description. The popover dialog takes the same name.
   */
  labelledBy?: string;
  /** The trigger's id, for a `<label htmlFor>`. */
  id?: string;
  /**
   * Locks the picker, its reason rendered above the trigger: the trigger stays
   * focusable and `aria-disabled`, and the calendar does not open.
   */
  lock?: FieldLock | null;
}

export type DateLabelTranslator = (key: string, fallback: string) => string;
