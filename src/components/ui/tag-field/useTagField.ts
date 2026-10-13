import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { moveCollectionItem } from '@/components/editor/collectionOrder';
import type { FieldLock } from '@/components/ui/fieldLock';
import type { TagItem } from '@/components/ui/tag-field/types';
import { generateId } from '@/utils/items';
import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface UseTagFieldOptions {
  value: string[];
  onChange: (value: string[]) => void;
  /**
   * Refuses every write while a pending AI proposal covers the list; an entry
   * typed before it arrived goes to the user's side instead (`FieldLock`).
   */
  lock?: FieldLock | null;
}

/**
 * The entry holding `text` nearest to `index`, or -1. Picks the right one of
 * two identical bullets once ids have been regenerated.
 */
const nearestMatch = (texts: readonly string[], text: string, index: number) => {
  let best = -1;
  texts.forEach((entry, i) => {
    if (entry === text && (best === -1 || Math.abs(i - index) < Math.abs(best - index))) best = i;
  });
  return best;
};

/** The user's side of a list proposal, as a list. */
const mineList = (lock: FieldLock) =>
  Array.isArray(lock.mine) ? lock.mine.map((entry) => String(entry ?? '')) : [];

export function useTagField({ value, onChange, lock }: UseTagFieldOptions) {
  const [inputValue, setInputValue] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<TagItem[]>(() =>
    value.map((text) => ({ id: generateId(), text })),
  );
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(prevValueRef.current)) {
      setItems(value.map((text) => ({ id: generateId(), text })));
      prevValueRef.current = value;
    }
  }, [value]);

  /** The one write path, so the lock is one guard. Returns whether it wrote. */
  const commitItems = useCallback(
    (newItems: TagItem[]) => {
      if (lock) return false;
      setItems(newItems);
      const newValues = newItems.map((item) => item.text);
      prevValueRef.current = newValues;
      onChange(newValues);
      return true;
    },
    [lock, onChange],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (lock) {
      lock.keepTyped?.([...mineList(lock), trimmed]);
      setInputValue('');
      return;
    }
    if (commitItems([...items, { id: generateId(), text: trimmed }])) setInputValue('');
  }, [commitItems, inputValue, items, lock]);

  const handleRemove = useCallback(
    (id: string) => {
      commitItems(items.filter((item) => item.id !== id));
    },
    [commitItems, items],
  );

  /**
   * An edit saved from the dialog. Locked, the dialog was opened on the user's
   * own entry before the proposal replaced the list, so the edit lands on their
   * side of it. Either way the entry is found by `id`, then by its text nearest
   * its old position (an outside write regenerates ids while the dialog is open),
   * else appended.
   * Saving unchanged text writes nothing.
   */
  const handleUpdate = useCallback(
    (id: string, newText: string, previous: { text: string; index: number }) => {
      const previousText = previous.text;
      // An untouched Save must not resurrect an entry an outside write removed.
      if (newText === previousText) return;
      if (lock) {
        const mine = mineList(lock);
        const at = nearestMatch(mine, previousText, previous.index);
        lock.keepTyped?.(
          at === -1 ? [...mine, newText] : mine.map((entry, i) => (i === at ? newText : entry)),
        );
        return;
      }
      const byId = items.findIndex((item) => item.id === id);
      const at =
        byId === -1
          ? nearestMatch(
              items.map((item) => item.text),
              previousText,
              previous.index,
            )
          : byId;
      commitItems(
        at === -1
          ? [...items, { id: generateId(), text: newText }]
          : items.map((item, i) => (i === at ? { ...item, text: newText } : item)),
      );
    },
    [commitItems, items, lock],
  );

  const handleMove = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = items.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= items.length) return;

      commitItems(moveCollectionItem(items, index, direction));
    },
    [commitItems, items],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      commitItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAdd();
    }
  };

  return {
    activeId,
    handleAdd,
    handleDragEnd,
    handleDragStart,
    handleKeyDown,
    handleMove,
    handleRemove,
    handleUpdate,
    inputValue,
    items,
    sensors,
    setInputValue,
  };
}
