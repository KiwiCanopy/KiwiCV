import { ReorgDiffPanel } from '@/components/editor/ReorgDiffPanel';
import { SkillsFormItem } from '@/components/editor/SkillsForm/SkillsFormItem';
import { SKILL_LEVEL_TO_KEY, type SkillsFormProps } from '@/components/editor/SkillsForm/types';
import { useSkillsForm } from '@/components/editor/SkillsForm/useSkillsForm';
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

export const SkillsForm = (props: SkillsFormProps) => {
  const { variant = 'nested' } = props;
  const { t } = useTranslation();

  const {
    localSkills,
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
    moveSkill,
    updateSkill,
    addSkill,
    addFirstSkill,
    deleteSkill,
    toggleVisibility,
    reorg,
    hiddenIds,
    hiddenSections,
  } = useSkillsForm(props);

  const isReorgActive = reorg?.sectionKey === 'skills';

  const activeIndex = activeId ? itemIds.indexOf(activeId) : -1;
  const activeSkill = activeIndex !== -1 ? localSkills[activeIndex] : null;

  return (
    <Section
      title={t('editor.sections.skills')}
      itemCount={localSkills.length}
      isHidden={allHidden}
      collapsed={isSectionCollapsed}
      variant={variant}
      sectionId="skills"
      onToggle={(collapsed) => {
        setIsSectionCollapsed(collapsed);
        if (collapsed) setExpandedIds([]);
      }}
      actions={
        <div className="flex items-center gap-2">
          {isReorgActive ? null : (
            <>
              <Button onClick={addSkill} variant="quiet" size="sm" aria-label={t('common.add')}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden @min-[38rem]:inline-block">{t('common.add')}</span>
              </Button>
              <IconButton
                label={
                  localSkills.length > 0
                    ? allHidden
                      ? t('common.show')
                      : t('common.hide')
                    : t('common.empty_list')
                }
                onClick={handleToggleAllVisibility}
                disabled={localSkills.length === 0}
                variant="quiet"
              >
                {allHidden ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </IconButton>
            </>
          )}
        </div>
      }
    >
      <ReorgDiffPanel />

      {reorg?.sectionKey === 'skills' ? null : localSkills.length === 0 ? (
        <EmptySectionState
          message={t('editor.modules.skills.empty')}
          actionLabel={t('editor.modules.skills.add_first')}
          onAction={addFirstSkill}
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
              {localSkills.map((item, index) => (
                <SkillsFormItem
                  key={item._id}
                  item={item}
                  index={index}
                  activeIndex={activeIndex}
                  activeId={activeId}
                  expandedIds={expandedIds}
                  setExpandedIds={setExpandedIds}
                  deleteSkill={deleteSkill}
                  toggleVisibility={toggleVisibility}
                  updateSkill={updateSkill}
                  hiddenIds={hiddenIds}
                  hiddenSections={hiddenSections}
                  moveSkill={moveSkill}
                  total={localSkills.length}
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
            {activeId && activeSkill ? (
              <div className="border-primary-strong bg-card/95 scale-[1.01] rounded-lg opacity-90 shadow-xl backdrop-blur-sm">
                <AccordionItem
                  title={activeSkill.name || t('common.untitled')}
                  subtitle={(() => {
                    const levelKey = activeSkill.level && SKILL_LEVEL_TO_KEY[activeSkill.level];
                    return levelKey
                      ? t(`editor.modules.skills.levels.${levelKey}`)
                      : t('editor.modules.skills.levels.not_specified');
                  })()}
                  subtitleIsHint={!activeSkill.level}
                  isVisible={isVisible('skills', activeSkill, hiddenIds, hiddenSections)}
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
