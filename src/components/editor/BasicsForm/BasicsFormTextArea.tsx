import React from 'react';

import { trimOnBlur, trimOnKeep } from '@/components/editor/BasicsForm/trimOnBlur';
import { TextArea } from '@/components/ui/TextArea';
import type { FieldLock } from '@/components/ui/fieldLock';

interface BasicsFormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  lock?: FieldLock | null;
}

export const BasicsFormTextArea: React.FC<BasicsFormTextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows,
  lock,
}) => {
  return (
    <TextArea
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      // ⚠️ `TextArea` defers its own `onChange` to blur in non-HTML mode and
      // fires it *before* `onBlur`, so this re-emits the trimmed value after
      // the untrimmed one and wins. Two writes, last one stored.
      // Not while locked — see `BasicsFormField`.
      onBlur={lock ? undefined : trimOnBlur(onChange)}
      placeholder={placeholder}
      rows={rows}
      lock={trimOnKeep(lock)}
    />
  );
};
