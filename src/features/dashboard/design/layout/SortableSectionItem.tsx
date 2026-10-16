import { memo, useId } from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { IconButton } from '@/components/ui/IconButton';
import { SectionItemMenu } from '@/features/dashboard/design/layout/SectionItemMenu';
import { useInlineOrderControls } from '@/features/dashboard/design/layout/useInlineOrderControls';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { isCustomSectionToken } from '@/utils/layoutMetadata';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRightLeft, CornerDownLeft, Eye, EyeOff, GripVertical } from 'lucide-react';

interface SortableSectionItemProps {
  id: string;
  label: string;
  description?: string;
  isHidden?: boolean;
  isMain?: boolean;
  canSwap?: boolean;
  onSwap?: (id: string) => void;
  editTitle?: string;
  onEdit?: (id: string) => void;
  visibilityTitle?: string;
  onToggleVisibility?: (id: string) => void;
  hasPageBreak?: boolean;
  onTogglePageBreak?: (id: string) => void;
  isFirst?: boolean;
  isPlaceholder?: boolean;
  isOverlay?: boolean;
  position?: number;
  total?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SortableSectionItem = memo(
  ({
    id,
    label,
    description,
    isHidden = false,
    isMain = false,
    canSwap,
    onSwap,
    editTitle,
    onEdit,
    visibilityTitle,
    onToggleVisibility,
    hasPageBreak = false,
    onTogglePageBreak,
    isFirst = false,
    isPlaceholder = false,
    isOverlay = false,
    position,
    total,
    onMoveUp,
    onMoveDown,
  }: SortableSectionItemProps) => {
    const { t } = useTranslation();
    const showInlineOrderControls = useInlineOrderControls();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      disabled: isPlaceholder || isOverlay,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
    };

    // Invisible 28px button body that lights up on hover — keeps the icons
    // small but gives them a real, generous hit area.
    const iconButtonClass = (extra?: string) =>
      cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
        isPlaceholder ? 'text-foreground/60 cursor-default' : extra,
      );

    const canMove =
      !isPlaceholder && !isOverlay && !!position && !!total && !!onMoveUp && !!onMoveDown;

    const pageBreakReasonId = useId();
    const isPageBreakDisabled = isFirst || isHidden;
    const pageBreakTooltip = isFirst
      ? t('design.page_break_disabled_first')
      : isHidden
        ? t('design.page_break_disabled_hidden')
        : hasPageBreak
          ? t('design.page_break_removal_tooltip')
          : t('design.page_break_tooltip');

    // Six 44px controls plus a readable label do not fit a 375px column. When
    // the row carries its own move buttons the controls move to a line of
    // their own instead: a deliberate two-line card, not the accidental wrap
    // that used to orphan the overflow menu.
    const isStacked = canMove && showInlineOrderControls;

    const gripButton = (
      <button
        type="button"
        {...(isPlaceholder ? {} : attributes)}
        {...(isPlaceholder ? {} : listeners)}
        className={cn(
          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isPlaceholder
            ? 'text-foreground/70 cursor-default'
            : 'text-muted-foreground hover:text-primary-strong cursor-grab active:cursor-grabbing',
        )}
        style={{ touchAction: 'none' }}
        aria-label={t('common.move_named', { name: label })}
        disabled={isPlaceholder}
      >
        {/* Drawn on its own surface at full muted-foreground: at 14px and 50%
            opacity the grip read as decoration rather than as something to
            grab, which is half of why touch users never found the drag. */}
        <span
          className={cn(
            'flex h-8 w-6 items-center justify-center rounded-md',
            !isPlaceholder && 'bg-muted/60 group-hover:bg-muted',
          )}
        >
          <GripVertical size={16} aria-hidden="true" />
        </span>
      </button>
    );

