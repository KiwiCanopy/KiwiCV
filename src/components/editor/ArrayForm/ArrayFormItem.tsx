import { useMemo } from 'react';

import { ArrayFormField } from '@/components/editor/ArrayForm/ArrayFormField';
import { SortableItem } from '@/components/editor/ArrayForm/SortableItem';
import {
  type ArrayFormItem,
  type ArrayFormKey,
  type FieldConfig,
  type LocalItem,
} from '@/components/editor/ArrayForm/types';
import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { AccordionItem } from '@/components/ui/Accordion';
import { AI_EXCLUDED_SECTIONS } from '@/constants/ai';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useLockedFields } from '@/features/dashboard/editor/proposals/useLockedFields';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPTY_ARRAY, useResumeStore } from '@/store/resume/useResumeStore';
import { itemTarget } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { isItemEmpty } from '@/utils/items';
import { isExpressibleDate } from '@/utils/normalizeDate';
import { isVisible } from '@/utils/visibility';

interface ArrayFormItemProps<K extends ArrayFormKey> {
  item: LocalItem<ArrayFormItem<K>>;
  index: number;
  sectionKey: K;
  itemTitleKey: keyof ArrayFormItem<K>;
  itemSubtitleKey?: keyof ArrayFormItem<K>;
  itemSummaryKey?: keyof ArrayFormItem<K>;
  itemStartDateKey?: keyof ArrayFormItem<K>;
  itemEndDateKey?: keyof ArrayFormItem<K>;
  fields: FieldConfig<ArrayFormItem<K>>[];
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (fromKeyboard: boolean) => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  position: number;
  total: number;
  updateItem: (index: number, updatedFields: Partial<ArrayFormItem<K>>) => void;
  isActive?: boolean;
  forceCollapsed?: boolean;
  subtitleFormatter?: (item: ArrayFormItem<K>) => string;
}

const getRowColumns = (fieldCount: number) => {
  if (fieldCount >= 3) return 'md:grid-cols-3';
  if (fieldCount === 2) return 'md:grid-cols-2';
  return 'md:grid-cols-1';
};

