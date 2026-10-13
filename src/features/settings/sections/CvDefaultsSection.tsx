import type { ReactNode } from 'react';

import { InfoBox } from '@/components/ui/InfoBox';
import { Input } from '@/components/ui/Input';
import { SettingsCard } from '@/features/settings/shared/SettingsCard';
import { cn } from '@/utils/cn';
import { Check, CircleQuestionMark, FileText, Pencil, X } from 'lucide-react';

// The pattern edit/save/cancel controls are square icon buttons sized to the
// adjacent Input via flex-stretch, so they stay bespoke rather than adopting
// the Button primitive's own min-height. They come off the legacy btn-3d
// bottom-shadow onto flat fills with a focus-visible ring.
const ICON_BTN_BASE =
  'flex w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none';
const ICON_BTN_PRIMARY =
  'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong';
const ICON_BTN_NEUTRAL =
  'border-border bg-card text-foreground hover:bg-muted border focus-visible:ring-primary-strong';

interface CvDefaultsSectionProps {
  title: string;
  projectNameLabel: string;
  projectNameDescription: string;
  availableVariablesLabel: string;
  patternTip: string;
  isEditingPattern: boolean;
  patternValue: string;
  tempPattern: string;
  onTempPatternChange: (value: string) => void;
  onStartEditingPattern: () => void;
  onSavePattern: () => void;
  onCancelEditingPattern: () => void;
  t: (key: string) => string;
}

export const CvDefaultsSection = ({
  title,
  projectNameLabel,
  projectNameDescription,
  availableVariablesLabel,
  patternTip,
  isEditingPattern,
  patternValue,
  tempPattern,
  onTempPatternChange,
  onStartEditingPattern,
  onSavePattern,
  onCancelEditingPattern,
  t,
}: CvDefaultsSectionProps) => {
  const infoContent: ReactNode = (
    <>
      <p className="mb-2 text-xs font-semibold">{availableVariablesLabel}:</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {['{lang}', '{name}', '{theme}', '{date-FORMAT}'].map((tag) => (
          <code
            key={tag}
            className="bg-muted border-border text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]"
          >
            {tag}
          </code>
        ))}
      </div>
      <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold">
        {t('settings.export.format_tokens')}
      </p>
      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          ['YYYY', '2026'],
          ['MM', '02'],
          ['DD', '19'],
          ['HH', '14'],
          ['mm', '30'],
          ['ss', '05'],
        ].map(([token, example]) => (
          <div key={token} className="flex items-center gap-1.5">
            <code className="bg-muted border-border text-foreground rounded border px-1 py-0.5 font-mono text-[10px]">
              {token}
            </code>
            <span className="text-muted-foreground text-[10px]">
              {'->'} {example}
            </span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed italic">{patternTip}</p>
    </>
  );

  return (
    <SettingsCard title={title} icon={<FileText className="text-muted-foreground h-5 w-5" />}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-foreground block text-sm font-semibold">
                {projectNameLabel}
              </label>

              <InfoBox position="right" width="w-80" italic={false} content={infoContent}>
                <div className="text-muted-foreground hover:text-primary-strong cursor-help p-0.5 transition-colors">
                  <CircleQuestionMark className="h-4 w-4" />
                </div>
              </InfoBox>
            </div>
            <p className="text-muted-foreground text-sm">{projectNameDescription}</p>
          </div>

          <div id="project-name" className="w-full max-w-md">
            <div className="flex gap-2">
              <Input
                value={isEditingPattern ? tempPattern : patternValue}
                onChange={(e) => onTempPatternChange(e.target.value)}
                placeholder="{date-YYYYMMDD}_{theme}_{name}"
                disabled={!isEditingPattern}
                className={cn(
                  'font-mono text-sm',
                  !isEditingPattern && 'bg-muted/50 cursor-not-allowed opacity-75',
                )}
              />
              {isEditingPattern ? (
                <>
                  <button
                    onClick={onSavePattern}
                    className={cn(ICON_BTN_BASE, ICON_BTN_PRIMARY)}
                    title={t('common.save')}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onCancelEditingPattern}
                    className={cn(ICON_BTN_BASE, ICON_BTN_NEUTRAL)}
                    title={t('common.cancel')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={onStartEditingPattern}
                  className={cn(ICON_BTN_BASE, ICON_BTN_NEUTRAL)}
                  title={t('common.edit')}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};