    // On the row, not in the overflow menu: whether a section starts a new PDF
    // page is state worth seeing at a glance. A stacked row puts it on the
    // title line, since a seventh 44px control overflows a 375px column.
    const pageBreakButton = onTogglePageBreak && !isPlaceholder && !isOverlay && (
      <IconButton
        label={hasPageBreak ? t('design.page_break_remove') : t('design.page_break_add')}
        title={pageBreakTooltip}
        variant="quiet"
        // Button's disabledReason prints the reason under the control,
        // which breaks the one-line row; the tooltip carries it visually.
        aria-disabled={isPageBreakDisabled || undefined}
        aria-describedby={isPageBreakDisabled ? pageBreakReasonId : undefined}
        className={cn(
          'border',
          hasPageBreak && !isPageBreakDisabled
            ? 'border-primary-strong/40 bg-primary/10 text-primary-strong hover:bg-primary/15'
            : 'text-muted-foreground hover:text-primary-strong border-transparent',
        )}
        onClick={() => onTogglePageBreak(id)}
      >
        <CornerDownLeft size={14} aria-hidden="true" />
        {isPageBreakDisabled && (
          <span id={pageBreakReasonId} className="sr-only">
            {pageBreakTooltip}
          </span>
        )}
      </IconButton>
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          // One line whenever the controls fit, with the label truncating
          // rather than wrapping — a wrapped row orphans the overflow menu
          // onto a line of its own. When the row also carries move buttons
          // there is no width for that, so it stacks deliberately instead.
          'group mb-2 flex rounded-xl border p-2',
          isStacked ? 'flex-col items-stretch gap-1' : 'flex-nowrap items-center gap-1 sm:gap-2',
          !isDragging && 'transition-all duration-300',
          isDragging
            ? 'pointer-events-none opacity-0'
            : isPlaceholder
              ? 'border-primary-strong/30 bg-primary/5 border-dashed opacity-70 grayscale-[0.5]'
              : isHidden
                ? 'border-border/40 bg-muted/5 opacity-50 grayscale hover:opacity-100'
                : isMain
                  ? 'border-border bg-background'
                  : 'border-border bg-muted/20',
        )}
      >
        {!isStacked && gripButton}
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col items-start px-1',
            isStacked && 'w-full pt-1',
          )}
        >
          <div className="flex w-full items-center gap-2">
            <span
              className={cn(
                'truncate text-[13px] transition-colors select-none',
                // A custom section shows its title as the user wrote it.
                !isCustomSectionToken(id) && 'capitalize',
                isPlaceholder
                  ? 'text-foreground font-bold'
                  : isHidden
                    ? 'text-muted-foreground/70 line-through/20 font-medium'
                    : isMain
                      ? 'text-foreground font-bold'
                      : 'text-foreground font-semibold',
              )}
            >
              {label}
            </span>
            {isStacked && pageBreakButton && <span className="ml-auto">{pageBreakButton}</span>}
            {isPlaceholder && (
              <span className="bg-primary/10 text-primary-strong rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                PRV
              </span>
            )}
          </div>
          {description && !isHidden && (
            <span className="text-muted-foreground line-clamp-1 text-[10px]">{description}</span>
          )}
        </div>
        <div
          className={cn(
            'flex items-center',
            isStacked
              ? 'border-border/40 w-full justify-between gap-1 border-t pt-1'
              : 'gap-1 sm:gap-2',
          )}
        >
          {isStacked && gripButton}
          {(onToggleVisibility || isPlaceholder) && (
            <button
              type="button"
              onClick={() => !isPlaceholder && onToggleVisibility?.(id)}
              className={iconButtonClass(
                isHidden
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-primary-strong',
              )}
              title={visibilityTitle}
              aria-label={
                isHidden
                  ? t('common.show_named', { name: label })
                  : t('common.hide_named', { name: label })
              }
              disabled={isPlaceholder}
            >
              {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {(canSwap || isPlaceholder) && onSwap && (
            <button
              type="button"
              onClick={() => !isPlaceholder && onSwap(id)}
              className={iconButtonClass(
                'text-muted-foreground hover:bg-muted hover:text-primary-strong',
              )}
              title={t('design.layout_swap_tooltip')}
              aria-label={t('design.swap_column_named', { name: label })}
              disabled={isPlaceholder}
            >
              <ArrowRightLeft size={13} />
            </button>
          )}
          {!isStacked && pageBreakButton}
          {/* On touch and in a narrow column the move buttons ride on the row
              itself. They are the one affordance that needs no gesture
              knowledge, so they must not be the thing hidden behind a menu. */}
          {isStacked && (
            <ItemOrderControls
              itemLabel={label}
              position={position!}
              total={total!}
              onMoveUp={onMoveUp!}
              onMoveDown={onMoveDown!}
            />
          )}
          {!isPlaceholder && !isOverlay && (
            <SectionItemMenu
              label={label}
              editTitle={editTitle}
              onEdit={onEdit ? () => onEdit(id) : undefined}
              position={position}
              total={total}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              hideOrderControls={isStacked}
            />
          )}
        </div>
      </div>
    );
  },
);

SortableSectionItem.displayName = 'SortableSectionItem';
