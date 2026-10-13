import { LanguageFormItem } from '@/components/editor/LanguageForm/LanguageFormItem';
import { LEVEL_TO_KEY, type LanguageFormProps } from '@/components/editor/LanguageForm/types';
import { useLanguageForm } from '@/components/editor/LanguageForm/useLanguageForm';
import { AccordionItem } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { EmptySectionState } from '@/components/ui/EmptySectionState';
import { IconButton } from '@/components/ui/IconButton';
import { Section } from '@/components/ui/Section';
import { useTranslation } from '@/hooks/useTranslation';
import { isVisible } from '@/utils/visibility';
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Eye, EyeOff, Plus } from 'lucide-react';

export const LanguageForm = (props: LanguageFormProps) => {
  const { variant = 'nested' } = props;
  const { t } = useTranslation();

  const {
    localLanguages,
    activeId,
    setActiveId,
    expandedIds,
    setExpandedIds,
    isSectionCollapsed,
    setIsSectionCollapsed,
    sensors,
    allHidden,
    handleToggleAllVisibility,
    itemIds,
    handleDragOver,
    handleDragEnd,
    moveLanguage,
    updateLanguage,
    addLanguage,
    addFirstLanguage,
    deleteLanguage,
    toggleVisibility,
    hiddenIds,
    hiddenSections,
  } = useLanguageForm(props);

  const activeIndex = activeId ? itemIds.indexOf(activeId) : -1;
  const activeLanguage = activeIndex !== -1 ? localLanguages[activeIndex] : null;

  return (
    <Section
      title={t('editor.sections.languages')}
      itemCount={localLanguages.length}
      isHidden={allHidden}
      collapsed={isSectionCollapsed}
      variant={variant}
      sectionId="languages"
      onToggle={(collapsed) => {
        setIsSectionCollapsed(collapsed);
        if (collapsed) setExpandedIds([]);
      }}
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={addLanguage} variant="quiet" size="sm" aria-label={t('common.add')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden @min-[38rem]:inline-block">{t('common.add')}</span>
          </Button>
          <IconButton
            label={
              localLanguages.length > 0
                ? allHidden
                  ? t('common.show')
                  : t('common.hide')
                : t('common.empty_list')
            }
            onClick={handleToggleAllVisibility}
            disabled={localLanguages.length === 0}
            variant="quiet"
          >
            {allHidden ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </IconButton>
        </div>
      }
    >
      {localLanguages.length === 0 ? (
        <EmptySectionState
          message={t('editor.modules.languages.empty')}
          actionLabel={t('editor.modules.languages.add_first')}
          onAction={addFirstLanguage}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event: DragStartEvent) => setActiveId(event.active.id as string)}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {localLanguages.map((item, index) => (
                <LanguageFormItem
                  key={item._id}
                  item={item}
                  index={index}
                  activeIndex={activeIndex}
                  activeId={activeId}
                  expandedIds={expandedIds}
                  setExpandedIds={setExpandedIds}
                  deleteLanguage={deleteLanguage}
                  toggleVisibility={toggleVisibility}
                  updateLanguage={updateLanguage}
                  hiddenIds={hiddenIds}
                  hiddenSections={hiddenSections}
                  moveLanguage={moveLanguage}
                  total={localLanguages.length}
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
            {activeId && activeLanguage ? (
              <div className="border-primary-strong bg-card/95 scale-[1.01] rounded-lg opacity-90 shadow-xl backdrop-blur-sm">
                <AccordionItem
                  title={activeLanguage.language || t('common.untitled')}
                  subtitle={(() => {
                    const levelStr =
                      activeLanguage.level && LEVEL_TO_KEY[activeLanguage.level]
                        ? t(`editor.modules.languages.levels.${LEVEL_TO_KEY[activeLanguage.level]}`)
                        : '';
                    const certificateStr = activeLanguage.certificate || '';
                    return (
                      [levelStr, certificateStr].filter(Boolean).join(', ') ||
                      t('editor.modules.languages.levels.not_specified')
                    );
                  })()}
                  isVisible={isVisible('languages', activeLanguage, hiddenIds, hiddenSections)}
                  forceCollapsed={true}
                >
                  <div className="pointer-events-none p-4 opacity-50">
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
};
