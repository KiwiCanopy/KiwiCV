import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ALL_UI_SECTION_ORDER, CUSTOM_SECTION_ICON, SECTION_METADATA } from '@/data/sections';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { EmptySectionCard } from '@/features/dashboard/design/layout/EmptySectionCard';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import {
  customSectionDisplayTitle,
  customSectionToken,
  sectionExists,
} from '@/utils/layoutMetadata';
import { Sparkles } from 'lucide-react';

export const EmptySectionsGrid = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resume = useResumeStore((state) => state.resume);
  const { isStandard } = useEditorBreakpoints();

  const emptySections = useMemo(() => {
    // No cast: `ALL_UI_SECTION_ORDER` is already `SectionKey[]`, and
    // `layout.test.ts` pins it as a permutation of `ALL_SECTION_KEYS` in both
    // directions — so unlike the persisted order, this input needs no narrowing
    // and the `as SectionKey` was pure noise. Adding `basics` or `profiles` to a
    // `GROUP_METADATA` group fails that test rather than arriving here.
    return ALL_UI_SECTION_ORDER.filter((sectionId) => !sectionExists(sectionId, resume));
  }, [resume]);

  // An entry-less custom section is not on the CV yet either.
  const emptyCustomSections = resume.customSections.filter((section) => section.items.length === 0);

  if (emptySections.length === 0 && emptyCustomSections.length === 0) return null;

  const handleAddSection = (sectionId: string) => {
    // Switch to editor and open section
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'editor');
    nextParams.set('section', sectionId);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="w-full space-y-4 pt-2 pb-2">
      <div className="space-y-1.5">
        <SectionLabel
          label={t('design.empty_sections_title')}
          icon={<Sparkles size={20} className="text-primary-strong/70" strokeWidth={2.5} />}
        />
        <p className="text-muted-foreground/60 max-w-2xl pl-7.5 text-xs leading-relaxed italic">
          {t('design.empty_sections_subtitle')}
        </p>
      </div>

      <div
        className={cn('grid gap-3', isStandard ? 'pl-[30px]' : 'pl-0')}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${isStandard ? '140px' : '110px'}, 1fr))`,
        }}
      >
        {emptySections.map((sectionId) => {
          const config = SECTION_METADATA[sectionId];
          if (!config) return null;

          return (
            <EmptySectionCard
              key={sectionId}
              id={sectionId}
              label={t(`editor.sections.${sectionId}`) || sectionId}
              icon={config.icon}
              onClick={handleAddSection}
            />
          );
        })}
        {emptyCustomSections.map((section) => (
          <EmptySectionCard
            key={section.id}
            id={customSectionToken(section.id)}
            label={customSectionDisplayTitle(section, t('common.untitled'))}
            icon={CUSTOM_SECTION_ICON}
            onClick={handleAddSection}
          />
        ))}
      </div>
    </div>
  );
};
