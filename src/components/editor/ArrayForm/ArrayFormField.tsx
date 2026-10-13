import { useId } from 'react';

import {
  type ArrayFormItem,
  type ArrayFormKey,
  type FieldConfig,
  type LocalItem,
} from '@/components/editor/ArrayForm/types';
import { type DateGranularity, DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { TagField } from '@/components/ui/TagField';
import { TextArea } from '@/components/ui/TextArea';
import type { FieldLock } from '@/components/ui/fieldLock';
import { useTranslation } from '@/hooks/useTranslation';
import { normalizeDate } from '@/utils/normalizeDate';
import { format, parseISO } from 'date-fns';

interface ArrayFormFieldProps<K extends ArrayFormKey> {
  field: FieldConfig<ArrayFormItem<K>>;
  item: LocalItem<ArrayFormItem<K>>;
  index: number;
  itemStartDateKey?: keyof ArrayFormItem<K>;
  itemEndDateKey?: keyof ArrayFormItem<K>;
  updateItem: (index: number, updatedFields: Partial<ArrayFormItem<K>>) => void;
  /** Set while a pending AI proposal covers this field; see `useLockedFields`. */
  lock: FieldLock | null | undefined;
}

export function ArrayFormField<K extends ArrayFormKey>({
  field,
  item,
  index,
  itemStartDateKey,
  itemEndDateKey,
  updateItem,
  lock,
}: ArrayFormFieldProps<K>) {
  const { t, tCV, cvLanguage, uiLanguage } = useTranslation();
  const dateLabelId = useId();
  const dateTriggerId = useId();

  const fieldValue = item[field.name];
  const isArray = Array.isArray(fieldValue) || field.type === 'tags';
  const isDateField =
    field.type === 'date' || field.name === itemStartDateKey || field.name === itemEndDateKey;

  const getParsedDate = (val: string): { date: Date | undefined; granularity: DateGranularity } => {
    if (!val) return { date: undefined, granularity: 'day' };
    const normalized = normalizeDate(val);
    // ⚠️ `parseISO`, never `new Date(...)`. A stored date is a CALENDAR date, and
    // the `Date` constructor reads the date-only form as UTC — so west of UTC the
    // picker opened a day early and `formatToValue` wrote that back.
    //
    // ⚠️ Every branch must go through `usable`. `parseISO` REJECTS an impossible
    // date where `new Date` rolled it over (`2019-02-29` → Invalid vs 1 March),
    // and `DatePicker` formats any truthy date — so an unguarded `Invalid Date`
    // throws `RangeError` during render, and there is no error boundary in this
    // app to contain it.
    const usable = (d: Date): Date | undefined => (isNaN(d.getTime()) ? undefined : d);

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return { date: usable(parseISO(normalized)), granularity: 'day' };
    }
    if (/^\d{4}-\d{2}$/.test(normalized)) {
      return { date: usable(parseISO(`${normalized}-01`)), granularity: 'month' };
    }
    if (/^\d{4}$/.test(normalized)) {
      return { date: usable(parseISO(`${normalized}-01-01`)), granularity: 'year' };
    }
    return { date: usable(new Date(val)), granularity: 'day' };
  };

  const formatToValue = (date: Date | undefined, granularity: DateGranularity): string => {
    if (!date) return '';
    if (granularity === 'year') return format(date, 'yyyy');
    if (granularity === 'month') return format(date, 'yyyy-MM');
    return format(date, 'yyyy-MM-dd');
  };

  const { date, granularity } = getParsedDate((fieldValue as string) || '');
  const dateFieldLabel =
    field.name === itemStartDateKey
      ? t('editor.fields.start_date')
      : field.name === itemEndDateKey
        ? t('editor.fields.end_date')
        : field.label;

  let infoHint = field.infoHint;
  if (!infoHint && field.name === itemEndDateKey) {
    infoHint = tCV('editor.hints.leave_empty_for_present');
  }

  if (isArray) {
    const singularLabel =
      field.name === 'highlights'
        ? t('editor.fields.highlight')
        : field.name === 'courses'
          ? t('editor.fields.course')
          : field.name === 'keywords'
            ? t('editor.fields.keyword')
            : undefined;

    return (
      <TagField
        key={field.name}
        label={field.label}
        singularLabel={singularLabel}
        value={fieldValue as string[]}
        onChange={(val) => updateItem(index, { [field.name]: val } as Partial<ArrayFormItem<K>>)}
        placeholder={field.placeholder}
        infoHint={infoHint}
        infoIcon={field.infoIcon}
        layoutHint={field.layoutHint}
        layoutIcon={field.layoutIcon}
        type={field.name === 'highlights' || field.type === 'textarea' ? 'textarea' : 'input'}
        rows={field.name === 'highlights' || field.type === 'textarea' ? 3 : 1}
        lock={lock}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <TextArea
        key={field.name}
        label={field.label}
        value={(fieldValue as string) || ''}
        onChange={(e) =>
          updateItem(index, { [field.name]: e.target.value } as Partial<ArrayFormItem<K>>)
        }
        placeholder={field.placeholder}
        rows={3}
        infoHint={infoHint}
        infoIcon={field.infoIcon}
        layoutHint={field.layoutHint}
        layoutIcon={field.layoutIcon}
        lock={lock}
      />
    );
  }

  if (isDateField) {
    return (
      <div className="w-full">
        {dateFieldLabel && (
          <label
            id={dateLabelId}
            htmlFor={dateTriggerId}
            className="text-foreground mb-1 block text-sm font-medium"
          >
            {dateFieldLabel}
          </label>
        )}
        <DatePicker
          id={dateTriggerId}
          labelledBy={dateFieldLabel ? dateLabelId : undefined}
          date={date}
          lock={lock}
          initialGranularity={granularity}
          enableCurrentDateButton={field.name === itemEndDateKey}
          currentDateLabel={t('common.date.use_current')}
          localeCode={cvLanguage}
          uiLocaleCode={uiLanguage}
          showFormatSelector={true}
          onChange={(newDate, newGran) => {
            updateItem(index, {
              [field.name]: formatToValue(newDate, newGran),
            } as Partial<ArrayFormItem<K>>);
          }}
          placeholder={
            field.name === itemEndDateKey
              ? infoHint || tCV('common.date.label')
              : tCV('editor.fields.date')
          }
        />
      </div>
    );
  }

  return (
    <Input
      key={field.name}
      type="text"
      label={field.label}
      value={(fieldValue as string) || ''}
      onChange={(e) =>
        updateItem(index, { [field.name]: e.target.value } as Partial<ArrayFormItem<K>>)
      }
      placeholder={field.placeholder}
      infoHint={infoHint}
      infoIcon={field.infoIcon}
      layoutHint={field.layoutHint}
      layoutIcon={field.layoutIcon}
      lock={lock}
    />
  );
}
