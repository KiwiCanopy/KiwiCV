import React from 'react';

import { trimOnBlur, trimOnKeep } from '@/components/editor/BasicsForm/trimOnBlur';
import { Input } from '@/components/ui/Input';
import type { FieldLock } from '@/components/ui/fieldLock';

interface BasicsFormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  prefix?: React.ReactNode;
  lock?: FieldLock | null;
}

export const BasicsFormField: React.FC<BasicsFormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  className,
  prefix,
  lock,
}) => {
  return (
    <Input
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      // Locked, the value is the pending proposal: trimming it would make "Keep
      // mine" treat the proposal as a later edit and leave it in place.
      onBlur={lock ? undefined : trimOnBlur(onChange)}
      placeholder={placeholder}
      className={className}
      prefix={prefix}
      lock={trimOnKeep(lock)}
    />
  );
};
