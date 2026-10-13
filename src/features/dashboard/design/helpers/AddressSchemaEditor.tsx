import { memo } from 'react';

import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { SortableAddressField } from '@/features/dashboard/design/helpers/SortableAddressField';
import { addressFieldLabel } from '@/features/dashboard/design/helpers/addressSchemaTypes';
import { useAddressSchemaEditor } from '@/features/dashboard/design/helpers/useAddressSchemaEditor';
import { createSortingAnnouncements } from '@/features/dashboard/design/sortingAnnouncements';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { MapPin, Plus, RotateCcw } from 'lucide-react';

export const AddressSchemaEditor = memo(() => {
  const { t } = useTranslation();
  const { isStandard } = useEditorBreakpoints();
  const {
    mode,
    localCustomFields,
    itemIds,
    inactiveFields,
    isEuropeanPreset,
    isUSCAPreset,
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
  } = useAddressSchemaEditor();
  const modeOptions = [
    { value: 'default' as const, label: t('design.address_schema_mode_default') },
    { value: 'custom' as const, label: t('design.address_schema_mode_custom') },
  ];
  /**
   * The one way a stored address field key becomes a label in this component.
   *
   * ⚠️ There is deliberately **no `fieldLabels` object in scope** — the map lives
   * inside `addressFieldLabel`, so the `fieldLabels[field] || field` idiom that
   * caused the prototype-key bug cannot be written here. See that function for why.
   */
  const labelFor = (field: string): string => addressFieldLabel(t, field);

  return (
    <div id="address-schema" className="space-y-6">
      <div className="space-y-1.5">
        <div
          className={cn('flex', isStandard ? 'flex-row items-baseline gap-3' : 'flex-col gap-1.5')}
        >
          <SectionLabel
            label={t('design.address_schema_title')}
            icon={<MapPin size={20} className="text-primary-strong/70" strokeWidth={2.5} />}
          />
          {mode !== 'default' && (
            <button
              onClick={handleReset}
              className="text-primary-strong hover:text-foreground group flex cursor-pointer items-center gap-1.5 text-left text-[11px] font-bold tracking-wide uppercase transition-colors"
            >
              <RotateCcw size={12} className="transition-transform group-hover:-rotate-45" />
              {t('design.address_schema_restore')}
            </button>
          )}
        </div>
        <span
          className={cn('text-muted-foreground block text-xs', isStandard ? 'pl-7' : 'pt-0.5 pl-0')}
        >
          {t('design.address_schema_desc')}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-foreground text-xs font-bold">
            {t('design.address_schema_mode_label')}
          </span>
          <SegmentedToggle value={mode} onChange={handleModeChange} options={modeOptions} />
          {mode === 'default' && (
            <span className="text-muted-foreground block pt-1 text-xs">
              {t('design.address_schema_mode_default_desc', {
                customLayout: t('design.address_schema_mode_custom'),
              })}
            </span>
          )}
        </div>

        {mode === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-foreground block text-xs font-bold">
                {t('design.address_schema_apply_template')}
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['european', isEuropeanPreset, t('design.address_schema_preset_european')],
                    ['us_ca', isUSCAPreset, t('design.address_schema_preset_us_ca')],
                  ] as const
                ).map(([preset, isActive, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    aria-pressed={isActive}
                    className={cn(
                      'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 select-none',
                      isActive
                        ? 'border-primary-strong bg-primary/5 text-primary-strong font-bold shadow-xs'
                        : 'border-input bg-muted/5 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary-strong/45',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground block text-[11px] font-bold tracking-wider uppercase">
                {t('design.address_schema_active_fields')}
              </span>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                accessibility={{
                  announcements: createSortingAnnouncements({
                    items: itemIds,
                    getLabel: (id) => labelFor(String(id)),
                    t,
                  }),
                }}
              >
                <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                  <div className="border-border bg-muted/5 flex min-h-[58px] flex-wrap items-center gap-2 rounded-lg border p-3.5">
                    {localCustomFields.length === 0 ? (
                      <span className="text-muted-foreground/60 text-xs italic">
                        {t('design.address_schema_no_active_fields')}
                      </span>
                    ) : (
                      localCustomFields.map((item, index) => (
                        <SortableAddressField
                          key={item.field}
                          id={item.field}
                          label={labelFor(item.field)}
                          onRemove={() => handleRemoveField(index)}
                          position={index + 1}
                          total={localCustomFields.length}
                          onMoveUp={() => handleMoveField(index, -1)}
                          onMoveDown={() => handleMoveField(index, 1)}
                          separator={item.separator}
                          onUpdateSeparator={(separator) => handleUpdateSeparator(index, separator)}
                          isHiddenSeparator={index === localCustomFields.length - 1}
                          t={t}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {inactiveFields.length > 0 && (
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[11px] font-bold tracking-wider uppercase">
                  {t('design.address_schema_available_fields')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {inactiveFields.map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => handleAddField(field)}
                      className="border-input bg-muted/20 text-muted-foreground hover:bg-secondary hover:text-primary-strong hover:border-primary-strong/45 flex cursor-pointer items-center gap-1 rounded-lg border border-dashed px-2.5 py-1.5 text-xs font-semibold transition-colors select-none"
                    >
                      <Plus size={12} />
                      {labelFor(field)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AddressSchemaEditor.displayName = 'AddressSchemaEditor';
