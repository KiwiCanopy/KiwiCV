import { memo } from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { IconButton } from '@/components/ui/IconButton';
import { LOCKED_BUTTON_CLASS, lockedButtonProps } from '@/components/ui/fieldLock';
import type { SortableTagProps } from '@/components/ui/tag-field/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, X } from 'lucide-react';

export const SortableTag = memo(
  ({
    id,
    text,
    index,
    onRemove,
    onEdit,
    isOverlay,
    onMove,
    total = 0,
    lockedReasonId,
  }: SortableTagProps) => {
    const locked = lockedReasonId !== undefined;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      disabled: locked,
    });
    const inertProps = lockedButtonProps(lockedReasonId);
    const { t } = useTranslation();

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 50 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'bg-card border-border group flex w-full items-center gap-2 rounded-lg border p-2 text-sm transition-colors duration-200',
          !isOverlay && 'hover:bg-muted/30',
          isDragging && !isOverlay && 'pointer-events-none opacity-0',
          isOverlay &&
            'border-primary-strong ring-primary-strong/20 bg-card/95 shadow-[var(--elevation-2)] ring-2 backdrop-blur-sm',
        )}
      >
        <div className="flex shrink-0 items-center gap-1">
          {!isOverlay && (
            <IconButton
              label={t('common.move_named', { name: text })}
              variant="quiet"
              className={cn('cursor-grab active:cursor-grabbing', locked && LOCKED_BUTTON_CLASS)}
              style={{ touchAction: 'none' }}
              {...attributes}
              {...listeners}
              {...inertProps}
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
          <span className="text-muted-foreground min-w-[1.5rem] text-[11px] font-semibold">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <span className="text-foreground min-w-0 flex-1 truncate pr-2" title={text}>
          {text}
        </span>

        {!isOverlay && (
          <div className="flex shrink-0 items-center gap-1">
            {onMove && total > 0 && (
              <ItemOrderControls
                itemLabel={text}
                position={index + 1}
                total={total}
                onMoveUp={() => onMove(id, -1)}
                onMoveDown={() => onMove(id, 1)}
                lockedReasonId={lockedReasonId}
              />
            )}
            <IconButton
              label={t('common.edit_named', { name: text })}
              onClick={() => onEdit?.(id, text)}
              variant="quiet"
              className={cn(locked && LOCKED_BUTTON_CLASS)}
              {...inertProps}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              label={t('common.delete_named', { name: text })}
              onClick={() => onRemove(id)}
              variant="quiet"
              className={cn(
                'hover:text-destructive hover:bg-destructive/10',
                locked && LOCKED_BUTTON_CLASS,
              )}
              {...inertProps}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        )}
      </div>
    );
  },
);

SortableTag.displayName = 'SortableTag';
