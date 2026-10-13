import React from 'react';

import { CharCounter } from '@/components/ui/CharCounter';
import { TextArea } from '@/components/ui/TextArea';
import { useCharCapNotice } from '@/components/ui/useCharCapNotice';
import { AI_MAX_CHAR_LIMIT } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';

interface AICustomPromptConfigProps {
  value: string;
  onChange: (value: string) => void;
}

export const AICustomPromptConfig: React.FC<AICustomPromptConfigProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const cap = useCharCapNotice(value.length, AI_MAX_CHAR_LIMIT);
  const handleChange = cap.track(onChange);

  return (
    <div className="space-y-1">
      <TextArea
        label={t('ai.custom_instructions')}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        aria-describedby={cap.counter.id}
        placeholder={t('ai.custom_instructions_placeholder')}
        rows={4}
        maxLength={AI_MAX_CHAR_LIMIT}
        immediate
      />
      <div className="flex justify-end">
        <CharCounter {...cap.counter} className="text-[10px]" />
      </div>
    </div>
  );
};
