import {
  type ArrayFormItem,
  type ArrayFormKey,
  type LocalItem,
} from '@/components/editor/ArrayForm/types';
import { persistableItems } from '@/utils/items';
import { ISO_DATE_PATTERN, normalizeDate } from '@/utils/normalizeDate';
import { isOngoingDateWord } from '@/utils/ongoingDate';

/**
 * `normalizeDate`'s output as a packed integer — `2019-03-01` → `20190301`,
 * ordered exactly as the ISO strings are. `null` for anything else.
 *
 * ⚠️ Absent parts pack as 0, so `2019` < `2019-03` < `2019-03-01`. ⚠️ No `Date`:
 * a date-only string parses as UTC and reads back local.
 */
const isoSortKey = (iso: string): number | null => {
  const parts = ISO_DATE_PATTERN.exec(iso);
  if (!parts) return null;
  return Number(parts[1]) * 10_000 + Number(parts[2] ?? '0') * 100 + Number(parts[3] ?? '0');
};

/**
 * A dated entry's sort key: comparable, and comparable only. An absent date is
 * `Infinity` for an end date and `-Infinity` for a start date; `-Infinity` is
 * also what a date nothing can express gets, so it sorts last rather than
 * claiming a position.
 *
 * ⚠️ `normalizeDate` decides what the string means, never this.
 */
export const parseDateString = (dateStr?: unknown, isEndDate = false) => {
  // ⚠️ `typeof`, not `?.trim()`. A stored date is arbitrary JSON, so a number
  // reaches `.trim` and throws.
  const trimmed = typeof dateStr === 'string' ? dateStr.trim() : '';
  if (!trimmed) return isEndDate ? Infinity : -Infinity;
  // An ongoing end date means what an empty one means.
  if (isOngoingDateWord(trimmed)) return isEndDate ? Infinity : -Infinity;

  return isoSortKey(normalizeDate(trimmed)) ?? -Infinity;
};

/**
 * Checks if a list of local items is already sorted chronologically.
 */
export const checkIsAlreadySorted = <K extends ArrayFormKey>(
  localItems: LocalItem<ArrayFormItem<K>>[],
  itemStartDateKey?: keyof ArrayFormItem<K>,
  itemEndDateKey?: keyof ArrayFormItem<K>,
): boolean => {
  if (localItems.length <= 1 || (!itemEndDateKey && !itemStartDateKey)) return true;

  for (let i = 0; i < localItems.length - 1; i++) {
    const a = localItems[i];
    const b = localItems[i + 1];

    const endA = parseDateString(a[itemEndDateKey as keyof typeof a], true);
    const endB = parseDateString(b[itemEndDateKey as keyof typeof b], true);

    if (endA < endB) return false;
    if (endA === endB) {
      const startA = parseDateString(a[itemStartDateKey as keyof typeof a], false);
      const startB = parseDateString(b[itemStartDateKey as keyof typeof b], false);
      if (startA < startB) return false;
    }
  }
  return true;
};

/**
 * Returns a new array of items sorted chronologically (descending).
 */
export const getChronologicallySortedItems = <K extends ArrayFormKey>(
  localItems: LocalItem<ArrayFormItem<K>>[],
  itemStartDateKey?: keyof ArrayFormItem<K>,
  itemEndDateKey?: keyof ArrayFormItem<K>,
): LocalItem<ArrayFormItem<K>>[] => {
  if (!itemEndDateKey && !itemStartDateKey) return localItems;

  return [...localItems].sort((a, b) => {
    const endA = itemEndDateKey
      ? parseDateString(a[itemEndDateKey as keyof typeof a], true)
      : -Infinity;
    const endB = itemEndDateKey
      ? parseDateString(b[itemEndDateKey as keyof typeof b], true)
      : -Infinity;

    if (endB !== endA) {
      if (endB === Infinity) return 1;
      if (endA === Infinity) return -1;
      return (endB as number) - (endA as number);
    }

    const startA = itemStartDateKey
      ? parseDateString(a[itemStartDateKey as keyof typeof a], false)
      : -Infinity;
    const startB = itemStartDateKey
      ? parseDateString(b[itemStartDateKey as keyof typeof b], false)
      : -Infinity;

    if (startB !== startA) {
      if (startB === Infinity) return 1;
      if (startA === Infinity) return -1;
      return (startB as number) - (startA as number);
    }

    return 0;
  });
};

/** `persistableItems`, typed for an ArrayForm section. */
export const getCleanItemsForStore = <K extends ArrayFormKey>(
  localItems: LocalItem<ArrayFormItem<K>>[],
): ArrayFormItem<K>[] => persistableItems(localItems) as ArrayFormItem<K>[];
