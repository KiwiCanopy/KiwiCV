import { ArrayFormItem } from '@/components/editor/ArrayForm/ArrayFormItem';
import { type ArrayFormKey, type ArrayFormProps } from '@/components/editor/ArrayForm/types';
import { useArrayForm } from '@/components/editor/ArrayForm/useArrayForm';
import { AccordionItem } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { EmptySectionState } from '@/components/ui/EmptySectionState';
import { IconButton } from '@/components/ui/IconButton';
import { Section } from '@/components/ui/Section';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPTY_ARRAY, useResumeStore } from '@/store/resume/useResumeStore';
import { sectionTarget } from '@/utils/aiTarget';
import { isSectionEmpty } from '@/utils/items';
import { isCustomSectionToken } from '@/utils/layout/customSections';
import { isVisible } from '@/utils/visibility';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Eye, EyeOff, History, Plus } from 'lucide-react';

export function ArrayForm<K extends ArrayFormKey>(props: ArrayFormProps<K>) {
  const {
    sectionKey,
    title,
    description,
    itemTitleKey,
    itemSubtitleKey,
    itemSummaryKey,
    itemStartDateKey,
    itemEndDateKey,
    fields,
    variant = 'default',
    emptyLabel,
    addFirstLabel,
    subtitleFormatter,
    icon,
    extraActions,
    beforeItems,
  } = props;

  const { t } = useTranslation();
  const hiddenIds = useResumeStore((state) => state.resume.meta.content.hiddenIds || EMPTY_ARRAY);
  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );

  const {
    localItems,
    activeId,
    expandedIds,
    isSectionCollapsed,
    allHidden,
    isAlreadySorted,
    sensors,
    itemIds,
    setExpandedIds,
    setIsSectionCollapsed,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    moveItem,
    sortChronologically,
    addItem,
    addFirstItem,
    deleteItem,
    updateItem,
    handleToggleSectionVisibility,
    toggleItemVisibility,
  } = useArrayForm(props);

  const activeIndex = activeId ? itemIds.indexOf(activeId) : -1;
  const activeItem = activeIndex !== -1 ? localItems[activeIndex] : null;

  return (
    <Section
      title={title}
      description={description}
      itemCount={localItems.length}
      isHidden={allHidden}
      collapsed={isSectionCollapsed}
      variant={variant}
      icon={icon}
      sectionId={isCustomSectionToken(sectionKey) ? undefined : sectionKey}
      aiTarget={
        isCustomSectionToken(sectionKey)
          ? {
              target: sectionTarget(sectionKey),
              name: title,
              // Blank drafts are never persisted, so they are nothing to improve.
              isEmpty: isSectionEmpty(localItems),
            }
          : undefined
      }
      onToggle={(collapsed) => {
        setIsSectionCollapsed(collapsed);
        if (collapsed) setExpandedIds([]);
      }}
      actions={
        <div className="flex min-w-0 items-center gap-2">
          {(itemEndDateKey || itemStartDateKey) && localItems.length > 1 && (
            <IconButton
              label={
                isAlreadySorted ? t('common.already_sorted') : t('common.sort_chronologically')
              }
              onClick={sortChronologically}
              disabled={isAlreadySorted}
              variant="quiet"
              title={
                isAlreadySorted ? t('common.already_sorted') : t('common.sort_chronologically')
              }
            >
              <History className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
          <Button
            onClick={addItem}
            variant="quiet"
            size="sm"
            aria-label={t('common.add')}
            title={t('common.add')}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden @min-[38rem]:inline-block">{t('common.add')}</span>
          </Button>
          <IconButton
            label={
              localItems.length > 0
                ? allHidden
                  ? t('common.show')
                  : t('common.hide')
                : t('common.empty_list')
            }
            title={
              localItems.length > 0
                ? allHidden
                  ? t('common.show')
                  : t('common.hide')
                : t('common.empty_list')
            }
            onClick={handleToggleSectionVisibility}
            disabled={localItems.length === 0}
            variant="quiet"
          >
            {allHidden ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </IconButton>
          {extraActions}
        </div>
      }
    >
      {beforeItems}
      {localItems.length === 0 ? (
        <EmptySectionState
          message={emptyLabel || t('common.empty_list')}
          actionLabel={addFirstLabel || t('common.add_first')}
          onAction={addFirstItem}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {localItems.map((item, index) => (
                <ArrayFormItem
                  key={item._id}
                  item={item}
                  index={index}
                  sectionKey={sectionKey}
                  itemTitleKey={itemTitleKey}
                  itemSubtitleKey={itemSubtitleKey}
                  itemSummaryKey={itemSummaryKey}
                  itemStartDateKey={itemStartDateKey}
                  itemEndDateKey={itemEndDateKey}
                  fields={fields}
                  isOpen={expandedIds.includes(item._id)}
                  onToggle={() => {
                    setExpandedIds((prev) =>
                      prev.includes(item._id)
                        ? prev.filter((id) => id !== item._id)
                        : [...prev, item._id],
                    );
                  }}
                  onDelete={(fromKeyboard) => deleteItem(index, fromKeyboard)}
                  onToggleVisibility={() => toggleItemVisibility(index)}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  position={index + 1}
                  total={localItems.length}
                  updateItem={updateItem}
                  isActive={activeIndex === index}
                  forceCollapsed={!!activeId}
                  subtitleFormatter={subtitleFormatter}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.3' } },
              }),
            }}
          >
            {activeId && activeItem ? (
              <div className="border-primary-strong bg-card/95 scale-[1.01] rounded-lg opacity-90 shadow-xl backdrop-blur-sm">
                <AccordionItem
                  title={
                    (activeItem[itemTitleKey] as string) ||
                    (itemTitleKey === 'name' ? t('common.untitled') : '')
                  }
                  subtitle={
                    subtitleFormatter
                      ? subtitleFormatter(activeItem)
                      : itemSubtitleKey
                        ? (activeItem[itemSubtitleKey] as string)
                        : undefined
                  }
                  description={itemSummaryKey ? (activeItem[itemSummaryKey] as string) : undefined}
                  startDate={
                    itemStartDateKey ? (activeItem[itemStartDateKey] as string) : undefined
                  }
                  endDate={itemEndDateKey ? (activeItem[itemEndDateKey] as string) : undefined}
                  isVisible={isVisible(
                    sectionKey,
                    activeItem as unknown as Record<string, unknown>,
                    hiddenIds,
                    hiddenSections,
                  )}
                  forceCollapsed={true}
                >
                  <div className="pointer-events-none opacity-50">
                    <p className="text-muted-foreground text-xs italic">{t('common.loading')}...</p>
                  </div>
                </AccordionItem>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </Section>
  );
}