export function ArrayFormItem<K extends ArrayFormKey>({
  item,
  index,
  sectionKey,
  itemTitleKey,
  itemSubtitleKey,
  itemSummaryKey,
  itemStartDateKey,
  itemEndDateKey,
  fields,
  isOpen,
  onToggle,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  position,
  total,
  updateItem,
  isActive,
  forceCollapsed,
  subtitleFormatter,
}: ArrayFormItemProps<K>) {
  const { t } = useTranslation();
  const hiddenIds = useResumeStore((state) => state.resume.meta.content.hiddenIds || EMPTY_ARRAY);
  const hiddenSections = useResumeStore(
    (state) => state.resume.meta.content.hiddenSections || EMPTY_ARRAY,
  );

  const itemLabel = (item[itemTitleKey] as string) || t('common.untitled');

  const subtitleBase = subtitleFormatter
    ? subtitleFormatter(item)
    : itemSubtitleKey
      ? (item[itemSubtitleKey] as string) || ''
      : '';
  // ⚠️ `typeof`, not `?.`. An item's `location` is arbitrary JSON on the same
  // terms as `basics.location`'s fields — `s()` type-tests it on import, but
  // rehydrated state never passes through there, and `?.trim()`
  // guards only nullish.
  const rawLocation = (item as { location?: unknown }).location;
  const location = typeof rawLocation === 'string' ? rawLocation.trim() : '';
  const subtitle = [subtitleBase, location].filter(Boolean).join(' · ');

  const itemHasError = useMemo(() => {
    return fields.some((field) => {
      const fieldValue = item[field.name];
      const isDateField =
        field.type === 'date' || field.name === itemStartDateKey || field.name === itemEndDateKey;
      return isDateField && fieldValue && !isExpressibleDate(fieldValue as string);
    });
  }, [fields, item, itemStartDateKey, itemEndDateKey]);

  const aiTarget =
    item._vId && !(AI_EXCLUDED_SECTIONS as readonly string[]).includes(sectionKey)
      ? itemTarget(sectionKey, item._vId)
      : undefined;
  const lockFor = useLockedFields<ArrayFormItem<K>>(aiTarget);

  // The diff panel names each changed field, and the field configs are the only
  // place those names are translated.
  const fieldLabels = useMemo(
    () =>
      fields.reduce<Partial<Record<keyof ArrayFormItem<K> & string, string>>>((acc, field) => {
        acc[field.name as keyof ArrayFormItem<K> & string] = field.label;
        return acc;
      }, {}),
    [fields],
  );

  // Group fields by row
  const rows: Record<number, FieldConfig<ArrayFormItem<K>>[]> = {};
  const unassignedFields: FieldConfig<ArrayFormItem<K>>[] = [];

  fields.forEach((field) => {
    if (field.row) {
      if (!rows[field.row]) rows[field.row] = [];
      rows[field.row].push(field);
    } else {
      unassignedFields.push(field);
    }
  });

  return (
    <SortableItem id={item._id} isActive={isActive} forceCollapsed={forceCollapsed}>
      <AccordionItem
        title={
          (item[itemTitleKey] as string) || (itemTitleKey === 'name' ? t('common.untitled') : '')
        }
        subtitle={subtitle || undefined}
        description={itemSummaryKey ? (item[itemSummaryKey] as string) : undefined}
        startDate={itemStartDateKey ? (item[itemStartDateKey] as string) : undefined}
        endDate={itemEndDateKey ? (item[itemEndDateKey] as string) : undefined}
        hasError={itemHasError}
        onDelete={onDelete}
        entryListId={sectionKey}
        onToggleVisibility={onToggleVisibility}
        isVisible={isVisible(
          sectionKey,
          item as unknown as Record<string, unknown>,
          hiddenIds,
          hiddenSections,
        )}
        aiTarget={aiTarget ? { target: aiTarget, isEmpty: isItemEmpty(item) } : undefined}
        isOpen={isOpen}
        onToggle={onToggle}
        isRange={!!itemEndDateKey}
        belowHeader={
          <EntryDiffPanel<ArrayFormItem<K>>
            target={aiTarget}
            fieldLabels={fieldLabels}
            entryName={itemLabel}
          />
        }
        orderActions={
          <ItemOrderControls
            itemLabel={itemLabel}
            position={position}
            total={total}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        }
      >
        {/* Render Grouped Rows */}
        {Object.keys(rows).map((rowId) => {
          const rowFields = rows[parseInt(rowId)];
          // `items-end` keeps sibling inputs on one baseline when their labels
          // wrap to different heights. It no longer needs an escape hatch: the
          // AI diff used to expand inside a field and tower over its neighbour,
          // and now it is a panel of its own above the fields.
          //
          // ⚠️ But only when the row's fields are the same height. A textarea is
          // several times taller than an input, and bottom-aligning the two
          // drops the short one to the foot of the row — in Awards, "Location"
          // sat a full textarea below "Summary", which is what `items-end` was
          // meant to prevent. A row holding one aligns at the top instead.
          const hasTallField = rowFields.some((f) => f.type === 'textarea' || f.type === 'tags');
          return (
            <div
              key={rowId}
              className={cn(
                'mb-4 grid grid-cols-1 gap-4',
                hasTallField ? 'items-start' : 'items-end',
                getRowColumns(rowFields.length),
              )}
            >
              {rowFields.map((field) => (
                <ArrayFormField
                  key={field.name}
                  field={field}
                  item={item}
                  index={index}
                  itemStartDateKey={itemStartDateKey}
                  itemEndDateKey={itemEndDateKey}
                  updateItem={updateItem}
                  lock={lockFor(field.name as keyof ArrayFormItem<K> & string)}
                />
              ))}
            </div>
          );
        })}

        {/* Render Remaining Fields */}
        {unassignedFields.length > 0 && (
          <div className="space-y-4">
            {unassignedFields.map((field) => (
              <div key={field.name} className="mb-4">
                <ArrayFormField
                  field={field}
                  item={item}
                  index={index}
                  itemStartDateKey={itemStartDateKey}
                  itemEndDateKey={itemEndDateKey}
                  updateItem={updateItem}
                  lock={lockFor(field.name as keyof ArrayFormItem<K> & string)}
                />
              </div>
            ))}
          </div>
        )}
      </AccordionItem>
    </SortableItem>
  );
}
