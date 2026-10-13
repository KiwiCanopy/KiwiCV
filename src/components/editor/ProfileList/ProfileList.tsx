import { ProfileItem } from '@/components/editor/ProfileList/ProfileItem';
import { SortableItem } from '@/components/editor/ProfileList/SortableItem';
import { type ProfileListProps } from '@/components/editor/ProfileList/types';
import { useProfileList } from '@/components/editor/ProfileList/useProfileList';
import { Button } from '@/components/ui/Button';
import { EmptySectionState } from '@/components/ui/EmptySectionState';
import { IconButton } from '@/components/ui/IconButton';
import { Section } from '@/components/ui/Section';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPTY_ARRAY, useResumeStore } from '@/store/resume/useResumeStore';
import { isVisible } from '@/utils/visibility';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Eye, EyeOff, Plus } from 'lucide-react';

export function ProfileList(props: ProfileListProps) {
  const { collapsed, onToggle, variant = 'default' } = props;
  const { t, tCV } = useTranslation();
  const hiddenIds = useResumeStore((state) => state.resume.meta.content.hiddenIds || EMPTY_ARRAY);
  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );

  const {
    localProfiles,
    activeId,
    itemIds,
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    localNetworkValues,
    suggestionRef,
    sensors,
    allHidden,
    handleToggleAllVisibility,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    moveProfile,
    addProfile,
    addFirstProfile,
    removeProfile,
    updateProfile,
    handleToggleVisibility,
    handleNetworkLocalChange,
  } = useProfileList(props);

  const activeProfileIndex = activeId ? itemIds.indexOf(activeId) : -1;
  const activeProfile = activeProfileIndex !== -1 ? localProfiles[activeProfileIndex] : null;

  return (
    <Section
      title={t('editor.basics.profiles.title')}
      itemCount={localProfiles.length}
      isHidden={allHidden}
      collapsible={true}
      collapsed={collapsed}
      onToggle={onToggle}
      variant={variant}
      sectionId="profiles"
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={addProfile} variant="quiet" size="sm" aria-label={t('common.add')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden @min-[38rem]:inline-block">{t('common.add')}</span>
          </Button>
          <IconButton
            label={
              localProfiles.length > 0
                ? allHidden
                  ? t('common.show')
                  : t('common.hide')
                : t('common.empty_list')
            }
            onClick={handleToggleAllVisibility}
            disabled={localProfiles.length === 0}
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
      <div className="space-y-3">
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
            {localProfiles.map((profile, index) => {
              const id = itemIds[index];
              return (
                <SortableItem
                  key={id}
                  id={id}
                  isActive={activeSuggestionIndex === index}
                  forceCollapsed={!!activeId}
                >
                  <ProfileItem
                    profile={profile}
                    index={index}
                    isHidden={
                      !isVisible(
                        'profiles',
                        profile as unknown as Record<string, unknown>,
                        hiddenIds,
                        hiddenSections,
                      )
                    }
                    activeSuggestionIndex={activeSuggestionIndex}
                    setActiveSuggestionIndex={setActiveSuggestionIndex}
                    suggestionRef={suggestionRef}
                    updateProfile={updateProfile}
                    handleToggleVisibility={handleToggleVisibility}
                    onNetworkLocalChange={handleNetworkLocalChange}
                    localNetworkValue={localNetworkValues[index]}
                    removeProfile={removeProfile}
                    moveProfile={moveProfile}
                    total={localProfiles.length}
                    t={t}
                    tCV={tCV}
                  />
                </SortableItem>
              );
            })}
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.3' } },
              }),
            }}
          >
            {activeId && activeProfile ? (
              <ProfileItem
                profile={activeProfile}
                index={activeProfileIndex}
                isHidden={
                  !isVisible(
                    'profiles',
                    activeProfile as unknown as Record<string, unknown>,
                    hiddenIds,
                    hiddenSections,
                  )
                }
                t={t}
                tCV={tCV}
                forceCollapsed
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {localProfiles.length === 0 && (
          <EmptySectionState
            message={t('editor.basics.profiles.empty')}
            actionLabel={t('editor.basics.profiles.add_first')}
            onAction={addFirstProfile}
          />
        )}
      </div>
    </Section>
  );
}
