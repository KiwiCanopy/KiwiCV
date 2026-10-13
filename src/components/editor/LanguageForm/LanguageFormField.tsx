import React from 'react';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { FieldLock } from '@/components/ui/fieldLock';
import { useTranslation } from '@/hooks/useTranslation';
import { type FluencyLevel, type ResumeData } from '@/types/resume';

import { FLUENCY_LEVELS, type LocalLanguage } from './types';

interface LanguageFormFieldProps {
  item: LocalLanguage;
  index: number;
  updateLanguage: (index: number, updatedFields: Partial<ResumeData['languages'][0]>) => void;
  /** From `useLockedFields`: the lock on a field, or `undefined`. */
  lockFor: (field: keyof ResumeData['languages'][number] & string) => FieldLock | null | undefined;
}

export const LanguageFormField: React.FC<LanguageFormFieldProps> = ({
  item,
  index,
  updateLanguage,
  lockFor,
}) => {
  const { t, tCV } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label={t('editor.fields.language')}
          value={item.language}
          onChange={(e) => updateLanguage(index, { language: e.target.value })}
          placeholder={tCV('placeholders.languages.name')}
          lock={lockFor('language')}
        />
        <Select
          label={t('editor.fields.level')}
          value={item.level !== undefined ? item.level.toString() : '0'}
          onChange={(e) =>
            updateLanguage(index, {
              level: (parseInt(e.target.value) || 0) as FluencyLevel,
            })
          }
          options={FLUENCY_LEVELS.map((level) => ({
            value: level.value.toString(),
            label: tCV(level.label),
          }))}
          lock={lockFor('level')}
        />
      </div>
      <div className="mt-4">
        <Input
          label={t('editor.fields.certificate')}
          value={item.certificate}
          onChange={(e) => updateLanguage(index, { certificate: e.target.value })}
          placeholder={tCV('placeholders.certificates.name')}
          lock={lockFor('certificate')}
        />
      </div>
    </>
  );
};
