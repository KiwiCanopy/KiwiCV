import React, { useId, useRef } from 'react';

import { FloatingTooltip } from '@/components/ui/FloatingTooltip';
import { useReasonTooltip } from '@/components/ui/useReasonTooltip';
import { useAIEntryGuard } from '@/hooks/useAIEntryGuard';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { getAISuggestionBreakdown } from '@/utils/ai';
import { type AITargetKey, isSectionTarget, parseAITarget } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { Check, LoaderCircle, RefreshCcw, Sparkles } from 'lucide-react';

interface AISuggestButtonProps {
  target: AITargetKey;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  idleLabel?: string;
  /**
   * Suppress the accept-all behaviour and the pending pill; the button is only
   * ever "start a run". Used where something else on screen already owns
   * accepting — the per-entry diff panel, which can name what it accepts, where
   * a bare count on a button cannot.
   */
  triggerOnly?: boolean;
  /**
   * What this button is called in the accessibility tree, naming its TARGET —
   * "Improve with AI: Backend & Frontend Development", not "Improve with AI".
   *
   * ⚠️ Required in spirit wherever the button is icon-only, which is every call
   * site today. Six of these render on one screen — one per section header plus
   * one per accordion entry — so six identical names is a list a screen-reader
   * user cannot navigate, and a voice-control user cannot address. Falls back to
   * the generic label so an unlabelled call site is still named, just badly.
   */
  ariaLabel?: string;
  /**
   * The thing this button acts ON — a section or entry name, never a verb. Used
   * to distinguish the ACCEPT state, where `ariaLabel` cannot help because it
   * already reads as an action.
   */
  targetName?: string;
  /**
   * Replaces `openAIModal(target)` on the IDLE press only, after the sign-in and
   * pass guards. The cover letter opens a chooser here instead.
   *
   * ⚠️ Called BELOW the accept-all branch, so a section with pending proposals
   * still accepts them rather than opening whatever this points at. A
   * `PopoverTrigger` wrapper cannot do this job at all — `handleClick` opens
   * with `stopPropagation()`, so the click never reaches it.
   */
  onIdleActivate?: () => void;
  /**
   * Disclosure state, for a button whose idle press opens a menu. Radix cannot
   * supply it here: the menu anchors rather than triggers (see
   * `CoverLetterAIMenu`), so nothing wires `aria-expanded` on its own.
   */
  expanded?: boolean;
  /**
   * Why there is nothing to improve yet. Set, the idle button stays in place but
   * refuses the press and shows this in a tooltip on hover, focus and tap;
   * pending proposals still win, since accepting them needs no content.
   */
  disabledReason?: string;
}

