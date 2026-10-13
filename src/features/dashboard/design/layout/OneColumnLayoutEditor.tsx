import { memo, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getSectionLabels, getThemeTranslations } from '@/components/preview/themes/shared';
import { SortableSectionItem } from '@/features/dashboard/design/layout/SortableSectionItem';
import {
  sectionVisibilityTarget,
  withCustomSectionLabels,
} from '@/features/dashboard/design/layout/layoutSectionHelpers';
import { createSortingAnnouncements } from '@/features/dashboard/design/sortingAnnouncements';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getSortedSectionsForOneColumn } from '@/utils/layoutMetadata';
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

export const OneColumnLayoutEditor = memo(() => {
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const toggleSectionVisibility = useResumeStore((state) => state.toggleSectionVisibility);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  // Explicitly define the base logic for translations
  const themeLocale = resume.meta.theme.locale;
  const tVals = useMemo(() => getThemeTranslations(themeLocale), [themeLocale]);
  const sectionLabelsOverrides = resume.meta.theme.params?.sectionLabels;
  const customSections = resume.customSections;
  const untitled = t('common.untitled');
  const labels = useMemo(
    () =>
      withCustomSectionLabels(
        getSectionLabels(tVals.sections || {}, sectionLabelsOverrides),
        { customSections },
        untitled,
      ),
    [tVals, sectionLabelsOverrides, customSections, untitled],
  );

  // The renderer's own order, so a custom section missing from the stored
  // order is listed (and persisted on the next drag) rather than dropped.
  const computedOrder = useMemo<string[]>(
    () => getSortedSectionsForOneColumn(resume.meta, resume),
    [resume],
  );

  const [managedItems, setManagedItems] = useState<string[]>(computedOrder);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hiddenSections = useMemo(
    () => new Set(resume.meta.content.hiddenSections || []),
    [resume.meta.content.hiddenSections],
  );

  // Sync when the store's order changes externally (e.g. reset or theme default change)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInternalUpdate) {
        if (JSON.stringify(managedItems) !== JSON.stringify(computedOrder)) {
          setManagedItems(computedOrder);
        }
      }
      setIsInternalUpdate(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [computedOrder, isInternalUpdate, managedItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = managedItems.indexOf(active.id as string);
      const newIndex = managedItems.indexOf(over.id as string);

      persistOrder(arrayMove(managedItems, oldIndex, newIndex));
    }
  };

  const persistOrder = (nextOrder: string[]) => {
    if (nextOrder.join(',') === managedItems.join(',')) return;
    setManagedItems(nextOrder);
    setIsInternalUpdate(true);
    setTimeout(() => {
      updateMeta({
        content: {
          ...resume.meta.content,
          order: {
            oneColumn: nextOrder,
            twoColumn: resume.meta.content.order?.twoColumn || { main: [], sidebar: [] },
          },
        },
      });
    }, 0);
  };

  const handleToggleVisibility = (sectionId: string) => {
    const target = sectionVisibilityTarget(sectionId, resume);
    if (target) toggleSectionVisibility(target.section, target.items);
  };

  const handleEditSection = (sectionId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'editor');
    nextParams.set('section', sectionId);
    setSearchParams(nextParams, { replace: true });
  };

  const pageBreaks = resume.meta.content.pageBreaks?.oneColumn || [];
  const togglePageBreak = useResumeStore((state) => state.togglePageBreak);

  const firstRenderedSection = useMemo(() => {
    return managedItems.find((id) => !hiddenSections.has(id));
  }, [managedItems, hiddenSections]);

  return (
    <div className="clean-scrollbar -mx-2 w-full space-y-8 overflow-x-auto px-2 pt-2">
      <div className="mr-auto w-full max-w-sm px-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
          accessibility={{
            announcements: createSortingAnnouncements({
              items: managedItems,
              getLabel: (id) => labels[id] || id,
              t,
            }),
          }}
        >
          <SortableContext items={managedItems} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {managedItems.length === 0 ? (
                <SortableSectionItem
                  id="example_section"
                  label={t('design.example_section')}
                  isPlaceholder={true}
                  onEdit={handleEditSection}
                  editTitle={t('common.edit')}
                  onToggleVisibility={handleToggleVisibility}
                  visibilityTitle={t('common.hide')}
                  onTogglePageBreak={(sectionId) => togglePageBreak('oneColumn', sectionId)}
                />
              ) : (
                managedItems.map((id, index) => {
                  return (
                    <SortableSectionItem
                      key={id}
                      id={id}
                      label={labels[id] || id}
                      isHidden={hiddenSections.has(id)}
                      editTitle={t('common.edit')}
                      onEdit={handleEditSection}
                      visibilityTitle={hiddenSections.has(id) ? t('common.show') : t('common.hide')}
                      onToggleVisibility={handleToggleVisibility}
                      hasPageBreak={pageBreaks.includes(id)}
                      onTogglePageBreak={(sectionId) => togglePageBreak('oneColumn', sectionId)}
                      isFirst={id === firstRenderedSection}
                      position={index + 1}
                      total={managedItems.length}
                      onMoveUp={() => persistOrder(arrayMove(managedItems, index, index - 1))}
                      onMoveDown={() => persistOrder(arrayMove(managedItems, index, index + 1))}
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
                  editTitle={t('common.edit')}
                  onEdit={handleEditSection}
                  visibilityTitle={
                    hiddenSections.has(activeId) ? t('common.show') : t('common.hide')
                  }
                  onToggleVisibility={handleToggleVisibility}
                  hasPageBreak={pageBreaks.includes(activeId)}
                  onTogglePageBreak={(sectionId) => togglePageBreak('oneColumn', sectionId)}
                  isFirst={activeId === firstRenderedSection}
                  isOverlay={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
});

OneColumnLayoutEditor.displayName = 'OneColumnLayoutEditor';
