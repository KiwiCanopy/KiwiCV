import { useCallback, useMemo, useState } from 'react';

import {
  type ArrayFormItem,
  type ArrayFormKey,
  type ArrayFormProps,
  type ArraySectionKeys,
  type LocalItem,
} from '@/components/editor/ArrayForm/types';
import {
  checkIsAlreadySorted,
  getChronologicallySortedItems,
  getCleanItemsForStore,
} from '@/components/editor/ArrayForm/utils';
import { moveCollectionItem } from '@/components/editor/collectionOrder';
import { useEntryFocusHandoff } from '@/hooks/useEntryFocusHandoff';
import { useLocalCollectionSync } from '@/hooks/useLocalCollectionSync';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPTY_ARRAY, useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { type CustomSectionItem, type ResumeData } from '@/types/resume';
import { entryDeleteAnchor, firstEntryFieldAnchor } from '@/utils/focus';
import { createCustomSectionItem, createEmptyItem, generateId, isItemEmpty } from '@/utils/items';
import { type EmptyItemKey, findCustomSection, isCustomSectionToken } from '@/utils/layoutMetadata';
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

export function useArrayForm<K extends ArrayFormKey>({
  sectionKey,
  itemStartDateKey,
  itemEndDateKey,
  defaultCollapsed = true,
}: Pick<
  ArrayFormProps<K>,
  'sectionKey' | 'itemStartDateKey' | 'itemEndDateKey' | 'defaultCollapsed'
>) {
  const resume = useResumeStore((state) => state.resume);
  const setResume = useResumeStore((state) => state.setResume);
  const toggleItemVisibility = useResumeStore((state) => state.toggleItemVisibility);
  const confirm = useConfirmStore((state) => state.confirm);
  const { t } = useTranslation();
  const toggleSectionVisibility = useResumeStore((state) => state.toggleSectionVisibility);
  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );

  const setCustomSectionItems = useResumeStore((state) => state.setCustomSectionItems);
  // A custom section's entries live under `customSections[i].items`.
  const customSection = isCustomSectionToken(sectionKey)
    ? findCustomSection(resume, sectionKey)
    : undefined;
  const items =
    ((customSection
      ? customSection.items
      : resume[sectionKey as ArraySectionKeys]) as ArrayFormItem<K>[]) || EMPTY_ARRAY;

  const writeItems = useCallback(
    (next: ArrayFormItem<K>[]) => {
      if (customSection) setCustomSectionItems(customSection.id, next as CustomSectionItem[]);
      else setResume({ ...resume, [sectionKey]: next } as ResumeData, { silent: true });
    },
    [customSection, setCustomSectionItems, setResume, resume, sectionKey],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const { localItems, setLocalItems, localItemsRef, notifyRecentlyDragged } =
    useLocalCollectionSync(items, activeId);

  const armEntryHandoff = useEntryFocusHandoff(localItems.length);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(defaultCollapsed);

  // Note: Removed auto-expand logic to follow new workflow rules
  const [prevDefaultCollapsed, setPrevDefaultCollapsed] = useState(defaultCollapsed);

  // Sync with defaultCollapsed prop
  if (defaultCollapsed !== prevDefaultCollapsed) {
    setPrevDefaultCollapsed(defaultCollapsed);
    setIsSectionCollapsed(defaultCollapsed);
    if (!defaultCollapsed && localItems.length === 1 && expandedIds.length === 0) {
      setExpandedIds([localItems[0]._id]);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allHidden = useMemo(
    () => hiddenSections.includes(sectionKey as string),
    [sectionKey, hiddenSections],
  );

  const handleToggleSectionVisibility = useCallback(() => {
    toggleSectionVisibility(sectionKey, items as Array<Record<string, unknown>>);
  }, [toggleSectionVisibility, sectionKey, items]);

  const itemIds = useMemo(() => localItems.map((item) => item._id), [localItems]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= localItemsRef.current.length) return;

      const reorderedItems = moveCollectionItem(localItemsRef.current, index, direction);
      setLocalItems(reorderedItems);
      const filteredItems = getCleanItemsForStore<K>(reorderedItems);
      writeItems(filteredItems);
    },
    [localItemsRef, setLocalItems, writeItems],
  );
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalItems((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    notifyRecentlyDragged();
    const filteredItems = getCleanItemsForStore<K>(localItemsRef.current);
    writeItems(filteredItems);
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setLocalItems(items.map((item) => ({ ...item, _id: generateId() })));
  }, [items, setLocalItems]);

  const isAlreadySorted = useMemo(
    () => checkIsAlreadySorted<K>(localItems, itemStartDateKey, itemEndDateKey),
    [localItems, itemStartDateKey, itemEndDateKey],
  );

  const sortChronologically = useCallback(() => {
    if ((!itemEndDateKey && !itemStartDateKey) || isAlreadySorted) return;
    const sorted = getChronologicallySortedItems<K>(localItems, itemStartDateKey, itemEndDateKey);
    setLocalItems(sorted);
    const filteredItems = getCleanItemsForStore<K>(sorted);
    writeItems(filteredItems);
  }, [localItems, itemEndDateKey, itemStartDateKey, isAlreadySorted, writeItems, setLocalItems]);

  const updateItem = useCallback(
    (index: number, updatedFields: Partial<ArrayFormItem<K>>) => {
      const newItems = [...localItems];
      newItems[index] = { ...newItems[index], ...updatedFields };
      setLocalItems(newItems);
      const filteredItems = getCleanItemsForStore<K>(newItems);
      writeItems(filteredItems);
    },
    [localItems, writeItems, setLocalItems],
  );

  const deleteItem = useCallback(
    async (index: number, fromKeyboard = false) => {
      const targetItem = localItems[index];
      const isEmpty = isItemEmpty(targetItem);

      if (!isEmpty) {
        const isConfirmed = await confirm({
          title: t('common.confirm_delete_title'),
          message: t('common.confirm_delete_message'),
          variant: 'destructive',
          // The pressed Delete button goes with the entry it deletes.
          restoreFocusTo: entryDeleteAnchor(sectionKey, index),
        });

        if (!isConfirmed) return;
      } else {
        // ⚠️ The second route out of this function, and the one no dialog covers:
        // a blank entry goes without a confirm, so `DialogFrame` never runs and
        // `restoreFocusTo` above cannot help. Armed before the removal.
        armEntryHandoff(entryDeleteAnchor(sectionKey, index), fromKeyboard);
      }

      const newLocalItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newLocalItems);
      const filteredItems = getCleanItemsForStore<K>(newLocalItems);
      writeItems(filteredItems);
    },
    [localItems, writeItems, sectionKey, setLocalItems, confirm, t, armEntryHandoff],
  );

  /**
   * The blank item comes from `createEmptyItem`, the canonical item shape, not
   * from a `newItem` prop each form restated inline — that was the sixth
   * parallel copy of the section inventory and the one `createEmptyItem` had
   * drifted *from*.
   *
   * Calling it per add also removes a latent aliasing hazard the prop carried:
   * a `newItem` object literal is stable across a form's own re-renders (its
   * state lives in this hook, not in the parent), and `ProjectsForm` passed one
   * literal to *both* ArrayForms, so `{ ...newItem }` handed every added item
   * the same `highlights` array reference. It never surfaced — `updateItem`
   * below replaces field values immutably, so nothing ever mutated the shared
   * array — but nothing kept it that way either.
   *
   * `satisfies` pins the link the runtime depends on: every section `ArrayForm`
   * accepts must have an item shape. Add an array to `ResumeData` without one
   * and this is a build error rather than an "add" button that appears to do
   * nothing (the blank `{ _vId }` reads as empty and the store sync drops it).
   * It is a cross-check between the two independent sources of truth,
   * `ResumeData` and `ALL_SECTION_KEYS`.
   *
   * ⚠️ It fires only for **required** array properties. An optional
   * `foo?: Item[]` types as `Item[] | undefined`, fails `ArraySectionKeys`'
   * `extends readonly unknown[]` filter, and drops out silently.
   */
  const addItem = useCallback(() => {
    // ⚠️ The explicit type argument is `K & EmptyItemKey`, not a widening back
    // to `Record<string, unknown>`. An earlier draft did widen, on the
    // belief that TS simply cannot relate `ItemFor<K>` to the still-generic
    // `ArrayFormItem<K>` — true of the *conditional* `ItemFor` it had
    // then, and a limitation of that formulation rather than of TS. `ItemFor` is
    // now an indexed access on a mapped type (`ItemMap[K]`), which defers, so
    // this call keeps the real item type and the typed return is not thrown away
    // for the nine sections `ArrayForm` covers — three quarters of the inventory,
    // and the ones the doc on `createEmptyItem` was advertising it for.
    //
    // Writing the argument is not the "type argument as advice" hazard: `K`
    // is this hook's own generic, so there is nothing an author could forget —
    // the expression compiles or it does not.
    const emptyItem = isCustomSectionToken(sectionKey)
      ? createCustomSectionItem()
      : createEmptyItem<K & EmptyItemKey>(sectionKey as K & EmptyItemKey);
    const vId = emptyItem._vId;
    const newItemWithId = { ...emptyItem, _id: generateId() } as LocalItem<ArrayFormItem<K>>;
    if (allHidden) {
      toggleItemVisibility(sectionKey, { _vId: vId });
    }
    setLocalItems((prev) => [newItemWithId, ...prev]);
    setIsSectionCollapsed(false);
    setExpandedIds((prev) => [...prev, newItemWithId._id]);
  }, [toggleItemVisibility, sectionKey, allHidden, setLocalItems]);

  /** The empty-state card's add: it unmounts, so focus goes to the new entry. */
  const addFirstItem = useCallback(
    (fromKeyboard: boolean) => {
      armEntryHandoff(firstEntryFieldAnchor(sectionKey), fromKeyboard);
      addItem();
    },
    [armEntryHandoff, sectionKey, addItem],
  );

  const toggleItemVisibilityHandler = useCallback(
    (index: number) => {
      const itemWithId = localItems[index];
      if (!itemWithId) return;
      const { _id, ...item } = itemWithId;
      toggleItemVisibility(sectionKey, item as unknown as Record<string, unknown>);
    },
    [localItems, toggleItemVisibility, sectionKey],
  );

  return {
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
    toggleItemVisibility: toggleItemVisibilityHandler,
  };
}
