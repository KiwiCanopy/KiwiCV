import { cn } from '@/utils/cn';
import { isKeyboardActivation } from '@/utils/focus';
import { ChevronRight, type LucideIcon, Plus } from 'lucide-react';

interface EmptySectionStateProps {
  /** Prose under the title. Says what belongs here, not that nothing does. */
  message: string;
  /** The title, phrased as the action. Falls back to `message` when absent. */
  actionLabel?: string;
  /**
   * `fromKeyboard` arms a focus handoff, since the card unmounts on add.
   * ⚠️ Not `onAction={add}` with an optional first parameter: it receives a boolean.
   */
  onAction?: (fromKeyboard: boolean) => void;
  /**
   * Defaults to `Plus`, which promises "add a blank one". A panel that starts a
   * generation says so instead — `Sparkles` for AI, per `.claude/rules/ui.md`
   *
   */
  icon?: LucideIcon;
  className?: string;
}

/**
 * The empty state for a list section.
 *
 * ⚠️ **The panel IS the button.** It used to be a filled card containing a
 * small secondary button, which put a box in a box and left a ~90px target
 * inside a full-width panel that did nothing. The whole zone is the target now,
 * so there is nothing to aim at, and the dashed edge reads as "something
 * belongs here" rather than as a card that happens to be empty.
 *
 * ⚠️ Do not "fix" this by auto-creating a blank entry instead. Skills once did that,
 * and it wrote an empty object into the user's CV before they asked
 * for one — which made the section's count badge disagree with `hasData`, the
 * same divergence the Improve gate reads. Its guard was a ref, so the row also
 * came back every time the rail remounted the section, and a user who
 * deliberately emptied Skills could not keep it empty.
 *
 * `border-input`, not `border-border`: this element is the control.
 */
export const EmptySectionState = ({
  message,
  actionLabel,
  onAction,
  icon: Icon = Plus,
  className,
}: EmptySectionStateProps) => {
  const title = actionLabel ?? message;
  const description = actionLabel ? message : undefined;

  const body = (
    <>
      <span
        className={cn(
          'bg-muted text-primary-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
          onAction && 'group-hover:bg-mist',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-sm font-bold">{title}</span>
        {description && (
          <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
            {description}
          </span>
        )}
      </span>
      {onAction && (
        <ChevronRight
          className="text-muted-foreground/60 group-hover:text-foreground h-4 w-4 shrink-0 transition-colors"
          aria-hidden="true"
        />
      )}
    </>
  );

  const shell = 'border-input flex w-full items-center gap-4 rounded-xl border border-dashed p-4';

  if (!onAction) {
    return <div className={cn(shell, className)}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={(event) => onAction(isKeyboardActivation(event))}
      className={cn(
        shell,
        'hover:bg-muted/40 focus-visible:ring-primary-strong group text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      {body}
    </button>
  );
};
