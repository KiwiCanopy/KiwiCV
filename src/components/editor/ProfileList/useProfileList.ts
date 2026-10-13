import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type LocalProfile, type ProfileListProps } from '@/components/editor/ProfileList/types';
import { moveCollectionItem } from '@/components/editor/collectionOrder';
import { PROFILES_LIST_ID } from '@/constants/focusAnchors';
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
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useProfileList({ profiles, onChange, onToggle }: ProfileListProps) {
  const confirm = useConfirmStore((state) => state.confirm);
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    localItems: localProfiles,
    setLocalItems: setLocalProfiles,
    localItemsRef: localProfilesRef,
    notifyRecentlyDragged,
  } = useLocalCollectionSync(profiles, activeId);
  const armEntryHandoff = useEntryFocusHandoff(localProfiles.length);

  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [localNetworkValues, setLocalNetworkValues] = useState<Record<number, string>>({});
  const suggestionRef = useRef<HTMLDivElement>(null);

  const itemIds = useMemo(() => localProfiles.map((p) => p._id), [localProfiles]);

  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );
  const toggleItemVisibility = useResumeStore((state) => state.toggleItemVisibility);
  const toggleSectionVisibility = useResumeStore((state) => state.toggleSectionVisibility);

  const allHidden = useMemo(() => {
    return hiddenSections.includes('profiles');
  }, [hiddenSections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleToggleAllVisibility = useCallback(() => {
    toggleSectionVisibility('profiles', profiles);
  }, [toggleSectionVisibility, profiles]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalProfiles((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    notifyRecentlyDragged();
    // A drag can reorder arbitrarily, so the index-keyed suggestion state can
    // no longer be trusted. Close it rather than reattach it to a stale row.
    setActiveSuggestionIndex(null);

    const filtered = persistableItems(localProfilesRef.current) as ResumeData['basics']['profiles'];

    onChange(filtered);
  };

  const moveProfile = useCallback(
    (index: number, direction: -1 | 1) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= localProfilesRef.current.length) return;

      const reorderedProfiles = moveCollectionItem(localProfilesRef.current, index, direction);
      setLocalProfiles(reorderedProfiles);

      // activeSuggestionIndex and localNetworkValues are keyed by array index,
      // so a move leaves them pointing at whichever profile now occupies that
      // slot. Carry both across with the item being moved.
      setLocalNetworkValues((prev) => {
        const next = { ...prev };
        const moved = prev[index];
        const displaced = prev[nextIndex];
        if (moved === undefined) delete next[nextIndex];
        else next[nextIndex] = moved;
        if (displaced === undefined) delete next[index];
        else next[index] = displaced;
        return next;
      });
      setActiveSuggestionIndex((current) => {
        if (current === index) return nextIndex;
        if (current === nextIndex) return index;
        return current;
      });

      const filtered = persistableItems(reorderedProfiles) as ResumeData['basics']['profiles'];

      onChange(filtered);
    },
    [localProfilesRef, onChange, setLocalProfiles],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setLocalProfiles(profiles.map((p) => ({ ...p, _id: generateId() })));
  }, [profiles, setLocalProfiles]);

  /**
   * `profiles` lives at `basics.profiles` rather than in `ALL_SECTION_KEYS`, but
   * `EMPTY_ITEM_FIELDS` carries it all the same (`EmptyItemKey` is
   * `SectionKey | 'profiles'`), so this was a straight swap — the inline
   * literal named exactly the same three fields.
   */
  const addProfile = useCallback(() => {
    const emptyItem = createEmptyItem('profiles');
    const newItemWithId: LocalProfile = { _id: generateId(), ...emptyItem };
    if (allHidden) {
      toggleItemVisibility('profiles', { _vId: emptyItem._vId });
    }
    setLocalProfiles((prev) => [newItemWithId, ...prev]);
    onToggle?.(false);
  }, [allHidden, toggleItemVisibility, onToggle, setLocalProfiles]);

  /** The empty-state card's add: it unmounts, so focus goes to the new entry. */
  const addFirstProfile = useCallback(
    (fromKeyboard: boolean) => {
      armEntryHandoff(firstEntryFieldAnchor(PROFILES_LIST_ID), fromKeyboard);
      addProfile();
    },
    [armEntryHandoff, addProfile],
  );

  const removeProfile = useCallback(
    async (index: number) => {
      const isConfirmed = await confirm({
        title: t('common.confirm_delete_title'),
        message: t('common.confirm_delete_message'),
        variant: 'destructive',
        // The pressed Delete button goes with the entry it deletes.
        restoreFocusTo: entryDeleteAnchor(PROFILES_LIST_ID, index),
      });

      if (!isConfirmed) return;

      const newLocal = localProfiles.filter((_, i) => i !== index);
      setLocalProfiles(newLocal);
      const filtered = persistableItems(newLocal) as ResumeData['basics']['profiles'];
      onChange(filtered);
    },
    [localProfiles, onChange, setLocalProfiles, confirm, t],
  );

  const updateProfile = useCallback(
    (index: number, updates: Partial<ResumeData['basics']['profiles'][0]>) => {
      const newLocal = [...localProfiles];
      newLocal[index] = { ...newLocal[index], ...updates };
      setLocalProfiles(newLocal);
      const filtered = persistableItems(newLocal) as ResumeData['basics']['profiles'];
      onChange(filtered);
    },
    [localProfiles, onChange, setLocalProfiles],
  );

  const handleToggleVisibility = useCallback(
    (profileWithId: LocalProfile) => {
      const { _id, ...profile } = profileWithId;
      toggleItemVisibility('profiles', profile as Record<string, unknown>);
    },
    [toggleItemVisibility],
  );

  const handleNetworkLocalChange = useCallback((index: number, value: string) => {
    setLocalNetworkValues((prev) => ({ ...prev, [index]: value }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setActiveSuggestionIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
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
  };
}
