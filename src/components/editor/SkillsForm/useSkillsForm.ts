import { useCallback, useMemo, useState } from 'react';

import { type LocalSkill, type SkillsFormProps } from '@/components/editor/SkillsForm/types';
import { moveCollectionItem } from '@/components/editor/collectionOrder';
import { useEntryFocusHandoff } from '@/hooks/useEntryFocusHandoff';
import { useLocalCollectionSync } from '@/hooks/useLocalCollectionSync';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPTY_ARRAY, useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { type ResumeData } from '@/types/resume';
import { entryDeleteAnchor, firstEntryFieldAnchor } from '@/utils/focus';
import { createEmptyItem, generateId, persistableItems } from '@/utils/items';
import {
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useSkillsForm({ defaultCollapsed = true }: SkillsFormProps) {
  const skills = useResumeStore((state) => state.resume.skills);
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    localItems: localSkills,
    setLocalItems: setLocalSkills,
    localItemsRef: localSkillsRef,
    notifyRecentlyDragged,
  } = useLocalCollectionSync(skills, activeId);
  const armEntryHandoff = useEntryFocusHandoff(localSkills.length);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [prevDefaultCollapsed, setPrevDefaultCollapsed] = useState(defaultCollapsed);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(defaultCollapsed);

  const reorg = useResumeStore((state) => state.ai.reorgSuggestion);
  const hiddenIds = useResumeStore((state) => state.resume.meta.content.hiddenIds || EMPTY_ARRAY);
  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );
  const setResume = useResumeStore((state) => state.setResume);
  const toggleItemVisibility = useResumeStore((state) => state.toggleItemVisibility);
  const toggleSectionVisibility = useResumeStore((state) => state.toggleSectionVisibility);
  const resume = useResumeStore((state) => state.resume);
  const confirm = useConfirmStore((state) => state.confirm);
  const { t } = useTranslation();

  // Sync vertical collapse/expand state during render
  if (defaultCollapsed !== prevDefaultCollapsed) {
    setPrevDefaultCollapsed(defaultCollapsed);
    setIsSectionCollapsed(defaultCollapsed);

    // Auto-expand first item if this section was specifically targeted and has exactly one item
    if (!defaultCollapsed && localSkills.length === 1 && expandedIds.length === 0) {
      setExpandedIds([localSkills[0]._id]);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allHidden = useMemo(() => {
    return hiddenSections.includes('skills');
  }, [hiddenSections]);

  const handleToggleAllVisibility = useCallback(() => {
    toggleSectionVisibility('skills', skills);
  }, [toggleSectionVisibility, skills]);

  const itemIds = useMemo(() => localSkills.map((item) => item._id), [localSkills]);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalSkills((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    notifyRecentlyDragged();

    // Persist non-empty items
    const filteredSkills = persistableItems(localSkillsRef.current) as ResumeData['skills'];

    setResume({ ...resume, skills: filteredSkills }, { silent: true });
  };

  const moveSkill = useCallback(
    (index: number, direction: -1 | 1) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= localSkillsRef.current.length) return;

      const reorderedSkills = moveCollectionItem(localSkillsRef.current, index, direction);
      setLocalSkills(reorderedSkills);
      const filteredSkills = persistableItems(reorderedSkills) as ResumeData['skills'];

      setResume({ ...resume, skills: filteredSkills }, { silent: true });
    },
    [localSkillsRef, resume, setLocalSkills, setResume],
  );

  const updateSkill = useCallback(
    (index: number, updatedFields: Partial<ResumeData['skills'][0]>) => {
      const newSkills = [...localSkillsRef.current];
      newSkills[index] = { ...newSkills[index], ...updatedFields };
      setLocalSkills(newSkills);

      // Only persist non-empty items
      const filteredSkills = persistableItems(newSkills) as ResumeData['skills'];

      setResume({ ...resume, skills: filteredSkills }, { silent: true });
    },
    [resume, setResume, localSkillsRef, setLocalSkills],
  );

  /**
   * `SkillsForm` is not an `ArrayForm`, so it once carried its own blank
   * item — the copy of the section inventory `EMPTY_ITEM_FIELDS` exists to be.
   * It had already drifted: `level: undefined as unknown as SkillLevel` here
   * against `level: 0` there.
   *
   * The two are indistinguishable everywhere the value is read — the select is
   * `item.level !== undefined ? item.level.toString() : '0'`, so both render the
   * `not_specified` option, `SKILL_LEVEL_TO_KEY[0]` is undefined so both take
   * the "not specified" subtitle, `isItemEmpty` calls both empty, and
   * `themes/shared/levels.ts` gates on `!level || level <= 0`. `0` is the value
   * the control's own `SKILL_LEVELS` gives that option, so that is the direction
   * to converge in.
   *
   * ⚠️ `validateSkills` does **not** normalise `0` back to `undefined` on the way
   * in: `levelMatch`'s third clause is true for `skill.level === 0`, which pushes
   * the item through unchanged. So a named skill with no level now persists
   * `"level": 0` where it used to omit the key. That is what `languages` has
   * always stored, and no reader distinguishes them.
   */
  const addSkill = useCallback(() => {
    const emptyItem = createEmptyItem('skills');
    const newItem: LocalSkill = { _id: generateId(), ...emptyItem };

    if (allHidden) {
      toggleItemVisibility('skills', { _vId: emptyItem._vId });
    }

    setLocalSkills((prev) => [newItem, ...prev]);
    setIsSectionCollapsed(false);
    setExpandedIds((prev) => [...prev, newItem._id]);
  }, [allHidden, toggleItemVisibility, setLocalSkills]);

  /** The empty-state card's add: it unmounts, so focus goes to the new entry. */
  const addFirstSkill = useCallback(
    (fromKeyboard: boolean) => {
      armEntryHandoff(firstEntryFieldAnchor('skills'), fromKeyboard);
      addSkill();
    },
    [armEntryHandoff, addSkill],
  );

  const deleteSkill = useCallback(
    async (index: number) => {
      const isConfirmed = await confirm({
        title: t('common.confirm_delete_title'),
        message: t('common.confirm_delete_message'),
        variant: 'destructive',
        // The pressed Delete button goes with the entry it deletes.
        restoreFocusTo: entryDeleteAnchor('skills', index),
      });

      if (!isConfirmed) return;

      const newSkills = localSkillsRef.current.filter((_, i) => i !== index);
      setLocalSkills(newSkills);

      const filteredSkills = persistableItems(newSkills) as ResumeData['skills'];

      setResume({ ...resume, skills: filteredSkills }, { silent: true });
    },
    [resume, setResume, localSkillsRef, setLocalSkills, confirm, t],
  );

  const toggleVisibility = useCallback(
    (index: number) => {
      const itemWithId = localSkillsRef.current[index];
      if (!itemWithId) return;
      const { _id, ...item } = itemWithId;
      toggleItemVisibility('skills', item as unknown as Record<string, unknown>);
    },
    [toggleItemVisibility, localSkillsRef],
  );

  return {
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
    setLocalSkills,
  };
}
