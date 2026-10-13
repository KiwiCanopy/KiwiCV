import { Button } from '@/components/ui/Button';
import { REVIEW_NEXT_ANCHOR_ID } from '@/constants/focusAnchors';
import { usePendingProposals } from '@/features/dashboard/editor/proposals/usePendingProposals';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { sectionHeadingAnchor } from '@/utils/focus';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * One place that says how much AI work is waiting anywhere in the CV, and one
 * button that walks it.
 *
 * Before this, pending proposals were only visible inside the section holding
 * them: a whole-CV run could leave changes in nine sections and the editor
 * showed them one accordion at a time, with no count and no way to step. It
 * renders nothing when there is nothing to review.
 */
export function PendingProposalsBar() {
  const { t } = useTranslation();
  const confirm = useConfirmStore((state) => state.confirm);
  const { total, sectionKeys, next, reviewNext, acceptAll, discardAll } = usePendingProposals();

  if (total === 0) return null;

  const handleAcceptAll = async () => {
    const confirmed = await confirm({
      // Either answer empties the bar, which returns `null` — so the button
      // that opened this dialog unmounts itself either way.
      restoreFocusTo: sectionHeadingAnchor,
      title: t('ai.confirm_apply_all_title'),
      message: t('ai.confirm_apply_all_message'),
    });
    if (confirmed) acceptAll();
  };

  const handleDiscardAll = async () => {
    const confirmed = await confirm({
      restoreFocusTo: sectionHeadingAnchor,
      title: t('ai.pending_discard_title'),
      message: t('ai.pending_discard_message'),
    });
    if (confirmed) discardAll();
  };

  return (
    <section
      aria-label={t('ai.pending_headline', { count: total })}
      className="border-border bg-kiwi/10 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 md:px-6"
    >
      <span
        className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        aria-hidden="true"
      >
        <Sparkles className="h-4 w-4" />
      </span>

      {/* ⚠️ No `flex-1`. It pushed the actions to the right edge of a bar that
          spans the whole workspace, so at the default split they sat entirely
          over the PREVIEW while acting on proposals in the editor. The rule is
          to place a control beside the thing it affects. */}
      <p className="text-foreground min-w-0 text-sm font-medium">
        {t('ai.pending_headline', { count: total })}{' '}
        <span className="text-muted-foreground font-normal">
          {t('ai.pending_sections', { count: sectionKeys.length })}
        </span>
      </p>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {/* ⚠️ NOT primary. Green means "take the proposal" everywhere else in
            this flow — the row accept, the panel's accept-all, this bar's
            accept-all — and this button takes nothing, it only moves to the
            next one. The arrow carries the navigation, which colour cannot. */}
        <Button
          /* A rung of the proposal flow's focus handoff (UI_PATTERNS.md).
             `usePendingProposals` moves focus off it when pressing it disables
             it. */
          id={REVIEW_NEXT_ANCHOR_ID}
          variant="secondary"
          size="sm"
          className="border-input"
          onClick={reviewNext}
          disabled={!next}
        >
          {t('ai.pending_review_next')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        {/* ⚠️ Three weights for three actions: filled green, light fill, no fill.
            Accept-all and discard-all are OPPOSITE bulk actions, so they must
            not differ by a hairline alone — `secondary` for both, edge or no
            edge, is the same mistake the row pair made in dark. Both carry
            `border-input` per the tinted-panel exception in
            `.claude/rules/ui.md`; on `bg-kiwi/10` the edge is what makes the
            fill-less one findable at all. */}
        <Button variant="primary" size="sm" onClick={handleAcceptAll}>
          {t('ai.accept_all_changes')}
        </Button>
        {/* ⚠️ Set apart from the accept beside it. The two are opposite bulk
            actions on the same set, and adjacency is what makes a mis-click
            expensive. A gap rather than the far edge: pushing it right would
            put the one destructive control back over the preview. */}
        <Button variant="quiet" size="sm" className="border-input ml-3" onClick={handleDiscardAll}>
          {t('ai.pending_discard_all')}
        </Button>
      </div>
    </section>
  );
}
