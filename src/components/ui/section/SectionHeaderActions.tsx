import { type ReactNode } from 'react';

import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { type SectionAIAction } from '@/components/ui/section/types';
import { sectionLabelKey } from '@/features/dashboard/editor/rail/railSections';
import { useTranslation } from '@/hooks/useTranslation';
import { type AITargetKey, sectionTarget } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { type SectionMetadataKey } from '@/utils/layoutMetadata';

interface SectionHeaderActionsProps {
  sectionId?: SectionMetadataKey;
  /** Wins over `sectionId` for a section that key cannot name. */
  aiTarget?: { target: AITargetKey; name: string };
  aiAction: SectionAIAction;
  actions?: ReactNode;
  itemCount?: number;
  /** `nested` renders a slightly tighter badge; the other two share one size. */
  badgeSize?: 'sm' | 'md';
  className?: string;
}

/**
 * The trailing cluster of a section header: Improve with AI, the section's own
 * actions, then the entry count. Shared by all three variants so the count badge
 * cannot drift between them — the rail's row badge copies these same classes.
 */
export function SectionHeaderActions({
  sectionId,
  aiTarget,
  aiAction,
  actions,
  itemCount,
  badgeSize = 'md',
  className,
}: SectionHeaderActionsProps) {
  const { t } = useTranslation();

  /**
   * ⚠️ Reads the rail's own `Record<RailSectionKey, …>` rather than templating
   * `editor.sections.${id}`. Three rows do not live under that prefix, and a
   * wrong key renders as its own path instead of failing — see
   * `sectionLabelKey`. My hand-rolled ternary here had the same hole for
   * `profiles`, latent only because `AI_EXCLUDED_SECTIONS` suppresses that
   * button.
   */
  const labelKey = sectionId ? sectionLabelKey(sectionId) : undefined;
  const sectionName = aiTarget?.name ?? (labelKey ? t(labelKey) : (sectionId ?? ''));
  const target = aiTarget?.target ?? (sectionId ? sectionTarget(sectionId) : undefined);

  return (
    <div className={cn('ml-auto flex shrink-0 items-center gap-3 sm:gap-4', className)}>
      {aiAction !== 'none' && target && (
        <AISuggestButton
          target={target}
          size="sm"
          ariaLabel={t('ai.optimize_section', { section: sectionName })}
          targetName={sectionName}
          disabledReason={aiAction === 'empty' ? t('ai.improve_blocked_empty_section') : undefined}
        />
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      {itemCount !== undefined && (
        <span
          className={cn(
            'inline-flex h-6 items-center justify-center rounded-md transition-colors duration-200',
            'text-muted-foreground bg-muted',
            badgeSize === 'sm'
              ? 'px-2.5 text-[10px] font-semibold'
              : 'min-w-[1.5rem] px-1.5 text-xs font-medium',
            itemCount === 0 ? 'opacity-40 grayscale' : 'opacity-100',
          )}
        >
          {itemCount}
        </span>
      )}
    </div>
  );
}