export const AISuggestButton: React.FC<AISuggestButtonProps> = ({
  target,
  className,
  size = 'md',
  idleLabel,
  triggerOnly = false,
  ariaLabel,
  targetName,
  onIdleActivate,
  expanded,
  disabledReason,
}) => {
  const { t } = useTranslation();
  const { allowRun, modals } = useAIEntryGuard();
  const openAIModal = useResumeStore((state) => state.openAIModal);
  const acceptAllSuggestions = useResumeStore((state) => state.acceptAllSuggestions);
  const suggestions = useResumeStore((state) => state.ai.suggestions);
  const isGenerating = useResumeStore((state) => state.ai.isGenerating);
  const activeTarget = useResumeStore((state) => state.ai.activeTarget);
  const reorgSuggestion = useResumeStore((state) => state.ai.reorgSuggestion);
  const confirm = useConfirmStore((state) => state.confirm);

  const isThisGenerating = isGenerating && activeTarget === target;

  const resume = useResumeStore((state) => state.resume);

  // Determine if there are pending suggestions for this target/scope
  const { contentCount, reorgCount, reorgAdded, reorgRemoved, reorgTotal } = React.useMemo(() => {
    if (target === 'cv') {
      const { content, reorg, reorgAdded, reorgRemoved, reorgTotal } = getAISuggestionBreakdown(
        suggestions,
        undefined,
        reorgSuggestion,
        resume,
      );
      return { contentCount: content, reorgCount: reorg, reorgAdded, reorgRemoved, reorgTotal };
    }
    if (isSectionTarget(target)) {
      const sectionKeys = [parseAITarget(target).sectionKey];
      const { content, reorg, reorgAdded, reorgRemoved, reorgTotal } = getAISuggestionBreakdown(
        suggestions,
        sectionKeys,
        reorgSuggestion,
        resume,
      );
      return { contentCount: content, reorgCount: reorg, reorgAdded, reorgRemoved, reorgTotal };
    }
    return { contentCount: 0, reorgCount: 0, reorgAdded: 0, reorgRemoved: 0, reorgTotal: 0 };
  }, [suggestions, target, reorgSuggestion, resume]);

  const isHighLevel = target === 'cv';

  const hasReorg = reorgCount > 0;

  const suggestionsCount = isHighLevel
    ? contentCount + (hasReorg ? reorgTotal : 0)
    : contentCount + reorgCount;

  const hasPendingSuggestions = React.useMemo(() => {
    if (triggerOnly) return false;
    return suggestionsCount > 0;
  }, [suggestionsCount, triggerOnly]);

  const isRefused = Boolean(disabledReason) && !hasPendingSuggestions;
  const reasonId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // `isGenerating` disables the button natively, which can swallow its `blur`.
  const reason = useReasonTooltip(isRefused && !isGenerating);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isRefused) {
      // Touch has no hover, so a tap is how the reason gets read there.
      reason.tap();
      return;
    }

    if (hasPendingSuggestions) {
      if (target === 'cv' || isSectionTarget(target)) {
        const isConfirmed = await confirm({
          title: t('ai.confirm_apply_all_title'),
          message: t('ai.confirm_apply_all_message'),
        });

        if (!isConfirmed) return;
      }

      acceptAllSuggestions(target);
      return;
    }

    if (!allowRun()) return;

    if (onIdleActivate) {
      onIdleActivate();
      return;
    }

    openAIModal(target);
  };

  const commonClasses = cn(
    'relative flex items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    className,
  );

  // ⚠️ Idle keeps a NEUTRAL container and spends the colour on the glyph
  // alone. The fill is not available to it: `SectionHeaderActions` renders one
  // of these per section header and `Accordion` renders one per entry, so a
  // Work section with five jobs shows six — and six `bg-primary` blocks means
  // none of them is the thing to press. `AIComposerBar:330` made the same
  // ruling for the same reason ("the salience belongs to the run button beside
  // it"), and `AIAccessChip` for a different one ("decorating a working button
  // is how a pass starts feeling metered").
  //
  // `--primary-strong`, not `--primary`: this is a drawn glyph, not a painted
  // surface, and the design language gives drawn roles the strong value.
  const stateClasses = hasPendingSuggestions
    ? 'border-primary-strong/30 bg-primary/10 text-primary-strong hover:bg-primary/15'
    : isRefused
      ? 'border-input bg-card text-primary-strong px-2 py-1 cursor-not-allowed'
      : 'border-input bg-card text-primary-strong hover:bg-muted px-2 py-1';

  const isPill = hasPendingSuggestions && suggestionsCount > 0;

  /**
   * One string for both the tooltip and the accessible name, so a sighted user
   * hovering and a screen-reader user listening are told the same thing.
   */
  /**
   * ⚠️ Both states name the same target, and each composes its OWN verb.
   *
   * The pending state first discarded `ariaLabel` outright, so every section
   * header with proposals announced a bare "Accept all changes" — several on one
   * screen, where pressing one accepts THAT section irreversibly. Appending
   * `ariaLabel` to fix it was worse: that value is the IDLE action label, so the
   * name became "Accept all changes: Optimize Work Experience" — two conflicting
   * imperatives for one button, composed unreviewed in all 15 locales.
   *
   * `targetName` is the section, not an action, so it can sit inside either verb.
   */
  const idleName = ariaLabel || idleLabel || t('ai.suggest') || 'Improve with AI';
  const acceptName = targetName
    ? t('ai.accept_all_named', { name: targetName })
    : t('ai.accept_all_changes');
  const accessibleName = hasPendingSuggestions ? acceptName : idleName;

  const sizes = {
    sm: isPill ? 'h-7 w-auto' : 'h-8 w-8',
    md: isPill ? 'h-8 w-auto' : 'h-9 w-9',
    lg: isPill ? 'h-10 w-auto' : 'h-10 w-10',
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isGenerating}
        // A refused press stays focusable so the reason can be described and read.
        aria-disabled={isRefused || undefined}
        aria-describedby={isRefused ? reasonId : undefined}
        // Unconditional, so leaving or blurring always clears the flag and it
        // cannot stick from a state that was not refused.
        {...reason.triggerProps}
        // The native tooltip would stack a second one on top of the reason.
        title={isRefused ? undefined : accessibleName}
        /* ⚠️ `title` alone was the ONLY accessible name here. It does
           supply one — it is the last fallback in the accname algorithm, so axe
           never flagged this — but it is the weakest source: invisible on touch,
           unreliable for voice control, and announced inconsistently. The glyph
           is `aria-hidden` and the button renders no visible text, so there
           was nothing else. */
        aria-label={accessibleName}
        aria-haspopup={onIdleActivate ? 'menu' : undefined}
        aria-expanded={onIdleActivate ? Boolean(expanded) : undefined}
        className={cn(
          commonClasses,
          sizes[size],
          stateClasses,
          isPill && 'shrink-0 overflow-hidden px-0',
        )}
      >
        {isThisGenerating ? (
          <div className="flex h-full w-full items-center justify-center px-2">
            <LoaderCircle className="h-3 w-3 animate-spin" />
          </div>
        ) : isPill ? (
          <div className="flex h-full items-center">
            <div className="border-primary-strong/20 flex h-full items-center justify-center border-r px-2">
              <Check className="h-3.5 w-3.5 shrink-0" />
            </div>
            <span className="flex h-full items-center gap-1.5 px-2.5 text-[10px] leading-none font-bold select-none">
              {isHighLevel ? (
                <span>{suggestionsCount}</span>
              ) : (
                <>
                  {contentCount > 0 && <span>{contentCount}</span>}
                  {contentCount > 0 && hasReorg && <span className="text-black opacity-30">|</span>}
                  {hasReorg && (
                    <div className="flex items-center gap-1.5">
                      <RefreshCcw className="h-3 w-3 shrink-0 opacity-70" />
                      <span className="flex items-center gap-1">
                        <span>{reorgTotal}</span>
                        <span className="text-[9px] opacity-70">
                          (<span className="text-success">+{reorgAdded}</span>
                          <span className="opacity-40">/</span>
                          <span className="text-destructive">-{reorgRemoved}</span>)
                        </span>
                      </span>
                    </div>
                  )}
                </>
              )}
            </span>
          </div>
        ) : hasPendingSuggestions ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          /* Only the glyph dims, so the focus ring on the button keeps full contrast. */
          <Sparkles className={cn('h-3.5 w-3.5', isRefused && 'opacity-50')} aria-hidden="true" />
        )}
      </button>

      {isRefused && (
        // Portalled, so it takes no room in the header row and escapes the sortable
        // entry's `transform`. End-aligned: every Improve button trails its row.
        <FloatingTooltip
          id={reasonId}
          anchorRef={buttonRef}
          side="bottom"
          align="end"
          {...reason.tooltipProps}
          className="max-w-60 rounded-md px-2.5 py-1.5 text-xs leading-snug shadow-lg"
        >
          {disabledReason}
        </FloatingTooltip>
      )}

      {modals}
    </>
  );
};
