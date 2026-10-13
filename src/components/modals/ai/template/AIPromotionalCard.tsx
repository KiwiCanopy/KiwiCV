import React from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Languages, Sparkles } from 'lucide-react';

export type AIStyleType = 'professional' | 'literal' | 'translate_close';

interface AIPromotionalCardProps {
  type: AIStyleType;
}

export const AIPromotionalCard: React.FC<AIPromotionalCardProps> = ({ type }) => {
  const { t } = useTranslation();

  let icon: React.ReactNode;
  let text: string;

  switch (type) {
    case 'professional':
      icon = <Sparkles className="text-primary-strong h-5 w-5" aria-hidden="true" />;
      text = t('ai.mode_professional_desc');
      break;
    case 'literal':
      icon = <FileText className="text-primary-strong h-5 w-5" aria-hidden="true" />;
      text = t('ai.import_style_literal_desc');
      break;
    case 'translate_close':
      icon = <Languages className="text-primary-strong h-5 w-5" aria-hidden="true" />;
      text = t('ai.translate_close_marketing');
      break;
  }

  return (
    <div className="border-border bg-muted/30 flex items-start gap-3 rounded-xl border p-4">
      <span className="bg-background border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
        {icon}
      </span>
      <p className="text-muted-foreground pt-1 text-sm leading-6">{text}</p>
    </div>
  );
};
