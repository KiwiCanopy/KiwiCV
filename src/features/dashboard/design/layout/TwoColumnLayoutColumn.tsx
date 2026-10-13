import { memo, useMemo, useState } from 'react';

import { SortableSectionItem } from '@/features/dashboard/design/layout/SortableSectionItem';
import { createSortingAnnouncements } from '@/features/dashboard/design/sortingAnnouncements';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TwoColumnLayoutColumnProps {
  title: string;
  items: string[];
  labels: Record<string, string>;
  hiddenSections: Set<string>;
  canSwapItems: boolean;
  onSwap: (id: string) => void;
  onReorder: (items: string[]) => void;
  onToggleVisibility: (id: string) => void;
  onEdit: (id: string) => void;
  pageBreaks: string[];
  onTogglePageBreak: (id: string) => void;
  showLabel: string;
  hideLabel: string;
  editLabel: string;
  isMain?: boolean;
  isAllEmpty?: boolean;
}

export const TwoColumnLayoutColumn = memo(
  ({
    title,
    items,
    labels,
    hiddenSections,
    canSwapItems,
    onSwap,
    onReorder,
    onToggleVisibility,
    onEdit,
    pageBreaks,
    onTogglePageBreak,
    showLabel,
    hideLabel,
    editLabel,
    isMain = false,
    isAllEmpty = false,
  }: TwoColumnLayoutColumnProps) => {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const firstRenderedSection = useMemo(
      () => items.find((id) => !hiddenSections.has(id)),
      [items, hiddenSections],
    );

    const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (over && active.id !== over.id) {
        onReorder(
          arrayMove(items, items.indexOf(active.id as string), items.indexOf(over.id as string)),
        );
      }
    };

    return (
      <div className="flex flex-col gap-1.5">
        <h4
          className={`tracking-wider uppercase transition-all ${
            isMain
              ? 'text-primary-strong mb-0.5 text-[12px] font-bold'
              : 'text-muted-foreground/80 text-[11px] font-semibold'
          }`}
        >
          {title}
        </h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
          accessibility={{
            announcements: createSortingAnnouncements({
              items,
              getLabel: (id) => labels[id] || id,
              t,
            }),
          }}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="min-h-[40px]">
              {items.length === 0 ? (
                isMain && isAllEmpty ? (
                  <SortableSectionItem
                    id="example_section"
                    label={t('design.example_section')}
                    isPlaceholder={true}
                    isMain={true}
                    onEdit={onEdit}
                    editTitle={editLabel}
                    onToggleVisibility={onToggleVisibility}
                    visibilityTitle={hideLabel}
                    onTogglePageBreak={onTogglePageBreak}
                    canSwap={canSwapItems}
                    onSwap={onSwap}
                  />
                ) : (
                  <div className="text-muted-foreground border-border rounded-md border border-dashed py-4 text-center text-[10px]">
                    {t('design.column_empty')}
                  </div>
                )
              ) : (
                items.map((sectionId) => {
                  const sectionIndex = items.indexOf(sectionId);
                  const isHidden = hiddenSections.has(sectionId);

                  return (
                    <SortableSectionItem
                      key={sectionId}
                      id={sectionId}
                      label={labels[sectionId] || sectionId}
                      isHidden={isHidden}
                      editTitle={editLabel}
                      onEdit={onEdit}
                      visibilityTitle={isHidden ? showLabel : hideLabel}
                      onToggleVisibility={onToggleVisibility}
                      canSwap={canSwapItems}
                      onSwap={onSwap}
                      hasPageBreak={pageBreaks.includes(sectionId)}
                      onTogglePageBreak={onTogglePageBreak}
                      isFirst={sectionId === firstRenderedSection}
                      isMain={isMain}
                      position={sectionIndex + 1}
                      total={items.length}
                      onMoveUp={() => onReorder(arrayMove(items, sectionIndex, sectionIndex - 1))}
                      onMoveDown={() => onReorder(arrayMove(items, sectionIndex, sectionIndex + 1))}
                    />
                  );
                })
              )}
            </div>
          </SortableContext>
          <DragOverlay adjustScale={true}>
            {activeId ? (
              <div className="scale-[1.02] shadow-2xl">
                <SortableSectionItem
                  id={activeId}
                  label={labels[activeId] || activeId}
                  isHidden={hiddenSections.has(activeId)}
                  editTitle={editLabel}
                  onEdit={onEdit}
                  visibilityTitle={hiddenSections.has(activeId) ? showLabel : hideLabel}
                  onToggleVisibility={onToggleVisibility}
                  canSwap={canSwapItems}
                  onSwap={onSwap}
                  hasPageBreak={pageBreaks.includes(activeId)}
                  onTogglePageBreak={onTogglePageBreak}
                  isFirst={activeId === firstRenderedSection}
                  isMain={isMain}
                  isOverlay={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  },
);

TwoColumnLayoutColumn.displayName = 'TwoColumnLayoutColumn';
