import { type ChangeEvent, type FC, useId, useState } from 'react';

import { FieldLabel } from '@/components/ui/FieldLabel';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { LOCKED_BUTTON_CLASS, lockedReasonId } from '@/components/ui/fieldLock';
import { SortableTag } from '@/components/ui/tag-field/SortableTag';
import { TagEditorDialog } from '@/components/ui/tag-field/TagEditorDialog';
import type { TagFieldProps } from '@/components/ui/tag-field/types';
import { useTagField } from '@/components/ui/tag-field/useTagField';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

export type { TagFieldProps } from '@/components/ui/tag-field/types';

export const TagField: FC<TagFieldProps> = ({
  value = [],
  onChange,
  label,
  singularLabel,
  placeholder,
  layoutHint,
  infoHint,
  infoIcon: InfoIcon,
  rows = 1,
  type = 'input',
  lock,
}) => {
  const { t } = useTranslation();
  const { isSocial } = useEditorBreakpoints();
  const inputId = useId();
  const reasonId = lock ? lockedReasonId(inputId) : undefined;
  // Owned here, not by the entry: a proposal replacing the list remounts every
  // entry, and an edit open at that moment must survive it.
  const [editing, setEditing] = useState<{ id: string; text: string; index: number } | null>(null);
  const {
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
  } = useTagField({ value, onChange, lock });

  const FieldComponent = type === 'textarea' ? TextArea : Input;

  return (
    <div className="group/tagfield space-y-4">
      {label && (
        <div className="flex items-center justify-between px-1">
          <FieldLabel
            htmlFor={inputId}
            className="text-foreground text-sm font-medium"
            layoutHint={layoutHint}
            infoHint={infoHint}
            infoIcon={InfoIcon}
          >
            {label}
          </FieldLabel>
          {items.length > 0 && (
            <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-semibold">
              {items.length}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div>
          <FieldComponent
            id={inputId}
            value={inputValue}
            onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setInputValue(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            // The reason only: the add field's buffer is a new entry, not the list.
            lock={lock && { reason: lock.reason, mine: lock.mine }}
            {...(type === 'input' ? { liveUpdate: true } : { immediate: true })}
            {...(type === 'textarea' ? { rows } : {})}
            enterKeyHint="done"
            // `resize-none`: the native grabber renders in the bottom-right,
            // the same corner the add button sits in, so the two collided. The
            // field already grows by `rows`, and `TextArea` reserves `pr-12`
            // for the suffix so the text never runs under it.
            className={cn(type === 'textarea' && 'min-h-[46px] resize-none')}
            suffix={
              <div className="flex items-center gap-1 pr-1">
                <IconButton
                  label={t('common.add')}
                  onClick={handleAdd}
                  // Locked: `aria-disabled`, not `disabled`, so it stays in the tree
                  // beside the field that announces why.
                  disabled={!lock && !inputValue.trim()}
                  aria-disabled={lock ? true : undefined}
                  aria-describedby={reasonId}
                  variant="quiet"
                  // The secondary fill, same as the backup button. As a quiet
                  // button it had no shape inside the field, so the only
                  // discoverable way to commit an entry was knowing Enter works.
                  //
                  // 32px, not `IconButton`'s 44px: it is anchored inside the
                  // field, where a 44px square around a 16px glyph is almost
                  // all padding and crowds the text. The icon is unchanged.
                  // Still over WCAG 2.2's 24px target minimum (2.5.8), and
                  // scoped here rather than on `IconButton`, which would shrink
                  // every touch target in the app.
                  className={cn(
                    'bg-secondary hover:bg-secondary/80 h-8 min-h-8 w-8',
                    lock && LOCKED_BUTTON_CLASS,
                  )}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            }
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="border-border bg-card rounded-xl border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
              <div className={cn('grid gap-3', isSocial ? 'grid-cols-2' : 'grid-cols-1')}>
                {items.map((item, index) => (
                  <SortableTag
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    index={index}
                    onRemove={handleRemove}
                    onEdit={(id, text) => setEditing({ id, text, index })}
                    onMove={handleMove}
                    total={items.length}
                    lockedReasonId={reasonId}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay adjustScale={true}>
              {activeId ? (
                <SortableTag
                  id={activeId}
                  text={items.find((item) => item.id === activeId)?.text || ''}
                  index={items.findIndex((item) => item.id === activeId)}
                  onRemove={handleRemove}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {editing && (
        <TagEditorDialog
          id={editing.id}
          text={editing.text}
          type={type}
          label={label}
          singularLabel={singularLabel}
          onUpdate={(id, newText) => handleUpdate(id, newText, editing)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
