import { type ReactNode, useId, useState } from 'react';

import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { type EntryListId } from '@/constants/focusAnchors';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AITargetKey } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { isKeyboardActivation } from '@/utils/focus';
import { ChevronDown, CircleAlert, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';

export interface AccordionItemProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /**
   * ⚠️ `fromKeyboard` is `isKeyboardActivation(event)` at the press site. A
   * delete that removes its own button with no dialog in between needs it to
   * decide whether a focus handoff is owed; a delete that raises a
   * confirm ignores it.
   */
  onDelete?: (fromKeyboard: boolean) => void;
  /**
   * The list this entry belongs to, marking the delete control as a focus
   * anchor for `entryDeleteAnchor`. Opt-in: an accordion whose deletes
   * are not index-addressable entries leaves it unset and enrolls nothing.
   */
  entryListId?: EntryListId;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  forceCollapsed?: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
  subtitleIsHint?: boolean;
  dragHandleProps?: Record<string, unknown>;
  setNodeRef?: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
  isOverlay?: boolean;
  hasError?: boolean;
  /** `isEmpty` keeps Improve in place but refused, with its reason, until the entry has content. */
  aiTarget?: { target: AITargetKey; isEmpty: boolean };
  isRange?: boolean;
  orderActions?: ReactNode;
  /**
   * Rendered between the header row and the collapsible panel, so it is visible
   * whether or not the entry is expanded. The AI diff panel lives here: a
   * collapsed entry with four rewritten fields has to look different from an
   * untouched one, which it cannot if the only place to say so is inside the
   * panel nobody has opened.
   */
  belowHeader?: ReactNode;
}

