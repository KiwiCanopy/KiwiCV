import { useEffect, useRef, useState } from 'react';

import { generateId, isItemEmpty } from '@/utils/items';

/**
 * Hook to manage local state for a collection of items (array) and sync it with a store/parent.
 *
 * Features:
 * - Local state with temporary IDs for stable list rendering/DnD
 * - Sync from store when changed externally (e.g. outside the editor tab)
 * - Safe sync from store with a delay (preventing snapping during input)
 * - isRecentlyDragged flag to prevent store -> local sync immediately after a drag
 *
 * @param storeItems The items from the store/parent
 * @param activeId Optional active drag ID to pause synchronization
 * @param debounceMs Optional delay for synchronization to prevent flickering
 */
export function useLocalCollectionSync<T extends Record<string, unknown>>(
  storeItems: T[],
  activeId?: string | null,
  debounceMs: number = 0,
) {
  const [localItems, setLocalItems] = useState<(T & { _id: string })[]>(() =>
    storeItems.map((item) => ({ ...item, _id: generateId() })),
  );

  const prevStoreItemsRef = useRef(storeItems);
  const localItemsRef = useRef(localItems);
  const isRecentlyDraggedRef = useRef(false);

  useEffect(() => {
    localItemsRef.current = localItems;
  }, [localItems]);

  // Sync when store items change
  useEffect(() => {
    if (storeItems !== prevStoreItemsRef.current) {
      prevStoreItemsRef.current = storeItems;
      // Only update local items immediately if we are not currently dragging
      if (!activeId) {
        const storeFiltered = storeItems;
        const localFiltered = localItemsRef.current
          .filter((item) => !isItemEmpty(item))
          .map(({ _id, ...rest }) => rest);

        if (JSON.stringify(localFiltered) !== JSON.stringify(storeFiltered)) {
          setLocalItems(
            storeItems.map((item, idx) => ({
              ...item,
              _id: localItemsRef.current[idx]?._id || generateId(),
            })),
          );
        }
      }
    }
  }, [storeItems, activeId]);

  const notifyRecentlyDragged = () => {
    isRecentlyDraggedRef.current = true;
  };

  // External sync check
  useEffect(() => {
    // Skip sync if we're currently dragging an item
    if (activeId) return;

    if (isRecentlyDraggedRef.current) {
      isRecentlyDraggedRef.current = false;
      return;
    }

    // Compare store state with local state (ignoring temporary IDs and empty items)
    const storeFiltered = storeItems;
    const localFiltered = localItemsRef.current
      .filter((item) => !isItemEmpty(item))
      .map(({ _id, ...rest }) => rest);

    if (JSON.stringify(localFiltered) !== JSON.stringify(storeFiltered)) {
      const timer = setTimeout(() => {
        const currentLocalFiltered = localItemsRef.current
          .filter((item) => !isItemEmpty(item))
          .map(({ _id, ...rest }) => rest);

        if (JSON.stringify(currentLocalFiltered) !== JSON.stringify(storeFiltered)) {
          setLocalItems(
            storeItems.map((item, idx) => ({
              ...item,
              _id: localItemsRef.current[idx]?._id || generateId(),
            })),
          );
        }
      }, debounceMs);
      return () => clearTimeout(timer);
    }
  }, [storeItems, activeId, debounceMs]);

  return {
    localItems,
    setLocalItems,
    localItemsRef,
    notifyRecentlyDragged,
  };
}
