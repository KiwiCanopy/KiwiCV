import { useMemo, useState } from 'react';

import {
  ALL_ADDRESS_FIELD_KEYS,
  type AddressField,
  type AddressFieldKey,
  type AddressPreset,
  type AddressSeparator,
  DEFAULT_ADDRESS_FIELDS,
  EUROPEAN_ADDRESS_FIELDS,
  US_CA_ADDRESS_FIELDS,
  matchesAddressFields,
} from '@/features/dashboard/design/helpers/addressSchemaTypes';
import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useAddressSchemaEditor() {
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const addressSchema = resume.meta.theme.params?.addressSchema || { mode: 'default' as const };
  const mode: 'default' | 'custom' = addressSchema.mode === 'custom' ? 'custom' : 'default';
  /**
   * ⚠️ Shape-filtered, not just `|| DEFAULT_ADDRESS_FIELDS`.
   *
   * ⚠️ `validation.ts` **does** narrow `addressSchema` now — `sanitizeAddressSchema`
   * exists — but only on the JSON-import path. `persist`
   * rehydration (`useResumeStore.ts`) does not call it, so what arrives from
   * localStorage still has no validated shape: arbitrary JSON, not merely an
   * arbitrary string. The guard stays; only the reason changed. (The old wording,
   * "strips rather than narrows", was corrected in `themes/shared/address.ts`
   * and survived here — the same laundered claim, one file over.) `itemIds` feeds these straight into dnd-kit
   * as sortable ids, and a `null` entry or a null `field` threw
   * `Cannot use 'in' operator to search for 'id' in null` from inside
   * `SortableContext` — a crash that never reaches `addressFieldLabel`, so the
   * label guard cannot see it.
   *
   * Malformed entries are dropped rather than replaced wholesale, mirroring
   * `themes/shared/address.ts`, so the editor and the rendered address agree on
   * which entries exist. All of them malformed reads as an empty custom schema in
   * both places.
   *
   * ⚠️ `useMemo` is load-bearing, not an optimisation. `customFields` is compared
   * by **identity** against `prevCustomFields` below to resync the local mirror,
   * so an unmemoised `.filter()` returns a fresh array every render, the
   * comparison never settles, and the component sets state in render forever —
   * "Too many re-renders", which is exactly what the existing drag-cancellation
   * tests caught when this guard was first added.
   */
  const storedFields = addressSchema.customFields;
  const customFields = useMemo(
    () =>
      Array.isArray(storedFields)
        ? storedFields.filter(
            (entry): entry is AddressField =>
              !!entry && typeof entry === 'object' && typeof entry.field === 'string',
          )
        : DEFAULT_ADDRESS_FIELDS,
    [storedFields],
  );
  const [localCustomFields, setLocalCustomFields] = useState(customFields);
  const [prevCustomFields, setPrevCustomFields] = useState(customFields);

  if (customFields !== prevCustomFields) {
    setPrevCustomFields(customFields);
    setLocalCustomFields(customFields);
  }

  const persistFields = (nextFields: AddressField[]) => {
    setLocalCustomFields(nextFields);
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: {
            ...resume.meta.theme.params,
            addressSchema: { ...addressSchema, customFields: nextFields },
          },
        },
      });
    }, 0);
  };

  const handleModeChange = (newMode: 'default' | 'custom') => {
    if (newMode === mode) return;
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: {
            ...resume.meta.theme.params,
            addressSchema: {
              ...addressSchema,
              mode: newMode,
              customFields: newMode === 'custom' ? customFields : addressSchema.customFields,
            },
          },
        },
      });
    }, 0);
  };

  const handleApplyPreset = (preset: AddressPreset) => {
    persistFields(preset === 'us_ca' ? US_CA_ADDRESS_FIELDS : EUROPEAN_ADDRESS_FIELDS);
  };

  const handleUpdateSeparator = (index: number, separator: AddressSeparator) => {
    const nextFields = [...localCustomFields];
    nextFields[index] = { ...nextFields[index], separator };
    persistFields(nextFields);
  };

  const handleRemoveField = (index: number) => {
    persistFields(localCustomFields.filter((_, fieldIndex) => fieldIndex !== index));
  };

  const handleMoveField = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= localCustomFields.length) return;
    persistFields(arrayMove(localCustomFields, index, nextIndex));
  };

  const handleAddField = (field: AddressFieldKey) => {
    const separator: AddressSeparator = field === 'postalCode' ? ' ' : ',';
    persistFields([...localCustomFields, { field, separator }]);
  };

  const handleReset = () => {
    if (mode === 'default') return;
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: {
            ...resume.meta.theme.params,
            addressSchema: { mode: 'default' },
          },
        },
      });
    }, 0);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = localCustomFields.findIndex((field) => field.field === active.id);
    const overIndex = localCustomFields.findIndex((field) => field.field === over.id);
    if (activeIndex !== -1 && overIndex !== -1) {
      setLocalCustomFields((fields) => arrayMove(fields, activeIndex, overIndex));
    }
  };

  const handleDragEnd = () => {
    if (JSON.stringify(localCustomFields) === JSON.stringify(customFields)) return;
    persistFields(localCustomFields);
  };

  // handleDragOver reorders the mirror live, so a cancelled drag must put it
  // back. dnd-kit fires onDragCancel instead of onDragEnd on Escape, so without
  // this the mirror kept the abandoned order while the store kept the old one,
  // and the next unrelated edit rebuilt from the mirror and persisted it.
  const handleDragCancel = () => {
    setLocalCustomFields(customFields);
  };

  const itemIds = useMemo(() => localCustomFields.map((field) => field.field), [localCustomFields]);
  const inactiveFields = useMemo(() => {
    const activeKeys = new Set(itemIds);
    return ALL_ADDRESS_FIELD_KEYS.filter((field) => !activeKeys.has(field));
  }, [itemIds]);

  return {
    mode,
    localCustomFields,
    itemIds,
    inactiveFields,
    isEuropeanPreset: matchesAddressFields(localCustomFields, EUROPEAN_ADDRESS_FIELDS),
    isUSCAPreset: matchesAddressFields(localCustomFields, US_CA_ADDRESS_FIELDS),
    sensors,
    handleModeChange,
    handleApplyPreset,
    handleUpdateSeparator,
    handleRemoveField,
    handleMoveField,
    handleAddField,
    handleReset,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
