import { useId, useState } from 'react';

import { SectionDefault } from '@/components/ui/section/SectionDefault';
import { SectionNested } from '@/components/ui/section/SectionNested';
import { SectionPage } from '@/components/ui/section/SectionPage';
import {
  type SectionAIAction,
  type SectionProps,
  type SectionViewProps,
} from '@/components/ui/section/types';
import { AI_EXCLUDED_SECTIONS } from '@/constants/ai';
import { SECTION_METADATA } from '@/data/sections';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { isItemEmpty, isSectionEmpty } from '@/utils/items';

export type { SectionProps, SectionVariant } from '@/components/ui/section/types';

/**
 * Resolves the disclosure wiring, the icon fallback and AI eligibility once, then
 * dispatches to one of the three looks in `ui/section/`. Every variant reads the
 * same `SectionViewProps`, so a control cannot exist in one look and be missing
 * from another.
 */
export function Section({
  collapsible,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  icon,
  itemCount,
  onToggle,
  variant = 'default',
  sectionId,
  ...rest
}: SectionProps) {
  const resume = useResumeStore((state) => state.resume);

  // `basics` is one object, not a list. The photo gives Improve nothing to work
  // on and profiles are AI-excluded, so neither counts; `_imageVId` is a fixed id.
  const hasData =
    sectionId === 'basics'
      ? !isItemEmpty({
          ...resume.basics,
          image: undefined,
          _imageVId: undefined,
          profiles: undefined,
        })
      : sectionId
        ? !isSectionEmpty(resume[sectionId as keyof typeof resume] as unknown[] | undefined)
        : false;

  const metadata = sectionId ? SECTION_METADATA[sectionId] : null;
  const finalIcon = icon || (metadata?.icon ? <metadata.icon className="h-6 w-6" /> : null);
  // The page variant is the only section on screen, so it never collapses —
  // hiding it would leave the panel empty with no way back except the rail.
  const isCollapsible = variant !== 'page' && (collapsible || itemCount !== undefined);
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed =
    variant === 'page'
      ? false
      : controlledCollapsed !== undefined
        ? controlledCollapsed
        : internalCollapsed;
  const generatedId = useId();
  const panelId = `${generatedId}-panel`;
  const aiAction: SectionAIAction = rest.aiTarget
    ? rest.aiTarget.isEmpty
      ? 'empty'
      : 'ready'
    : sectionId && !(AI_EXCLUDED_SECTIONS as readonly string[]).includes(sectionId)
      ? hasData
        ? 'ready'
        : 'empty'
      : 'none';

  const toggleSection = () => {
    const newCollapsed = !isCollapsed;
    if (controlledCollapsed === undefined) setInternalCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const viewProps: SectionViewProps = {
    ...rest,
    collapsible,
    defaultCollapsed,
    collapsed: controlledCollapsed,
    icon,
    itemCount,
    onToggle,
    variant,
    sectionId,
    finalIcon,
    isCollapsed,
    isCollapsible,
    panelId,
    aiAction,
    headerControlProps: isCollapsible
      ? {
          type: 'button' as const,
          'aria-expanded': !isCollapsed,
          // The panel is not rendered while collapsed; a dangling aria-controls
          // is worse than none, which ARIA permits for a disclosure.
          'aria-controls': isCollapsed ? undefined : panelId,
          onClick: toggleSection,
        }
      : {},
  };

  if (variant === 'page') return <SectionPage {...viewProps} />;
  if (variant === 'nested') return <SectionNested {...viewProps} />;

  return <SectionDefault {...viewProps} />;
}
