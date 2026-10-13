import { useState } from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import type { AddressSeparator } from '@/features/dashboard/design/helpers/addressSchemaTypes';
import { cn } from '@/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { ChevronDown, GripVertical, X } from 'lucide-react';

interface SortableAddressFieldProps {
  id: string;
  label: string;
  onRemove: () => void;
  separator: AddressSeparator;
  onUpdateSeparator: (separator: AddressSeparator) => void;
  isHiddenSeparator: boolean;
  position: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

interface SeparatorSelectorProps {
  currentSeparator: AddressSeparator;
  onUpdate: (separator: AddressSeparator) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isHidden?: boolean;
}

function SeparatorSelector({ currentSeparator, onUpdate, t, isHidden }: SeparatorSelectorProps) {
  const [open, setOpen] = useState(false);

  if (isHidden) {
    return <div className="h-11 min-w-11 flex-none" aria-hidden="true" />;
  }

  const separators: Array<{
    value: AddressSeparator;
    label: string;
    indicator: string;
  }> = [
    { value: ',', label: t('design.address_schema_separator_comma'), indicator: ',' },
    { value: ' ', label: t('design.address_schema_separator_space'), indicator: '␣' },
    { value: '-', label: t('design.address_schema_separator_dash'), indicator: '-' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group border-input bg-background text-foreground hover:bg-muted hover:border-primary-strong/40 flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors"
          title={t('design.address_schema_toggle_separator')}
        >
          <span className="text-[13px] leading-none">
            {currentSeparator === ',' ? ',' : currentSeparator === '-' ? '-' : '␣'}
          </span>
          <ChevronDown
            size={12}
            className="text-primary-strong/80 transition-transform duration-200 group-data-[state=open]:rotate-180"
            strokeWidth={3}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-48 p-1.5">
        <div className="flex flex-col gap-0.5">
          {separators.map((separator) => (
            <button
              key={separator.value}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onUpdate(separator.value);
                setOpen(false);
              }}
              aria-pressed={currentSeparator === separator.value}
              className={cn(
                'hover:bg-muted flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                currentSeparator === separator.value
                  ? 'bg-primary/10 text-primary-strong font-bold'
                  : 'text-foreground',
              )}
            >
              <span>{separator.label}</span>
              <span className="text-muted-foreground/60 ml-2 font-mono">
                ({separator.indicator})
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SortableAddressField({
  id,
  label,
  onRemove,
  separator,
  onUpdateSeparator,
  isHiddenSeparator,
  position,
  total,
  onMoveUp,
  onMoveDown,
  t,
}: SortableAddressFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border bg-background flex min-h-11 w-full flex-wrap items-center gap-1 rounded-xl border p-1.5"
    >
      <div
        className={cn(
          'text-foreground flex min-h-11 min-w-[8rem] flex-1 items-center gap-1.5 rounded-lg px-1 text-xs font-semibold select-none',
          isDragging ? 'opacity-50' : '',
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-primary-strong hover:bg-muted flex h-11 w-11 cursor-grab items-center justify-center rounded-lg active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          role="button"
          tabIndex={0}
          aria-label={t('common.move_named', { name: label })}
        >
          <GripVertical size={13} />
        </div>
        <span className="max-w-[120px] truncate select-none">{label}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-muted flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors"
          aria-label={t('common.remove_named', { name: label })}
        >
          <X size={12} />
        </button>
      </div>
      <ItemOrderControls
        itemLabel={label}
        position={position}
        total={total}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      <SeparatorSelector
        currentSeparator={separator}
        onUpdate={onUpdateSeparator}
        t={t}
        isHidden={isHiddenSeparator}
      />
    </div>
  );
}