export function AccordionItem({
  title,
  subtitle,
  children,
  onDelete,
  entryListId,
  onToggleVisibility,
  isVisible = true,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  forceCollapsed = false,
  description,
  startDate,
  endDate,
  subtitleIsHint,
  dragHandleProps,
  setNodeRef,
  style,
  hasError,
  aiTarget,
  isRange = true,
  orderActions,
  belowHeader,
}: AccordionItemProps) {
  const { formatCVDateRange, formatCVDate, t } = useTranslation();
  const suggestions = useResumeStore((state) => state.ai.suggestions);
  const { isStandard } = useEditorBreakpoints();

  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const generatedId = useId();
  const panelId = `${generatedId}-panel`;
  const itemLabel = title || t('common.untitled');
  const visibilityName = isVisible
    ? t('common.hide_named', { name: itemLabel })
    : t('common.show_named', { name: itemLabel });

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // dnd-kit passes style={ opacity: 1 } which overrides tailwind classes.
  // We merge it here so that hidden items can actually fade out.
  const mergedStyle = {
    ...style,
    opacity:
      !isVisible && (style?.opacity === 1 || style?.opacity === undefined) ? 0.4 : style?.opacity,
  };

  return (
    <div
      ref={setNodeRef}
      style={mergedStyle}
      className={cn(
        'bg-card mb-3 min-w-0 border shadow-[var(--elevation-1)] transition-colors duration-200',
        isStandard ? 'border-border rounded-lg' : 'border-border/60 rounded-xl',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-wrap items-center px-3 py-3 sm:px-4',
          isStandard ? 'flex-row' : 'flex-row gap-2',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button
              type="button"
              aria-label={t('common.move_named', { name: itemLabel })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted touch-action-none mr-2 flex h-11 w-11 cursor-move items-center justify-center rounded transition-colors"
              style={{ touchAction: 'none' }}
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen && !forceCollapsed}
            // The panel is not rendered while collapsed, so pointing at it
            // would be a dangling reference. aria-controls is optional here.
            aria-controls={isOpen && !forceCollapsed ? panelId : undefined}
            className="group flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
          >
            <div className="w-0 flex-1 overflow-hidden">
              <h3
                className={cn(
                  // 14px/500: one step below the Section header that owns this
                  // list (16px/700), so an entry never outweighs its section.
                  'flex min-w-0 items-center gap-2 overflow-hidden text-sm font-medium',
                  !isVisible ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {hasError && (
                  <>
                    <CircleAlert className="text-destructive h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="sr-only">{t('common.error')}</span>
                  </>
                )}
                <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2 truncate">
                  <span className="truncate">
                    {title || (
                      <span className="text-muted-foreground font-normal italic">
                        {t('common.untitled')}
                      </span>
                    )}
                  </span>
                  {/* Subtitle and date step down by size and weight, never by opacity:
                      both are information and need 4.5:1. */}
                  {!isStandard && subtitle && (
                    <span
                      className={cn(
                        'text-muted-foreground shrink truncate text-xs font-normal',
                        subtitleIsHint ? 'italic' : '',
                      )}
                    >
                      {subtitle}
                    </span>
                  )}
                  {!isStandard && (startDate || endDate) && (
                    <span className="text-muted-foreground text-[10px] font-normal">
                      ({isRange ? formatCVDateRange(startDate, endDate) : formatCVDate(startDate)})
                    </span>
                  )}
                </span>
                {aiTarget && suggestions[aiTarget.target] && (
                  <span className="bg-warning h-2 w-2 shrink-0 rounded-full" />
                )}
              </h3>
              <div
                className={cn(
                  'mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5',
                  !isStandard && 'hidden',
                )}
              >
                {subtitle && (
                  <p
                    className={cn(
                      'max-w-[180px] shrink truncate text-sm',
                      subtitleIsHint
                        ? 'text-muted-foreground/50 font-normal italic'
                        : 'text-muted-foreground',
                    )}
                  >
                    {subtitle}
                  </p>
                )}
                {(startDate || endDate) && (
                  <p className="text-muted-foreground/80 flex items-center gap-1 text-xs">
                    {isRange ? formatCVDateRange(startDate, endDate) : formatCVDate(startDate)}
                  </p>
                )}
              </div>
              {description && !isOpen && isStandard && (
                <p className="text-muted-foreground/70 mt-1 line-clamp-1 max-w-md text-xs italic">
                  {description}
                </p>
              )}
            </div>

            <ChevronDown
              className={cn(
                'text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200',
                isOpen && !forceCollapsed && 'rotate-180 transform',
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            'flex items-center justify-end gap-1',
            isStandard
              ? 'border-border mt-0 ml-4 border-l pl-2'
              : 'border-border mt-2 w-full border-t pt-2',
          )}
        >
          {!forceCollapsed && orderActions}
          {/* ⚠️ `triggerOnly`: accepting belongs to the diff panel below, which
              can say what it is accepting. This button only ever means "improve
              this entry". */}
          {aiTarget && (
            <AISuggestButton
              target={aiTarget.target}
              size="sm"
              triggerOnly
              // One proposal per entry at a time: it is reviewed before another run.
              disabledReason={
                suggestions[aiTarget.target]
                  ? t('ai.improve_blocked_pending_entry')
                  : aiTarget.isEmpty
                    ? t('ai.improve_blocked_empty_entry')
                    : undefined
              }
              /* Named after its entry, like the move and visibility buttons in
                 this same row (`aria-label` at :114 and :239). Without it every
                 entry in a section announces identically. */
              ariaLabel={t('ai.suggest_named', { name: itemLabel })}
            />
          )}
          {onToggleVisibility && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="text-muted-foreground hover:text-primary-strong hover:bg-primary/10 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
              title={visibilityName}
              aria-label={visibilityName}
            >
              {!isVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              // Read positionally by `entryDeleteAnchor` so a confirmed delete
              // hands focus to the entry that took this one's place.
              data-entry-delete={entryListId}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(isKeyboardActivation(e));
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
              title={t('common.delete_named', { name: itemLabel })}
              aria-label={t('common.delete_named', { name: itemLabel })}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {belowHeader}

      {isOpen && !forceCollapsed && (
        <div
          id={panelId}
          // Read by `firstEntryFieldAnchor`.
          data-entry-fields={entryListId}
          className="border-border mt-2 border-t px-4 pt-0 pb-4"
        >
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
