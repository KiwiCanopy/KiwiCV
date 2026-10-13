export function moveCollectionItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (index < 0 || index >= items.length || nextIndex < 0 || nextIndex >= items.length) {
    return [...items];
  }

  const reorderedItems = [...items];
  const [item] = reorderedItems.splice(index, 1);
  reorderedItems.splice(nextIndex, 0, item);
  return reorderedItems;
}
