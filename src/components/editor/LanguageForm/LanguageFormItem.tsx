import React from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { LanguageFormField } from '@/components/editor/LanguageForm/LanguageFormField';
import { type LocalLanguage, languageLevelKey } from '@/components/editor/LanguageForm/types';
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

interface LanguageFormItemProps {
  item: LocalLanguage;
  index: number;
  activeIndex: number;
  activeId: string | null;
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
  deleteLanguage: (index: number) => void;
  toggleVisibility: (index: number) => void;
  updateLanguage: (index: number, updatedFields: Partial<LocalLanguage>) => void;
  hiddenIds: string[];
  hiddenSections: string[];
  moveLanguage: (index: number, direction: -1 | 1) => void;
  total: number;
}

export const LanguageFormItem: React.FC<LanguageFormItemProps> = ({
  item,
  index,
  activeIndex,
  activeId,
  expandedIds,
  setExpandedIds,
  deleteLanguage,
  toggleVisibility,
  updateLanguage,
  hiddenIds,
  hiddenSections,
  moveLanguage,
  total,
}) => {
  const { t, tCV } = useTranslation();
  const id = item._id;
  const aiTarget = item._vId ? itemTarget('languages', item._vId) : undefined;
  const lockFor = useLockedFields<ResumeData['languages'][number]>(aiTarget);

  const fieldLabels = React.useMemo(
    () =>
      ({
        language: t('editor.fields.language'),
        level: t('editor.fields.level'),
        certificate: t('editor.fields.certificate'),
      }) satisfies DiffFieldLabels<ResumeData['languages'][number]>,
    [t],
  );
  // The panel names a level as the picker does, not as its stored number.
  const valueFormatters = React.useMemo(
    () =>
      ({
        level: (value: unknown) =>
          tCV(`editor.modules.languages.levels.${languageLevelKey(value)}`),
      }) satisfies DiffValueFormatters<ResumeData['languages'][number]>,
    [tCV],
  );

  return (
    <SortableItem key={id} id={id} isActive={activeIndex === index} forceCollapsed={!!activeId}>
      <AccordionItem
        title={item.language || t('common.untitled')}
        subtitle={(() => {
          const levelKey = languageLevelKey(item.level);
          const levelStr =
            levelKey === 'not_specified' ? '' : tCV(`editor.modules.languages.levels.${levelKey}`);
          const certificateStr = item.certificate || '';
          return (
            [levelStr, certificateStr].filter(Boolean).join(', ') ||
            t('editor.modules.languages.levels.not_specified')
          );
        })()}
        subtitleIsHint={!item.level && !item.certificate}
        onDelete={() => deleteLanguage(index)}
        entryListId="languages"
        onToggleVisibility={() => toggleVisibility(index)}
        isVisible={isVisible('languages', item, hiddenIds, hiddenSections)}
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
            entryName={item.language || t('common.untitled')}
          />
        }
        orderActions={
          <ItemOrderControls
            itemLabel={item.language || t('common.untitled')}
            position={index + 1}
            total={total}
            onMoveUp={() => moveLanguage(index, -1)}
            onMoveDown={() => moveLanguage(index, 1)}
          />
        }
      >
        <LanguageFormField
          item={item}
          index={index}
          updateLanguage={updateLanguage}
          lockFor={lockFor}
        />
      </AccordionItem>
    </SortableItem>
  );
};
