import { memo } from 'react';

import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { EmptySectionsGrid } from '@/features/dashboard/design/layout/EmptySectionsGrid';
import { LayoutEditor } from '@/features/dashboard/design/layout/LayoutEditor';
import { useInlineOrderControls } from '@/features/dashboard/design/layout/useInlineOrderControls';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { Layout, RotateCcw } from 'lucide-react';

interface SectionOrderSectionProps {
  t: (path: string) => string;
}

export const SectionOrderSection = memo(({ t }: SectionOrderSectionProps) => {
  const resume = useResumeStore((state) => state.resume);
  const resetLayoutToDefaults = useResumeStore((state) => state.resetLayoutToDefaults);
  const { isStandard } = useEditorBreakpoints();
  // Same condition that decides whether the rows carry their own move buttons,
  // so the sentence always describes the controls actually on screen.
  const showInlineOrderControls = useInlineOrderControls();

  const handleReset = () => {
    const oneCol = resume.meta.content.order?.oneColumn || [];
    const twoCol = resume.meta.content.order?.twoColumn;
    if (oneCol.length === 0 && !twoCol) return;
    resetLayoutToDefaults();
  };

  return (
    <div id="section-order" className={cn('w-full', isStandard ? 'space-y-6' : 'space-y-4')}>
      <div className="space-y-3">
        <SectionLabel
          label={t('design.section_reordering.title')}
          icon={<Layout size={20} className="text-primary-strong/70" strokeWidth={2.5} />}
        />
        <p
          className={cn(
            'text-muted-foreground text-xs leading-relaxed',
            isStandard ? 'pl-7' : 'pl-0',
          )}
        >
          {showInlineOrderControls
            ? t('design.section_reordering.hint_touch')
            : t('design.section_reordering.hint')}
        </p>
        <button
          onClick={handleReset}
          className={cn(
            'text-primary-strong hover:text-foreground group flex items-center gap-1.5 text-left text-[11px] font-bold tracking-wide uppercase transition-colors',
            isStandard ? 'pl-7' : 'pt-1 pl-0',
          )}
        >
          <RotateCcw size={12} className="transition-transform group-hover:-rotate-45" />
          {t('common.reset')}
        </button>
      </div>
      <LayoutEditor />
      <hr className="border-border/50" />
      <EmptySectionsGrid />
    </div>
  );
});

SectionOrderSection.displayName = 'SectionOrderSection';
