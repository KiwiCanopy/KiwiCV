import React from 'react';

import type { AIActionType } from '@/components/modals/ai/template/AIActionCards';
import { DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import { Briefcase, FileText, Languages, SlidersHorizontal, Sparkles } from 'lucide-react';

interface AICompactHeaderProps {
  mode: AIActionType | AIPromptMode | null;
  title: string;
  subtitle?: string;
  borderClass?: string;
  paddingClass?: string;
  marginClass?: string;
  /**
   * True when this header sits inside a `DialogFrame` and its heading is the
   * dialog's accessible name. False renders plain `h2`/`p`, for the copies of
   * this header that render outside any dialog.
   */
  isDialogTitle?: boolean;
}

export const AICompactHeader: React.FC<AICompactHeaderProps> = ({
  mode,
  title,
  subtitle,
  borderClass = 'border-b border-border',
  paddingClass = 'pl-6 pr-16 py-4 sm:pl-10 sm:pr-24 sm:py-6',
  marginClass = '',
  isDialogTitle = false,
}) => {
  const renderIcon = () => {
    switch (mode) {
      case 'job_description':
        return <Briefcase className="relative h-5 w-5 sm:h-6 sm:w-6" />;
      case 'custom':
        return <SlidersHorizontal className="relative h-5 w-5 sm:h-6 sm:w-6" />;
      case 'professional':
        return <Sparkles className="relative h-5 w-5 sm:h-6 sm:w-6" />;
      case 'translate_close':
        return <Languages className="relative h-5 w-5 sm:h-6 sm:w-6" />;
      case 'literal':
        return <FileText className="relative h-5 w-5 sm:h-6 sm:w-6" />;
      default:
        return <Sparkles className="relative h-5 w-5 sm:h-6 sm:w-6" />;
    }
  };

  const TitleComponent = isDialogTitle ? DialogFrameTitle : 'h2';

  return (
    <div className={`flex items-center ${borderClass} ${paddingClass} ${marginClass}`}>
      <div className="flex min-w-0 items-center gap-4">
        <div className="bg-muted text-primary-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12">
          {renderIcon()}
        </div>
        <div className="min-w-0">
          <TitleComponent className="text-foreground truncate text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </TitleComponent>
          {subtitle &&
            (isDialogTitle ? (
              <DialogFrameDescription className="text-muted-foreground truncate text-xs">
                {subtitle}
              </DialogFrameDescription>
            ) : (
              <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
            ))}
        </div>
      </div>
    </div>
  );
};
