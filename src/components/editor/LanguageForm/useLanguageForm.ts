import { useCallback, useMemo, useState } from 'react';

import { type LanguageFormProps, type LocalLanguage } from '@/components/editor/LanguageForm/types';
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

export function useLanguageForm({ defaultCollapsed = true }: LanguageFormProps) {
  const languages = useResumeStore((state) => state.resume.languages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    localItems: localLanguages,
    setLocalItems: setLocalLanguages,
    localItemsRef: localLanguagesRef,
    notifyRecentlyDragged,
  } = useLocalCollectionSync(languages, activeId);
  const armEntryHandoff = useEntryFocusHandoff(localLanguages.length);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [prevDefaultCollapsed, setPrevDefaultCollapsed] = useState(defaultCollapsed);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(defaultCollapsed);

  // Sync vertical collapse/expand state during render
  if (defaultCollapsed !== prevDefaultCollapsed) {
    setPrevDefaultCollapsed(defaultCollapsed);
    setIsSectionCollapsed(defaultCollapsed);

    // Auto-expand first item if this section was specifically targeted and has exactly one item
    if (!defaultCollapsed && localLanguages.length === 1 && expandedIds.length === 0) {
      setExpandedIds([localLanguages[0]._id]);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const allHidden = useMemo(() => {
    return hiddenSections.includes('languages');
  }, [hiddenSections]);

  const handleToggleAllVisibility = useCallback(() => {
    toggleSectionVisibility('languages', languages);
  }, [toggleSectionVisibility, languages]);

  const itemIds = useMemo(() => localLanguages.map((item) => item._id), [localLanguages]);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalLanguages((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    notifyRecentlyDragged();

    // Persist non-empty items
    const filteredLanguages = persistableItems(
      localLanguagesRef.current,
    ) as ResumeData['languages'];

    setResume({ ...resume, languages: filteredLanguages }, { silent: true });
  };

  const moveLanguage = useCallback(
    (index: number, direction: -1 | 1) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= localLanguagesRef.current.length) return;

      const reorderedLanguages = moveCollectionItem(localLanguagesRef.current, index, direction);
      setLocalLanguages(reorderedLanguages);
      const filteredLanguages = persistableItems(reorderedLanguages) as ResumeData['languages'];

      setResume({ ...resume, languages: filteredLanguages }, { silent: true });
    },
    [localLanguagesRef, resume, setLocalLanguages, setResume],
  );

  const updateLanguage = useCallback(
    (index: number, updatedFields: Partial<ResumeData['languages'][0]>) => {
      const newLanguages = [...localLanguagesRef.current];
      newLanguages[index] = { ...newLanguages[index], ...updatedFields };
      setLocalLanguages(newLanguages);

      // Only persist non-empty items
      const filteredLanguages = persistableItems(newLanguages) as ResumeData['languages'];

      setResume({ ...resume, languages: filteredLanguages }, { silent: true });
    },
    [resume, setResume, localLanguagesRef, setLocalLanguages],
  );

  /**
   * Was a blank-item literal of its own, since deleted — see the note on
   * `useSkillsForm`'s `addSkill`. This one had not drifted; `EMPTY_ITEM_FIELDS`
   * already seeded `level: 0`, so the swap changes nothing that is stored or
   * rendered.
   */
  const addLanguage = useCallback(() => {
    const emptyItem = createEmptyItem('languages');
    const newItem: LocalLanguage = { _id: generateId(), ...emptyItem };

    if (allHidden) {
      toggleItemVisibility('languages', { _vId: emptyItem._vId });
    }

    setLocalLanguages((prev) => [newItem, ...prev]);
    setIsSectionCollapsed(false);
    setExpandedIds((prev) => [...prev, newItem._id]);
  }, [allHidden, toggleItemVisibility, setLocalLanguages]);

  /** The empty-state card's add: it unmounts, so focus goes to the new entry. */
  const addFirstLanguage = useCallback(
    (fromKeyboard: boolean) => {
      armEntryHandoff(firstEntryFieldAnchor('languages'), fromKeyboard);
      addLanguage();
    },
    [armEntryHandoff, addLanguage],
  );

  const deleteLanguage = useCallback(
    async (index: number) => {
      const isConfirmed = await confirm({
        title: t('common.confirm_delete_title'),
        message: t('common.confirm_delete_message'),
        variant: 'destructive',
        // The pressed Delete button goes with the entry it deletes.
        restoreFocusTo: entryDeleteAnchor('languages', index),
      });

      if (!isConfirmed) return;

      const newLanguages = localLanguagesRef.current.filter((_, i) => i !== index);
      setLocalLanguages(newLanguages);

      const filteredLanguages = persistableItems(newLanguages) as ResumeData['languages'];

      setResume({ ...resume, languages: filteredLanguages }, { silent: true });
    },
    [resume, setResume, localLanguagesRef, setLocalLanguages, confirm, t],
  );

  const toggleVisibility = useCallback(
    (index: number) => {
      const itemWithId = localLanguagesRef.current[index];
      if (!itemWithId) return;
      const { _id, ...item } = itemWithId;
      toggleItemVisibility('languages', item as unknown as Record<string, unknown>);
    },
    [toggleItemVisibility, localLanguagesRef],
  );

  return {
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
    setLocalLanguages,
  };
}
