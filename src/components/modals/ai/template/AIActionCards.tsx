import React from 'react';
import { LuUserPen } from 'react-icons/lu';

import { OptionCard } from '@/components/ui/OptionCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Briefcase, FileText, Languages, Sparkles } from 'lucide-react';

export type AIActionType =
  'professional' | 'job_description' | 'custom' | 'literal' | 'translate_close';

interface AIActionCardsProps {
  onSelect: (id: AIActionType) => void;
  showLiteral?: boolean;
  showTranslate?: boolean;
  className?: string;
  disabled?: boolean;
  overrides?: {
    professional?: { description?: string };
    job_description?: { description?: string };
    custom?: { description?: string };
    literal?: { description?: string };
    translate_close?: { description?: string };
  };
}

export const AIActionCards: React.FC<AIActionCardsProps> = ({
  onSelect,
  showLiteral = false,
  showTranslate = false,
  className,
  disabled,
  overrides,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <OptionCard
        title={t('ai.mode_job')}
        description={overrides?.job_description?.description || t('ai.mode_job_desc')}
        icon={<Briefcase className="text-primary-strong h-6 w-6" aria-hidden="true" />}
        onClick={() => onSelect('job_description')}
        className={className}
        disabled={disabled}
      />
      <OptionCard
        title={t('ai.mode_professional')}
        description={overrides?.professional?.description || t('ai.mode_professional_desc')}
        icon={<Sparkles className="text-primary-strong h-6 w-6" aria-hidden="true" />}
        onClick={() => onSelect('professional')}
        className={className}
        disabled={disabled}
      />
      <OptionCard
        title={t('ai.mode_custom')}
        description={overrides?.custom?.description || t('ai.mode_custom_desc')}
        icon={<LuUserPen className="text-primary-strong h-6 w-6" aria-hidden="true" />}
        onClick={() => onSelect('custom')}
        className={className}
        disabled={disabled}
      />
      {showTranslate && (
        <OptionCard
          title={t('ai.mode_translate_close')}
          description={overrides?.translate_close?.description || t('ai.mode_translate_close_desc')}
          icon={<Languages className="text-primary-strong h-6 w-6" aria-hidden="true" />}
          onClick={() => onSelect('translate_close')}
          className={className}
          disabled={disabled}
        />
      )}
      {showLiteral && (
        <OptionCard
          title={t('ai.import_style_literal')}
          description={overrides?.literal?.description || t('ai.import_style_literal_desc')}
          icon={<FileText className="text-primary-strong h-6 w-6" aria-hidden="true" />}
          onClick={() => onSelect('literal')}
          className={className}
          disabled={disabled}
        />
      )}
    </>
  );
};
