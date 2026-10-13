import * as React from 'react';

import { formatDate, getThemeTranslations } from '@/components/preview/themes/shared';
import {
  type DateFormatType,
  type DateGranularity,
  type DatePickerProps,
} from '@/components/ui/date-picker/types';
import { useTranslation } from '@/hooks/useTranslation';
import { getDateFnsLocale } from '@/utils/date-locales';
import { format, setMonth, setYear } from 'date-fns';

export function useDatePicker({
  date,
  onChange,
  initialGranularity,
  localeCode,
  uiLocaleCode,
  translateLabel,
  showFormatSelector = false,
}: DatePickerProps) {
  const { t, uiLanguage } = useTranslation();
  const dataLocaleCode = localeCode || uiLanguage;
  const interactionLocaleCode = uiLocaleCode || uiLanguage;
  const uiLocale = getDateFnsLocale(interactionLocaleCode);

  // ⚠️ **Two locales, because there are two locale *codes*.** This was
  // one `bcp47`, derived from `dataLocaleCode` and then handed to `formatDate`
  // alongside `interactionLocaleCode` at two of the three sites. With a Japanese
  // UI over an English CV that made the picker disagree with itself: the
  // year-only branch read `code` and produced `2026年`, while the month view
  // read `bcp47` and produced English month names. Pairing each code with its
  // own metadata makes the mismatch unexpressible rather than merely fixed.
  const dataLocale = React.useMemo(() => getThemeTranslations(dataLocaleCode), [dataLocaleCode]);
  const interactionLocale = React.useMemo(
    () => getThemeTranslations(interactionLocaleCode),
    [interactionLocaleCode],
  );
  const [open, setOpen] = React.useState(false);

  const getFormatFromGranularity = React.useCallback((granularity: DateGranularity) => {
    if (granularity === 'year') return 'year';
    if (granularity === 'month') return 'month_year';
    return 'day_month_year';
  }, []);

  const getInitialFormat = React.useCallback((): DateFormatType => {
    const hasDate = date && !isNaN(date.getTime());
    if (hasDate && initialGranularity) return getFormatFromGranularity(initialGranularity);
    return showFormatSelector ? 'month_year' : 'day_month_year';
  }, [date, getFormatFromGranularity, initialGranularity, showFormatSelector]);

  const [activeFormat, setActiveFormat] = React.useState<DateFormatType>(getInitialFormat);
  const [granularity, setGranularity] = React.useState<DateGranularity>(() => {
    const hasDate = date && !isNaN(date.getTime());
    if (hasDate) return initialGranularity || 'day';
    return showFormatSelector ? 'month' : 'year';
  });
  const [displayGranularity, setDisplayGranularity] = React.useState<DateGranularity>(() => {
    const hasDate = date && !isNaN(date.getTime());
    if (hasDate) return initialGranularity || 'day';
    return showFormatSelector ? 'month' : 'day';
  });
  const [yearPageStart, setYearPageStart] = React.useState(() => {
    const year = (date || new Date()).getFullYear();
    return year - 5;
  });
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);
  const [hasSelectedMonth, setHasSelectedMonth] = React.useState(() => {
    const hasDate = date && !isNaN(date.getTime());
    return (
      !!hasDate &&
      (!initialGranularity || initialGranularity === 'month' || initialGranularity === 'day')
    );
  });
  const [hasSelectedDay, setHasSelectedDay] = React.useState(() => {
    const hasDate = date && !isNaN(date.getTime());
    return !!hasDate && (!initialGranularity || initialGranularity === 'day');
  });
  const [month, setMonthView] = React.useState<Date>(date || new Date());

  const translate = React.useCallback(
    (key: string, fallback: string) => {
      const value = translateLabel ? translateLabel(key) : t(key);
      return value === key ? fallback : value;
    },
    [t, translateLabel],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const nextMonth = date || new Date();
      setMonthView(nextMonth);
      setYearPageStart(nextMonth.getFullYear() - 5);

      const hasDate = date && !isNaN(date.getTime());
      const nextGranularity = hasDate
        ? initialGranularity || 'day'
        : showFormatSelector
          ? 'month'
          : 'year';
      const nextDisplayGranularity = hasDate
        ? initialGranularity || 'day'
        : showFormatSelector
          ? 'month'
          : 'day';

      setDisplayGranularity(nextDisplayGranularity);
      setGranularity(nextGranularity);
      setActiveFormat(
        hasDate
          ? initialGranularity
            ? getFormatFromGranularity(initialGranularity)
            : 'day_month_year'
          : showFormatSelector
            ? 'month_year'
            : 'day_month_year',
      );
      setTempDate(date);
      setHasSelectedMonth(
        hasDate
          ? !initialGranularity || initialGranularity === 'month' || initialGranularity === 'day'
          : false,
      );
      setHasSelectedDay(hasDate ? !initialGranularity || initialGranularity === 'day' : false);
    }
    setOpen(nextOpen);
  };

  const handleCommit = (selectedDate: Date | undefined, nextGranularity = granularity) => {
    setDisplayGranularity(nextGranularity);
    onChange?.(selectedDate, nextGranularity);
    setOpen(false);
  };

  const formatDisplayDate = (value: Date) => {
    const activeDisplayGranularity = initialGranularity || displayGranularity;
    const dateString =
      activeDisplayGranularity === 'year'
        ? format(value, 'yyyy')
        : activeDisplayGranularity === 'month'
          ? format(value, 'yyyy-MM')
          : format(value, 'yyyy-MM-dd');
    return formatDate(dateString, dataLocale);
  };

  const monthNames = Array.from({ length: 12 }).map((_, index) =>
    format(setMonth(new Date(2020, 0, 1), index), 'MMM', { locale: uiLocale }),
  );
  const yearOptions = Array.from({ length: 12 }).map((_, index) => yearPageStart + index);
  const stepLabel = translate(`common.date.granularity.${granularity}`, granularity);
  const selectedSummary = React.useMemo(() => {
    const dateToFormat = tempDate || month;
    const summaryGranularity = granularity === 'day' && !hasSelectedDay ? 'month' : granularity;
    const dateString =
      summaryGranularity === 'year'
        ? format(dateToFormat, 'yyyy')
        : summaryGranularity === 'month'
          ? format(dateToFormat, 'yyyy-MM')
          : format(dateToFormat, 'yyyy-MM-dd');
    return formatDate(dateString, interactionLocale);
  }, [granularity, hasSelectedDay, interactionLocale, month, tempDate]);

  const handleFormatChange = (newFormat: DateFormatType) => {
    setActiveFormat(newFormat);
    if (newFormat === 'year') setGranularity('year');
    else if (newFormat === 'month_year') setGranularity('month');
    else setGranularity('day');
  };

  const granularityOptions = React.useMemo(() => {
    const options: { value: DateGranularity; label: string }[] = [
      { value: 'year', label: translate('common.date.granularity.year', 'Year') },
      { value: 'month', label: translate('common.date.granularity.month', 'Month') },
      { value: 'day', label: translate('common.date.granularity.day', 'Day') },
    ];
    if (!showFormatSelector) return options;
    if (activeFormat === 'year') return options.filter((option) => option.value === 'year');
    if (activeFormat === 'month_year') {
      return options.filter((option) => option.value === 'year' || option.value === 'month');
    }
    return options;
  }, [activeFormat, showFormatSelector, translate]);

  const handleDaySelect = (selectedDate: Date | undefined) => {
    const finalDate = selectedDate || tempDate || date;
    setTempDate(finalDate);
    setHasSelectedDay(true);
    setHasSelectedMonth(true);
    handleCommit(finalDate, 'day');
  };

  const handleMonthSelect = (monthIndex: number) => {
    const baseDate = tempDate || month || new Date();
    const newDate = setMonth(baseDate, monthIndex);
    setTempDate(newDate);
    setMonthView(newDate);
    setHasSelectedMonth(true);
    setHasSelectedDay(false);
    if (showFormatSelector && activeFormat === 'month_year') handleCommit(newDate, 'month');
    else setGranularity('day');
  };

  const handleYearSelect = (year: number) => {
    const baseDate = tempDate || month || new Date();
    const newDate = setYear(baseDate, year);
    setTempDate(newDate);
    setMonthView(newDate);
    setHasSelectedMonth(false);
    setHasSelectedDay(false);
    if (showFormatSelector && activeFormat === 'year') handleCommit(newDate, 'year');
    else setGranularity('month');
  };

  const handleToday = () => {
    const today = new Date();
    setMonthView(today);
    handleCommit(today, 'day');
  };

  return {
    activeFormat,
    // ⚠️ `bcp47` and `interactionLocaleCode` were both on this model and are
    // both gone. They were the two halves of one pair, exported
    // separately, which is what let `DatePrecisionFields` recombine them into a
    // mismatched call the hook itself never made. Exporting the *object*
    // removes the recombination step rather than guarding it.
    dataLocale,
    interactionLocale,
    formatDisplayDate,
    granularity,
    granularityOptions,
    handleCommit,
    handleDaySelect,
    handleFormatChange,
    handleMonthSelect,
    handleOpenChange,
    handleToday,
    handleYearSelect,
    hasSelectedDay,
    hasSelectedMonth,
    month,
    monthNames,
    open,
    selectedSummary,
    setGranularity,
    setMonthView,
    setYearPageStart,
    stepLabel,
    tempDate,
    translate,
    uiLocale,
    yearOptions,
    yearPageStart,
  };
}

export type DatePickerModel = ReturnType<typeof useDatePicker>;
