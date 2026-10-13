import { type Ref, type SelectHTMLAttributes, useId } from 'react';

import { LANGUAGES, type LocaleCode } from '@/locales/index';
import { cn } from '@/utils/cn';

/**
 * An option appended after the locale list. `TExtra` is the caller's own value
 * union (a sentinel like `'other'`), so only the call site that opts in has to
 * widen its state — the seven call sites that pass locales only keep seeing
 * `LocaleCode | ''`.
 */
export interface LocaleSelectExtraOption<TExtra extends string> {
  value: TExtra;
  label: string;
}

interface LocaleSelectProps<TExtra extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'value' | 'onChange'
> {
  label: string;
  value: LocaleCode | '' | TExtra;
  onValueChange: (locale: LocaleCode | '' | TExtra) => void;
  localeCodes?: readonly LocaleCode[];
  extraOptions?: readonly LocaleSelectExtraOption<TExtra>[];
  placeholder?: string;
  showLabel?: boolean;
  wrapperClassName?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function LocaleSelect<TExtra extends string = never>({
  className,
  extraOptions,
  id,
  label,
  localeCodes,
  onValueChange,
  placeholder,
  ref,
  showLabel = true,
  value,
  wrapperClassName,
  ...props
}: LocaleSelectProps<TExtra>) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const languages = localeCodes
    ? localeCodes.map((code) => LANGUAGES.find((language) => language.code === code)!)
    : LANGUAGES;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      <label
        htmlFor={controlId}
        className={cn('text-foreground mb-1 block text-sm font-medium', !showLabel && 'sr-only')}
      >
        {label}
      </label>
      <select
        ref={ref}
        id={controlId}
        value={value}
        onChange={(event) => onValueChange(event.target.value as LocaleCode | '' | TExtra)}
        className={cn(
          'border-input bg-card text-foreground min-h-11 w-full rounded-lg border px-3 py-2',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.code.toUpperCase()} — {language.label}
          </option>
        ))}
        {extraOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
