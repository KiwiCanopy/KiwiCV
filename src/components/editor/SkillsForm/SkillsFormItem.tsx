import React from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { SkillsFormField } from '@/components/editor/SkillsForm/SkillsFormField';
import { type LocalSkill, skillLevelKey } from '@/components/editor/SkillsForm/types';
import { AccordionItem, type AccordionItemProps } from '@/components/ui/Accordion';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import {
  type DiffFieldLabels,
  type DiffValueFormatters,
} from '@/features/dashboard/editor/proposals/useEntryDiff';
import { useLockedFields } from '@/features/dashboard/editor/proposals/useLockedFields';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResumeData } from '@/types/resume';
import { itemTarget } from '@/utils/aiTarget';
import { isItemEmpty } from '@/utils/items';
import { isVisible } from '@/utils/visibility';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isActive?: boolean;
  forceCollapsed?: boolean;
}

function SortableItem({ id, children, isActive, forceCollapsed }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 0 : isActive ? 50 : 1,
  };

  return React.cloneElement(children as React.ReactElement<AccordionItemProps>, {
    setNodeRef,
    style,
    dragHandleProps: { ...attributes, ...listeners },
    forceCollapsed: isDragging || forceCollapsed,
  });
}

interface SkillsFormItemProps {
  item: LocalSkill;
  index: number;
  activeIndex: number;
  activeId: string | null;
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
  deleteSkill: (index: number) => void;
  toggleVisibility: (index: number) => void;
  updateSkill: (index: number, updatedFields: Partial<LocalSkill>) => void;
  hiddenIds: string[];
  hiddenSections: string[];
  moveSkill: (index: number, direction: -1 | 1) => void;
  total: number;
}

export const SkillsFormItem: React.FC<SkillsFormItemProps> = ({
  item,
  index,
  activeIndex,
  activeId,
  expandedIds,
  setExpandedIds,
  deleteSkill,
  toggleVisibility,
  updateSkill,
  hiddenIds,
  hiddenSections,
  moveSkill,
  total,
}) => {
  const { t, tCV } = useTranslation();
  const id = item._id;
  const aiTarget = item._vId ? itemTarget('skills', item._vId) : undefined;
  const lockFor = useLockedFields<ResumeData['skills'][number]>(aiTarget);

  const fieldLabels = React.useMemo(
    () =>
      ({
        name: t('editor.fields.skill_name'),
        level: t('editor.fields.skill_level'),
        keywords: t('editor.fields.keywords'),
      }) satisfies DiffFieldLabels<ResumeData['skills'][number]>,
    [t],
  );
  // The panel names a level as the picker does, not as its stored number.
  const valueFormatters = React.useMemo(
    () =>
      ({
        level: (value: unknown) => tCV(`editor.modules.skills.levels.${skillLevelKey(value)}`),
      }) satisfies DiffValueFormatters<ResumeData['skills'][number]>,
    [tCV],
  );

  return (
    <SortableItem key={id} id={id} isActive={activeIndex === index} forceCollapsed={!!activeId}>
      <AccordionItem
        title={item.name || t('common.untitled')}
        subtitle={tCV(`editor.modules.skills.levels.${skillLevelKey(item.level)}`)}
        subtitleIsHint={!item.level}
        onDelete={() => deleteSkill(index)}
        entryListId="skills"
        onToggleVisibility={() => toggleVisibility(index)}
        isVisible={isVisible('skills', item, hiddenIds, hiddenSections)}
        isOpen={expandedIds.includes(id)}
        onToggle={() => {
          setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((currId) => currId !== id) : [...prev, id],
          );
        }}
        aiTarget={aiTarget ? { target: aiTarget, isEmpty: isItemEmpty(item) } : undefined}
        belowHeader={
          <EntryDiffPanel
            target={aiTarget}
            fieldLabels={fieldLabels}
            valueFormatters={valueFormatters}
            entryName={item.name || t('common.untitled')}
          />
        }
        orderActions={
          <ItemOrderControls
            itemLabel={item.name || t('common.untitled')}
            position={index + 1}
            total={total}
            onMoveUp={() => moveSkill(index, -1)}
            onMoveDown={() => moveSkill(index, 1)}
          />
        }
      >
        <SkillsFormField item={item} index={index} updateSkill={updateSkill} lockFor={lockFor} />
      </AccordionItem>
    </SortableItem>
  );
};
